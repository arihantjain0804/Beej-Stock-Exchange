const WebSocket = require('ws');
const { query } = require('../config/database');
const { publishPrices } = require('../config/redis');
const logger = require('../utils/logger');

const TICK_INTERVAL = parseInt(process.env.WS_PRICE_TICK_INTERVAL_MS || 3000);
// How often to persist a price_history row per token. Separate from
// TICK_INTERVAL — writing every 3s would flood the table for no benefit;
// this is the cadence that actually builds up a real, growing chart over
// time. Fix: previously the ticker only ever updated an in-memory cache
// and broadcast over WS — price_history was only ever written once by the
// seed script (30 backdated days) or by an executed trade. That meant no
// new data point was ever added while the app was just running, so every
// timeframe tab (1D/1W/1M/3M/ALL) read the same frozen rows and looked
// identical, and drill-down charts had nothing to plot beyond a flat
// two-point fallback.
const HISTORY_WRITE_INTERVAL_MS = parseInt(process.env.HISTORY_WRITE_INTERVAL_MS || 60000);

// ─── Commodity Price API Integration ─────────────────────────────────────────
// Uses data.gov.in Agmarknet API (free, no billing required).
// Get a free key at: https://data.gov.in/user/register → My Account → API
// Set DATA_GOV_API_KEY in Railway env vars to enable real prices.
// Without it, prices simulate with noise around DB seed values — same as before.
//
// Symbol → commodity/state mapping (Agmarknet naming convention)
const COMMODITY_MAP = {
  'PNJ-WHT': { commodity: 'Wheat',     state: 'Punjab' },
  'KRS-RCE': { commodity: 'Rice',      state: 'Andhra Pradesh' },
  'VDB-SOY': { commodity: 'Soyabean',  state: 'Maharashtra' },
  'UP-SGC':  { commodity: 'Sugarcane', state: 'Uttar Pradesh' },
  'GUJ-GND': { commodity: 'Groundnut', state: 'Gujarat' },
  'MH-CTN':  { commodity: 'Cotton',    state: 'Maharashtra' },
  'TN-BSM':  { commodity: 'Rice',      state: 'Tamil Nadu' },
  'MP-SOY':  { commodity: 'Soyabean',  state: 'Madhya Pradesh' },
  'RJ-CUM':  { commodity: 'Cumin',     state: 'Rajasthan' },
  'KAR-RGI': { commodity: 'Ragi',      state: 'Karnataka' },
  'KER-CCO': { commodity: 'Coconut',   state: 'Kerala' },
  'AP-TRM':  { commodity: 'Turmeric',  state: 'Andhra Pradesh' },
};

const COMMODITY_REFRESH_MS = parseInt(process.env.COMMODITY_REFRESH_MS || 3600000); // 1 hour default
let realPriceCache  = {};  // { [symbol]: priceInr }
let lastCommodityFetch = 0;

async function fetchRealPrices() {
  const apiKey = process.env.DATA_GOV_API_KEY;
  if (!apiKey) return; // silently skip — simulation takes over

  const now = Date.now();
  if (now - lastCommodityFetch < COMMODITY_REFRESH_MS) return; // cache still fresh
  lastCommodityFetch = now;

  try {
    // Agmarknet modal price resource (₹/quintal)
    const url =
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` +
      `?api-key=${apiKey}&format=json&limit=200`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json    = await res.json();
    const records = json.records || [];

    // Build lookup: "commodity|state" → modal price
    const lookup = {};
    for (const r of records) {
      const key   = `${r.commodity?.toLowerCase()}|${r.state?.toLowerCase()}`;
      const modal = parseFloat(r.modal_price);
      if (!isNaN(modal) && modal > 0) lookup[key] = modal;
    }

    // Map to our token symbols
    const updated = {};
    for (const [symbol, { commodity, state }] of Object.entries(COMMODITY_MAP)) {
      const key = `${commodity.toLowerCase()}|${state.toLowerCase()}`;
      if (lookup[key]) updated[symbol] = lookup[key];
    }

    if (Object.keys(updated).length > 0) {
      realPriceCache = { ...realPriceCache, ...updated };
      logger.info('Commodity prices refreshed from data.gov.in', {
        updated: Object.keys(updated),
      });
    }
  } catch (err) {
    logger.warn('Commodity API fetch failed — using simulation', { error: err.message });
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function send(ws, type, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, data, ts: Date.now() }));
  }
}

// ─── Price Server ─────────────────────────────────────────────────────────────
function createPriceServer(httpServer) {
  const wss           = new WebSocket.Server({ server: httpServer, path: '/ws' });
  const subscriptions = new Map();
  const clients       = new Set();
  const priceCache    = new Map();

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.subs    = new Set();
    clients.add(ws);

    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', async (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      if (msg.type === 'subscribe') {
        const symbols = Array.isArray(msg.symbols) ? msg.symbols : [msg.symbols];
        for (const sym of symbols) {
          const r = await query('SELECT id FROM crop_tokens WHERE symbol=$1', [sym.toUpperCase()]);
          if (!r.rows.length) continue;
          const tid = r.rows[0].id;
          ws.subs.add(tid);
          if (!subscriptions.has(tid)) subscriptions.set(tid, new Set());
          subscriptions.get(tid).add(ws);
        }
        send(ws, 'subscribed', { symbols });

      } else if (msg.type === 'subscribe_all') {
        const { rows } = await query("SELECT id FROM crop_tokens WHERE status='active'");
        for (const t of rows) {
          ws.subs.add(t.id);
          if (!subscriptions.has(t.id)) subscriptions.set(t.id, new Set());
          subscriptions.get(t.id).add(ws);
        }
        send(ws, 'subscribed_all', { count: rows.length });

      } else if (msg.type === 'ping') {
        send(ws, 'pong', {});
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      for (const tid of ws.subs) {
        subscriptions.get(tid)?.delete(ws);
      }
    });
  });

  // ── Heartbeat ──────────────────────────────────────────────────────────────
  const heartbeat = setInterval(() => {
    for (const ws of clients) {
      if (!ws.isAlive) { ws.terminate(); continue; }
      ws.isAlive = false;
      ws.ping();
    }
  }, 30000);

  // ── Price Tick ─────────────────────────────────────────────────────────────
  const ticker = setInterval(async () => {
    try {
      // Refresh real commodity prices if cache is stale (no-op if key missing)
      await fetchRealPrices();

      const { rows } = await query(
        "SELECT id,symbol,current_price_inr,prev_close_inr FROM crop_tokens WHERE status='active'"
      );

      const priceMap = {};

      for (const t of rows) {
        const prev   = priceCache.get(t.id) ?? parseFloat(t.current_price_inr);
        // Anchor to real commodity price if available, else use DB price
        const anchor = realPriceCache[t.symbol] ?? parseFloat(t.current_price_inr);

        // Small mean-reverting noise around anchor (0.2% per tick)
        const drift    = (anchor - prev) * 0.02;
        const noise    = (Math.random() - 0.5) * prev * 0.002;
        const newPrice = Math.max(prev * 0.9, prev + drift + noise);

        priceCache.set(t.id, newPrice);

        const change_pct = (
          (newPrice - parseFloat(t.prev_close_inr)) /
          parseFloat(t.prev_close_inr) * 100
        ).toFixed(2);

        priceMap[t.symbol] = {
          price:      newPrice.toFixed(4),
          change_pct,
          real: !!realPriceCache[t.symbol], // true = anchored to real mandi data
        };

        // Push to per-token subscribers
        const subs = subscriptions.get(t.id);
        if (subs?.size) {
          const msg = JSON.stringify({
            type: 'price_update',
            data: { symbol: t.symbol, price: newPrice.toFixed(4), change_pct },
            ts:   Date.now(),
          });
          for (const ws of subs) {
            if (ws.readyState === WebSocket.OPEN) ws.send(msg);
          }
        }
      }

      // Broadcast full ticker to all clients
      const tickerMsg = JSON.stringify({ type: 'ticker', data: priceMap, ts: Date.now() });
      for (const ws of clients) {
        if (ws.readyState === WebSocket.OPEN) ws.send(tickerMsg);
      }

      await publishPrices(priceMap);

    } catch (err) {
      logger.error('Price tick error', { error: err.message });
    }
  }, TICK_INTERVAL);

  let indexAnchorValue = null; // last known real beej50_history value
  let indexAnchorMcap  = null; // total real market cap at that anchor point

  wss.on('close', () => {
    clearInterval(heartbeat);
    clearInterval(ticker);
    clearInterval(historyWriter);
    clearInterval(indexWriter);
  });

  // ── Persist real price history periodically (not on every tick) ────────
  const historyWriter = setInterval(async () => {
    try {
      const { rows } = await query("SELECT id FROM crop_tokens WHERE status='active'");
      for (const t of rows) {
        const price = priceCache.get(t.id);
        if (price == null) continue; // no tick yet for this token
        await query(
          'INSERT INTO price_history (token_id, price_inr, volume, recorded_at) VALUES ($1, $2, $3, NOW())',
          [t.id, price.toFixed(4), 0]
        );
      }
    } catch (err) {
      logger.error('Price history write error', { error: err.message });
    }
  }, HISTORY_WRITE_INTERVAL_MS);

  // ── Persist a real, moving BEEJ-50 index value periodically ─────────────
  // Same staleness bug as price_history: beej50_history was only ever
  // written once by the seed script, so every timeframe tab read the same
  // frozen rows forever. This anchors to whatever the seed left off at,
  // then moves the index in direct proportion to real total market-cap
  // change (price x circulating_supply, active/harvested tokens) from that
  // point on — same convention the frontend uses for its live readout,
  // just now actually persisted so the series really grows.
  const indexWriter = setInterval(async () => {
    try {
      const { rows } = await query(
        "SELECT current_price_inr, circulating_supply FROM crop_tokens WHERE status IN ('active','harvested')"
      );
      const mcap = rows.reduce(
        (sum, t) => sum + parseFloat(t.current_price_inr) * parseFloat(t.circulating_supply || 0),
        0
      );
      if (!mcap) return;

      if (indexAnchorValue == null) {
        const { rows: latest } = await query('SELECT value FROM beej50_history ORDER BY recorded_at DESC LIMIT 1');
        indexAnchorValue = parseFloat(latest[0]?.value || 10000);
        indexAnchorMcap = mcap;
      }

      const newValue = indexAnchorValue * (mcap / indexAnchorMcap);
      const { rows: prevRow } = await query('SELECT value FROM beej50_history ORDER BY recorded_at DESC LIMIT 1');
      const prevValue = parseFloat(prevRow[0]?.value || newValue);
      const changePct = prevValue ? ((newValue - prevValue) / prevValue) * 100 : 0;

      await query(
        'INSERT INTO beej50_history (value, change_pct, recorded_at) VALUES ($1, $2, NOW())',
        [newValue.toFixed(2), changePct.toFixed(4)]
      );
    } catch (err) {
      logger.error('BEEJ-50 history write error', { error: err.message });
    }
  }, HISTORY_WRITE_INTERVAL_MS);

  // Kick off first commodity fetch immediately on server start
  fetchRealPrices().catch(() => {});

  logger.info('WebSocket price server started', { path: '/ws' });
  return wss;
}

module.exports = { createPriceServer };
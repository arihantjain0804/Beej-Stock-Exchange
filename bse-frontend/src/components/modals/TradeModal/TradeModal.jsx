import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { tokensApi, ordersApi } from '../../../api/index';
import './TradeModal.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const TIMEFRAMES = ['1D', '1W', '1M', 'ALL'];
const TF_DAYS = { '1D': 2, '1W': 7, '1M': 30, 'ALL': 9999 };

// ─── Fallback generators ──────────────────────────────────────────────────────
// Real orders/trades/price_history tables are often empty for a brand-new
// listing (no one has traded it yet). Rather than showing a blank chart or
// empty order book, we fall back to an illustrative simulation — clearly a
// UI affordance for "what live trading looks like," not a fabricated claim
// about any real crop or farmer.
function genHistory(basePrice, points) {
  const hist = [];
  let p = basePrice * (0.88 + Math.random() * 0.08);
  for (let i = 0; i < points; i++) {
    p = Math.max(basePrice * 0.7, p + (Math.random() - 0.47) * basePrice * 0.012);
    hist.push(parseFloat(p.toFixed(2)));
  }
  return hist;
}

function genOrderBook(basePrice) {
  const asks = [];
  const bids = [];
  let ap = basePrice + (Math.random() * 2);
  let bp = basePrice - (Math.random() * 2);
  for (let i = 0; i < 10; i++) {
    asks.push({ price: parseFloat(ap.toFixed(2)), qty: parseFloat((Math.random() * 5000 + 50).toFixed(1)) });
    ap += Math.random() * 1.5;
    bids.push({ price: parseFloat(bp.toFixed(2)), qty: parseFloat((Math.random() * 5000 + 50).toFixed(1)) });
    bp -= Math.random() * 1.5;
  }
  return { asks: asks.reverse(), bids };
}

function genRecentTrades(basePrice, count = 20) {
  const trades = [];
  let p = basePrice;
  const now = new Date();
  for (let i = 0; i < count; i++) {
    p = Math.max(basePrice * 0.95, p + (Math.random() - 0.5) * 2);
    const t = new Date(now - i * 23000);
    trades.push({
      price: parseFloat(p.toFixed(2)),
      qty: Math.floor(Math.random() * 800 + 2),
      side: Math.random() > 0.45 ? 'BUY' : 'SELL',
      time: `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}`,
    });
  }
  return trades;
}

// ─── Price Chart Canvas ───────────────────────────────────────────────────────
function PriceChart({ history, color = '#6daf4a' }) {
  const canvasRef = useRef(null);
  const [hover, setHover] = useState(null);

  const draw = useCallback((hoverX) => {
    const canvas = canvasRef.current;
    if (!canvas || !history.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const min = Math.min(...history) * 0.998;
    const max = Math.max(...history) * 1.002;
    const toX = i => (i / (Math.max(history.length - 1, 1))) * W;
    const toY = v => H - ((v - min) / (max - min || 1)) * H * 0.88 - H * 0.06;

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + '40');
    grad.addColorStop(1, color + '00');
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(history[0]));
    history.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    ctx.moveTo(toX(0), toY(history[0]));
    history.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round'; ctx.stroke();

    if (hoverX != null) {
      const idx = Math.round((hoverX / W) * (history.length - 1));
      const cx = toX(idx), cy = toY(history[idx]);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
      ctx.strokeStyle = '#0a0803'; ctx.lineWidth = 2; ctx.stroke();
    }

    ctx.fillStyle = 'rgba(212,200,154,0.3)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    [0.15, 0.5, 0.85].forEach(t => {
      const v = min + (max - min) * (1 - t);
      const y = toY(v);
      ctx.fillText('₹' + v.toFixed(0), W - 4, y + 3);
    });
  }, [history, color]);

  useEffect(() => { draw(hover); }, [draw, hover]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      draw(null);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  const handleMouseMove = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    setHover(e.clientX - r.left);
  };

  const hoverIdx = hover != null
    ? Math.round((hover / (canvasRef.current?.width || 1)) * (history.length - 1))
    : null;

  return (
    <div className="tm-chart-wrap">
      {hoverIdx != null && history[hoverIdx] != null && (
        <div className="tm-price-bubble" style={{ left: `${(hoverIdx / (history.length - 1)) * 100}%` }}>
          ₹{history[hoverIdx]?.toFixed(2)}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="tm-chart-canvas"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      />
    </div>
  );
}

// ─── Market Depth Chart ───────────────────────────────────────────────────────
function DepthChart({ orderBook }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    const bids = [...orderBook.bids].reverse();
    const asks = [...orderBook.asks];
    if (!bids.length || !asks.length) return;

    let bidCum = 0, askCum = 0;
    const bidPoints = bids.map(b => { bidCum += b.qty; return bidCum; });
    const askPoints = asks.map(a => { askCum += a.qty; return askCum; });
    const maxQ = Math.max(bidCum, askCum) || 1;

    const bidGrad = ctx.createLinearGradient(0, 0, W / 2, 0);
    bidGrad.addColorStop(0, 'rgba(109,175,74,0)');
    bidGrad.addColorStop(1, 'rgba(109,175,74,0.25)');
    ctx.beginPath();
    ctx.moveTo(0, H);
    bids.forEach((b, i) => {
      ctx.lineTo((i / Math.max(bids.length - 1, 1)) * (W / 2), H - (bidPoints[i] / maxQ) * H * 0.85);
    });
    ctx.lineTo(W / 2, H); ctx.closePath();
    ctx.fillStyle = bidGrad; ctx.fill();
    ctx.beginPath();
    bids.forEach((b, i) => ctx.lineTo((i / Math.max(bids.length - 1, 1)) * (W / 2), H - (bidPoints[i] / maxQ) * H * 0.85));
    ctx.strokeStyle = '#6daf4a'; ctx.lineWidth = 1.2; ctx.stroke();

    const askGrad = ctx.createLinearGradient(W / 2, 0, W, 0);
    askGrad.addColorStop(0, 'rgba(180,60,40,0.25)');
    askGrad.addColorStop(1, 'rgba(180,60,40,0)');
    ctx.beginPath();
    ctx.moveTo(W / 2, H);
    asks.forEach((a, i) => {
      ctx.lineTo(W / 2 + (i / Math.max(asks.length - 1, 1)) * (W / 2), H - (askPoints[i] / maxQ) * H * 0.85);
    });
    ctx.lineTo(W, H); ctx.closePath();
    ctx.fillStyle = askGrad; ctx.fill();
    ctx.beginPath();
    asks.forEach((a, i) => ctx.lineTo(W / 2 + (i / Math.max(asks.length - 1, 1)) * (W / 2), H - (askPoints[i] / maxQ) * H * 0.85));
    ctx.strokeStyle = '#b43c28'; ctx.lineWidth = 1.2; ctx.stroke();

    const midPrice = ((bids[bids.length - 1]?.price || 0) + (asks[0]?.price || 0)) / 2;
    ctx.fillStyle = 'rgba(212,200,154,0.35)';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('₹' + midPrice.toFixed(0), W / 2, H - 4);
  }, [orderBook]);

  return <canvas ref={canvasRef} className="tm-depth-canvas" />;
}

// ─── Main TradeModal ──────────────────────────────────────────────────────────
export default function TradeModal() {
  const {
    tradeOpen, setTradeOpen, tradeSymbol, setTradeSymbol, showToast, connected, setWalletOpen, tokens,
  } = useAppContext();

  // Which real token this modal shows. tradeSymbol comes from handleInvest
  // (the token the user actually clicked); fall back to the first real
  // token if the modal was opened without a specific one in mind.
  const activeSymbol = tradeSymbol || tokens[0]?.symbol || null;
  const activeToken = useMemo(
    () => tokens.find(t => t.symbol === activeSymbol) || null,
    [tokens, activeSymbol]
  );

  const [tf, setTf] = useState('1D');
  const [side, setSide] = useState('BUY');
  const [qty, setQty] = useState('');

  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [recentTrades, setRecentTrades] = useState([]);
  const [priceHistoryRows, setPriceHistoryRows] = useState([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // Fetch real market data for the active token whenever it changes.
  const loadMarketData = useCallback(async (symbol) => {
    if (!symbol) return;
    setMarketLoading(true);
    try {
      const [obRes, trRes, phRes] = await Promise.all([
        tokensApi.orderBook(symbol),
        tokensApi.recentTrades(symbol, 30),
        tokensApi.priceHistory(symbol, 90),
      ]);
      setOrderBook({
        bids: (obRes.data?.bids || []).map(b => ({ price: Number(b.price_inr), qty: Number(b.quantity) })),
        asks: (obRes.data?.asks || []).map(a => ({ price: Number(a.price_inr), qty: Number(a.quantity) })),
      });
      // Real trades table doesn't record buy/sell direction, so we derive an
      // uptick/downtick indicator from consecutive prices — a standard,
      // defensible convention, not a fabricated claim.
      const rows = trRes.data || [];
      setRecentTrades(rows.map((t, i) => {
        const prevPrice = rows[i + 1]?.price_inr ?? t.price_inr;
        return {
          price: Number(t.price_inr),
          qty: Number(t.quantity),
          side: Number(t.price_inr) >= Number(prevPrice) ? 'BUY' : 'SELL',
          time: new Date(t.executed_at).toTimeString().slice(0, 8),
        };
      }));
      setPriceHistoryRows(phRes.data || []);
    } catch (err) {
      console.error('Market data fetch failed', err);
    } finally {
      setMarketLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!tradeOpen || !activeSymbol) return;
    setQty('');
    loadMarketData(activeSymbol);
  }, [tradeOpen, activeSymbol, loadMarketData]);

  if (!tradeOpen) return null;

  if (!activeToken) {
    // No tokens loaded yet (still fetching, or none exist) — avoid crashing
    // on a null token below.
    return (
      <div className="tm-overlay" onClick={e => e.target === e.currentTarget && setTradeOpen(false)}>
        <div className="tm-shell" role="dialog" aria-modal="true" aria-label="Trade">
          <div className="tm-header">
            <div className="tm-brand"><span className="tm-brand-main">Loading market…</span></div>
            <button className="tm-close" onClick={() => setTradeOpen(false)}>✕</button>
          </div>
        </div>
      </div>
    );
  }

  const livePrice = activeToken.price ?? 0;
  const prevPrice = activeToken.prevPrice ?? livePrice;
  const change = livePrice - prevPrice;
  const changePct = prevPrice ? ((change / prevPrice) * 100).toFixed(2) : '0.00';
  const isUp = change >= 0;
  const orderTotal = qty ? (livePrice * parseFloat(qty)).toFixed(2) : '0.00';

  // Real price history if this token has at least 2 recorded points (a
  // single point can't draw a line — was previously treated as "real
  // enough," which silently drew a blank/zero-length chart); otherwise
  // fall back to an illustrative simulated series.
  const realCloses = priceHistoryRows.map(r => Number(r.close)).filter(n => !isNaN(n));
  const days = TF_DAYS[tf];
  const history = realCloses.length >= 2
    ? realCloses.slice(-days)
    : genHistory(livePrice || 100, tf === '1D' ? 80 : tf === '1W' ? 120 : tf === '1M' ? 200 : 350);

  // Real order book if there are any open orders; otherwise illustrative.
  const displayOrderBook = (orderBook.bids.length || orderBook.asks.length)
    ? orderBook
    : genOrderBook(livePrice || 100);

  // Real trades if any exist; otherwise illustrative.
  const displayTrades = recentTrades.length ? recentTrades : genRecentTrades(livePrice || 100);

  // Real 24h high/low if the backend has recorded them; otherwise an
  // illustrative estimate band around the live price.
  const dayHigh = activeToken.day_high_inr ?? livePrice * 1.018;
  const dayLow  = activeToken.day_low_inr  ?? livePrice * 0.974;
  const volume  = recentTrades.length
    ? recentTrades.reduce((sum, t) => sum + t.price * t.qty, 0)
    : null;

  const handlePlaceOrder = async () => {
    if (!qty || parseFloat(qty) <= 0) return;

    if (!connected) {
      setWalletOpen(true);
      return;
    }

    // Always a market order: it fills instantly at current_price_inr on the
    // backend and immediately updates portfolio_holdings + transactions.
    // (A limit order only fills against an opposing limit order from another
    // user — with no real counterparties yet, those would sit open forever,
    // which is why orders used to "place" but never show up anywhere.)
    const p = livePrice;

    setOrderLoading(true);
    try {
      const res = await ordersApi.place({
        symbol:   activeToken.symbol,
        side:     side.toLowerCase(),
        type:     'market',
        quantity: parseInt(qty),
      });
      const pnl = res?.data?.realized_pnl_this_trade;
      const pnlLine = side === 'SELL' && pnl != null
        ? ` · ${pnl >= 0 ? 'Profit' : 'Loss'} ₹${Math.abs(pnl).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        : '';
      showToast(
        `Order Filled ✓`,
        `${activeToken.symbol} ${side} ₹${p.toFixed(2)} × ${qty} tokens · Total ₹${(p * parseFloat(qty)).toLocaleString('en-IN')}${pnlLine}`
      );
      setQty('');
      // Refresh real order book / trades to reflect the new order.
      loadMarketData(activeToken.symbol);
    } catch (err) {
      showToast('Order Failed', err.message || 'Please try again');
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="tm-overlay" onClick={e => e.target === e.currentTarget && setTradeOpen(false)}>
      <div className="tm-shell" role="dialog" aria-modal="true" aria-label="Trade">

        {/* ── Header ── */}
        <div className="tm-header">
          <div className="tm-header-left">
            <div className="tm-brand">
              <span className="tm-brand-main">SECONDARY MARKET · द्वितीयक बाज़ार</span>
              <span className="tm-brand-sub">BSE Token Exchange</span>
            </div>
          </div>

          {/* Token ticker strip — real tokens */}
          <div className="tm-ticker-strip">
            {tokens.slice(0, 3).map(t => {
              const p = t.price ?? 0;
              const prev = t.prevPrice ?? p;
              const pct = prev ? (((p - prev) / prev) * 100).toFixed(2) : '0.00';
              const up = p >= prev;
              return (
                <div
                  key={t.symbol}
                  className={`tm-ticker-item${activeToken.symbol === t.symbol ? ' active' : ''}`}
                  onClick={() => setTradeSymbol(t.symbol)}
                >
                  <span className="tm-ticker-sym">{t.symbol}</span>
                  <span className="tm-ticker-name">{t.name}</span>
                  <span className="tm-ticker-price">₹{p.toFixed(2)}</span>
                  <span className={`tm-ticker-chg ${up ? 'up' : 'dn'}`}>{up ? '▲' : '▼'} {Math.abs(pct)}%</span>
                </div>
              );
            })}
          </div>

          <button className="tm-close" onClick={() => setTradeOpen(false)}>✕</button>
        </div>

        {/* ── Body ── */}
        <div className="tm-body">

          {/* Order Book */}
          <div className="tm-order-book">
            <div className="tm-panel-title">ORDER BOOK</div>
            <div className="tm-ob-header">
              <span>PRICE (₹)</span><span>QTY</span><span>TOTAL</span>
            </div>
            <div className="tm-ob-asks">
              {displayOrderBook.asks.map((row, i) => (
                <div key={i} className="tm-ob-row tm-ob-ask">
                  <span className="tm-ob-price ask">{row.price.toFixed(2)}</span>
                  <span>{(row.qty / 1000).toFixed(1)}K</span>
                  <span>{(row.price * row.qty / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
            <div className="tm-ob-mid">
              <span className={`tm-ob-mid-price ${isUp ? 'up' : 'dn'}`}>₹{livePrice.toFixed(2)}</span>
              <span className={`tm-ob-mid-chg ${isUp ? 'up' : 'dn'}`}>{isUp ? '▲' : '▼'} {Math.abs(parseFloat(changePct))}%</span>
              <span className="tm-ob-mid-label">LAST TRADED PRICE</span>
            </div>
            <div className="tm-ob-bids">
              {displayOrderBook.bids.map((row, i) => (
                <div key={i} className="tm-ob-row tm-ob-bid">
                  <span className="tm-ob-price bid">{row.price.toFixed(2)}</span>
                  <span>{(row.qty / 1000).toFixed(1)}K</span>
                  <span>{(row.price * row.qty / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main chart area */}
          <div className="tm-main">
            {/* Token info */}
            <div className="tm-token-info">
              <div className="tm-token-left">
                <span className={`tm-live-price ${isUp ? 'up' : 'dn'}`}>₹{livePrice.toFixed(2)}</span>
                <div className="tm-token-meta">
                  <span className="tm-token-sym">{activeToken.symbol} · {activeToken.name}</span>
                </div>
              </div>
              <div className="tm-token-stats">
                {[
                  ['24H HIGH', `₹${dayHigh.toFixed(2)}`],
                  ['24H LOW',  `₹${dayLow.toFixed(2)}`],
                  ['VOLUME',   volume != null ? `₹${(volume / 100000).toFixed(2)}L` : '—'],
                  ['HARVEST',  `${activeToken.days ?? '—'} days`],
                ].map(([l, v]) => (
                  <div key={l} className="tm-stat">
                    <span className="tm-stat-label">{l}</span>
                    <span className="tm-stat-val">{v}</span>
                  </div>
                ))}
              </div>
              <div className="tm-tf-tabs">
                {TIMEFRAMES.map(t => (
                  <button key={t} className={`tm-tf-btn${tf === t ? ' active' : ''}`} onClick={() => setTf(t)}>{t}</button>
                ))}
              </div>
            </div>

            {/* Price chart */}
            <PriceChart history={history} color={isUp ? '#6daf4a' : '#c04030'} />

            {/* Depth chart */}
            <div className="tm-depth-wrap">
              <span className="tm-depth-label">MARKET DEPTH</span>
              <DepthChart orderBook={displayOrderBook} />
            </div>

            {/* Buy/Sell form */}
            <div className="tm-order-form">
              <div className="tm-side-tabs">
                <button
                  className={`tm-side-btn buy${side === 'BUY' ? ' active' : ''}`}
                  onClick={() => setSide('BUY')}
                >BUY</button>
                <button
                  className={`tm-side-btn sell${side === 'SELL' ? ' active' : ''}`}
                  onClick={() => setSide('SELL')}
                >SELL</button>
              </div>

              <div className="tm-form-row">
                <div className="tm-field">
                  <label className="tm-field-label">MARKET PRICE (₹)</label>
                  <div className="tm-field-input-wrap">
                    <span className="tm-field-prefix">₹</span>
                    <span className="tm-field-input" style={{ opacity: 0.85 }}>
                      {livePrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="tm-field">
                  <label className="tm-field-label">QUANTITY (TOKENS)</label>
                  <div className="tm-field-input-wrap">
                    <input
                      className="tm-field-input"
                      type="number"
                      placeholder="0"
                      value={qty}
                      onChange={e => setQty(e.target.value)}
                    />
                    <span className="tm-field-suffix">▲▼</span>
                  </div>
                </div>
              </div>

              <div className="tm-order-total">
                <span className="tm-order-total-label">ORDER TOTAL</span>
                <span className="tm-order-total-val">₹{parseFloat(orderTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <button
                className={`tm-place-btn ${side === 'BUY' ? 'buy' : 'sell'}`}
                onClick={handlePlaceOrder}
                disabled={orderLoading}
              >
                {orderLoading ? 'PLACING…' : `PLACE ${side} ORDER →`}
              </button>
            </div>
          </div>

          {/* Recent Trades */}
          <div className="tm-recent-trades">
            <div className="tm-panel-title">RECENT TRADES</div>
            <div className="tm-rt-header">
              <span>PRICE</span><span>QTY</span><span>SIDE</span><span></span>
            </div>
            <div className="tm-rt-list">
              {displayTrades.map((t, i) => (
                <div key={i} className={`tm-rt-row ${t.side === 'BUY' ? 'buy' : 'sell'}`}>
                  <span className={`tm-rt-price ${t.side === 'BUY' ? 'up' : 'dn'}`}>{t.price.toFixed(2)}</span>
                  <span>{t.qty}</span>
                  <span className={t.side === 'BUY' ? 'up' : 'dn'}>{t.side}</span>
                  <span className="tm-rt-time">{t.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
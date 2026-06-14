import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { BSI_CONSTITUENTS } from '../../../data/tokens';
import './TradeModal.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const TIMEFRAMES = ['1D', '1W', '1M', 'ALL'];

// Generate price history for a token
function genHistory(basePrice, points) {
  const hist = [];
  let p = basePrice * (0.88 + Math.random() * 0.08);
  for (let i = 0; i < points; i++) {
    p = Math.max(basePrice * 0.7, p + (Math.random() - 0.47) * basePrice * 0.012);
    hist.push(parseFloat(p.toFixed(2)));
  }
  return hist;
}

// Generate order book entries
function genOrderBook(basePrice) {
  const asks = [];
  const bids = [];
  let ap = basePrice + (Math.random() * 2);
  let bp = basePrice - (Math.random() * 2);
  for (let i = 0; i < 10; i++) {
    asks.push({ price: parseFloat(ap.toFixed(2)), qty: parseFloat((Math.random() * 5000 + 50).toFixed(1)), side: 'ask' });
    ap += Math.random() * 1.5;
    bids.push({ price: parseFloat(bp.toFixed(2)), qty: parseFloat((Math.random() * 5000 + 50).toFixed(1)), side: 'bid' });
    bp -= Math.random() * 1.5;
  }
  return { asks: asks.reverse(), bids };
}

// Generate recent trades
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
    const toX = i => (i / (history.length - 1)) * W;
    const toY = v => H - ((v - min) / (max - min)) * H * 0.88 - H * 0.06;

    // Area gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + '40');
    grad.addColorStop(1, color + '00');
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(history[0]));
    history.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(history[0]));
    history.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round'; ctx.stroke();

    // Hover crosshair
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

    // Y-axis price labels
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
      {hoverIdx != null && (
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

    let bidCum = 0, askCum = 0;
    const bidPoints = bids.map(b => { bidCum += b.qty; return bidCum; });
    const askPoints = asks.map(a => { askCum += a.qty; return askCum; });
    const maxQ = Math.max(bidCum, askCum);

    // Bid area (green, left half)
    const bidGrad = ctx.createLinearGradient(0, 0, W / 2, 0);
    bidGrad.addColorStop(0, 'rgba(109,175,74,0)');
    bidGrad.addColorStop(1, 'rgba(109,175,74,0.25)');
    ctx.beginPath();
    ctx.moveTo(0, H);
    bids.forEach((b, i) => {
      ctx.lineTo((i / (bids.length - 1)) * (W / 2), H - (bidPoints[i] / maxQ) * H * 0.85);
    });
    ctx.lineTo(W / 2, H); ctx.closePath();
    ctx.fillStyle = bidGrad; ctx.fill();
    ctx.beginPath();
    bids.forEach((b, i) => ctx.lineTo((i / (bids.length - 1)) * (W / 2), H - (bidPoints[i] / maxQ) * H * 0.85));
    ctx.strokeStyle = '#6daf4a'; ctx.lineWidth = 1.2; ctx.stroke();

    // Ask area (red, right half)
    const askGrad = ctx.createLinearGradient(W / 2, 0, W, 0);
    askGrad.addColorStop(0, 'rgba(180,60,40,0.25)');
    askGrad.addColorStop(1, 'rgba(180,60,40,0)');
    ctx.beginPath();
    ctx.moveTo(W / 2, H);
    asks.forEach((a, i) => {
      ctx.lineTo(W / 2 + (i / (asks.length - 1)) * (W / 2), H - (askPoints[i] / maxQ) * H * 0.85);
    });
    ctx.lineTo(W, H); ctx.closePath();
    ctx.fillStyle = askGrad; ctx.fill();
    ctx.beginPath();
    asks.forEach((a, i) => ctx.lineTo(W / 2 + (i / (asks.length - 1)) * (W / 2), H - (askPoints[i] / maxQ) * H * 0.85));
    ctx.strokeStyle = '#b43c28'; ctx.lineWidth = 1.2; ctx.stroke();

    // Mid price label
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
  const { tradeOpen, setTradeOpen, showToast } = useAppContext();

  const [activeToken, setActiveToken] = useState(BSI_CONSTITUENTS[2]); // VDB-SOY default
  const [tf, setTf] = useState('1D');
  const [side, setSide] = useState('BUY');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [histories, setHistories] = useState({});
  const [orderBook, setOrderBook] = useState(() => genOrderBook(623));
  const [recentTrades, setRecentTrades] = useState(() => genRecentTrades(623));
  const [livePrice, setLivePrice] = useState(activeToken.basePrice);
  const [livePrices, setLivePrices] = useState(() =>
    Object.fromEntries(BSI_CONSTITUENTS.map(t => [t.symbol, t.basePrice]))
  );

  // Generate histories on mount
  useEffect(() => {
    const h = {};
    BSI_CONSTITUENTS.forEach(t => {
      h[t.symbol] = {
        '1D': genHistory(t.basePrice, 80),
        '1W': genHistory(t.basePrice, 120),
        '1M': genHistory(t.basePrice, 200),
        'ALL': genHistory(t.basePrice, 350),
      };
    });
    setHistories(h);
  }, []);

  // Live price tick
  useEffect(() => {
    if (!tradeOpen) return;
    const interval = setInterval(() => {
      setLivePrice(p => {
        const next = parseFloat((p + (Math.random() - 0.48) * p * 0.003).toFixed(2));
        return next;
      });
      setLivePrices(prev => {
        const next = { ...prev };
        BSI_CONSTITUENTS.forEach(t => {
          next[t.symbol] = parseFloat((prev[t.symbol] + (Math.random() - 0.48) * prev[t.symbol] * 0.002).toFixed(2));
        });
        return next;
      });
      // Occasionally add a new recent trade
      if (Math.random() > 0.4) {
        setRecentTrades(prev => [{
          price: parseFloat((livePrice + (Math.random() - 0.5) * 2).toFixed(2)),
          qty: Math.floor(Math.random() * 500 + 1),
          side: Math.random() > 0.45 ? 'BUY' : 'SELL',
          time: new Date().toTimeString().slice(0, 8),
        }, ...prev.slice(0, 24)]);
      }
    }, 1800);
    return () => clearInterval(interval);
  }, [tradeOpen, livePrice]);

  // Sync livePrice when switching tokens
  useEffect(() => {
    setLivePrice(livePrices[activeToken.symbol] || activeToken.basePrice);
    setOrderBook(genOrderBook(livePrices[activeToken.symbol] || activeToken.basePrice));
    setPrice('');
    setQty('');
  }, [activeToken.symbol]);

  if (!tradeOpen) return null;

  const history = histories[activeToken.symbol]?.[tf] || [];
  const prevPrice = history[history.length - 2] || livePrice;
  const change = livePrice - prevPrice;
  const changePct = ((change / prevPrice) * 100).toFixed(2);
  const isUp = change >= 0;
  const orderTotal = price && qty ? (parseFloat(price) * parseFloat(qty)).toFixed(2) : '0.00';

  const handlePlaceOrder = () => {
    if (!qty || parseFloat(qty) <= 0) return;
    const p = price || livePrice.toFixed(2);
    showToast(
      `Order ${side === 'BUY' ? 'Filled ✓' : 'Placed'}`,
      `${activeToken.symbol} ${side} ₹${p} × ${qty} tokens · Total ₹${(parseFloat(p) * parseFloat(qty)).toLocaleString('en-IN')}`
    );
    setRecentTrades(prev => [{
      price: parseFloat(parseFloat(p).toFixed(2)),
      qty: parseInt(qty),
      side,
      time: new Date().toTimeString().slice(0, 8),
    }, ...prev.slice(0, 24)]);
    setQty('');
    setPrice('');
  };

  return (
    <div className="tm-overlay" onClick={e => e.target === e.currentTarget && setTradeOpen(false)}>
      <div className="tm-shell">

        {/* ── Header ── */}
        <div className="tm-header">
          <div className="tm-header-left">
            <div className="tm-brand">
              <span className="tm-brand-main">SECONDARY MARKET · द्वितीयक बाज़ार</span>
              <span className="tm-brand-sub">BSE Token Exchange</span>
            </div>
          </div>

          {/* Token ticker strip */}
          <div className="tm-ticker-strip">
            {BSI_CONSTITUENTS.slice(0, 3).map(t => {
              const p = livePrices[t.symbol] || t.basePrice;
              const prev = t.basePrice;
              const pct = (((p - prev) / prev) * 100).toFixed(2);
              const up = p >= prev;
              return (
                <div
                  key={t.symbol}
                  className={`tm-ticker-item${activeToken.symbol === t.symbol ? ' active' : ''}`}
                  onClick={() => setActiveToken(t)}
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
              {orderBook.asks.map((row, i) => (
                <div key={i} className="tm-ob-row tm-ob-ask" onClick={() => setPrice(row.price.toString())}>
                  <span className="tm-ob-price ask">{row.price.toFixed(2)}</span>
                  <span>{(row.qty / 1000).toFixed(1)}K</span>
                  <span>{(row.price * row.qty / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
            <div className="tm-ob-mid">
              <span className={`tm-ob-mid-price ${isUp ? 'up' : 'dn'}`}>₹{livePrice.toFixed(2)}</span>
              <span className={`tm-ob-mid-chg ${isUp ? 'up' : 'dn'}`}>{isUp ? '▲' : '▼'} +{Math.abs(parseFloat(changePct))}%</span>
              <span className="tm-ob-mid-label">LAST TRADED PRICE</span>
            </div>
            <div className="tm-ob-bids">
              {orderBook.bids.map((row, i) => (
                <div key={i} className="tm-ob-row tm-ob-bid" onClick={() => setPrice(row.price.toString())}>
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
                  ['24H HIGH', `₹${(livePrice * 1.018).toFixed(2)}`],
                  ['24H LOW',  `₹${(livePrice * 0.974).toFixed(2)}`],
                  ['VOLUME',   '₹1.1 Cr'],
                  ['HARVEST',  `${activeToken.weight * 3 | 0} days`],
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
              <DepthChart orderBook={orderBook} />
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
                  <label className="tm-field-label">PRICE PER TOKEN (₹)</label>
                  <div className="tm-field-input-wrap">
                    <span className="tm-field-prefix">₹</span>
                    <input
                      className="tm-field-input"
                      type="number"
                      placeholder={livePrice.toFixed(2)}
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                    />
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
              >
                PLACE {side} ORDER →
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
              {recentTrades.map((t, i) => (
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
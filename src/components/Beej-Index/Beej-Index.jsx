import { useState, useEffect, useRef, useCallback } from 'react';
import { BSI_CONSTITUENTS } from '../../data/tokens';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtIndex(v) {
  return v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function genHistory(pts, vol) {
  const data = [];
  let v = 9800 + Math.random() * 200;
  for (let i = 0; i < pts; i++) {
    const d = (Math.random() - 0.468) * vol;
    v = Math.max(v * 0.8, v + d);
    v += (10240 - v) * 0.008;
    data.push(Math.round(v * 100) / 100);
  }
  data.push(10240);
  return data;
}

function genSparkline(basePrice) {
  const spark = [];
  let p = basePrice * 0.94;
  for (let i = 0; i < 20; i++) {
    p += (Math.random() - 0.5) * basePrice * 0.006;
    p = p + (basePrice - p) * 0.05;
    spark.push(Math.round(p * 100) / 100);
  }
  spark.push(basePrice);
  return spark;
}

// ─── Static data initialised once ───────────────────────────────────────────

const BASE_INDEX = 10240;

const INDEX_HISTORY = {
  '1D':  genHistory(96,   12),
  '1W':  genHistory(168,  22),
  '1M':  genHistory(720,  35),
  '3M':  genHistory(2160, 55),
  'ALL': genHistory(4320, 80),
};

// Mutable constituent state (price + sparkline walk live)
const LIVE = BSI_CONSTITUENTS.map(c => ({
  ...c,
  price: c.basePrice,
  sparkline: genSparkline(c.basePrice),
  get change() {
    return ((this.price - this.sparkline[0]) / this.sparkline[0] * 100);
  },
}));

// Build sectors from constituents
function buildSectors(constituents) {
  const s = {};
  constituents.forEach(c => {
    if (!s[c.sector]) s[c.sector] = { weight: 0, color: c.color };
    s[c.sector].weight += c.weight;
  });
  return s;
}

// ─── Canvas drawing utilities ────────────────────────────────────────────────

function drawMiniChart(canvas, data) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 380, H = canvas.offsetHeight || 130;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const pad = { top: 20, right: 12, bottom: 22, left: 10 };
  const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom;
  const minV = Math.min(...data) * 0.998, maxV = Math.max(...data) * 1.002, rng = maxV - minV;
  const sx = i => pad.left + (i / (data.length - 1)) * cW;
  const sy = v => pad.top + (1 - (v - minV) / rng) * cH;

  const isUp = data[data.length - 1] >= data[0];
  const lineC = isUp ? '#5a9e40' : '#e05c1a';
  const fillS = isUp ? 'rgba(74,117,53,0.16)' : 'rgba(224,92,26,0.13)';

  // Grid
  ctx.strokeStyle = 'rgba(200,134,10,0.06)'; ctx.lineWidth = 1;
  for (let i = 1; i <= 2; i++) {
    const y = pad.top + (i / 3) * cH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
  }

  // Area fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
  grad.addColorStop(0, fillS); grad.addColorStop(1, 'rgba(14,11,5,0)');
  ctx.beginPath();
  ctx.moveTo(sx(0), sy(data[0]));
  for (let i = 1; i < data.length; i++) ctx.lineTo(sx(i), sy(data[i]));
  ctx.lineTo(sx(data.length - 1), pad.top + cH);
  ctx.lineTo(sx(0), pad.top + cH);
  ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(sx(0), sy(data[0]));
  for (let i = 1; i < data.length; i++) ctx.lineTo(sx(i), sy(data[i]));
  ctx.strokeStyle = lineC; ctx.lineWidth = 1.8; ctx.stroke();

  // Endpoint dot
  const ex = sx(data.length - 1), ey = sy(data[data.length - 1]);
  ctx.beginPath(); ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = lineC; ctx.fill();

  // X labels
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(212,200,154,0.2)';
  ctx.textAlign = 'center';
  ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'].forEach((lbl, i) => {
    ctx.fillText(lbl, pad.left + (i / 5) * cW, H - 4);
  });
}

function drawSparkline(canvas, data, up) {
  if (!canvas) return;
  const W = 70, H = 24, dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
  const minV = Math.min(...data), maxV = Math.max(...data), rng = maxV - minV || 1;
  const sx = i => 2 + (i / (data.length - 1)) * (W - 4);
  const sy = v => 2 + (1 - (v - minV) / rng) * (H - 4);
  ctx.beginPath();
  data.forEach((v, i) => i === 0 ? ctx.moveTo(sx(i), sy(v)) : ctx.lineTo(sx(i), sy(v)));
  ctx.strokeStyle = up ? 'rgba(109,175,74,0.7)' : 'rgba(224,92,26,0.7)';
  ctx.lineWidth = 1.2; ctx.stroke();
}

function drawRing(canvas, sectors, hoveredSector, ringValEl) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const S = 180;
  canvas.width = S * dpr; canvas.height = S * dpr;
  canvas.style.width = S + 'px'; canvas.style.height = S + 'px';
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
  const cx = S / 2, cy = S / 2, r = 72, inner = 48;
  let startAngle = -Math.PI / 2;
  const total = Object.values(sectors).reduce((s, v) => s + v.weight, 0);
  const slices = [];

  Object.entries(sectors).forEach(([name, sec]) => {
    const slice = (sec.weight / total) * Math.PI * 2;
    const isHov = name === hoveredSector;
    const rr = isHov ? r + 6 : r;
    const ri = isHov ? inner - 2 : inner;
    slices.push({ name, sec, startAngle, endAngle: startAngle + slice, r: rr, inner: ri });

    ctx.beginPath();
    ctx.moveTo(cx + ri * Math.cos(startAngle), cy + ri * Math.sin(startAngle));
    ctx.arc(cx, cy, rr, startAngle, startAngle + slice);
    ctx.arc(cx, cy, ri, startAngle + slice, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = isHov ? sec.color : sec.color + 'cc';
    ctx.fill();
    if (isHov) {
      ctx.shadowColor = sec.color; ctx.shadowBlur = 14;
      ctx.fill(); ctx.shadowBlur = 0;
    }
    startAngle += slice;
  });

  if (ringValEl) {
    if (hoveredSector && sectors[hoveredSector]) {
      ringValEl.textContent = sectors[hoveredSector].weight.toFixed(1) + '%';
    } else {
      ringValEl.textContent = Object.keys(sectors).length + ' Sectors';
    }
  }

  return slices;
}

function drawBigChart(canvas, data, hoverX, modalValEl) {
  if (!canvas) return;
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const W = rect.width, H = rect.height;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);

  const pad = { top: 30, right: 60, bottom: 36, left: 16 };
  const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom;
  const minV = Math.min(...data) * 0.997, maxV = Math.max(...data) * 1.003, rng = maxV - minV;
  const sx = i => pad.left + (i / (data.length - 1)) * cW;
  const sy = v => pad.top + (1 - (v - minV) / rng) * cH;

  const isUp = data[data.length - 1] >= data[0];
  const lineC = isUp ? '#5a9e40' : '#e05c1a';
  const fillS = isUp ? 'rgba(74,117,53,0.14)' : 'rgba(224,92,26,0.11)';

  // Grid + Y labels
  for (let i = 1; i <= 5; i++) {
    const y = pad.top + (i / 6) * cH;
    const v = maxV - (i / 6) * rng;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y);
    ctx.strokeStyle = 'rgba(200,134,10,0.07)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.font = '500 9px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(212,200,154,0.22)';
    ctx.textAlign = 'left';
    ctx.fillText(fmtIndex(v), W - pad.right + 4, y + 3);
  }

  // Area fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
  grad.addColorStop(0, fillS); grad.addColorStop(1, 'rgba(14,11,5,0)');
  ctx.beginPath();
  ctx.moveTo(sx(0), sy(data[0]));
  for (let i = 1; i < data.length; i++) ctx.lineTo(sx(i), sy(data[i]));
  ctx.lineTo(sx(data.length - 1), pad.top + cH);
  ctx.lineTo(sx(0), pad.top + cH);
  ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(sx(0), sy(data[0]));
  for (let i = 1; i < data.length; i++) ctx.lineTo(sx(i), sy(data[i]));
  ctx.strokeStyle = lineC; ctx.lineWidth = 1.8; ctx.stroke();

  // Hover crosshair
  if (hoverX >= pad.left && hoverX <= W - pad.right) {
    const idx = Math.round((hoverX - pad.left) / cW * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    const cx2 = sx(clamped), cy2 = sy(data[clamped]);
    ctx.beginPath(); ctx.moveTo(cx2, pad.top); ctx.lineTo(cx2, pad.top + cH);
    ctx.strokeStyle = 'rgba(200,134,10,0.22)'; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx2, cy2, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = lineC; ctx.fill();

    const lbl = fmtIndex(data[clamped]);
    ctx.font = '500 11px JetBrains Mono, monospace';
    const lw = ctx.measureText(lbl).width + 14;
    const lx = cx2 + 10 < W - pad.right - lw ? cx2 + 10 : cx2 - lw - 4;
    ctx.fillStyle = 'rgba(12,9,4,0.9)';
    ctx.fillRect(lx, cy2 - 11, lw, 20);
    ctx.fillStyle = '#C8860A';
    ctx.fillText(lbl, lx + 7, cy2 + 4);

    if (modalValEl) modalValEl.textContent = fmtIndex(data[clamped]);
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BeejIndex() {
  const [modalOpen, setModalOpen]   = useState(false);
  const [modalTF, setModalTF]       = useState('1D');
  const [sortMode, setSortMode]     = useState('weight');
  const [currentIndex, setCurrentIndex] = useState(BASE_INDEX);
  const [liveData, setLiveData]     = useState(LIVE);
  const [hoveredSector, setHoveredSector] = useState(null);

  // Refs for canvas elements
  const miniRef     = useRef(null);
  const ringRef     = useRef(null);
  const bigRef      = useRef(null);
  const ringValRef  = useRef(null);
  const modalValRef = useRef(null);
  const ringSlicesRef = useRef([]);
  const hoverXRef   = useRef(-1);
  const constitRef  = useRef(null);

  const sectors = buildSectors(BSI_CONSTITUENTS);

  // ── Compute header values ──────────────────────────────────
  const hist1D  = INDEX_HISTORY['1D'];
  const chgPct  = ((currentIndex - hist1D[0]) / hist1D[0] * 100);
  const isUp    = chgPct >= 0;
  const allHist = INDEX_HISTORY['ALL'];
  const ath     = Math.max(...allHist);
  const seasonStart = allHist[0];
  const mcap    = (currentIndex * 8240 / 1e7).toFixed(1);

  // ── Live tick ──────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex(prev => {
        const delta = (Math.random() - 0.482) * 18;
        let next = Math.round((prev + delta) * 100) / 100;
        next = next + (BASE_INDEX - next) * 0.003;

        INDEX_HISTORY['1D'].push(next);
        if (INDEX_HISTORY['1D'].length > 200) INDEX_HISTORY['1D'].shift();

        return next;
      });

      setLiveData(prev => prev.map(c => {
        const d = (Math.random() - 0.49) * c.basePrice * 0.003;
        let newPrice = Math.round((c.price + d) * 100) / 100;
        newPrice = newPrice + (c.basePrice - newPrice) * 0.01;
        const newSpark = [...c.sparkline, newPrice];
        if (newSpark.length > 21) newSpark.shift();
        return { ...c, price: newPrice, sparkline: newSpark };
      }));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // ── Redraw mini chart ──────────────────────────────────────
  useEffect(() => {
    drawMiniChart(miniRef.current, INDEX_HISTORY['1D']);
  }, [currentIndex]);

  // ── Redraw ring ────────────────────────────────────────────
  useEffect(() => {
    const slices = drawRing(ringRef.current, sectors, hoveredSector, ringValRef.current);
    if (slices) ringSlicesRef.current = slices;
  }, [hoveredSector, currentIndex]);

  // ── Redraw big chart ───────────────────────────────────────
  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => {
        drawBigChart(bigRef.current, INDEX_HISTORY[modalTF], hoverXRef.current, modalValRef.current);
      }, 60);
    }
  }, [modalOpen, modalTF, currentIndex]);

  // ── Draw constituent sparklines after render ───────────────
  useEffect(() => {
    if (!constitRef.current) return;
    const sorted = getSorted();
    sorted.forEach(c => {
      const cvs = constitRef.current.querySelector(`canvas[data-sym="${c.symbol}"]`);
      if (cvs) drawSparkline(cvs, c.sparkline, c.change >= 0);
    });
  });

  // ── Resize handler ─────────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      drawMiniChart(miniRef.current, INDEX_HISTORY['1D']);
      if (modalOpen) drawBigChart(bigRef.current, INDEX_HISTORY[modalTF], hoverXRef.current, modalValRef.current);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [modalOpen, modalTF]);

  // ── Sort helper ────────────────────────────────────────────
  function getSorted() {
    const sorted = [...liveData];
    if (sortMode === 'weight') sorted.sort((a, b) => b.weight - a.weight);
    else if (sortMode === 'change') sorted.sort((a, b) => b.change - a.change);
    else sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }

  // ── Ring mouse hit-test ────────────────────────────────────
  function getSectorAtPoint(mx, my) {
    const S = 180, cx = S / 2, cy = S / 2;
    const dx = mx - cx, dy = my - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const offset = -Math.PI / 2;
    let a = Math.atan2(dy, dx) - offset;
    if (a < 0) a += Math.PI * 2;

    for (const sl of ringSlicesRef.current) {
      let sa = sl.startAngle - offset;
      let ea = sl.endAngle - offset;
      if (sa < 0) sa += Math.PI * 2;
      if (ea < 0) ea += Math.PI * 2;
      if (ea < sa) ea += Math.PI * 2;
      let ta = a;
      if (ta < sa) ta += Math.PI * 2;
      if (ta >= sa && ta <= ea && dist >= sl.inner && dist <= sl.r + 6) return sl.name;
    }
    return null;
  }

  // ── Modal header values ────────────────────────────────────
  const modalChgPct = ((currentIndex - hist1D[0]) / hist1D[0] * 100);
  const modalIsUp   = modalChgPct >= 0;
  const seasonLow   = Math.min(...allHist);
  const modalVol    = (4.2 + Math.random() * 1.5).toFixed(1);

  const sorted = getSorted();
  const maxWeight = Math.max(...BSI_CONSTITUENTS.map(c => c.weight));

  return (
    <>
      {/* ── Main Section ──────────────────────────────────── */}
      <section id="bse-index">
        <div className="bsi-inner">

          {/* Hero band */}
          <div className="bsi-hero reveal">
            <div className="bsi-hero-left">
              <p className="bsi-eyebrow">BSE Aggregate Index · Kharif 2025</p>
              <h2 className="bsi-title">BEEJ-50<br /><em>The pulse of India's fields.</em></h2>
              <p className="bsi-subtitle">
                A market-cap weighted index of all active crop tokens on the exchange — real yields, real soil, real returns.
              </p>

              <div className="bsi-value-wrap">
                <div className="bsi-value">{fmtIndex(currentIndex)}</div>
                <div className="bsi-change-wrap">
                  <div className={`bsi-change ${isUp ? 'up' : 'down'}`}>
                    {isUp ? '▲ +' : '▼ '}{Math.abs(chgPct).toFixed(2)}%
                  </div>
                  <div className="bsi-change-label">24h change</div>
                </div>
              </div>

              <div className="bsi-meta-row">
                <div className="bsi-meta-stat">
                  <span className="bsi-meta-label">All-Time High</span>
                  <span className="bsi-meta-val">{fmtIndex(ath)}</span>
                </div>
                <div className="bsi-meta-stat">
                  <span className="bsi-meta-label">Season Start</span>
                  <span className="bsi-meta-val">{fmtIndex(seasonStart)}</span>
                </div>
                <div className="bsi-meta-stat">
                  <span className="bsi-meta-label">Market Cap</span>
                  <span className="bsi-meta-val">₹{mcap} Cr</span>
                </div>
                <div className="bsi-meta-stat">
                  <span className="bsi-meta-label">Constituents</span>
                  <span className="bsi-meta-val">{BSI_CONSTITUENTS.length} Tokens</span>
                </div>
              </div>
            </div>

            <div className="bsi-hero-right">
              <canvas
                id="bsi-mini-canvas"
                ref={miniRef}
                width={380}
                height={130}
                onClick={() => setModalOpen(true)}
                style={{ cursor: 'pointer' }}
              />
              <button
                className="bsi-expand-btn"
                onClick={() => setModalOpen(true)}
              >
                ↗ EXPAND INDEX
              </button>
            </div>
          </div>

          {/* Grid header with sort */}
          <div className="bsi-grid-header reveal">
            <span className="bsi-grid-title">Index Constituents</span>
            <div className="bsi-grid-sort">
              {['weight', 'change', 'price'].map(mode => (
                <button
                  key={mode}
                  className={`bsi-sort-btn${sortMode === mode ? ' active' : ''}`}
                  onClick={() => setSortMode(mode)}
                >
                  By {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Constituent tiles */}
          <div
            className="bsi-constituents reveal reveal-delay-1"
            ref={constitRef}
          >
            {sorted.map((c, i) => {
              const up = c.change >= 0;
              return (
                <div
                  key={c.symbol}
                  className="bsi-constituent"
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => setModalOpen(true)}
                >
                  {/* Weight bar */}
                  <div
                    className="bsi-c-bar"
                    style={{
                      width: `${(c.weight / maxWeight * 100).toFixed(1)}%`,
                      background: `linear-gradient(to right, ${c.color}55, ${c.color}22)`,
                    }}
                  />
                  <div className="bsi-c-top">
                    <span className="bsi-c-symbol" style={{ color: c.color }}>{c.symbol}</span>
                    <span className="bsi-c-weight">{c.weight.toFixed(1)}%</span>
                  </div>
                  <div className="bsi-c-name">{c.name}</div>
                  <div className="bsi-c-region">{c.region}</div>
                  <canvas
                    className="bsi-c-sparkline"
                    data-sym={c.symbol}
                    width={70}
                    height={24}
                  />
                  <div className="bsi-c-bottom">
                    <span className="bsi-c-price">
                      ₹{c.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`bsi-c-change ${up ? 'up' : 'down'}`}>
                      {up ? '▲' : '▼'} {Math.abs(c.change).toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sector ring + legend */}
          <div className="bsi-bottom reveal reveal-delay-2">
            <div className="bsi-ring-wrap">
              <canvas
                id="bsi-ring-canvas"
                ref={ringRef}
                width={180}
                height={180}
                onMouseMove={e => {
                  const rect = ringRef.current.getBoundingClientRect();
                  const hit = getSectorAtPoint(e.clientX - rect.left, e.clientY - rect.top);
                  setHoveredSector(hit || null);
                }}
                onMouseLeave={() => setHoveredSector(null)}
              />
              <div className="bsi-ring-center">
                <span className="bsi-ring-center-val" ref={ringValRef}>
                  {Object.keys(sectors).length} Sectors
                </span>
                <span className="bsi-ring-center-label">Sector Mix</span>
              </div>
            </div>

            <div className="bsi-sector-legend">
              {Object.entries(sectors).map(([name, sec]) => (
                <div
                  key={name}
                  className="bsi-legend-row"
                  style={{ opacity: hoveredSector && hoveredSector !== name ? 0.45 : 1 }}
                  onMouseEnter={() => setHoveredSector(name)}
                  onMouseLeave={() => setHoveredSector(null)}
                >
                  <div className="bsi-legend-dot" style={{ background: sec.color }} />
                  <div className="bsi-legend-info">
                    <span className="bsi-legend-name">{name}</span>
                    <span className="bsi-legend-pct">{sec.weight.toFixed(1)}% weight</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Expanded Modal ────────────────────────────────── */}
      <div id="bsi-modal-backdrop" className={modalOpen ? 'open' : ''}>

        <div className="bsi-modal-topbar">
          <div className="bsi-modal-brand">
            <div className="bsi-modal-eyebrow">BSE Aggregate Index · बीज-50</div>
            <div className="bsi-modal-title">BEEJ-50 Index</div>
          </div>

          <div className="bsi-modal-live">
            <span className="bsi-modal-val" ref={modalValRef}>
              {fmtIndex(currentIndex)}
            </span>
            <span className={`bsi-modal-chg ${modalIsUp ? 'up' : 'down'}`}>
              {modalIsUp ? '▲ +' : '▼ '}{Math.abs(modalChgPct).toFixed(2)}%
            </span>
          </div>

          <button className="bsi-modal-close" onClick={() => setModalOpen(false)}>✕</button>
        </div>

        <div className="bsi-modal-body">

          {/* Chart panel */}
          <div className="bsi-modal-chart-wrap">
            <div className="bsi-modal-chart-controls">
              <div className="bsi-modal-stats">
                <div className="bsi-modal-stat">
                  <span className="bsi-modal-stat-label">All-Time High</span>
                  <span className="bsi-modal-stat-val">{fmtIndex(ath)}</span>
                </div>
                <div className="bsi-modal-stat">
                  <span className="bsi-modal-stat-label">Season Low</span>
                  <span className="bsi-modal-stat-val">{fmtIndex(seasonLow)}</span>
                </div>
                <div className="bsi-modal-stat">
                  <span className="bsi-modal-stat-label">Market Cap</span>
                  <span className="bsi-modal-stat-val">₹{mcap} Cr</span>
                </div>
                <div className="bsi-modal-stat">
                  <span className="bsi-modal-stat-label">24h Volume</span>
                  <span className="bsi-modal-stat-val">₹{modalVol} Cr</span>
                </div>
                <div className="bsi-modal-stat">
                  <span className="bsi-modal-stat-label">Tokens</span>
                  <span className="bsi-modal-stat-val">{BSI_CONSTITUENTS.length} Active</span>
                </div>
              </div>

              <div className="bsi-modal-tf-tabs">
                {['1D', '1W', '1M', '3M', 'ALL'].map(tf => (
                  <button
                    key={tf}
                    className={`bsi-modal-tf-tab${modalTF === tf ? ' active' : ''}`}
                    onClick={() => {
                      setModalTF(tf);
                      hoverXRef.current = -1;
                    }}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <canvas
              id="bsi-big-canvas"
              ref={bigRef}
              style={{ cursor: 'crosshair' }}
              onMouseMove={e => {
                const rect = bigRef.current.getBoundingClientRect();
                hoverXRef.current = e.clientX - rect.left;
                drawBigChart(bigRef.current, INDEX_HISTORY[modalTF], hoverXRef.current, modalValRef.current);
              }}
              onMouseLeave={() => {
                hoverXRef.current = -1;
                if (modalValRef.current) modalValRef.current.textContent = fmtIndex(currentIndex);
                drawBigChart(bigRef.current, INDEX_HISTORY[modalTF], -1, null);
              }}
            />
          </div>

          {/* Breakdown panel */}
          <div className="bsi-modal-breakdown">
            <div className="bsi-modal-breakdown-header">
              <div className="bsi-modal-breakdown-title">Index Composition</div>
            </div>
            <div className="bsi-modal-breakdown-list">
              {[...liveData].sort((a, b) => b.weight - a.weight).map((c, i) => {
                const up = c.change >= 0;
                const mxW = Math.max(...liveData.map(x => x.weight));
                return (
                  <div key={c.symbol} className="bsi-bd-row">
                    <span className="bsi-bd-rank">{i + 1}</span>
                    <div className="bsi-bd-dot" style={{ background: c.color }} />
                    <div className="bsi-bd-info">
                      <div className="bsi-bd-symbol" style={{ color: c.color }}>{c.symbol}</div>
                      <div className="bsi-bd-name">{c.name}</div>
                      <div className="bsi-bd-weight-bar">
                        <div
                          className="bsi-bd-weight-fill"
                          style={{
                            width: `${(c.weight / mxW * 100).toFixed(1)}%`,
                            background: `${c.color}88`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="bsi-bd-right">
                      <span className="bsi-bd-price">
                        ₹{c.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className={`bsi-bd-chg ${up ? 'up' : 'down'}`}>
                        {up ? '▲' : '▼'} {Math.abs(c.change).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
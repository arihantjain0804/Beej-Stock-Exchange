import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../../context/AppContext";
import './CropDetailModal.css';

function genCropPriceHistory(basePrice = 488, targetPrice = 500) {
  const pts = 150;
  const data = [];
  let p = basePrice;
  for (let i = 0; i < pts; i++) {
    const progress = i / pts;
    const drift = (targetPrice - basePrice) * progress * 0.015;
    p += drift + (Math.random() - 0.46) * 1.8;
    p = Math.max(basePrice * 0.97, p);
    // Gently pull toward target in final 20% of points
    if (progress > 0.8) p = p + (targetPrice - p) * 0.08;
    data.push(Math.round(p * 100) / 100);
  }
  return data;
}

function CropPriceCanvas({ priceHistory, basePrice, baseChange }) {
  const canvasRef  = useRef(null);
  const hoverXRef  = useRef(-1);
  const [hoverDate,  setHoverDate]  = useState(null);
  const [hoverPrice, setHoverPrice] = useState(null);

  const dataRef = useRef(
    priceHistory && priceHistory.length
      ? priceHistory.map(d => d.price ?? d)
      : genCropPriceHistory()
  );

  function draw(hoverX) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth || 900;
    const H = canvas.offsetHeight || 200;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const data = dataRef.current;
    const pad  = { top: 16, right: 100, bottom: 36, left: 30 };
    const cW   = W - pad.left - pad.right;
    const cH   = H - pad.top  - pad.bottom;
    const minV = Math.min(...data) * 0.998;
    const maxV = Math.max(...data) * 1.002;
    const rng  = maxV - minV;

    const sx = i => pad.left + (i / (data.length - 1)) * cW;
    const sy = v => pad.top  + (1 - (v - minV) / rng) * cH;

    // Area fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
    grad.addColorStop(0,   'rgba(200,134,10,0.22)');
    grad.addColorStop(0.6, 'rgba(200,134,10,0.06)');
    grad.addColorStop(1,   'rgba(14,11,5,0)');
    ctx.beginPath();
    ctx.moveTo(sx(0), sy(data[0]));
    for (let i = 1; i < data.length; i++) ctx.lineTo(sx(i), sy(data[i]));
    ctx.lineTo(sx(data.length - 1), pad.top + cH);
    ctx.lineTo(sx(0), pad.top + cH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(sx(0), sy(data[0]));
    for (let i = 1; i < data.length; i++) ctx.lineTo(sx(i), sy(data[i]));
    ctx.strokeStyle = '#C8860A';
    ctx.lineWidth   = 1.8;
    ctx.stroke();

    // Endpoint glow dot
    ctx.shadowColor = '#C8860A';
    ctx.shadowBlur  = 12;
    ctx.beginPath();
    ctx.arc(sx(data.length - 1), sy(data[data.length - 1]), 5, 0, Math.PI * 2);
    ctx.fillStyle = '#C8860A';
    ctx.fill();
    ctx.shadowBlur = 0;

    // X labels
    const xLabels = ['15 Jan', '3 May', '19 Aug', '8 Nov', '25 Feb', '13 Jun'];
    ctx.font      = '9px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(212,200,154,0.3)';
    ctx.textAlign = 'center';
    xLabels.forEach((lbl, i) => {
      ctx.fillText(lbl, pad.left + (i / (xLabels.length - 1)) * cW, H - pad.bottom + 16);
    });

    // Hover
    if (hoverX >= pad.left && hoverX <= W - pad.right) {
      const idx     = Math.round((hoverX - pad.left) / cW * (data.length - 1));
      const clamped = Math.max(0, Math.min(data.length - 1, idx));
      const cx2 = sx(clamped);
      const cy2 = sy(data[clamped]);

      // Full-height dashed line
      ctx.beginPath();
      ctx.moveTo(cx2, pad.top);
      ctx.lineTo(cx2, pad.top + cH);
      ctx.strokeStyle = 'rgba(200,134,10,0.35)';
      ctx.lineWidth   = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Green dot
      ctx.beginPath();
      ctx.arc(cx2, cy2, 4, 0, Math.PI * 2);
      ctx.fillStyle   = '#6daf4a';
      ctx.shadowColor = '#6daf4a';
      ctx.shadowBlur  = 8;
      ctx.fill();
      ctx.shadowBlur  = 0;

      // Price bubble
      const lbl = '₹' + data[clamped].toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      ctx.font = '500 10px JetBrains Mono, monospace';
      const lw = ctx.measureText(lbl).width + 16;
      const lx = cx2 + 10 < W - pad.right - lw ? cx2 + 10 : cx2 - lw - 6;
      const ly = cy2 - 30;
      ctx.fillStyle   = 'rgba(10,8,3,0.92)';
      ctx.strokeStyle = 'rgba(200,134,10,0.3)';
      ctx.lineWidth   = 1;
      ctx.beginPath(); ctx.rect(lx, ly, lw, 22); ctx.fill(); ctx.stroke();
      ctx.fillStyle   = '#C8860A';
      ctx.textAlign   = 'left';
      ctx.fillText(lbl, lx + 8, ly + 14);

      // Update React state for header + date badge
      const dateIdx = Math.round(clamped / (data.length - 1) * (xLabels.length - 1));
      setHoverDate(xLabels[Math.min(dateIdx, xLabels.length - 1)]);
      setHoverPrice('₹' + data[clamped].toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } else {
      setHoverDate(null);
      setHoverPrice(null);
    }
  }

  useEffect(() => {
    const id = setTimeout(() => draw(hoverXRef.current), 80);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(() => draw(hoverXRef.current));
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {/* Header row — date badge inline with price */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem' }}>
        <div>
          <div className="cem-chart-title">Token Price · 15 Jan → Today</div>
          <div style={{ marginTop: '0.3rem', display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <span className="cem-chart-price">{hoverPrice ?? basePrice}</span>
            <span className="cem-chart-change">{baseChange}</span>
          </div>
        </div>
        {hoverDate && (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.52rem',
            letterSpacing: '0.1em',
            color: 'var(--straw)',
            border: '1px solid rgba(200,134,10,0.35)',
            padding: '0.25rem 0.6rem',
            background: 'rgba(10,8,3,0.9)',
            alignSelf: 'center',
          }}>
            {hoverDate}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '200px', cursor: 'crosshair' }}
          onMouseMove={e => {
            const rect = canvasRef.current.getBoundingClientRect();
            hoverXRef.current = e.clientX - rect.left;
            draw(hoverXRef.current);
          }}
          onMouseLeave={() => {
            hoverXRef.current = -1;
            draw(-1);
          }}
        />
      </div>
    </div>
  );
}

export default function CropDetailModal() {
  const { cropDetail, setCropDetail, handleBookmark, watchlist, handleInvest } = useAppContext();
  const [activeTab, setActiveTab] = useState("overview");

  if (!cropDetail) return null;

  function handleClose() {
    setCropDetail(null);
    setActiveTab("overview");
  }

  const isWatchlisted = watchlist.includes(cropDetail.id);

  return (
    <div className="crop-modal-backdrop open" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className={`cem-shell ${cropDetail.risk === "med" ? "risk-med" : ""}`}>

        <div className="cem-header">
          <div>
            <p className="cem-eyebrow">BSE Crop Listing · Season 2025</p>
            <h2 className="cem-crop-name">{cropDetail.name}</h2>
            <p className="cem-crop-variety">{cropDetail.variety}</p>
          </div>
          <div className="cem-header-right">
            <span className={`cem-risk-badge ${cropDetail.risk === "med" ? "cem-risk-med" : "cem-risk-low"}`}>
              {cropDetail.risk === "med" ? "MED RISK" : "LOW RISK"}
            </span>
            <button className="cem-close" onClick={handleClose}>✕</button>
          </div>
        </div>

        <div className="cem-tabs">
          {["overview", "agronomist", "weather", "chart"].map((tab) => (
            <button
              key={tab}
              className={`cem-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "overview"   && "Overview"}
              {tab === "agronomist" && "Agronomist Notes"}
              {tab === "weather"    && "Weather Risk"}
              {tab === "chart"      && "Token Price"}
            </button>
          ))}
        </div>

        <div className="cem-body">

          {/* TAB: Overview */}
          <div className={`cem-tab-panel${activeTab === "overview" ? " active" : ""}`}>
            <div className="cem-stats-grid">
              <div className="cem-stat">
                <span className="cem-stat-val">{cropDetail.landArea ?? "14.5 Acres"}</span>
                <span className="cem-stat-key">Land Area</span>
              </div>
              <div className="cem-stat">
                <span className="cem-stat-val">{cropDetail.estYield ?? "52 Q/Acre"}</span>
                <span className="cem-stat-key">Est. Yield</span>
              </div>
              <div className="cem-stat">
                <span className="cem-stat-val">{cropDetail.harvestIn ?? "38 days"}</span>
                <span className="cem-stat-key">Harvest In</span>
              </div>
              <div className="cem-stat">
                <span className="cem-stat-val">{cropDetail.fundingTarget ?? "₹8,40,000"}</span>
                <span className="cem-stat-key">Funding Target</span>
              </div>
              <div className="cem-stat">
                <span className="cem-stat-val highlight">{cropDetail.projectedReturn ?? "21.4%"}</span>
                <span className="cem-stat-key">Projected Return</span>
              </div>
              <div className="cem-stat">
                <span className="cem-stat-val">{cropDetail.tokenPrice ?? "₹500"}</span>
                <span className="cem-stat-key">Token Price</span>
              </div>
            </div>

            <div className="cem-funding-block">
              <div className="cem-funding-header">
                <span className="cem-funding-label">Funding Progress</span>
                <span className="cem-funding-pct">{cropDetail.fundingPct ?? "94"}%</span>
              </div>
              <div className="cem-funding-bar-bg">
                <div
                  className="cem-funding-bar-fill"
                  style={{ width: `${cropDetail.fundingPct ?? 94}%` }}
                ></div>
              </div>
              <div className="cem-funding-amounts">
                <span>{cropDetail.fundedAmt ?? "₹7,89,600 raised"}</span>
                <span>{cropDetail.remainingAmt ?? "₹50,400 remaining"}</span>
              </div>
            </div>

            <div className="cem-farmer-strip">
              <div className="cem-farmer-avatar">{cropDetail.farmerAvatar ?? "👨‍🌾"}</div>
              <div>
                <span className="cem-farmer-name">{cropDetail.farmerName ?? "Harpreet Singh"}</span>
                <span className="cem-farmer-loc">{cropDetail.farmerLoc ?? "Ludhiana, Punjab"}</span>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <span className="cem-farmer-badge">{cropDetail.farmerBadge ?? "3rd Season · Verified"}</span>
              </div>
            </div>
          </div>

          {/* TAB: Agronomist Notes */}
          <div className={`cem-tab-panel${activeTab === "agronomist" ? " active" : ""}`}>
            <div className="cem-agro-section">
              <div className="cem-agro-head">
                <div className="cem-agro-icon">🔬</div>
                <div>
                  <div className="cem-agro-title">{cropDetail.agroTitle ?? `Field Assessment — ${cropDetail.name}`}</div>
                  <div className="cem-agro-sub">{cropDetail.agroDate ?? "Reviewed by BSE Agronomist Team · April 2025"}</div>
                </div>
              </div>
              <div
                className="cem-agro-note"
                dangerouslySetInnerHTML={{ __html: cropDetail.agroNote ?? `This is an <strong>exceptionally well-managed plot</strong> in the Ludhiana belt.` }}
              />
              <div className="cem-agro-checklist">
                {(cropDetail.agroChecklist ?? [
                  { text: "Soil nitrogen levels verified — optimal range", warn: false },
                  { text: "Drip irrigation system operational & inspected", warn: false },
                  { text: "HD-2967 variety — rust-resistant, high-yield certified seed", warn: false },
                  { text: "Land ownership documents verified (Khatauni on file)", warn: false },
                  { text: "3 consecutive successful harvests — strong track record", warn: false },
                  { text: "Mild aphid pressure observed — preventive spray scheduled", warn: true },
                ]).map((item, i) => (
                  <div key={i} className="cem-agro-check">
                    <div className={`cem-agro-check-dot${item.warn ? " warn" : ""}`}></div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TAB: Weather Risk */}
          <div className={`cem-tab-panel${activeTab === "weather" ? " active" : ""}`}>
            <div className="cem-weather-grid">
              {(cropDetail.weatherCards ?? [
                { icon: "🌡️", label: "Temperature Forecast", value: "22–28°C · Stable", fill: 25 },
                { icon: "🌧️", label: "Rainfall Probability", value: "Low · 18% chance", fill: 20 },
                { icon: "💨", label: "Wind / Storm Risk", value: "Minimal · Calm season", fill: 15 },
                { icon: "🌾", label: "Harvest Window Risk", value: "Low · 38-day buffer", fill: 22 },
              ]).map((card, i) => (
                <div key={i} className="cem-weather-card">
                  <span className="cem-wc-icon">{card.icon}</span>
                  <span className="cem-wc-label">{card.label}</span>
                  <span className="cem-wc-value">{card.value}</span>
                  <div className="cem-wc-risk-bar">
                    <div className="cem-wc-risk-fill risk-fill-low" style={{ width: `${card.fill}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cem-risk-summary">
              <span className="cem-risk-sum-label">Overall Weather Risk Assessment</span>
              <p
                className="cem-risk-sum-text"
                dangerouslySetInnerHTML={{ __html: cropDetail.weatherSummary ?? `Punjab's Rabi season forecast for the harvest window (May–June) is historically stable. Risk is rated <strong>LOW</strong>.` }}
              />
            </div>
          </div>

          {/* TAB: Token Price */}
          <div className={`cem-tab-panel${activeTab === "chart" ? " active" : ""}`}>
            <div className="cem-chart-wrap">
              <CropPriceCanvas
                priceHistory={cropDetail.priceHistory ?? null}
                basePrice={cropDetail.tokenPrice ?? "₹500.00"}
                baseChange={cropDetail.chartChange ?? "+₹12.00 (+2.46%) since listing"}
              />
            </div>
            <div className="cem-token-meta">
              <div className="cem-tm-item">
                <span className="cem-tm-val">{cropDetail.tokenSymbol ?? "WHT-25"}</span>
                <span className="cem-tm-key">Symbol</span>
              </div>
              <div className="cem-tm-item">
                <span className="cem-tm-val">{cropDetail.totalSupply ?? "1,680"}</span>
                <span className="cem-tm-key">Total Supply</span>
              </div>
              <div className="cem-tm-item">
                <span className="cem-tm-val">{cropDetail.tokensSold ?? "1,579"}</span>
                <span className="cem-tm-key">Tokens Sold</span>
              </div>
              <div className="cem-tm-item">
                <span className="cem-tm-val">{cropDetail.tokensAvailable ?? "101"}</span>
                <span className="cem-tm-key">Available</span>
              </div>
            </div>
          </div>

        </div>

        <div className="cem-footer">
          <div className="cem-footer-left">🔒 Smart Contract Settlement · SEBI AgriToken Framework</div>
          <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            <button className="cem-watchlist-btn" onClick={() => handleBookmark(cropDetail)}>
              {isWatchlisted ? "✓ Watchlisted" : "+ Watchlist"}
            </button>
            <button className="cem-invest-btn" onClick={() => handleInvest(cropDetail)}>
              Invest Now →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
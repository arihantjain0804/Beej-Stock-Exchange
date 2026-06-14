import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { BSI_CONSTITUENTS } from '../../../data/tokens';
import './YieldCalculatorModal.css';

const SEASONS = [
  { value: 'kharif_25', label: 'Kharif 2025 (Jun–Nov)' },
  { value: 'rabi_25',   label: 'Rabi 2025–26 (Nov–Apr)' },
  { value: 'zaid_26',   label: 'Zaid 2026 (Mar–Jun)' },
];

const PRESETS = [5000, 10000, 25000, 50000, 100000];

const RISK_FACTORS = [
  { icon: '🌧️', name: 'Weather Risk',    pct: 28 },
  { icon: '📈', name: 'Price Volatility', pct: 42 },
  { icon: '🌾', name: 'Yield Variance',   pct: 18 },
  { icon: '📋', name: 'Regulatory',       pct: 10 },
];

const TOKEN_COLORS = {
  'PNJ-WHT': '#c8860a',
  'KRS-RCE': '#4a7535',
  'VDB-SOY': '#3a92d4',
  'UP-SGC':  '#e05c1a',
  'GUJ-GND': '#a06828',
  'MH-CTN':  '#7a5cb8',
};

function calcReturns(amount, token, risk) {
  const base   = token.change > 0 ? 0.17 : 0.12;
  const spread = 0.04 + (risk / 100) * 0.08;
  const bull   = base + spread;
  const bear   = Math.max(0.04, base - spread);
  return {
    bull:  parseFloat((amount * bull).toFixed(0)),
    base:  parseFloat((amount * base).toFixed(0)),
    bear:  parseFloat((amount * bear).toFixed(0)),
    bullPct: (bull * 100).toFixed(1),
    basePct: (base * 100).toFixed(1),
    bearPct: (bear * 100).toFixed(1),
    total:   parseFloat((amount + amount * base).toFixed(0)),
    roi:     (base * 100).toFixed(1),
  };
}

// Confidence band canvas chart
function BandChart({ amount, token, risk }) {
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !token) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    const months = 6;
    const pts = months + 1;
    const { bull, base, bear } = calcReturns(amount, token, risk);

    const toX = i => (i / months) * (W - 60) + 30;
    const minV = amount - Math.abs(bear) * 0.2;
    const maxV = amount + bull * 1.1;
    const toY = v => H - 30 - ((v - minV) / (maxV - minV)) * (H - 50);

    const bullPts = Array.from({ length: pts }, (_, i) => amount + (bull * i) / months);
    const basePts = Array.from({ length: pts }, (_, i) => amount + (base * i) / months);
    const bearPts = Array.from({ length: pts }, (_, i) => amount + (bear * i) / months);

    // Bull-bear band fill
    const bandGrad = ctx.createLinearGradient(0, 0, 0, H);
    bandGrad.addColorStop(0, 'rgba(200,134,10,0.12)');
    bandGrad.addColorStop(1, 'rgba(200,134,10,0.02)');
    ctx.beginPath();
    bullPts.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    [...bearPts].reverse().forEach((v, i) => ctx.lineTo(toX(months - i), toY(v)));
    ctx.closePath();
    ctx.fillStyle = bandGrad;
    ctx.fill();

    // Bear line
    ctx.beginPath();
    bearPts.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.strokeStyle = 'rgba(224,92,26,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.stroke();
    ctx.setLineDash([]);

    // Bull line
    ctx.beginPath();
    bullPts.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.strokeStyle = 'rgba(74,117,53,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.stroke();
    ctx.setLineDash([]);

    // Base line
    ctx.beginPath();
    basePts.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.strokeStyle = 'var(--harvest)' ; ctx.lineWidth = 2; ctx.stroke();

    // Endpoint dot
    ctx.beginPath();
    ctx.arc(toX(months), toY(basePts[months]), 4, 0, Math.PI * 2);
    ctx.fillStyle = '#c8860a'; ctx.fill();

    // X-axis labels
    ctx.fillStyle = 'rgba(212,200,154,0.3)';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ['Now', 'M2', 'M3', 'M4', 'M5', 'Harvest'].forEach((lbl, i) => {
      ctx.fillText(lbl, toX(i), H - 8);
    });
  }, [amount, token, risk]);

  useEffect(() => {
    const ro = new ResizeObserver(() => draw());
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => { draw(); }, [draw]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

export default function YieldCalculatorModal() {
  const { yieldCalcOpen, setYieldCalcOpen } = useAppContext();

  const [selectedToken, setSelectedToken] = useState(BSI_CONSTITUENTS[0]);
  const [amount, setAmount] = useState(10000);
  const [season, setSeason] = useState(SEASONS[0].value);
  const [risk, setRisk] = useState(50);
  const [calculated, setCalculated] = useState(false);
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    setResults(calcReturns(amount, selectedToken, risk));
    setCalculated(true);
  };

  const handleAmountChange = (val) => {
    setAmount(val);
    if (calculated) setResults(calcReturns(val, selectedToken, risk));
  };

  if (!yieldCalcOpen) return null;

  return (
    <div id="yc-backdrop" className="open" onClick={e => e.target.id === 'yc-backdrop' && setYieldCalcOpen(false)}>
      <div id="yc-modal">

        {/* Header */}
        <div id="yc-header">
          <div>
            <div className="yc-header-title">
              Yield Calculator <em>· उपज कैलकुलेटर</em>
            </div>
            <div className="yc-header-sub">BSE AgriToken · Projected returns based on historical data</div>
          </div>
          <button className="yc-close-btn" onClick={() => setYieldCalcOpen(false)}>✕</button>
        </div>

        {/* Body */}
        <div id="yc-body">

          {/* Left — Inputs */}
          <div id="yc-inputs">

            {/* Token selection */}
            <div>
              <div className="yc-section-title">Select Crop Token</div>
              <div className="yc-token-grid">
                {BSI_CONSTITUENTS.slice(0, 6).map(t => (
                  <div
                    key={t.symbol}
                    className={`yc-token-chip${selectedToken.symbol === t.symbol ? ' selected' : ''}`}
                    onClick={() => { setSelectedToken(t); if (calculated) setResults(calcReturns(amount, t, risk)); }}
                  >
                    <div className="yc-tc-dot" style={{ background: TOKEN_COLORS[t.symbol] || '#c8860a' }} />
                    <div>
                      <div className="yc-tc-sym">{t.symbol}</div>
                      <div className="yc-tc-yield">~{(15 + t.weight * 2).toFixed(1)}% est.</div>
                    </div>
                    <span className="yc-tc-check">✓</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Investment amount */}
            <div>
              <div className="yc-section-title">Investment Amount</div>
              <div className="yc-amount-wrap">
                <span className="yc-amount-prefix">₹</span>
                <input
                  className="yc-amount-input"
                  type="number"
                  placeholder="10,000"
                  value={amount}
                  min={500}
                  onChange={e => handleAmountChange(Number(e.target.value))}
                />
              </div>
              <div className="yc-amount-presets">
                {PRESETS.map(p => (
                  <button key={p} className="yc-preset" onClick={() => handleAmountChange(p)}>
                    ₹{p >= 100000 ? `${p / 100000}L` : `${p / 1000}K`}
                  </button>
                ))}
              </div>
            </div>

            {/* Season */}
            <div>
              <div className="yc-section-title">Season</div>
              <select className="yc-select" value={season} onChange={e => setSeason(e.target.value)}>
                {SEASONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Risk tolerance */}
            <div>
              <div className="yc-section-title">Risk Tolerance</div>
              <div className="yc-slider-wrap">
                <input
                  className="yc-slider"
                  type="range" min={0} max={100} value={risk}
                  style={{ '--pct': `${risk}%` }}
                  onChange={e => { setRisk(Number(e.target.value)); if (calculated) setResults(calcReturns(amount, selectedToken, Number(e.target.value))); }}
                />
                <div className="yc-slider-labels">
                  <span>Conservative</span>
                  <span>Moderate</span>
                  <span>Aggressive</span>
                </div>
              </div>
            </div>

            {/* Calculate button */}
            <button className="yc-calc-btn" onClick={handleCalculate}>
              Calculate Returns →
            </button>

          </div>

          {/* Right — Results */}
          <div id="yc-results">
            {!calculated ? (
              <div className="yc-empty-state">
                <div className="yc-empty-icon">📊</div>
                <div className="yc-empty-text">Select a token, enter your amount, and calculate projected returns</div>
              </div>
            ) : (
              <>
                {/* KPI cards */}
                <div className="yc-output-kpis">
                  <div className="yc-kpi-card highlight">
                    <div className="yc-kpi-lbl">Projected Return</div>
                    <div className="yc-kpi-num gold">₹{results.base.toLocaleString('en-IN')}</div>
                    <div className="yc-kpi-sub">{results.roi}% · Base scenario</div>
                  </div>
                  <div className="yc-kpi-card">
                    <div className="yc-kpi-lbl">Total at Harvest</div>
                    <div className="yc-kpi-num green">₹{results.total.toLocaleString('en-IN')}</div>
                    <div className="yc-kpi-sub">Principal + Returns</div>
                  </div>
                  <div className="yc-kpi-card">
                    <div className="yc-kpi-lbl">Token: {selectedToken.symbol}</div>
                    <div className="yc-kpi-num">₹{selectedToken.basePrice.toFixed(0)}</div>
                    <div className="yc-kpi-sub">{Math.floor(amount / selectedToken.basePrice)} tokens</div>
                  </div>
                </div>

                {/* Band chart */}
                <div id="yc-band-wrap" style={{ height: '180px' }}>
                  <div className="yc-chart-title">
                    Return Confidence Band
                  </div>
                  <div className="yc-band-legend">
                    <div className="yc-bl-item"><div className="yc-bl-swatch" style={{ background: '#4a7535' }} />Bull</div>
                    <div className="yc-bl-item"><div className="yc-bl-swatch" style={{ background: '#c8860a' }} />Base</div>
                    <div className="yc-bl-item"><div className="yc-bl-swatch" style={{ background: '#e05c1a' }} />Bear</div>
                  </div>
                  <div style={{ height: 'calc(100% - 56px)' }}>
                    <BandChart amount={amount} token={selectedToken} risk={risk} />
                  </div>
                </div>

                {/* Scenario table */}
                <table className="yc-scenario-table">
                  <thead>
                    <tr>
                      <th>Scenario</th>
                      <th>Return %</th>
                      <th>Profit</th>
                      <th>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="yc-scenario-row-bull">
                      <td>🐂 Bull</td>
                      <td style={{ color: '#4a7535' }}>{results.bullPct}%</td>
                      <td>₹{results.bull.toLocaleString('en-IN')}</td>
                      <td>₹{(amount + results.bull).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="yc-scenario-row-base">
                      <td>📊 Base</td>
                      <td style={{ color: '#c8860a' }}>{results.basePct}%</td>
                      <td>₹{results.base.toLocaleString('en-IN')}</td>
                      <td>₹{results.total.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="yc-scenario-row-bear">
                      <td>🐻 Bear</td>
                      <td style={{ color: '#e05c1a' }}>{results.bearPct}%</td>
                      <td>₹{results.bear.toLocaleString('en-IN')}</td>
                      <td>₹{(amount + results.bear).toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Risk factors */}
                <div>
                  <div className="yc-section-title">Risk Factors</div>
                  <div className="yc-risk-grid">
                    {RISK_FACTORS.map(r => (
                      <div key={r.name} className="yc-risk-chip">
                        <span className="yc-risk-icon">{r.icon}</span>
                        <span className="yc-risk-name">{r.name}</span>
                        <div className="yc-risk-bar-track">
                          <div
                            className="yc-risk-bar-fill"
                            style={{ width: `${r.pct}%`, background: r.pct > 35 ? 'var(--ember)' : 'var(--field-light)' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="yc-disclaimer">
                  Projections are estimates based on historical crop data and BSE token performance. Actual returns may vary due to weather, market conditions, and harvest outcomes. Past performance does not guarantee future results. Minimum investment ₹500.
                </p>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
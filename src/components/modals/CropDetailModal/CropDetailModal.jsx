import { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';

export default function CropDetailModal() {
  const { cropDetail: crop, setCropDetail, handleInvest } = useAppContext();
  const [tab, setTab] = useState('overview');
  const [barFill, setBarFill] = useState(0);

  useEffect(() => {
    if (crop) setTimeout(() => setBarFill(crop.fill), 200);
  }, [crop]);

  if (!crop) return null;
  const onClose = () => setCropDetail(null);

  return (
    <div className="crop-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cem-shell">
        <div className="cem-header">
          <div>
            <p className="cem-eyebrow">BSE Crop Listing · Season 2025</p>
            <h2 className="cem-crop-name">{crop.name}</h2>
            <p className="cem-crop-variety">{crop.variety}</p>
          </div>
          <div className="cem-header-right">
            <span className={`cem-risk-badge cem-risk-${crop.risk}`}>{crop.risk.toUpperCase()} RISK</span>
            <button className="cem-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="cem-tabs">
          {['overview', 'agronomist', 'weather'].map(t => (
            <button key={t} className={`cem-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="cem-body">
          {tab === 'overview' && (
            <>
              <div className="cem-stats-grid">
                {[
                  ['Land Area', crop.land],
                  ['Est. Yield', crop.yield_],
                  ['Harvest In', crop.harvestIn],
                  ['Funding Target', crop.target],
                  ['Projected Return', crop.return_, true],
                  ['Token Price', crop.tokenPrice],
                ].map(([k, v, hl]) => (
                  <div key={k} className="cem-stat">
                    <span className={`cem-stat-val ${hl ? 'highlight' : ''}`}>{v}</span>
                    <span className="cem-stat-key">{k}</span>
                  </div>
                ))}
              </div>
              <div className="cem-funding-block">
                <div className="cem-funding-header">
                  <span className="cem-funding-label">Funding Progress</span>
                  <span className="cem-funding-pct">{crop.fill}%</span>
                </div>
                <div className="cem-funding-bar-bg">
                  <div className="cem-funding-bar-fill" style={{ width: `${barFill}%` }}></div>
                </div>
                <div className="cem-funding-amounts">
                  <span>{crop.tokensSold} tokens sold</span>
                  <span>{crop.totalSupply} total supply</span>
                </div>
              </div>
              <div className="cem-farmer-strip">
                <div className="cem-farmer-avatar">👨‍🌾</div>
                <div>
                  <div className="cem-farmer-name">{crop.farmer}</div>
                  <div className="cem-farmer-loc">{crop.location}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className="cem-farmer-badge">Verified Farmer</span>
                </div>
              </div>
            </>
          )}

          {tab === 'agronomist' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                <div style={{ fontSize: '2rem' }}>🔬</div>
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: 'var(--sky)' }}>
                    Field Assessment — {crop.name}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.5rem', color: 'var(--straw-dim)', opacity: 0.45, marginTop: '0.15rem' }}>
                    Reviewed by BSE Agronomist Team · 2025
                  </div>
                </div>
              </div>
              <p className="cem-agro-note">{crop.agroNote}</p>
              <div className="cem-agro-checklist">
                {[
                  'Soil nitrogen levels verified — optimal range',
                  'Irrigation system operational & inspected',
                  'Variety — rust-resistant, high-yield certified seed',
                  'Land ownership documents verified',
                  'Successful harvest track record',
                ].map(item => (
                  <div key={item} className="cem-agro-check">
                    <div className="cem-agro-check-dot"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'weather' && (
            <>
              <div className="cem-weather-grid">
                {[
                  ['🌡️', 'Temperature Forecast', '22–28°C · Stable',         25, 'low'],
                  ['🌧️', 'Rainfall Probability',  'Low · 18% chance',          18, 'low'],
                  ['💨', 'Wind / Storm Risk',      'Minimal · Calm season',     15, 'low'],
                  ['🌾', 'Harvest Window Risk',    `Low · ${crop.harvestIn} buffer`, 22, 'low'],
                ].map(([icon, label, val, pct, risk]) => (
                  <div key={label} className="cem-weather-card">
                    <span className="cem-wc-icon">{icon}</span>
                    <span className="cem-wc-label">{label}</span>
                    <span className="cem-wc-value">{val}</span>
                    <div className="cem-wc-risk-bar">
                      <div className={`cem-wc-risk-fill risk-fill-${risk}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border-dim)' }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.5rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--straw-dim)', opacity: 0.45, marginBottom: '0.6rem' }}>
                  Overall Weather Risk
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '0.95rem', color: 'var(--straw-dim)', lineHeight: 1.8, fontStyle: 'italic' }}>
                  Forecast for the harvest window is historically stable with low monsoon interference. No extreme weather events expected. Risk is rated <strong style={{ color: 'var(--field-light)' }}>LOW</strong>.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="cem-footer">
          <div className="cem-footer-left">🔒 Smart Contract Settlement · SEBI AgriToken Framework</div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              style={{ background: 'none', border: '1px solid var(--glass-border-dim)', color: 'var(--straw-dim)', padding: '0.55rem 1rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.56rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--harvest)'; e.currentTarget.style.color = 'var(--sky)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,134,10,0.1)'; e.currentTarget.style.color = 'rgba(212,200,154,0.5)'; }}
            >
              + Watchlist
            </button>
            <button className="cem-invest-btn" onClick={() => { onClose(); handleInvest(crop); }}>
              Invest Now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
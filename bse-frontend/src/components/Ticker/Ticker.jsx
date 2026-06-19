// ─── Ticker Component ─────────────────────────────────────────────────────────
// Scrolling live price bar shown at the bottom of the Hero section.
// Receives the tokens array from AppContext via the Hero component.

import './Ticker.css';

export default function Ticker({ tokens }) {
  const doubled = [...tokens, ...tokens];

  return (
    <div className="ticker-bar">
      <div className="ticker-label">
        <div className="ticker-dot"></div>
        <span>LIVE</span>
      </div>
      <div className="ticker-track">
        <div className="ticker-inner">
          {doubled.map((t, i) => {
            const isUp = t.price >= t.prevPrice;
            const diff = t.price - t.prevPrice;
            const pct = ((diff / t.prevPrice) * 100).toFixed(2);
            const sign = isUp ? '+' : '';
            return (
              <div key={i} className="ticker-item">
                <span className="t-crop">{t.symbol}</span>
                <span className="t-price">₹{t.price.toFixed(2)}</span>
                <span className={`t-change ${isUp ? 'up' : 'down'}`}>
                  {isUp ? '▲' : '▼'} {sign}{pct}%
                </span>
                <span className="t-sep">|</span>
                <span className="t-fill">{t.fill}%</span>
                <span className="t-sep">·</span>
                <span className="t-days">{t.days}d</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
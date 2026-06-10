import { useState, useEffect } from 'react';
import { CROP_CARDS } from '../../data/cropCards';
import { useAppContext } from '../../context/AppContext';

export default function CropCards() {
  const { watchlist, handleBookmark, setCropDetail } = useAppContext();
  const [filledBars, setFilledBars] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      const f = {};
      CROP_CARDS.forEach(c => { f[c.id] = c.fill; });
      setFilledBars(f);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const delays = ['reveal-d1', 'reveal-d2', 'reveal-d3'];

  return (
    <section id="projects">
      <div className="section-inner">
        <div className="projects-header reveal">
          <div>
            <p className="section-eyebrow">Active This Season</p>
            <h2 className="section-title">Live <em>Crop Listings</em></h2>
          </div>
          <button className="projects-view-all">View All Projects →</button>
        </div>

        <div className="crop-cards">
          {CROP_CARDS.map((c, i) => (
            <div key={c.id} className={`crop-card reveal ${delays[i]}`} onClick={() => setCropDetail(c)}>
              <div className="card-glow"></div>

              <button
                className={`card-bookmark ${watchlist.includes(c.id) ? 'bookmarked' : ''}`}
                onClick={e => { e.stopPropagation(); handleBookmark(c); }}
                aria-label={`Bookmark ${c.name}`}
              >
                <svg viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                  <path className="bm-fill" d="M1 1h12v13.5l-6-3.5-6 3.5V1z" stroke="currentColor" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="card-badge-wrap">
                <span className={`card-badge ${c.badge === 'new' ? 'badge-new' : 'badge-filling'}`}>
                  {c.badge === 'new' ? 'New Listing' : 'Filling Fast'}
                </span>
              </div>

              <div className="card-header">
                <div>
                  <div className="card-crop-name">{c.name}</div>
                  <div className="card-crop-variety">{c.variety}</div>
                </div>
                <div className={`card-risk risk-${c.risk}`}>
                  {c.risk === 'low' ? 'LOW RISK' : c.risk === 'med' ? 'MED RISK' : 'HIGH RISK'}
                </div>
              </div>

              <div className="card-meta">
                {[
                  ['Land Area', c.land],
                  ['Est. Yield', c.yield_],
                  ['Funding Target', c.target],
                  ['Projected Return', c.return_, true],
                  ['Harvest In', c.harvestIn],
                ].map(([label, value, hl]) => (
                  <div key={label} className="card-meta-row">
                    <span className="cm-label">{label}</span>
                    <span className={`cm-value ${hl ? 'highlight' : ''}`}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="card-progress-wrap">
                <div className="cp-header">
                  <span className="cp-label">Funded</span>
                  <span className="cp-pct">{c.fill}%</span>
                </div>
                <div className="cp-bar-bg">
                  <div className="cp-bar-fill" style={{ width: `${filledBars[c.id] || 0}%` }}></div>
                </div>
              </div>

              <div className="card-footer">
                <div className="card-farmer">
                  <span className="farmer-name">{c.farmer}</span>
                  <span className="farmer-location">{c.location}</span>
                </div>
                <button className="card-invest-btn" onClick={() => setCropDetail(c)}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
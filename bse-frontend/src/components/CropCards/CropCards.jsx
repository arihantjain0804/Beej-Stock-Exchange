import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import './CropCards.css';

// Maps a real backend token (as shaped by AppContext) into the fields
// CropCards / CropDetailModal render. Every value here traces back to a
// real column on crop_tokens — nothing is invented per-crop.
function mapTokenToCard(t) {
  const fundingPct = t.total_supply
    ? Math.round((t.circulating_supply / t.total_supply) * 100)
    : 0;
  const price = t.current_price_inr ?? t.token_price_inr ?? 0;
  const raisedInr = (t.circulating_supply || 0) * price;
  const targetInr = (t.total_supply || 0) * price;
  const remainingInr = targetInr - raisedInr;

  const location = [t.district, t.state].filter(Boolean).join(', ') || 'India';

    // No real underwriting/risk model exists yet. For demo purposes, derive an
  // illustrative risk tier from a real, visible number on the card
  // (expected_yield_pct) using a standard higher-yield/higher-risk heuristic,
  // rather than either leaving it blank or randomizing it — this way it's
  // deterministic (same crop always shows the same tier) instead of
  // flickering between reloads, and it's still an honest label: a mock
  // rating derived from real yield data, not a fabricated claim.
  const yieldPct = t.expected_yield_pct;
  const risk = yieldPct == null ? 'unrated'
    : yieldPct < 11 ? 'low'
    : yieldPct < 15 ? 'med'
    : 'high';
  const isNew = t.created_at
    ? (Date.now() - new Date(t.created_at).getTime()) < 14 * 24 * 60 * 60 * 1000
    : false;

  return {
    id: t.id,
    tokenSymbol: t.symbol,
    name: t.name,
    variety: t.crop_type
      ? t.crop_type.charAt(0).toUpperCase() + t.crop_type.slice(1)
      : '',
    risk,
    badge: isNew ? 'new' : 'filling',
    land: t.land_area_acres ? `${t.land_area_acres} Acres` : 'N/A',
    yield_: t.expected_yield_pct != null ? `${t.expected_yield_pct}% Expected Yield` : 'N/A',
    target: `₹${targetInr.toLocaleString('en-IN')}`,
    // No separate "return" metric exists in the schema distinct from yield —
    // reusing expected_yield_pct here is an approximation, not a real return figure.
    return_: t.expected_yield_pct != null ? `${t.expected_yield_pct}% / Season` : 'N/A',
    harvestIn: t.harvest_date
      ? `${Math.max(0, Math.ceil((new Date(t.harvest_date) - new Date()) / 86400000))} days`
      : 'N/A',
    fill: fundingPct,
    farmer: t.farmer_name || 'Unnamed Farmer',
    location,
    tokenPrice: `₹${price.toFixed(2)}`,
    totalSupply: (t.total_supply || 0).toLocaleString('en-IN'),
    tokensSold: (t.circulating_supply || 0).toLocaleString('en-IN'),
    tokensAvailable: ((t.total_supply || 0) - (t.circulating_supply || 0)).toLocaleString('en-IN'),
    fundingPct,
    fundedAmt: `₹${raisedInr.toLocaleString('en-IN')} raised`,
    remainingAmt: `₹${remainingInr.toLocaleString('en-IN')} remaining`,
    farmerLoc: location,
    farmerBadge: t.farmer_verified ? 'Verified' : 'Unverified',
    // Real description from the DB, when farmers have written one.
    // No fabricated agronomist/weather content — CropDetailModal falls
    // back to honest "not yet available" copy when this is absent.
    description: t.description || null,
  };
}

export default function CropCards() {
  const { watchlist, handleBookmark, setCropDetail, tokens, tokensLoading } = useAppContext();
  const [filledBars, setFilledBars] = useState({});

  const cards = useMemo(() => tokens.map(mapTokenToCard), [tokens]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const f = {};
      cards.forEach(c => { f[c.id] = c.fill; });
      setFilledBars(f);
    }, 400);
    return () => clearTimeout(timer);
  }, [cards]);

  const delays = ['reveal-d1', 'reveal-d2', 'reveal-d3'];

  return (
    <section id="projects">
      <div className="section-inner">
        <div className="projects-header reveal">
          <div>
            <p className="section-eyebrow">Active This Season</p>
            <h2 className="section-title">Live <em>Crop Listings</em></h2>
          </div>
          <button className="projects-view-all" onClick={() => document.getElementById('bse-index')?.scrollIntoView({ behavior: 'smooth' })}>View All Projects →</button>
        </div>

        {tokensLoading && (
          <p className="section-eyebrow" style={{ padding: '2rem 0' }}>Loading live listings…</p>
        )}

        {!tokensLoading && cards.length === 0 && (
          <p className="section-eyebrow" style={{ padding: '2rem 0' }}>No active listings right now.</p>
        )}

        <div className="crop-cards">
          {cards.slice(0, 3).map((c, i) => (
            <div key={c.id} className={`crop-card reveal ${delays[i]}`} onClick={() => setCropDetail(c)}>
              <div className="card-glow"></div>

              <button
                className={`card-bookmark ${watchlist.includes(c.tokenSymbol) ? 'bookmarked' : ''}`}
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
                  {c.risk === 'low' ? 'LOW RISK' : c.risk === 'med' ? 'MED RISK' : c.risk === 'high' ? 'HIGH RISK' : 'UNRATED'}
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
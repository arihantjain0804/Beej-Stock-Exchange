import { useAppContext } from '../../../context/AppContext';
import { CROP_CARDS } from '../../../data/cropCards';

export default function WatchlistDrawer() {
  const {
    watchlistOpen,
    setWatchlistOpen,
    watchlist,
    handleBookmark,
    setCropDetail,
    setInvestorModal,
  } = useAppContext();

  const savedCrops = CROP_CARDS.filter(c => watchlist.includes(c.id));

  return (
    <>
      <div
        className={`watchlist-scrim${watchlistOpen ? ' open' : ''}`}
        onClick={() => setWatchlistOpen(false)}
      />
      <div className={`wl-drawer${watchlistOpen ? ' open' : ''}`} role="dialog" aria-label="Your Watchlist">
        
        {/* Header */}
        <div className="wl-header">
          <div className="wl-title-wrap">
            <span className="wl-eyebrow">बीज · My Watchlist</span>
            <span className="wl-title">Crops on Watch</span>
          </div>
          <button className="wl-close" onClick={() => setWatchlistOpen(false)}>✕</button>
        </div>

        {/* Count line */}
        <div className="wl-count-line">
          {savedCrops.length} CROP{savedCrops.length !== 1 ? 'S' : ''} SAVED
        </div>

        {/* List */}
        <div className="wl-list">
          {savedCrops.length === 0 ? (
            <div className="wl-empty">
              <div className="wl-empty-icon">🌾</div>
              <p className="wl-empty-text">
                No crops on your watchlist yet.<br />
                Tap the bookmark on any crop card to save it here.
              </p>
            </div>
          ) : (
           savedCrops.map(c => (
              <div key={c.id} className="wl-item" onClick={() => { setWatchlistOpen(false); setCropDetail(c); }}>
                <div className={`wl-item-accent${c.risk === 'med' ? ' risk-med' : c.risk === 'high' ? ' risk-high' : ''}`} />
                <div className="wl-item-body">
                  <div className="wl-item-name">{c.name}</div>
                  <div className="wl-item-meta">{c.variety}</div>
                  <div className="wl-item-stats">
                    <div className="wl-stat">
                      <span className="wl-stat-label">Returns</span>
                      <span className="wl-stat-value good">{c.return_.replace('/ Season', '').trim()}</span>
                    </div>
                    <div className="wl-stat">
                      <span className="wl-stat-label">Funded</span>
                      <span className="wl-stat-value">{c.fill}%</span>
                    </div>
                    <div className="wl-stat">
                      <span className="wl-stat-label">Harvest</span>
                      <span className="wl-stat-value">{c.harvestIn}</span>
                    </div>
                  </div>
                </div>
                <div className="wl-item-actions">
                  <button
                    className="wl-invest-btn"
                    onClick={e => { e.stopPropagation(); setInvestorModal(true); }}
                  >
                    Invest →
                  </button>
                  <button
                    className="wl-remove-btn"
                    onClick={e => { e.stopPropagation(); handleBookmark(c); }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedCrops.length > 0 && (
          <div className="wl-footer">
            <button
              className="wl-invest-all"
              onClick={() => { setWatchlistOpen(false); setInvestorModal(true); }}
            >
              Invest in Watchlist →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
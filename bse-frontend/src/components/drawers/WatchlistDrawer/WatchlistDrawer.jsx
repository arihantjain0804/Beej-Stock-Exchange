import { useAppContext } from '../../../context/AppContext';
import { CROP_CARDS } from '../../../data/cropCards';
import './WatchlistDrawer.css';

const fmt = (n) => parseFloat(n || 0).toLocaleString('en-IN');

export default function WatchlistDrawer() {
  const {
    watchlistOpen,
    setWatchlistOpen,
    watchlist,
    watchlistItems,
    user,
    handleBookmark,
    setCropDetail,
    setInvestorModal,
    handleInvest,
    removeFromWatchlist,
  } = useAppContext();

  // Logged-in: use backend rows (full token data)
  // Guest: filter local CROP_CARDS by id
  const savedCrops = user
    ? watchlistItems
    : CROP_CARDS.filter(c => watchlist.includes(c.id));

  const handleRemove = (e, item) => {
    e.stopPropagation();
    if (user) {
      removeFromWatchlist(item.symbol);
    } else {
      handleBookmark(item);
    }
  };

  // Normalise both backend rows and CROP_CARD objects into one display shape
  const displayItems = savedCrops.map(item => {
    if (user) {
      const change  = parseFloat(item.change_pct || 0);
      const harvest = item.harvest_date
        ? Math.max(0, Math.round((new Date(item.harvest_date) - new Date()) / 86400000))
        : null;
      return {
        key:     item.symbol,
        name:    item.name,
        meta:    `${item.symbol} · ${item.crop_type || ''}`,
        returns: `${item.expected_yield_pct || '—'}%`,
        funded:  '—',
        harvest: harvest !== null ? `${harvest}d` : '—',
        price:   `₹${fmt(item.current_price_inr)}`,
        change,
        raw:     item,
      };
    } else {
      return {
        key:     item.id,
        name:    item.name,
        meta:    item.variety,
        returns: item.return_?.replace('/ Season', '').trim() || '—',
        funded:  `${item.fill}%`,
        harvest: item.harvestIn,
        price:   item.tokenPrice,
        change:  null,
        raw:     item,
      };
    }
  });

  return (
    <>
      <div
        className={`watchlist-scrim${watchlistOpen ? ' open' : ''}`}
        onClick={() => setWatchlistOpen(false)}
      />
      <div
        className={`wl-drawer${watchlistOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your Watchlist"
      >
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
          {displayItems.length} CROP{displayItems.length !== 1 ? 'S' : ''} SAVED
        </div>

        {/* List */}
        <div className="wl-list">
          {displayItems.length === 0 ? (
            <div className="wl-empty">
              <div className="wl-empty-icon">🌾</div>
              <p className="wl-empty-text">
                No crops on your watchlist yet.<br />
                Tap the bookmark on any crop card to save it here.
              </p>
            </div>
          ) : (
            displayItems.map(item => (
              <div
                key={item.key}
                className="wl-item"
                onClick={() => { setWatchlistOpen(false); setCropDetail(item.raw); }}
              >
                <div className="wl-item-accent" />

                <div className="wl-item-body">
                  <div className="wl-item-name">{item.name}</div>
                  <div className="wl-item-meta">{item.meta}</div>

                  {item.change !== null && (
                    <div style={{
                      fontSize: '0.72rem',
                      marginTop: '2px',
                      color: item.change >= 0 ? 'var(--leaf)' : '#e05',
                    }}>
                      {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change)}% today · {item.price}
                    </div>
                  )}

                  <div className="wl-item-stats">
                    <div className="wl-stat">
                      <span className="wl-stat-label">Yield</span>
                      <span className="wl-stat-value good">{item.returns}</span>
                    </div>
                    {item.funded !== '—' && (
                      <div className="wl-stat">
                        <span className="wl-stat-label">Funded</span>
                        <span className="wl-stat-value">{item.funded}</span>
                      </div>
                    )}
                    <div className="wl-stat">
                      <span className="wl-stat-label">Harvest</span>
                      <span className="wl-stat-value">{item.harvest}</span>
                    </div>
                  </div>
                </div>

                <div className="wl-item-actions">
                  <button
                    className="wl-invest-btn"
                    onClick={e => { e.stopPropagation(); handleInvest(item.raw); }}
                  >
                    Invest →
                  </button>
                  <button
                    className="wl-item-remove"
                    onClick={e => handleRemove(e, item.raw)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {displayItems.length > 0 && (
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
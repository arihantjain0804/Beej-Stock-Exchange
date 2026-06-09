import { useAppContext } from '../../../context/AppContext';
import { CROP_CARDS } from '../../../data/cropCards';
import { TOKENS } from '../../../data/tokens';

export default function WatchlistDrawer() {
  const { watchlistOpen, setWatchlistOpen, watchlist, removeFromWatchlist } = useAppContext();
  const onClose = () => setWatchlistOpen(false);

  const cropMap = Object.fromEntries(CROP_CARDS.map(c => [c.id, c]));
  const tokenMap = Object.fromEntries(TOKENS.map(t => [t.id, t]));

  return (
    <>
      <div className={`drawer-scrim ${watchlistOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`watchlist-drawer ${watchlistOpen ? 'open' : ''}`}>
        <div className="wl-header">
          <div>
            <span className="wl-eyebrow">बीज · My Watchlist</span>
            <span className="wl-title">Crops on Watch</span>
          </div>
          <button className="wl-close" onClick={onClose}>✕</button>
        </div>
        <div className="wl-list">
          {watchlist.length === 0 ? (
            <div className="wl-empty-state">
              <div className="wl-empty-icon">🌾</div>
              <div className="wl-empty-text">No crops saved yet.<br />Tap the bookmark icon on any crop card.</div>
            </div>
          ) : watchlist.map(id => {
            const crop = cropMap[id];
            const token = tokenMap[id];
            if (!crop) return null;
            return (
              <div key={id} className="wl-item">
                <span className="wl-crop-emoji">{token?.emoji || '🌾'}</span>
                <div style={{ flex: 1 }}>
                  <div className="wl-crop-name">{crop.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.5rem', color: 'var(--straw-dim)', opacity: 0.45 }}>{crop.location}</div>
                </div>
                <span className="wl-crop-price">{crop.return_}</span>
                <button className="wl-remove" onClick={() => removeFromWatchlist(id)}>✕</button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
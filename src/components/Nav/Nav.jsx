import { useAppContext } from '../../context/AppContext';

// ─── Nav Component ────────────────────────────────────────────────────────────
// Fixed top navigation bar. Reads state directly from AppContext —
// no props needed from App.jsx.

export default function Nav() {
  const {
    connected,
    walletAddr,
    watchlist,
    setWalletOpen,
    setPortfolioOpen,
    setWatchlistOpen,
  } = useAppContext();

  const watchlistCount = watchlist.length;

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <nav>
      <div className="nav-brand">
        <span className="nav-brand-main">BSE · BEEJ</span>
        <span className="nav-brand-sub">बीज स्टॉक एक्सचेंज</span>
      </div>

      <ul className="nav-links">
        <li><a onClick={() => scrollTo('projects')}>Markets</a></li>
        <li><a onClick={() => scrollTo('bse-index')}>BEEJ-50</a></li>
        <li><a onClick={() => scrollTo('how')}>How It Works</a></li>
        <li><a onClick={() => scrollTo('problem')}>For Farmers</a></li>
        <li><a onClick={() => scrollTo('trust')}>About</a></li>
      </ul>

      <div className="nav-right">
        <button
          style={{
            background: 'none',
            border: '1px solid rgba(200,134,10,0.2)',
            color: 'rgba(212,200,154,0.5)',
            padding: '0.5rem 1.1rem',
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: '0.62rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.3s',
          }}
          onClick={() => setWatchlistOpen(true)}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--harvest)';
            e.currentTarget.style.color = 'var(--sky)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(200,134,10,0.2)';
            e.currentTarget.style.color = 'rgba(212,200,154,0.5)';
          }}
        >
          Watchlist
          {watchlistCount > 0 && (
            <span style={{
              position: 'absolute', top: '-6px', right: '-6px',
              background: 'var(--harvest)', color: 'var(--soil)',
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: '0.45rem', fontWeight: '600',
              width: '16px', height: '16px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {watchlistCount}
            </span>
          )}
        </button>

        {connected && (
          <button
            style={{
              background: 'none',
              border: '1px solid rgba(200,134,10,0.2)',
              color: 'rgba(212,200,154,0.5)',
              padding: '0.5rem 1.1rem',
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: '0.62rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onClick={() => setPortfolioOpen(true)}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--harvest)';
              e.currentTarget.style.color = 'var(--sky)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(200,134,10,0.2)';
              e.currentTarget.style.color = 'rgba(212,200,154,0.5)';
            }}
          >
            Portfolio
          </button>
        )}

        <button
          className={`nav-wallet ${connected ? 'connected' : ''}`}
          onClick={() => setWalletOpen(true)}
        >
          {connected ? walletAddr : 'Connect Wallet'}
        </button>
      </div>
    </nav>
  );
}
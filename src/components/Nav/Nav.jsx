import { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

// ─── Nav Component (v24) ──────────────────────────────────────────────────────
export default function Nav() {
  const {
    connected,
    walletAddr,
    watchlist,
    setWalletOpen,
    setPortfolioOpen,
    setWatchlistOpen,
    setFarmerModal,
    setInvestorModal,
    setTradeOpen,
    setPriceAlertsOpen,
    setYieldCalcOpen,
    setNotifOpen, unreadCount
  } = useAppContext();

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

useEffect(() => {
  const handleScroll = () => {
    const navEl = document.querySelector('nav:first-of-type');
    if (window.scrollY > 50) {
      navEl?.classList.add('scrolled');
    } else {
      navEl?.classList.remove('scrolled');
    }
  };
  handleScroll(); // run once on mount
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

  return (
    <>
      {/* ── Desktop Nav ── */}
      <nav>
        <div className="nav-brand">
          <span className="nav-brand-main">BSE · BEEJ</span>
          <span className="nav-brand-sub">बीज स्टॉक एक्सचेंज</span>
        </div>

        <ul className="nav-links">
          <li><a onClick={() => scrollTo('projects')} style={{ cursor: 'pointer' }}>Markets</a></li>
          <li><a onClick={() => scrollTo('bse-index')} style={{ cursor: 'pointer' }}>BEEJ-50</a></li>
          <li><a onClick={() => scrollTo('how')} style={{ cursor: 'pointer' }}>How It Works</a></li>
          <li><a onClick={() => {setFarmerModal(true); }} style={{ cursor: 'pointer' }}>For Farmers</a></li>
          <li><a onClick={() => {setInvestorModal(true); }} style={{ cursor: 'pointer' }}>For Investors</a></li>
          <li><a onClick={() => scrollTo('trust')} style={{ cursor: 'pointer' }}>About</a></li>
          <li>
            <a onClick={() => setTradeOpen(true)} style={{ cursor: 'pointer', position: 'relative' }}>
              Trade{' '}
              <span style={{
                display: 'inline-block',
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: '0.44rem',
                letterSpacing: '0.1em',
                background: 'var(--harvest)',
                color: 'var(--soil)',
                padding: '1px 5px',
                marginLeft: '4px',
                position: 'relative',
                top: '-1px',
                fontWeight: 500,
              }}>NEW</span>
            </a>
          </li>
        </ul>

        <div className="nav-right">
          {/* Watchlist button */}
          <button
            className={`nav-watchlist${watchlist.length > 0 ? ' has-items' : ''}`}
            onClick={() => setWatchlistOpen(true)}
            aria-label="Open watchlist"
          >
            <svg viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path className="nw-fill" d="M1 1h12v13.5l-6-3.5-6 3.5V1z" strokeLinejoin="round" stroke="currentColor" />
            </svg>
            Watchlist
            <span 
              className={`wl-badge${watchlist.length > 0 ? ' visible' : ''}`}>{watchlist.length}
            </span>
          </button>

          {/* Icon tray — Alerts + Yield Calculator only */}
          <div className="nav-icon-tray">
            {/* Price Alerts */}
            <button className="nav-icon-btn" aria-label="Price Alerts" title="Price Alerts" onClick={() => setPriceAlertsOpen(true)}>
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '15px', height: '15px' }}>
                <path d="M10 2C10 2 5 4.5 5 10V14L3 16H17L15 14V10C15 4.5 10 2 10 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M8 16C8 17.1 8.9 18 10 18C11.1 18 12 17.1 12 16" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="15" cy="5" r="2.5" fill="var(--ember)" />
              </svg>
            </button>

            {/* Yield Calculator */}
            <button className="nav-icon-btn" aria-label="Yield Calculator" title="Yield Calculator" onClick={() => setYieldCalcOpen(true)}>
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '15px', height: '15px' }}>
                <rect x="3" y="2" width="14" height="16" rx="1" stroke="currentColor" strokeWidth="1.3" />
                <path d="M6 5h8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M6 8.5h2.5M10.5 8.5H13M6 11.5h2.5M10.5 11.5H13M6 14.5h2.5M10.5 14.5H13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                <path d="M7.5 6.5V3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </button>

            {/* Notification Bell */}
            <button className="nav-bell" aria-label="Notifications" title="Notifications" onClick={() => setNotifOpen(true)}>
              <svg className="nav-bell-icon" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1C10 1 4 4 4 11V16L2 18H18L16 16V11C16 4 10 1 10 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M8 18C8 19.1 8.9 20 10 20C11.1 20 12 19.1 12 18" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}
            </button>
          </div>

          {/* Wallet button */}
          <button  
          className={`nav-wallet ${connected ? 'connected' : ''}`} 
            onClick={() => setWalletOpen(true)}>
            {connected ? `🔶 ${walletAddr}` : 'Connect Wallet'}
          </button>

          {/* Portfolio — only show when connected */}
          {connected && (
            <button
              className="nav-wallet"
              style={{ marginLeft: '0.5rem' }}
              onClick={() => setPortfolioOpen(true)}
            >
              Portfolio
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile Bottom Nav ── */}
      <div className="mobile-bottom-nav" aria-label="Mobile navigation">
        <div className="mbn-track">
          <button className="mbn-tab active" aria-label="Markets" onClick={() => scrollTo('projects')}>
            <div className="mbn-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="3 17 8 11 13 14 21 7" />
                <line x1="3" y1="21" x2="21" y2="21" />
              </svg>
            </div>
            <span className="mbn-label">Markets</span>
          </button>

          <button className="mbn-tab" aria-label="BEEJ-50 Index" onClick={() => scrollTo('bse-index')}>
            <div className="mbn-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <span className="mbn-label">Index</span>
          </button>

          <button className="mbn-tab mbn-center" aria-label="Trade" onClick={() => scrollTo('projects')}>
            <div className="mbn-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="mbn-label">Trade</span>
          </button>

          <button className="mbn-tab" aria-label="Price Alerts">
            <div className="mbn-icon">
              <svg viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.3">
                <path d="M10 1C10 1 4 4 4 11V16L2 18H18L16 16V11C16 4 10 1 10 1Z" strokeLinejoin="round" />
                <path d="M8 18C8 19.1 8.9 20 10 20C11.1 20 12 19.1 12 18" />
              </svg>
            </div>
            <span className="mbn-label">Alerts</span>
          </button>

          <button className="mbn-tab" aria-label="Portfolio" onClick={() => setPortfolioOpen(true)}>
            <div className="mbn-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="1" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <span className="mbn-label">Portfolio</span>
          </button>
        </div>
      </div>
    </>
  );
}
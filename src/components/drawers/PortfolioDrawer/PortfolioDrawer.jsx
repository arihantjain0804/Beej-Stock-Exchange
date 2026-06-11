import { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';

const MOCK_POSITIONS = [
  {
    id: 1,
    name: 'Basmati Rice',
    variety: 'RIC-25 · Punjab · Season 2025',
    value: 52500,
    invested: 50000,
    tokens: 100,
    avgPrice: 500,
    yield: '297.6 MT',
    harvest: 'Oct 2025',
    progress: 68,
  },
  {
    id: 2,
    name: 'Turmeric',
    variety: 'TRM-25 · Karnataka · Season 2025',
    value: 31200,
    invested: 30000,
    tokens: 60,
    avgPrice: 500,
    yield: '9630 Q',
    harvest: 'Dec 2025',
    progress: 42,
  },
];

const MOCK_ACTIVITY = [
  { id: 1, dot: 'green', desc: 'Purchased 100 tokens of Basmati Rice', meta: '12 Mar 2025 · 14:32 IST', amount: '₹50,000' },
  { id: 2, dot: 'harvest', desc: 'Purchased 60 tokens of Turmeric', meta: '18 Mar 2025 · 10:15 IST', amount: '₹30,000' },
  { id: 3, dot: 'ember', desc: 'KYC verification completed', meta: '10 Mar 2025 · 09:00 IST', amount: null },
];

export default function PortfolioDrawer() {
  const { portfolioOpen, setPortfolioOpen, walletAddr, setInvestorModal } = useAppContext();
  const [activeTab, setActiveTab] = useState('positions');

  const totalInvested = MOCK_POSITIONS.reduce((s, p) => s + p.invested, 0);
  const totalValue = MOCK_POSITIONS.reduce((s, p) => s + p.value, 0);
  const pnl = totalValue - totalInvested;
  const pnlPct = ((pnl / totalInvested) * 100).toFixed(1);

  return (
    <>
      {/* Scrim */}
      <div
        className={`portfolio-scrim${portfolioOpen ? ' open' : ''}`} onClick={() => setPortfolioOpen(false)}
      />

      {/* Drawer */}
      <div className={`pf-drawer${portfolioOpen ? ' open' : ''}`} role="dialog" aria-label="My Portfolio">

        {/* Header */}
        <div className="pf-header">
          <div className="pf-header-left">
            <span className="pf-eyebrow">बीज · My Portfolio</span>
            <span className="pf-title">Crop Holdings</span>
            <span className="pf-wallet-addr">{walletAddr || 'Not connected'}</span>
          </div>
          <button className="pf-close" onClick={() => setPortfolioOpen(false)}>✕</button>
        </div>

        {/* Summary */}
        <div className="pf-summary">
          <div className="pf-sum-item">
            <span className="pf-sum-label">Invested</span>
            <span className="pf-sum-value">₹{totalInvested.toLocaleString('en-IN')}</span>
            <span className="pf-sum-sub">{MOCK_POSITIONS.length} positions</span>
          </div>
          <div className="pf-sum-item">
            <span className="pf-sum-label">Current Value</span>
            <span className="pf-sum-value">₹{totalValue.toLocaleString('en-IN')}</span>
            <span className="pf-sum-sub">&nbsp;</span>
          </div>
          <div className="pf-sum-item">
            <span className="pf-sum-label">Unrealised P&amp;L</span>
            <span className="pf-sum-value gain">+₹{pnl.toLocaleString('en-IN')}</span>
            <span className="pf-sum-sub">+{pnlPct}%</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="pf-tabs">
          <button className={`pf-tab${activeTab === 'positions' ? ' active' : ''}`} onClick={() => setActiveTab('positions')}>Positions</button>
          <button className={`pf-tab${activeTab === 'activity' ? ' active' : ''}`} onClick={() => setActiveTab('activity')}>Activity</button>
        </div>

        {/* Body */}
        <div className="pf-body">

          {activeTab === 'positions' && (
            MOCK_POSITIONS.length === 0 ? (
              <div style={{ padding: '3rem 1.8rem', textAlign: 'center', opacity: 0.4, fontStyle: 'italic', color: 'var(--straw-dim)' }}>
                No positions yet. Start investing in crop tokens.
              </div>
            ) : (
              MOCK_POSITIONS.map(pos => {
                const pnl = pos.value - pos.invested;
                const isUp = pnl >= 0;
                return (
                  <div key={pos.id} className="pf-position">
                    <div className="pf-pos-top">
                      <div className="pf-pos-left">
                        <span className="pf-pos-name">{pos.name}</span>
                        <span className="pf-pos-variety">{pos.variety}</span>
                      </div>
                      <div className="pf-pos-right">
                        <span className="pf-pos-value">₹{pos.value.toLocaleString('en-IN')}</span>
                        <span className={`pf-pos-pnl ${isUp ? 'up' : 'down'}`}>
                          {isUp ? '+' : ''}₹{pnl.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="pf-pos-stats">
                      <div className="pf-stat">
                        <span className="pf-stat-label">Tokens</span>
                        <span className="pf-stat-value">{pos.tokens}</span>
                      </div>
                      <div className="pf-stat">
                        <span className="pf-stat-label">Avg Price</span>
                        <span className="pf-stat-value">₹{pos.avgPrice}</span>
                      </div>
                      <div className="pf-stat">
                        <span className="pf-stat-label">Est. Yield</span>
                        <span className="pf-stat-value">{pos.yield}</span>
                      </div>
                    </div>

                    <div className="pf-harvest-bar-wrap">
                      <div className="pf-harvest-label">
                        <span>Harvest Progress</span>
                        <span>{pos.harvest}</span>
                      </div>
                      <div className="pf-hbar-bg">
                        <div className="pf-hbar-fill" style={{ width: `${pos.progress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })
            )
          )}

          {activeTab === 'activity' && (
            MOCK_ACTIVITY.map(item => (
              <div key={item.id} className="pf-activity-item">
                <div className={`pf-act-dot ${item.dot}`} />
                <div className="pf-act-body">
                  <div className="pf-act-desc">{item.desc}</div>
                  <div className="pf-act-meta">{item.meta}</div>
                </div>
                {item.amount && <div className="pf-act-amount">{item.amount}</div>}
              </div>
            ))
          )}

        </div>

        {/* Footer */}
        <div className="pf-footer">
          <button className="pf-btn-invest" onClick={() => { setPortfolioOpen(false); setInvestorModal(true); }}>Add Position →</button>
          <button
              className="pf-btn-markets"
              onClick={() => {
                setPortfolioOpen(false);
                setTimeout(() => {
                  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }, 350);
              }}
            >
              Browse Markets
            </button>
        </div>

      </div>
    </>
  );
}
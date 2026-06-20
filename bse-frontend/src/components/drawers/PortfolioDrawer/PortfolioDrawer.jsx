import { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import './PortfolioDrawer.css';

const fmt = (n) => parseFloat(n || 0).toLocaleString('en-IN');
const fmtDate = (s) => s
  ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';
const fmtTime = (s) => s
  ? new Date(s).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  : '';

export default function PortfolioDrawer() {
  const {
    portfolioOpen, setPortfolioOpen,
    walletAddr,
    user,
    setInvestorModal,
    portfolio,
    transactions,
    portfolioLoading,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('positions');

  const holdings        = portfolio?.holdings  || [];
  const summary         = portfolio?.summary   || {};
  const totalInvested   = parseFloat(summary.total_invested  || 0);
  const currentValue    = parseFloat(summary.current_value   || 0);
  const unrealizedPnl   = parseFloat(summary.unrealized_pnl  || 0);
  const pnlPct          = parseFloat(summary.pnl_pct         || 0);
  const walletBalance   = parseFloat(summary.wallet_balance  || 0);
  const holdingsCount   = summary.holdings_count || holdings.length;

  return (
    <>
      {/* Scrim */}
      <div
        className={`portfolio-scrim${portfolioOpen ? ' open' : ''}`}
        onClick={() => setPortfolioOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`pf-drawer${portfolioOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="My Portfolio"
      >
        {/* Header */}
        <div className="pf-header">
          <div className="pf-header-left">
            <span className="pf-eyebrow">बीज · My Portfolio</span>
            <span className="pf-title">Crop Holdings</span>
            <span className="pf-wallet-addr">{walletAddr || 'Not connected'}</span>
          </div>
          <button className="pf-close" onClick={() => setPortfolioOpen(false)}>✕</button>
        </div>

        {portfolioLoading ? (
          <div style={{ padding: '3rem 1.8rem', textAlign: 'center', opacity: 0.5 }}>
            Loading portfolio…
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="pf-summary">
              <div className="pf-sum-item">
                <span className="pf-sum-label">Invested</span>
                <span className="pf-sum-value">₹{fmt(totalInvested)}</span>
                <span className="pf-sum-sub">{holdingsCount} position{holdingsCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="pf-sum-item">
                <span className="pf-sum-label">Current Value</span>
                <span className="pf-sum-value">₹{fmt(currentValue)}</span>
                <span className="pf-sum-sub">Wallet: ₹{fmt(walletBalance)}</span>
              </div>
              <div className="pf-sum-item">
                <span className="pf-sum-label">Unrealised P&amp;L</span>
                <span className={`pf-sum-value ${unrealizedPnl >= 0 ? 'gain' : 'loss'}`}>
                  {unrealizedPnl >= 0 ? '+' : ''}₹{fmt(Math.abs(unrealizedPnl))}
                </span>
                <span className="pf-sum-sub">{pnlPct >= 0 ? '+' : ''}{pnlPct}%</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="pf-tabs">
              <button
                className={`pf-tab${activeTab === 'positions' ? ' active' : ''}`}
                onClick={() => setActiveTab('positions')}
              >
                Positions
              </button>
              <button
                className={`pf-tab${activeTab === 'activity' ? ' active' : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                Activity
              </button>
            </div>

            {/* Body */}
            <div className="pf-body">

              {activeTab === 'positions' && (
                holdings.length === 0 ? (
                  <div style={{
                    padding: '3rem 1.8rem',
                    textAlign: 'center',
                    opacity: 0.4,
                    fontStyle: 'italic',
                    color: 'var(--straw)',
                  }}>
                    No positions yet. Start investing in crop tokens.
                  </div>
                ) : (
                  holdings.map(pos => {
                    const pnl     = parseFloat(pos.unrealized_pnl || 0);
                    const isUp    = pnl >= 0;
                    const posPct  = parseFloat(pos.pnl_pct || 0);
                    const harvest = pos.harvest_date ? new Date(pos.harvest_date) : null;
                    const now     = new Date();
                    const daysLeft = harvest
                      ? Math.max(0, Math.round((harvest - now) / 86400000))
                      : null;
                    const progress = daysLeft !== null
                      ? Math.min(100, Math.max(0, Math.round(100 - (daysLeft / 180) * 100)))
                      : 50;

                    return (
                      <div key={pos.id} className="pf-position">
                        <div className="pf-pos-top">
                          <div className="pf-pos-left">
                            <span className="pf-pos-name">{pos.name}</span>
                            <span className="pf-pos-variety">
                              {pos.symbol} · {pos.crop_type} · {pos.status}
                            </span>
                          </div>
                          <div className="pf-pos-right">
                            <span className="pf-pos-value">₹{fmt(pos.current_value)}</span>
                            <span className={`pf-pos-pnl ${isUp ? 'up' : 'down'}`}>
                              {isUp ? '+' : ''}₹{fmt(Math.abs(pnl))} ({isUp ? '+' : ''}{posPct}%)
                            </span>
                          </div>
                        </div>

                        <div className="pf-pos-stats">
                          <div className="pf-stat">
                            <span className="pf-stat-label">Tokens</span>
                            <span className="pf-stat-value">{pos.quantity}</span>
                          </div>
                          <div className="pf-stat">
                            <span className="pf-stat-label">Avg Cost</span>
                            <span className="pf-stat-value">₹{fmt(pos.avg_cost_inr)}</span>
                          </div>
                          <div className="pf-stat">
                            <span className="pf-stat-label">Est. Yield</span>
                            <span className="pf-stat-value">
                              {pos.expected_yield_pct ? `${pos.expected_yield_pct}%` : '—'}
                            </span>
                          </div>
                        </div>

                        <div className="pf-harvest-bar-wrap">
                          <div className="pf-harvest-label">
                            <span>Season Progress</span>
                            <span>{harvest ? fmtDate(pos.harvest_date) : 'TBD'}</span>
                          </div>
                          <div className="pf-hbar-bg">
                            <div className="pf-hbar-fill" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              )}

              {activeTab === 'activity' && (
                transactions.length === 0 ? (
                  <div style={{
                    padding: '3rem 1.8rem',
                    textAlign: 'center',
                    opacity: 0.4,
                    fontStyle: 'italic',
                    color: 'var(--straw)',
                  }}>
                    No transactions yet.
                  </div>
                ) : (
                  transactions.map(tx => {
                    const isCredit = ['sell', 'dividend', 'refund'].includes(tx.type);
                    const dot = tx.type === 'buy' ? 'green'
                      : tx.type === 'sell' ? 'ember'
                      : 'harvest';
                    return (
                      <div key={tx.id} className="pf-activity-item">
                        <div className={`pf-act-dot ${dot}`} />
                        <div className="pf-act-body">
                          <div className="pf-act-desc">
                            {tx.type?.toUpperCase()}{tx.quantity ? ` ${tx.quantity} tokens of ` : ' '}{tx.token_name || ''}
                          </div>
                          <div className="pf-act-meta">
                            {fmtDate(tx.created_at)} · {fmtTime(tx.created_at)}
                          </div>
                        </div>
                        <div className={`pf-act-amount ${isCredit ? 'gain' : ''}`}>
                          {isCredit ? '+' : '-'}₹{fmt(Math.abs(tx.amount_inr || 0))}
                        </div>
                      </div>
                    );
                  })
                )
              )}

            </div>
          </>
        )}

        {/* Footer */}
        <div className="pf-footer">
          <button
            className="pf-btn-invest"
            onClick={() => { setPortfolioOpen(false); setInvestorModal(true); }}
          >
            Add Position →
          </button>
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
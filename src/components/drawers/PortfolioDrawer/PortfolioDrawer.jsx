import { useAppContext } from '../../../context/AppContext';

export default function PortfolioDrawer() {
  const { portfolioOpen, setPortfolioOpen, connected } = useAppContext();
  const onClose = () => setPortfolioOpen(false);

  return (
    <>
      <div className={`drawer-scrim ${portfolioOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`portfolio-drawer ${portfolioOpen ? 'open' : ''}`}>
        <div className="pf-header">
          <div>
            <span className="pf-eyebrow">बीज · My Portfolio</span>
            <span className="pf-title">Crop Holdings</span>
          </div>
          <button className="pf-close" onClick={onClose}>✕</button>
        </div>
        <div className="pf-summary">
          <div className="pf-sum-item"><span className="pf-sum-label">Invested</span><span className="pf-sum-value">₹0</span></div>
          <div className="pf-sum-item"><span className="pf-sum-label">Current Value</span><span className="pf-sum-value">₹0</span></div>
          <div className="pf-sum-item"><span className="pf-sum-label">Unrealised P&L</span><span className="pf-sum-value gain">+₹0</span></div>
        </div>
        <div className="pf-body">
          {!connected ? (
            <>
              <div className="pf-empty-icon">🔗</div>
              <div className="pf-empty-text">Connect your wallet<br />to view your portfolio</div>
            </>
          ) : (
            <>
              <div className="pf-empty-icon">🌾</div>
              <div className="pf-empty-text">No positions yet.<br />Start investing in crops.</div>
            </>
          )}
        </div>
        <div className="pf-footer">
          <button className="pf-btn-invest" onClick={onClose}>Add Position →</button>
          <button className="pf-btn-markets" onClick={onClose}>Browse Markets</button>
        </div>
      </div>
    </>
  );
}
import { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { BSI_CONSTITUENTS } from '../../../data/tokens';

const CONDITION_OPTIONS = [
  { value: 'above', label: 'Rises above' },
  { value: 'below', label: 'Falls below' },
  { value: 'change_up', label: 'Change % up' },
  { value: 'change_dn', label: 'Change % down' },
];

function getDistance(current, target, condition) {
  if (condition === 'above') {
    const pct = ((target - current) / current) * 100;
    return { pct, label: pct > 0 ? `${pct.toFixed(1)}% away` : 'Triggered', cls: Math.abs(pct) < 2 ? 'close' : Math.abs(pct) < 8 ? 'medium' : 'far' };
  }
  if (condition === 'below') {
    const pct = ((current - target) / current) * 100;
    return { pct, label: pct > 0 ? `${pct.toFixed(1)}% away` : 'Triggered', cls: Math.abs(pct) < 2 ? 'close' : Math.abs(pct) < 8 ? 'medium' : 'far' };
  }
  return { pct: 50, label: 'Watching', cls: 'medium' };
}

const DEFAULT_ALERTS = [
  { id: 1, symbol: 'PNJ-WHT', condition: 'above', target: 900, createdAt: '2 days ago', status: 'watching' },
  { id: 2, symbol: 'VDB-SOY', condition: 'below', target: 600, createdAt: '1 day ago', status: 'watching' },
  { id: 3, symbol: 'KRS-RCE', condition: 'above', target: 520, createdAt: '5 hours ago', status: 'triggered' },
];

export default function PriceAlertsModal() {
  const { priceAlertsOpen, setPriceAlertsOpen } = useAppContext();
  const [activeToken, setActiveToken] = useState(BSI_CONSTITUENTS[0]);
  const [condition, setCondition] = useState('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [alerts, setAlerts] = useState(DEFAULT_ALERTS);
  const [toast, setToast] = useState({ show: false, title: '', detail: '', down: false });

  // Simulate price tick checking alerts
  useEffect(() => {
    if (!priceAlertsOpen) return;
    const interval = setInterval(() => {
      setAlerts(prev => prev.map(a => {
        const token = BSI_CONSTITUENTS.find(t => t.symbol === a.symbol);
        if (!token || a.status === 'triggered') return a;
        const price = token.basePrice * (0.98 + Math.random() * 0.04);
        const hit = (a.condition === 'above' && price >= a.target) ||
                    (a.condition === 'below' && price <= a.target);
        if (hit) {
          showToast(a, price);
          return { ...a, status: 'triggered' };
        }
        return a;
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, [priceAlertsOpen]);

  const showToast = (alert, price) => {
    const token = BSI_CONSTITUENTS.find(t => t.symbol === alert.symbol);
    setToast({
      show: true,
      title: `Alert: ${alert.symbol} ${alert.condition === 'above' ? '▲' : '▼'} ₹${alert.target}`,
      detail: `${token?.name} hit ₹${price.toFixed(2)} · ${alert.condition === 'above' ? 'Target reached' : 'Price dropped below target'}`,
      down: alert.condition === 'below',
    });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 4500);
  };

  const handleAddAlert = () => {
    if (!targetPrice || isNaN(parseFloat(targetPrice))) return;
    const newAlert = {
      id: Date.now(),
      symbol: activeToken.symbol,
      condition,
      target: parseFloat(targetPrice),
      createdAt: 'just now',
      status: 'watching',
    };
    setAlerts(prev => [newAlert, ...prev]);
    setTargetPrice('');
  };

  const handleDelete = (id) => setAlerts(prev => prev.filter(a => a.id !== id));
  const handleClearAll = () => setAlerts([]);

  if (!priceAlertsOpen) return null;

  return (
    <>
      <div className={`pa-backdrop open`} onClick={e => e.target === e.currentTarget && setPriceAlertsOpen(false)}>
        <div className="pa-modal">

          {/* Header */}
          <div className="pa-header">
            <div className="pa-header-left">
              <p className="pa-eyebrow">BSE · Price Alerts</p>
              <h2 className="pa-title">Price Alerts</h2>
            </div>
            <button className="pa-close" onClick={() => setPriceAlertsOpen(false)}>✕</button>
          </div>

          {/* Token selector */}
          <div className="pa-token-row">
            {BSI_CONSTITUENTS.slice(0, 6).map(t => (
              <button
                key={t.symbol}
                className={`pa-token-chip${activeToken.symbol === t.symbol ? ' active' : ''}`}
                onClick={() => setActiveToken(t)}
              >
                {t.symbol}
                <span className="pa-token-price">₹{t.basePrice.toFixed(2)}</span>
              </button>
            ))}
          </div>

          {/* Add alert form */}
          <div className="pa-form">
            <p className="pa-form-title">Set New Alert — {activeToken.symbol}</p>
            <div className="pa-form-grid">
              <div className="pa-field">
                <label className="pa-label">Condition</label>
                <select className="pa-select" value={condition} onChange={e => setCondition(e.target.value)}>
                  {CONDITION_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="pa-field">
                <label className="pa-label">Target Price</label>
                <div className="pa-input-wrap">
                  <input
                    className="pa-input"
                    type="number"
                    placeholder={activeToken.basePrice.toFixed(2)}
                    value={targetPrice}
                    onChange={e => setTargetPrice(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddAlert()}
                  />
                  <span className="pa-input-unit">₹</span>
                </div>
              </div>
              <button className="pa-add-btn" onClick={handleAddAlert}>+ Add</button>
            </div>
            <p className="pa-form-hint">
              Current price: <span>₹{activeToken.basePrice.toFixed(2)}</span> · Alerts trigger in real-time during market hours
            </p>
          </div>

          {/* Alerts list */}
          <div className="pa-alerts-section">
            <div className="pa-alerts-header">
              <span className="pa-alerts-label">Active Alerts ({alerts.length})</span>
              {alerts.length > 0 && (
                <button className="pa-clear-all" onClick={handleClearAll}>Clear All</button>
              )}
            </div>

            {alerts.length === 0 ? (
              <div className="pa-empty">
                <div className="pa-empty-icon">🔔</div>
                <p className="pa-empty-text">No alerts set · Add one above</p>
              </div>
            ) : (
              alerts.map(alert => {
                const token = BSI_CONSTITUENTS.find(t => t.symbol === alert.symbol);
                const dist = getDistance(token?.basePrice || 0, alert.target, alert.condition);
                const fillPct = Math.min(100, Math.max(0, 100 - dist.pct));
                const isTriggered = alert.status === 'triggered';
                const isDown = alert.condition === 'below' || alert.condition === 'change_dn';

                return (
                  <div
                    key={alert.id}
                    className={`pa-alert-item${isTriggered ? (isDown ? ' triggered-down' : ' triggered') : ''}`}
                  >
                    <div className={`pa-alert-status ${isTriggered ? (isDown ? 'triggered-down' : 'triggered') : 'watching'}`}>
                      {isTriggered ? '✓' : '◉'}
                    </div>
                    <div className="pa-alert-body">
                      <div className="pa-alert-token">{alert.symbol}</div>
                      <div className="pa-alert-desc">
                        {CONDITION_OPTIONS.find(o => o.value === alert.condition)?.label} ₹{alert.target.toFixed(2)}
                      </div>
                      <div className="pa-alert-meta">Set {alert.createdAt}</div>
                    </div>
                    <div className="pa-alert-right">
                      <span className="pa-alert-target">₹{alert.target.toFixed(2)}</span>
                      <span className={`pa-alert-distance ${dist.cls}`}>{dist.label}</span>
                      <div className="pa-distance-bar">
                        <div
                          className="pa-distance-fill"
                          style={{
                            width: `${fillPct}%`,
                            background: isDown ? 'var(--ember)' : 'var(--harvest)',
                          }}
                        />
                      </div>
                    </div>
                    <button className="pa-alert-delete" onClick={() => handleDelete(alert.id)}>✕</button>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* Toast */}
      <div className={`pa-toast${toast.show ? ' show' : ''}${toast.down ? ' down-alert' : ''}`}>
        <span className="pa-toast-icon">{toast.down ? '📉' : '📈'}</span>
        <div className="pa-toast-body">
          <div className="pa-toast-title">{toast.title}</div>
          <div className="pa-toast-detail">{toast.detail}</div>
        </div>
        <button className="pa-toast-close" onClick={() => setToast(t => ({ ...t, show: false }))}>✕</button>
      </div>
    </>
  );
}
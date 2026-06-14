import { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import './NotificationsPanel.css';

const INITIAL_NOTIFS = [
  {
    id: 1, type: 'harvest', icon: '🌾', unread: true,
    title: 'Punjab Wheat harvest settlement',
    desc: 'Smart contract settlement initiated · ₹8,40,000 distribution in progress',
    time: '2 min ago', tag: 'harvest', harvestPct: 94,
  },
  {
    id: 2, type: 'alert', icon: '📈', unread: true,
    title: 'Price alert triggered: KRS-RCE',
    desc: 'Krishna Rice crossed ₹520 target · Current price ₹523.40',
    time: '18 min ago', tag: 'alert',
  },
  {
    id: 3, type: 'trade', icon: '💱', unread: true,
    title: 'Order filled — VDB-SOY',
    desc: 'BUY 532 tokens @ ₹625.02 · Total ₹3,32,510.64',
    time: '1 hour ago', tag: 'trade',
  },
  {
    id: 4, type: 'kyc', icon: '✅', unread: false,
    title: 'KYC verification complete',
    desc: 'Your identity documents have been verified · Full trading access enabled',
    time: '3 hours ago', tag: 'kyc',
  },
  {
    id: 5, type: 'harvest', icon: '🌱', unread: false,
    title: 'Vidarbha Soy — season update',
    desc: 'Crop progress report: 67% funded · Agronomist confirms healthy growth',
    time: '5 hours ago', tag: 'harvest', harvestPct: 67,
  },
  {
    id: 6, type: 'alert', icon: '🔔', unread: false,
    title: 'Watchlist: PNJ-WHT near target',
    desc: 'Punjab Wheat is within 3% of your ₹900 price alert',
    time: 'Yesterday', tag: 'alert',
  },
  {
    id: 7, type: 'system', icon: '📋', unread: false,
    title: 'New crop listing: AP-TRM',
    desc: 'Andhra Pradesh Turmeric is now available · Rabi season · 19.2% projected return',
    time: 'Yesterday', tag: 'system',
  },
  {
    id: 8, type: 'trade', icon: '💰', unread: false,
    title: 'Dividend distributed — MH-CTN',
    desc: 'Mid-season distribution of ₹4,200 credited to your wallet',
    time: '2 days ago', tag: 'trade',
  },
];

const FILTERS = ['All', 'Harvest', 'Trades', 'Alerts', 'System'];

function filterNotifs(notifs, tab) {
  if (tab === 'All') return notifs;
  const map = { Harvest: 'harvest', Trades: 'trade', Alerts: 'alert', System: ['system', 'kyc'] };
  const types = Array.isArray(map[tab]) ? map[tab] : [map[tab]];
  return notifs.filter(n => types.includes(n.type));
}

export default function NotificationsPanel() {
  const { notifOpen, setNotifOpen, notifs, setNotifs, unreadCount } = useAppContext();
  const [activeTab, setActiveTab] = useState('All');
  const filtered = filterNotifs(notifs, activeTab);

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
  };
  const dismiss = (id) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };
  const markRead = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const tabCount = (tab) => filterNotifs(notifs, tab).filter(n => n.unread).length;

  // Group by time
  const today = filtered.filter(n => ['2 min ago','18 min ago','1 hour ago','3 hours ago','5 hours ago'].includes(n.time));
  const yesterday = filtered.filter(n => n.time === 'Yesterday');
  const older = filtered.filter(n => n.time === '2 days ago');

  const renderItem = (n) => (
    <div
      key={n.id}
      className={`notif-item${n.unread ? ' unread' : ''}`}
      onClick={() => markRead(n.id)}
    >
      <div className={`notif-icon-wrap ${n.type}`}>{n.icon}</div>
      <div className="notif-body">
        <div className="notif-item-title">{n.title}</div>
        <div className="notif-item-desc">{n.desc}</div>
        {n.harvestPct && (
          <div className="notif-harvest-bar">
            <div className="notif-harvest-fill" style={{ width: `${n.harvestPct}%` }} />
          </div>
        )}
        <div className="notif-item-meta">
          <span className="notif-item-time">{n.time}</span>
          <span className={`notif-item-tag ${n.tag}`}>{n.tag}</span>
        </div>
      </div>
      <button className="notif-item-dismiss" onClick={e => { e.stopPropagation(); dismiss(n.id); }}>✕</button>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`notif-backdrop${notifOpen ? ' open' : ''}`}
        onClick={() => setNotifOpen(false)}
      />

      {/* Panel */}
      <div className={`notif-panel${notifOpen ? ' open' : ''}`}>

        {/* Header */}
        <div className="notif-header">
          <div className="notif-header-left">
            <p className="notif-eyebrow">
              <span className="notif-live-dot" />
              BSE · Live Feed
            </p>
            <h2 className="notif-title">Notifications</h2>
            <div className="notif-header-actions">
              {unreadCount > 0 && (
                <button className="notif-mark-all" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
            </div>
          </div>
          <button className="notif-close" onClick={() => setNotifOpen(false)}>✕</button>
        </div>

        {/* Filter tabs */}
        <div className="notif-filters">
          {FILTERS.map(tab => {
            const count = tabCount(tab);
            return (
              <button
                key={tab}
                className={`notif-filter-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {count > 0 && <span className="notif-filter-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="notif-list">
          {filtered.length === 0 ? (
            <div className="notif-empty visible">
              <div className="notif-empty-icon">🔔</div>
              <p className="notif-empty-text">No notifications · All clear</p>
            </div>
          ) : (
            <>
              {today.length > 0 && (
                <>
                  <div className="notif-group-label">Today</div>
                  {today.map(renderItem)}
                </>
              )}
              {yesterday.length > 0 && (
                <>
                  <div className="notif-group-label">Yesterday</div>
                  {yesterday.map(renderItem)}
                </>
              )}
              {older.length > 0 && (
                <>
                  <div className="notif-group-label">Earlier</div>
                  {older.map(renderItem)}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="notif-footer">
          <span className="notif-footer-label">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </span>
          <button className="notif-settings-btn" onClick={() => { setNotifOpen(false); setPriceAlertsOpen(true); }}>Notification Settings →</button>
        </div>

      </div>
    </>
  );
}
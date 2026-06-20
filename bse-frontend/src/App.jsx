import {
  createContext, useContext, useState,
  useCallback, useEffect, useRef,
} from 'react';
import { TOKENS, seedPrices } from '../data/tokens';
import { useLivePrices } from '../hooks/useLivePrices';
import {
  authApi, portfolioApi,
  watchlistApi, notificationsApi,
} from '../api/index';
import { tokenStore } from '../api/client';

// ─── Context Definition ───────────────────────────────────────────────────────
const AppContext = createContext(null);

// Maps backend notification type → emoji icon
const NOTIF_ICONS = {
  harvest: '🌾', alert: '🔔', trade: '💱', kyc: '✅',
  system: '📋', dividend: '💰', price_alert: '📈',
};
function iconForType(type) { return NOTIF_ICONS[type] || '📋'; }

// ─── Provider Component ───────────────────────────────────────────────────────
export function AppProvider({ children }) {
  // ── Intro ─────────────────────────────────────────────────────────────────
  const [entered, setEntered] = useState(false);

  // ── Token prices ──────────────────────────────────────────────────────────
  const [tokens, setTokens] = useState(() => seedPrices(TOKENS));
  useLivePrices(setTokens);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // ── Wallet / Connection ───────────────────────────────────────────────────
  const [walletOpen, setWalletOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [walletAddr, setWalletAddr] = useState('');

  // ── Drawers ───────────────────────────────────────────────────────────────
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);

  // ── Portfolio ─────────────────────────────────────────────────────────────
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  // ── Watchlist ─────────────────────────────────────────────────────────────
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistItems, setWatchlistItems] = useState([]);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [cropDetail, setCropDetail] = useState(null);
  const [farmerModal, setFarmerModal] = useState(false);
  const [investorModal, setInvestorModal] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [priceAlertsOpen, setPriceAlertsOpen] = useState(false);
  const [yieldCalcOpen, setYieldCalcOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const unreadCount = notifs.filter(n => n.unread).length;

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ show: false, title: '', detail: '' });

  // ─── Restore session on mount ─────────────────────────────────────────────
  const sessionRestored = useRef(false);
  useEffect(() => {
    if (sessionRestored.current) return;
    sessionRestored.current = true;

    const hasToken = !!tokenStore.getAccess() || !!tokenStore.getRefresh();
    if (!hasToken) return;

    authApi.getMe()
      .then(res => {
        setUser(res.data);
        setConnected(true);
        setWalletAddr(res.data.phone || '');
      })
      .catch(() => {
        tokenStore.clear();
      });
  }, []);

  // ─── Fetch portfolio when drawer opens ────────────────────────────────────
  useEffect(() => {
    if (!portfolioOpen || !user) return;
    setPortfolioLoading(true);
    Promise.all([
      portfolioApi.get(),
      portfolioApi.transactions({ limit: 20 }),
    ])
      .then(([pfRes, txRes]) => {
        setPortfolio(pfRes.data);
        setTransactions(txRes.data || []);
      })
      .catch(err => console.error('Portfolio fetch failed', err))
      .finally(() => setPortfolioLoading(false));
  }, [portfolioOpen, user]);

  // ─── Fetch watchlist when user logs in ────────────────────────────────────
  const fetchWatchlist = useCallback(async () => {
    if (!user) return;
    try {
      const res = await watchlistApi.get();
      const rows = res.data || [];
      setWatchlistItems(rows);
      setWatchlist(rows.map(r => r.symbol));
    } catch (err) {
      console.error('Watchlist fetch failed', err);
    }
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // ─── Fetch notifications when panel opens ─────────────────────────────────
  useEffect(() => {
    if (!notifOpen || !user) return;
    setNotifsLoading(true);
    notificationsApi.get({ limit: 30 })
      .then(res => {
        const rows = (res.data || []).map(n => ({
          ...n,
          unread: !n.is_read,
          icon: iconForType(n.type),
          tag: n.type,
        }));
        setNotifs(rows);
      })
      .catch(err => console.error('Notifs fetch failed', err))
      .finally(() => setNotifsLoading(false));
  }, [notifOpen, user]);

  // ─── Escape key ───────────────────────────────────────────────────────────
  useEffect(() => {
    function handleEscape(e) {
      if (e.key !== 'Escape') return;
      if (walletOpen) setWalletOpen(false);
      else if (priceAlertsOpen) setPriceAlertsOpen(false);
      else if (investorModal) setInvestorModal(false);
      else if (notifOpen) setNotifOpen(false);
      else if (yieldCalcOpen) setYieldCalcOpen(false);
      else if (tradeOpen) setTradeOpen(false);
      else if (farmerModal) setFarmerModal(false);
      else if (cropDetail) setCropDetail(null);
      else if (watchlistOpen) setWatchlistOpen(false);
      else if (portfolioOpen) setPortfolioOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [
    walletOpen, priceAlertsOpen, investorModal, notifOpen, yieldCalcOpen,
    tradeOpen, farmerModal, cropDetail, watchlistOpen, portfolioOpen,
  ]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const showToast = useCallback((title, detail) => {
    setToast({ show: true, title, detail });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  }, []);

  const handleConnect = useCallback((method, addr, authResult) => {
    if (authResult) {
      tokenStore.set(authResult.tokens.access, authResult.tokens.refresh);
      setUser(authResult.user);
      setWalletAddr(authResult.user.phone || addr);
    } else {
      setWalletAddr(addr);
    }
    setConnected(true);
    setTimeout(() => {
      setWalletOpen(false);
      setPortfolioOpen(true);
      showToast('Wallet Connected', `${method} · ${addr}`);
    }, 1200);
  }, [showToast]);

  const handleLogout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setConnected(false);
    setWalletAddr('');
    setPortfolio(null);
    setTransactions([]);
    setWatchlist([]);
    setWatchlistItems([]);
    setNotifs([]);
    showToast('Logged out', 'Session ended');
  }, [showToast]);

  const handleBookmark = useCallback(async (crop) => {
    if (user) {
      const symbol = crop.tokenSymbol || crop.symbol || crop.id?.toUpperCase();
      const alreadyIn = watchlist.includes(symbol);
      try {
        if (alreadyIn) {
          await watchlistApi.remove(symbol);
          setWatchlist(prev => prev.filter(s => s !== symbol));
          setWatchlistItems(prev => prev.filter(r => r.symbol !== symbol));
          showToast('Removed from Watchlist', crop.name);
        } else {
          await watchlistApi.add(symbol);
          await fetchWatchlist();
          showToast('Added to Watchlist', crop.name);
        }
      } catch (err) {
        showToast('Watchlist Error', err.message);
      }
    } else {
      setWatchlist(prev => {
        if (prev.includes(crop.id)) {
          showToast('Removed from Watchlist', crop.name);
          return prev.filter(id => id !== crop.id);
        }
        showToast('Added to Watchlist', crop.name);
        return [...prev, crop.id];
      });
    }
  }, [user, watchlist, fetchWatchlist, showToast]);

  const handleInvest = useCallback((crop) => {
    if (!connected) {
      setWalletOpen(true);
    } else {
      showToast(
        `Trade Opened · ${crop.name}`,
        `Token: ${crop.tokenSymbol} · Price: ${crop.tokenPrice}`
      );
    }
  }, [connected, showToast]);

  const removeFromWatchlist = useCallback(async (symbolOrId) => {
    if (user) {
      try {
        await watchlistApi.remove(symbolOrId);
        setWatchlist(prev => prev.filter(s => s !== symbolOrId));
        setWatchlistItems(prev => prev.filter(r => r.symbol !== symbolOrId));
      } catch (err) {
        showToast('Error', err.message);
      }
    } else {
      setWatchlist(prev => prev.filter(x => x !== symbolOrId));
    }
  }, [user, showToast]);

  const markNotifRead = useCallback(async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true, unread: false } : n));
    } catch { /* silent */ }
  }, []);

  const markAllNotifsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true, unread: false })));
    } catch { /* silent */ }
  }, []);

  // ─── Context Value ─────────────────────────────────────────────────────────
  const value = {
    entered, setEntered,
    tokens,
    user,
    authLoading, setAuthLoading,
    authError, setAuthError,
    connected,
    walletAddr,
    walletOpen, setWalletOpen,
    portfolioOpen, setPortfolioOpen,
    watchlistOpen, setWatchlistOpen,
    portfolio,
    transactions,
    portfolioLoading,
    watchlist,
    watchlistItems,
    cropDetail, setCropDetail,
    farmerModal, setFarmerModal,
    investorModal, setInvestorModal,
    tradeOpen, setTradeOpen,
    priceAlertsOpen, setPriceAlertsOpen,
    yieldCalcOpen, setYieldCalcOpen,
    notifOpen, setNotifOpen,
    notifs, setNotifs,
    notifsLoading,
    unreadCount,
    toast,
    showToast,
    handleConnect,
    handleLogout,
    handleBookmark,
    handleInvest,
    removeFromWatchlist,
    fetchWatchlist,
    markNotifRead,
    markAllNotifsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return context;
}
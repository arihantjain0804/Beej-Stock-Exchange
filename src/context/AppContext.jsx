import { createContext, useContext, useState, useCallback } from 'react';
import { TOKENS, seedPrices } from '../data/tokens';
import { useLivePrices } from '../hooks/useLivePrices';
import { useReveal } from '../hooks/useReveal';

// ─── Context Definition ───────────────────────────────────────────────────────
const AppContext = createContext(null);

const INITIAL_NOTIFS = [
  { id: 1, type: 'harvest', icon: '🌾', unread: true, title: 'Punjab Wheat harvest settlement', desc: 'Smart contract settlement initiated · ₹8,40,000 distribution in progress', time: '2 min ago', tag: 'harvest', harvestPct: 94 },
  { id: 2, type: 'alert', icon: '📈', unread: true, title: 'Price alert triggered: KRS-RCE', desc: 'Krishna Rice crossed ₹520 target · Current price ₹523.40', time: '18 min ago', tag: 'alert' },
  { id: 3, type: 'trade', icon: '💱', unread: true, title: 'Order filled — VDB-SOY', desc: 'BUY 532 tokens @ ₹625.02 · Total ₹3,32,510.64', time: '1 hour ago', tag: 'trade' },
  { id: 4, type: 'kyc', icon: '✅', unread: false, title: 'KYC verification complete', desc: 'Your identity documents have been verified · Full trading access enabled', time: '3 hours ago', tag: 'kyc' },
  { id: 5, type: 'harvest', icon: '🌱', unread: false, title: 'Vidarbha Soy — season update', desc: 'Crop progress report: 67% funded · Agronomist confirms healthy growth', time: '5 hours ago', tag: 'harvest', harvestPct: 67 },
  { id: 6, type: 'alert', icon: '🔔', unread: false, title: 'Watchlist: PNJ-WHT near target', desc: 'Punjab Wheat is within 3% of your ₹900 price alert', time: 'Yesterday', tag: 'alert' },
  { id: 7, type: 'system', icon: '📋', unread: false, title: 'New crop listing: AP-TRM', desc: 'Andhra Pradesh Turmeric is now available · Rabi season · 19.2% projected return', time: 'Yesterday', tag: 'system' },
  { id: 8, type: 'trade', icon: '💰', unread: false, title: 'Dividend distributed — MH-CTN', desc: 'Mid-season distribution of ₹4,200 credited to your wallet', time: '2 days ago', tag: 'trade' },
];

// ─── Provider Component ───────────────────────────────────────────────────────
export function AppProvider({ children }) {
  // Intro
  const [entered, setEntered] = useState(false);

  // Live token prices
  const [tokens, setTokens] = useState(() => seedPrices(TOKENS));
  useLivePrices(setTokens);

  // Scroll reveal animations
  useReveal();

  // Wallet
  const [walletOpen, setWalletOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [walletAddr, setWalletAddr] = useState('');

  // Drawers
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);

  // Watchlist
  const [watchlist, setWatchlist] = useState([]);

  // Modals
  const [cropDetail, setCropDetail] = useState(null);
  const [farmerModal, setFarmerModal] = useState(false);
  const [investorModal, setInvestorModal] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [priceAlertsOpen, setPriceAlertsOpen] = useState(false);
  const [yieldCalcOpen, setYieldCalcOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const unreadCount = notifs.filter(n => n.unread).length;

  // Toast notification
  const [toast, setToast] = useState({ show: false, title: '', detail: '' });

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const showToast = useCallback((title, detail) => {
    setToast({ show: true, title, detail });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  }, []);

  const handleConnect = useCallback((method, addr) => {
    setConnected(true);
    setWalletAddr(addr);
    setTimeout(() => {
      setWalletOpen(false);
      setPortfolioOpen(true);
      showToast('Wallet Connected', `${method} · ${addr}`);
    }, 1200);
  }, [showToast]);

  const handleBookmark = useCallback((crop) => {
    setWatchlist(prev => {
      if (prev.includes(crop.id)) {
        showToast('Removed from Watchlist', crop.name);
        return prev.filter(id => id !== crop.id);
      } else {
        showToast('Added to Watchlist', crop.name);
        return [...prev, crop.id];
      }
    });
  }, [showToast]);

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

  const removeFromWatchlist = useCallback((id) => {
    setWatchlist(prev => prev.filter(x => x !== id));
  }, []);

  // ─── Context Value ──────────────────────────────────────────────────────────
  const value = {
    // State
    entered, setEntered,
    tokens,
    connected,
    walletAddr,
    walletOpen, setWalletOpen,
    portfolioOpen, setPortfolioOpen,
    watchlistOpen, setWatchlistOpen,
    watchlist,
    cropDetail, setCropDetail,
    farmerModal, setFarmerModal,
    investorModal, setInvestorModal,
    tradeOpen, setTradeOpen,
    priceAlertsOpen, setPriceAlertsOpen,
    yieldCalcOpen, setYieldCalcOpen,
    notifOpen, setNotifOpen,
    notifs, setNotifs, unreadCount,
    toast,

    // Handlers
    showToast,
    handleConnect,
    handleBookmark,
    handleInvest,
    removeFromWatchlist,
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
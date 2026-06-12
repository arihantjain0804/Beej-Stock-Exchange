import { createContext, useContext, useState, useCallback } from 'react';
import { TOKENS, seedPrices } from '../data/tokens';
import { useLivePrices } from '../hooks/useLivePrices';
import { useReveal } from '../hooks/useReveal';

// ─── Context Definition ───────────────────────────────────────────────────────
const AppContext = createContext(null);

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
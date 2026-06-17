import './styles/base.css';
import './styles/HandCursor.css';

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';

// Layout
import Nav from './components/Nav/Nav';
import { Footer, Toast } from './components/sections/sections.jsx';

// Drawers
import PortfolioDrawer from './components/drawers/PortfolioDrawer/PortfolioDrawer';
import WatchlistDrawer from './components/drawers/WatchlistDrawer/WatchlistDrawer';

// Modals
import WalletModal          from './components/modals/WalletModal/WalletModal';
import CropDetailModal      from './components/modals/CropDetailModal/CropDetailModal';
import FarmerModal          from './components/modals/FarmerModal/FarmerModal';
import InvestorModal        from './components/modals/InvestorModal/InvestorModal';
import IntroOverlay         from './components/modals/IntroOverlay/IntroOverlay';
import TradeModal           from './components/modals/TradeModal/TradeModal';
import PriceAlertsModal     from './components/modals/PriceAlertsModal/PriceAlertsModal';
import YieldCalculatorModal from './components/modals/YieldCalculatorModal/YieldCalculatorModal';
import NotificationsPanel   from './components/modals/NotificationsPanel/NotificationsPanel';

// Pages
import HomePage     from './pages/HomePage';
import MarketsPage  from './pages/MarketsPage';
import NotFoundPage from './pages/NotFoundPage';

//Mobile responsive styles
import './styles/responsive.css';

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div className="error-fallback">Something went wrong. Please refresh.</div>
    );
    return this.props.children;
  }
}

// ─── Shared shell (Nav + modals + drawers persist across all routes) ──────────
function AppShell() {
  const { entered, walletOpen, cropDetail, farmerModal, investorModal } = useAppContext();

  return (
    <>
      {!entered && <IntroOverlay />}
      <Nav />

      {/* Page content swaps here */}
      <Routes>
        <Route path="/"        element={<HomePage />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="*"        element={<NotFoundPage />} />
      </Routes>

      <Footer />

      {/* Drawers — global, always mounted */}
      <PortfolioDrawer />
      <WatchlistDrawer />

      {/* Modals — global, always mounted or conditionally rendered */}
      {walletOpen    && <WalletModal />}
      {cropDetail    && <CropDetailModal />}
      {farmerModal   && <FarmerModal />}
      {investorModal && <InvestorModal />}
      <TradeModal />
      <PriceAlertsModal />
      <YieldCalculatorModal />
      <NotificationsPanel />
      <Toast />
    </>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
import './styles/tokens.css';

import { AppProvider, useAppContext } from './context/AppContext';

// Layout components
import Nav       from './components/Nav/Nav';
import Hero      from './components/Hero/Hero';
import BeejIndex from './components/Beej-Index/Beej-Index';
import CropCards from './components/CropCards/CropCards';

// Section components
import {
  IntroOverlay,
  ProblemSection,
  HowItWorks,
  TrustMetrics,
  SeasonCalendar,
  ReturnSection,
  Footer,
  Toast,
} from './components/sections/sections.jsx';
// Modals
import WalletModal     from './components/modals/WalletModal/WalletModal';
import CropDetailModal from './components/modals/CropDetailModal/CropDetailModal';
import FarmerModal     from './components/modals/FarmerModal/FarmerModal';
import InvestorModal   from './components/modals/InvestorModal/InvestorModal';

// Drawers
import PortfolioDrawer from './components/drawers/PortfolioDrawer/PortfolioDrawer';
import WatchlistDrawer from './components/drawers/WatchlistDrawer/WatchlistDrawer';

// ─── Inner App (has access to context) ───────────────────────────────────────
function AppInner() {
  const {
    entered,
    walletOpen,
    cropDetail,
    farmerModal,
    investorModal,
  } = useAppContext();

  return (
    <>
      {!entered && <IntroOverlay />}

      <Nav />

      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <CropCards />
        <BeejIndex />
        <TrustMetrics />
        <SeasonCalendar />
        <ReturnSection />
      </main>

      <Footer />

      {/* Drawers */}
      <PortfolioDrawer />
      <WatchlistDrawer />

      {/* Modals — only render when open */}
      {walletOpen    && <WalletModal />}
      {cropDetail    && <CropDetailModal />}
      {farmerModal   && <FarmerModal />}
      {investorModal && <InvestorModal />}

      {/* Global toast notification */}
      <Toast />
    </>
  );
}

// ─── Root App (provides context to everything) ────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
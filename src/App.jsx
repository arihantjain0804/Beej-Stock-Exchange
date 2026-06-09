import { AppProvider, useAppContext } from './context/AppContext';
import Nav from './components/Nav/Nav';
import Hero from './components/Hero/Hero';
import Ticker from './components/Ticker/Ticker';
import BeejIndex from './components/BeejIndex/BeejIndex';
import CropCards from './components/CropCards/CropCards';
import WalletModal from './components/modals/WalletModal/WalletModal';
import CropDetailModal from './components/modals/CropDetailModal/CropDetailModal';
import FarmerModal from './components/modals/FarmerModal/FarmerModal';
import InvestorModal from './components/modals/InvestorModal/InvestorModal';
import PortfolioDrawer from './components/drawers/PortfolioDrawer/PortfolioDrawer';
import WatchlistDrawer from './components/drawers/WatchlistDrawer/WatchlistDrawer';
import {
  Toast,
  ProblemSection,
  HowItWorks,
  TrustMetrics,
  ReturnSection,
  Footer,
  SeasonCalendar,
  IntroOverlay,
} from './components/sections';
import './styles/tokens.css';

function AppShell() {
  const {
    entered, setEntered,
    tokens,
    connected, walletAddr,
    walletOpen, setWalletOpen,
    portfolioOpen, setPortfolioOpen,
    watchlistOpen, setWatchlistOpen,
    watchlist, removeFromWatchlist,
    cropDetail, setCropDetail,
    farmerModal, setFarmerModal,
    investorModal, setInvestorModal,
    toast,
    handleConnect,
    handleBookmark,
    handleInvest,
  } = useAppContext();

  return (
    <>
      {!entered && <IntroOverlay onEnter={() => setEntered(true)} />}

      <Nav
        connected={connected}
        walletAddr={walletAddr}
        watchlistCount={watchlist.length}
        onWalletClick={() => setWalletOpen(true)}
        onPortfolioClick={() => setPortfolioOpen(true)}
        onWatchlistClick={() => setWatchlistOpen(true)}
      />

      <Ticker />
      <Hero
        tokens={tokens}
        onInvestorClick={() => setInvestorModal(true)}
        onFarmerClick={() => setFarmerModal(true)}
      />
      <BeejIndex />
      <ProblemSection />
      <HowItWorks />
      <CropCards
        watchlist={watchlist}
        onBookmark={handleBookmark}
        onViewDetails={setCropDetail}
        onInvest={handleInvest}
      />
      <TrustMetrics />
      <SeasonCalendar />
      <ReturnSection
        onInvestorClick={() => setInvestorModal(true)}
        onFarmerClick={() => setFarmerModal(true)}
      />
      <Footer />

      {walletOpen && (
        <WalletModal onClose={() => setWalletOpen(false)} onConnect={handleConnect} />
      )}
      {cropDetail && (
        <CropDetailModal crop={cropDetail} onClose={() => setCropDetail(null)} onInvest={handleInvest} />
      )}
      {farmerModal && <FarmerModal onClose={() => setFarmerModal(false)} />}
      {investorModal && <InvestorModal onClose={() => setInvestorModal(false)} />}

      <PortfolioDrawer
        open={portfolioOpen}
        onClose={() => setPortfolioOpen(false)}
        connected={connected}
      />
      <WatchlistDrawer
        open={watchlistOpen}
        onClose={() => setWatchlistOpen(false)}
        watchlist={watchlist}
        onRemove={removeFromWatchlist}
      />

      <Toast message={toast} show={toast.show} />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
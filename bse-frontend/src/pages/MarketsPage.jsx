import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useReveal } from '../hooks/useReveal';
import CropCards from '../components/CropCards/CropCards';
import BeejIndex from '../components/Beej-Index/Beej-Index';

// Markets page — crop listings + BEEJ-50 index
// Supports ?open=trade and ?open=portfolio query params so Nav links
// can navigate here AND trigger a modal/drawer in one step.
export default function MarketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setTradeOpen, setPortfolioOpen } = useAppContext();
  useReveal();

  useEffect(() => {
    const open = searchParams.get('open');
    if (open === 'trade') {
      setTradeOpen(true);
      setSearchParams({}, { replace: true }); // clean URL after triggering
    } else if (open === 'portfolio') {
      setPortfolioOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, setTradeOpen, setPortfolioOpen]);

  return (
    <main>
      <section
        id="projects"
        style={{ paddingTop: '6rem' }} // offset for fixed Nav
      >
        <CropCards />
      </section>
      <section id="bse-index">
        <BeejIndex />
      </section>
    </main>
  );
}
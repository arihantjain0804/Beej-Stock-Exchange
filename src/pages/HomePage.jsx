import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';
import Hero from '../components/Hero/Hero';
import {
  ProblemSection,
  HowItWorks,
  TrustMetrics,
  SeasonCalendar,
  ReturnSection,
} from '../components/sections/sections.jsx';

export default function HomePage() {
  const { state } = useLocation();
  useReveal();

  // If Nav navigated here with a scrollTo target (e.g. from /markets clicking "About"),
  // scroll to that section after the page renders.
  useEffect(() => {
    if (state?.scrollTo) {
      // Small delay lets the DOM paint before scrolling
      const timer = setTimeout(() => {
        document.getElementById(state.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <main>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <TrustMetrics />
      <SeasonCalendar />
      <ReturnSection />
    </main>
  );
}
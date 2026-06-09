import { useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useParticles } from '../../hooks/useParticles';
import Ticker from '../Ticker/Ticker';

// ─── Hero Section ─────────────────────────────────────────────────────────────
// Full-viewport landing section with particle canvas, stats, and CTA buttons.

export default function Hero() {
  const { tokens, setInvestorModal, setFarmerModal } = useAppContext();
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  return (
    <section className="hero" id="hero">
      <div className="hero-atmosphere"></div>
      <div className="rays-wrap">
        {[...Array(8)].map((_, i) => <div key={i} className="ray"></div>)}
      </div>
      <div className="hero-sun"></div>
      <canvas ref={canvasRef} className="particle-canvas"></canvas>
      <div className="horizon"></div>
      <div className="field-floor"></div>

      <div className="hero-content">
        <p className="hero-eyebrow">Beej Stock Exchange</p>
        <h1 className="hero-title">
          Fund the Harvest.
          <span>Own the Return.</span>
        </h1>
        <div className="hero-divider"></div>
        <p className="hero-tagline">
          India's first crop-tokenization exchange — where farmers raise capital
          without debt, and investors earn from real fields.
        </p>

        <div className="hero-cta-wrap">
          <button className="cta-investor" onClick={() => setInvestorModal(true)}>
            <span className="cta-label">For Investors</span>
            <span className="cta-main-text">Explore Live Harvests →</span>
            <span className="cta-sub">Browse crop projects · Start from ₹500</span>
          </button>
          <button className="cta-farmer" onClick={() => setFarmerModal(true)}>
            <span className="cta-label">For Farmers</span>
            <span className="cta-main-text">List Your Crop →</span>
            <span className="cta-sub">Zero interest · Capital in 7 days</span>
          </button>
        </div>

        <div className="hero-stats">
          {[
            ['₹4.2Cr', 'Capital Deployed'],
            ['847',    'Farmers Funded'],
            ['18.4%',  'Avg. Investor Return'],
            ['12',     'States Active'],
          ].map(([num, label]) => (
            <div key={label} className="h-stat">
              <span className="h-stat-num">{num}</span>
              <span className="h-stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <Ticker tokens={tokens} />
    </section>
  );
}
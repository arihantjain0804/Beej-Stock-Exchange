import { useAppContext } from '../../context/AppContext';

export function Toast() {
  const { toast } = useAppContext();
  return (
    <div className={`trade-toast ${toast.show ? 'show' : ''}`}>
      <span style={{ fontSize: '1.4rem' }}>🌾</span>
      <div className="toast-body">
        <div className="toast-title">{toast.title}</div>
        <div className="toast-detail">{toast.detail}</div>
      </div>
    </div>
  );
}

export function ProblemSection() {
  return (
    <section id="problem">
      <div className="section-inner">
        <div className="problem-grid">
          <div className="problem-intro reveal" style={{ gridColumn: '1/-1' }}>
            <p className="section-eyebrow">The Real-World Problem</p>
            <h2 className="section-title">Two groups who need each other.<br /><em>Finally on the same field.</em></h2>
          </div>
          <div className="reveal">
            <span className="ps-tag ps-tag-farmer">The Farmer's Reality</span>
            <h3 className="ps-headline">"I have the land, the seed, the skill.<br />I don't have the capital."</h3>
            <p className="ps-body">Over 86% of Indian farmers are small and marginal holders. Every season, they turn to moneylenders charging 24–36% interest — before the crop has even been planted.</p>
            <ul className="ps-points">
              <li>No access to formal credit without collateral</li>
              <li>Forced into high-interest informal lending</li>
              <li>Profit goes to repayment, not the family</li>
              <li>Each season starts with debt, not dignity</li>
            </ul>
          </div>
          <div className="seed-orb-divider">
            <div className="seed-orb-line"></div>
            <div className="seed-orb-core">
              <div className="seed-orb-glow"></div>
              <svg className="seed-orb-svg" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
                <circle cx="28" cy="28" r="27" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                <ellipse cx="28" cy="28" rx="9" ry="13" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
                <path d="M28 15 L28 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                <path d="M28 41 L28 48" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
              </svg>
            </div>
            <div className="seed-orb-line"></div>
          </div>
          <div className="reveal reveal-d1">
            <span className="ps-tag ps-tag-investor">The Investor's Reality</span>
            <h3 className="ps-headline">"I want real returns from real things.<br />Not another screen."</h3>
            <p className="ps-body">FDs at 6.5%. Equity markets with volatility and noise. Crypto speculation. Where is the asset-backed, tangible investment that also means something?</p>
            <ul className="ps-points">
              <li>FDs underperform inflation in real terms</li>
              <li>Equities require deep market knowledge</li>
              <li>No direct access to agricultural upside</li>
              <li>Returns disconnected from the real economy</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how" style={{ background: 'var(--soil-mid)', borderTop: '1px solid var(--glass-border-dim)' }}>
      <div className="section-inner">
        <div style={{ textAlign: 'center' }} className="reveal">
          <p className="section-eyebrow">How Beej Works</p>
          <h2 className="section-title">Three acts. <em>One harvest.</em></h2>
        </div>
        <div className="how-steps">
          {[
            { num: '01', icon: '🌱', title: 'A farmer lists a crop', body: 'A verified farmer submits their crop project — land size, crop variety, expected yield, funding need, and season timeline. A BSE agronomist validates the listing within 48 hours.', data: 'YIELD ESTIMATE · RISK SCORE · VERIFIED DATA', delay: '' },
            { num: '02', icon: '💰', title: 'Investors fund in tokens', body: 'The crop is tokenized into fractional units. Each token represents a proportional share of the eventual harvest proceeds. Invest from ₹500 upward — no intermediaries.', data: 'SMART CONTRACT · ASSET-BACKED · FRACTIONAL', delay: 'reveal-d1' },
            { num: '03', icon: '🌾', title: 'Harvest distributes returns', body: 'After harvest, crop sale proceeds flow through a smart contract. Farmers keep their agreed share. Investor returns are distributed proportionally within 24 hours.', data: 'AUTO DISTRIBUTION · 24HR SETTLEMENT · ON-CHAIN', delay: 'reveal-d2' },
          ].map(s => (
            <div key={s.num} className={`how-step reveal ${s.delay}`}>
              <div className="step-num">{s.num}</div>
              <span className="step-icon">{s.icon}</span>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body">{s.body}</p>
              <p className="step-data">{s.data}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustMetrics() {
  const stats = [
    { num: '₹4.2Cr', label: 'Total Capital Deployed',  sub: 'Across 2 seasons',           delay: 'reveal-d1' },
    { num: '847',    label: 'Farmers Funded',           sub: 'Across 12 states',            delay: 'reveal-d2' },
    { num: '18.4%',  label: 'Average Investor Return',  sub: 'Per season cycle',            delay: 'reveal-d3' },
    { num: '100%',   label: 'On-time Distribution',     sub: 'Smart contract guaranteed',   delay: 'reveal-d4' },
  ];
  return (
    <section id="trust">
      <div className="section-inner">
        <div className="trust-grid">
          {stats.map(s => (
            <div key={s.label} className={`trust-metric reveal ${s.delay}`}>
              <span className="tm-num">{s.num}</span>
              <span className="tm-label">{s.label}</span>
              <span className="tm-sub">{s.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ReturnSection() {
  const { setInvestorModal, setFarmerModal } = useAppContext();
  return (
    <section id="return">
      <div className="section-inner">
        <div className="return-inner reveal" style={{ textAlign: 'center' }}>
          <p className="section-eyebrow">The Return</p>
          <h2 className="return-title">Invest in soil.<br /><em>Reap what the market can't.</em></h2>
          <p className="return-sub">
            Crop tokens are asset-backed, time-bound, and inflation-resistant. When the fields yield, so do you —
            directly, transparently, and proportionally.
          </p>
          <div className="return-btns">
            <button className="btn-invest" onClick={() => setInvestorModal(true)}>Start Investing →</button>
            <button className="btn-secondary-cta" onClick={() => setFarmerModal(true)}>List Your Crop</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <div className="footer-brand-main">BSE · BEEJ</div>
          <div className="footer-brand-sub">बीज स्टॉक एक्सचेंज</div>
          <p className="footer-desc">India's first crop-tokenization exchange, connecting farmers with investors through transparent, smart-contract-settled crop tokens.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <div className="footer-col-title">Platform</div>
            <a>Markets</a><a>BEEJ-50 Index</a><a>Trade</a><a>Portfolio</a><a>Watchlist</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Learn</div>
            <a>How It Works</a><a>For Farmers</a><a>For Investors</a><a>Risk Framework</a><a>Agronomist Reports</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <a>About BSE</a><a>Careers</a><a>Press</a><a>Privacy Policy</a><a>Terms of Service</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-legal">© 2025 Beej Exchange Pvt. Ltd. · CIN: U67100MH2024PTC000001</div>
        <div className="footer-sebi">Regulated under SEBI AgriToken Framework · IRDAI Crop Insurance Partner</div>
      </div>
    </footer>
  );
}
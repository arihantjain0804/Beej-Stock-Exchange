import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { MONTHS } from '../../data/tokens';
import './ProblemSection.css';
import './HowItWorks.css';
import './TrustMetrics.css';
import './SeasonCalendar.css';
import './ReturnSection.css';
import './Footer.css';
import './Toast.css';

const steps = [
  { num: '01', icon: '🌱', title: 'A farmer lists a crop', body: 'A verified farmer submits their crop project — land size, crop variety, expected yield, funding need, and season timeline. A BSE agronomist validates the listing within 48 hours.', data: 'YIELD ESTIMATE · RISK SCORE · VERIFIED DATA' },
  { num: '02', icon: '💰', title: 'Investors fund in tokens', body: 'The crop is tokenized into fractional units. Each token represents a proportional share of the eventual harvest proceeds. Investors browse, evaluate, and invest — from ₹500 upward — no intermediaries.', data: 'SMART CONTRACT · ASSET-BACKED · FRACTIONAL' },
  { num: '03', icon: '🌾', title: 'Harvest distributes returns', body: 'After harvest, crop sale proceeds flow through a smart contract. Farmers keep their agreed share. Investor returns are distributed proportionally, automatically, within 24 hours of sale settlement.', data: 'AUTO DISTRIBUTION · 24HR SETTLEMENT · ON-CHAIN' },
];

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
        <div className="problem-grid" >
          <div className="problem-intro reveal" style={{ gridColumn: '1/-1' , marginBottom: '6rem'}}>
            <p className="section-eyebrow">The Real-World Problem</p>
            <h2 className="section-title">Two groups who need each other.<br /><em>Finally on the same field.</em></h2>
          </div>
          <div className="problem-side problem-farmer reveal">
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
          
          <div className="seed-orb-divider-vertical">
            <div className="seed-orb-line-v" />
            <div className="seed-orb-core">
              <div className="seed-orb-glow" />
              <svg className="seed-orb-svg" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
                <circle cx="28" cy="28" r="27" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                <ellipse cx="28" cy="28" rx="9" ry="13" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
                <path d="M28 15 L28 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                <path d="M28 41 L28 48" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
              </svg>
            </div>
            <div className="seed-orb-line-v" />
          </div>
          <div className="problem-side problem-investor reveal reveal-d1">
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
  const sectionRef = useRef(null);

  useEffect(() => {
    const steps = sectionRef.current?.querySelectorAll('.how-step');
    const pathFill = sectionRef.current?.querySelector('.hiw-path-fill');
    const nodes = sectionRef.current?.querySelectorAll('.hiw-node');
    const reveals = sectionRef.current?.querySelectorAll('.reveal');
    reveals?.forEach(el => el.classList.add('visible'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate steps in
          steps?.forEach(s => s.classList.add('visible'));
          // Draw the connector line
          pathFill?.classList.add('animate');
          // Pop the nodes with delay
          nodes?.forEach((node, i) => {
            setTimeout(() => node.classList.add('pop'), i * 500 + 100);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how" ref={sectionRef}>
      <div className="section-inner">
        <div style={{ textAlign: 'center' }} className="reveal">
          <p className="section-eyebrow">How Beej Works</p>
          <h2 className="section-title">Three acts. <em>One harvest.</em></h2>
        </div>

        <div className="how-steps">
          {/* Animated SVG connector */}
          <svg className="hiw-connector" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '7rem', overflow: 'visible', pointerEvents: 'none' }}>
            <defs>
              <linearGradient id="hiw-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(200,134,10,0.3)" />
                <stop offset="50%" stopColor="#C8860A" />
                <stop offset="100%" stopColor="rgba(200,134,10,0.3)" />
              </linearGradient>
            </defs>
            <line className="hiw-path-bg" x1="16.67%" y1="56" x2="83.33%" y2="56" />
            <line className="hiw-path-fill" x1="16.67%" y1="56" x2="83.33%" y2="56" />
          </svg>

          {/* Glowing nodes */}
          <div className="hiw-node" style={{ left: 'calc(16.67% - 3px)', top: '3.5rem' }} />
          <div className="hiw-node" style={{ left: 'calc(50% - 1px)', top: '3.5rem' }} />
          <div className="hiw-node" style={{ left: 'calc(83.33% - 2px)', top: '3.5rem' }} />

          {steps.map((s, i) => (
            <div key={s.num} className="how-step">
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
          <p className="section-eyebrow">The Season Is Open</p>
          <h2 className="return-title">The field is ready.<br /><em>Are you?</em></h2>
          <p className="return-sub">
            Every rupee you put in is a seed. Every harvest is your return.
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
      <div className="footer-top">
        <div className="footer-col-brand">
          <span className="footer-logo-text">BSE · BEEJ</span>
          <span className="footer-logo-hindi">बीज स्टॉक एक्सचेंज · Est. 2025</span>
          <p className="footer-tagline-text">Where seeds become stocks, and harvests become returns.</p>
        </div>
        <div>
          <div className="footer-col-heading">Platform</div>
          <ul className="footer-col-links">
            <li><a>Browse Markets</a></li>
            <li><a>List Your Crop</a></li>
            <li><a>How It Works</a></li>
            <li><a>Token Standards</a></li>
            <li><a>Smart Contracts</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-heading">Company</div>
          <ul className="footer-col-links">
            <li><a>About BSE</a></li>
            <li><a>Agronomist Network</a></li>
            <li><a>Impact Reports</a></li>
            <li><a>Press &amp; Media</a></li>
            <li><a>Careers</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-heading">Legal &amp; Compliance</div>
          <ul className="footer-col-links">
            <li><a>Terms of Service</a></li>
            <li><a>Privacy Policy</a></li>
            <li><a>Risk Disclosure</a></li>
            <li><a>SEBI Registration</a></li>
            <li><a>Grievance Redressal</a></li>
          </ul>
        </div>
        <div className="footer-sebi">
          <p className="footer-sebi-text">
            <strong>RISK DISCLOSURE</strong> — Investments in crop tokens involve risks including but not limited to weather, commodity price fluctuations, and regulatory changes. Past returns are not indicative of future performance. Beej Stock Exchange is registered with <strong>SEBI</strong> under the Alternative Investment Fund regulations. All crop listings are independently verified by certified agronomists. Investors are advised to read the complete Risk Disclosure document before investing. Minimum investment ₹500. This platform is intended for Indian residents only.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy-new">© 2025 Beej Exchange Pvt. Ltd. · CIN: U67100MH2024PTC000001</span>
        <div className="footer-social">
          <a>Twitter</a>
          <a>LinkedIn</a>
          <a>Telegram</a>
        </div>
      </div>
    </footer>
  );
}

// Month index → which season bar color to show
const MONTH_SEASONS = [
  'rabi',    // Jan
  'rabi',    // Feb
  'rabi',    // Mar
  'zaid',    // Apr
  'zaid',    // May
  'zaid',    // Jun
  'kharif',  // Jul
  'kharif',  // Aug
  'kharif',  // Sep
  'kharif',  // Oct
  'kharif',  // Nov
  'rabi',    // Dec
];

const MONTH_CROPS = {
  3:  [{ name: 'WHEAT', status: 'open' }],
  4:  [{ name: 'WHEAT', status: 'open' }],
  5:  [{ name: 'RICE',  status: 'open' }, { name: 'SOY', status: 'open' }],
  6:  [{ name: 'RICE',  status: 'open' }, { name: 'SOY', status: 'open' }],
  7:  [{ name: 'RICE',  status: 'open' }, { name: 'SOY', status: 'open' }],
  8:  [{ name: 'SOY',   status: 'soon' }],
};

const FUNDING_ROWS = [
  {
    label: 'Punjab Wheat',
    spans: [
      { start: 3, end: 4, type: 'open' },
      { start: 5, end: 5, type: 'soon' },
    ],
  },
  {
    label: 'Krishna Rice',
    spans: [
      { start: 5, end: 6, type: 'soon' },
      { start: 7, end: 8, type: 'soon' },
    ],
  },
  {
    label: 'Vidarbha Soy',
    spans: [
      { start: 5, end: 5, type: 'soon' },
      { start: 6, end: 7, type: 'soon' },
      { start: 8, end: 10, type: 'soon' },
    ],
  },
];

function buildCells(spans) {
  const cells = Array(12).fill(null).map(() => ({ type: null, pos: null, label: null }));
  spans.forEach(({ start, end, type, label }) => {
    for (let i = start; i <= end; i++) {
      const pos = i === start && i === end ? 'single'
        : i === start ? 'span-start'
        : i === end   ? 'span-end'
        : 'span-mid';
      cells[i] = { type, pos, label: i === start ? label : null };
    }
  });
  return cells;
}

export function SeasonCalendar() {
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const stripRef = useRef(null);
  const { setCropDetail } = useAppContext();

  useEffect(() => {
    const fills = stripRef.current?.querySelectorAll('.month-bar-fill');
    if (!fills) return;
    const t = setTimeout(() => {
      fills.forEach(el => { el.style.width = '100%'; });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="season-calendar" className="season-calendar">
      <div className="section-inner">

        <div className="calendar-header reveal">
          <p className="cal-eyebrow">Crop Season Calendar · 2025–26</p>
          <h3 className="cal-title">When the fields wake, and when they rest.</h3>
        </div>

        <div className="season-strip reveal reveal-delay-1" ref={stripRef}>
          {MONTHS.map((m, i) => {
            const crops = MONTH_CROPS[i] || [];
            const hasCrop = crops.length > 0;
            const hasOpen = crops.some(c => c.status === 'open');
            return (
              <div
                key={m}
                className={`month-col${hasCrop ? ' has-crop' : ''}`}
                onMouseEnter={() => setHoveredMonth(i)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                <div className="month-open-badge">{hasOpen ? 'OPEN' : ''}</div>
                <div className="month-name">{m}</div>
                <div className={`month-bar${hasCrop && hasOpen ? ' fundable-open' : hasCrop ? ' fundable' : ''}`}>
                  <div className={`month-bar-fill ${MONTH_SEASONS[i]}`} style={{ width: 0 }} />
                </div>
                <div className="month-crops">
                  {crops.map(c => (
                    <div key={c.name} className={`crop-pill ${c.status}`}>
                      <div className="pill-dot" />
                      {c.name}
                    </div>
                  ))}
                </div>
                {hasCrop && (
                  <div className="cal-tooltip">
                    <div className="tt-month">{m} 2025</div>
                    <div className="tt-divider" />
                    {crops.map(c => (
                      <div key={c.name} className="tt-crop">
                        <div className="tt-crop-name">{
                          c.name === 'WHEAT' ? 'Punjab Wheat' :
                          c.name === 'RICE'  ? 'Krishna Rice' :
                          'Vidarbha Soy'
                        }</div>
                        <div className={`tt-crop-status ${c.status}`}>{c.status.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="reveal reveal-delay-2">
          <div className="timeline-legend">
            <div className="tl-legend-item">
              <div className="tl-legend-swatch open-swatch" />
              Funding Open
            </div>
            <div className="tl-legend-item">
              <div className="tl-legend-swatch soon-swatch" />
              Coming Soon
            </div>
          </div>
          <div className="funding-timeline">
            {FUNDING_ROWS.map(row => {
              const cells = buildCells(
                row.spans.map((s, si) => ({ ...s, label: si === 0 ? row.label : null }))
              );
              return (
                <div key={row.label} className="funding-row">
                  {cells.map((cell, i) => (
                    <div
                      key={i}
                      className={[
                        'funding-cell',
                        cell.type ? `fc-${cell.type}` : '',
                        cell.pos  ? cell.pos : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => cell.type === 'open' && setCropDetail(row.label)}
                    >
                      {cell.label && <span className="span-label">{cell.label}</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="cal-open-callout reveal reveal-delay-3">
          <div className="callout-left">
            <div className="callout-pulse-dot" />
            <div className="callout-text">
              <span className="callout-label">Funding Open Now · April 2025</span>
              <span className="callout-desc">Punjab Wheat — accepting investor tokens this season</span>
            </div>
          </div>
          <button className="callout-btn" onClick={() => setCropDetail('Punjab Wheat')}>
            Invest Now →
          </button>
        </div>

        <div className="season-legend reveal reveal-delay-3">
          {[
            ['kharif', 'Kharif (Jun–Nov)'],
            ['rabi',   'Rabi (Nov–Apr)'],
            ['zaid',   'Zaid (Mar–Jun)'],
          ].map(([cls, label]) => (
            <div key={cls} className="legend-item">
              <div className={`legend-dot ${cls}`} />
              {label}
            </div>
          ))}
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--harvest)', opacity: 1 }} />
            Fundable Now
          </div>
        </div>

      </div>
    </section>
  );
}
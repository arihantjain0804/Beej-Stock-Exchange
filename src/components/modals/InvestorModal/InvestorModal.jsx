import { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';

const STEPS = [
  { num: 1, label: 'Your Profile' },
  { num: 2, label: 'KYC & Bank' },
  { num: 3, label: 'Preferences' },
  { num: 4, label: 'Confirmed' },
];

const CROPS = [
  { key: 'wheat', emoji: '🌾', name: 'Wheat' },
  { key: 'rice', emoji: '🍚', name: 'Rice' },
  { key: 'soybean', emoji: '🫘', name: 'Soybean' },
  { key: 'cotton', emoji: '☁️', name: 'Cotton' },
  { key: 'sugarcane', emoji: '🎋', name: 'Sugarcane' },
  { key: 'maize', emoji: '🌽', name: 'Maize' },
  { key: 'groundnut', emoji: '🥜', name: 'Groundnut' },
  { key: 'turmeric', emoji: '🟡', name: 'Turmeric' },
];

const REGIONS = ['Punjab', 'Maharashtra', 'Andhra Pradesh', 'Karnataka', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat', 'Rajasthan'];

export default function InvestorModal() {
  const { setInvestorModal, setPortfolioOpen } = useAppContext();
  const [step, setStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);

  // Step 1
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [investorType, setInvestorType] = useState('');
  const [experience, setExperience] = useState('');
  const [risk, setRisk] = useState('');

  // Step 2
  const [pan, setPan] = useState('');
  const [demat, setDemat] = useState('');
  const [upi, setUpi] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState('');
  const [addressFile, setAddressFile] = useState('');

  // Step 3
  const [selectedCrops, setSelectedCrops] = useState(['wheat', 'soybean']);
  const [ticket, setTicket] = useState(10000);
  const [selectedRegions, setSelectedRegions] = useState(['Punjab', 'Andhra Pradesh']);
  const [horizon, setHorizon] = useState('medium');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeSebi, setAgreeSebi] = useState(false);

  const [error, setError] = useState('');
  const investorId = `BSE-INV-${Math.floor(Math.random() * 900000 + 100000)}`;

  const onClose = () => setInvestorModal(false);

  const toggleCrop = (key) => setSelectedCrops(prev =>
    prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
  );

  const toggleRegion = (r) => setSelectedRegions(prev =>
    prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
  );

  const handleNext = () => {
    setError('');
    console.log('showErrors before:', showErrors, 'name:', name, 'email:', email, 'phone:', phone);
    if (step === 1) {
      if (!name || !email || !phone || !investorType || !risk) {
        setError('Please fill in all required fields before continuing.');
        setShowErrors(true);
        console.log('set showErrors to true');
        return;
      }
    }
    if (step === 2) {
      if (!pan || pan.length !== 10) {
        setError('Please enter a valid PAN number to continue.');
        setShowErrors(true);
        return;
      }
    }
    if (step === 3) {
      if (!agreeTerms || !agreeSebi) {
        setError('Please accept both terms to activate your account.');
        setShowErrors(true);
        return;
      }
    }
    setShowErrors(false);
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError('');
    setShowErrors(false);
    setStep(s => s - 1);
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="iom-shell">

        <button className="iom-close" onClick={onClose}>✕</button>

        <div className="iom-header">
          <p className="iom-eyebrow">Investor Registration · बीज</p>
          <h2 className="iom-title">Grow your capital.<br /><em>From seed to return.</em></h2>
        </div>

        {/* Step progress */}
        <div className="iom-progress">
          <div className="iom-steps-row">
            {STEPS.map(s => {
              let nodeClass = 'iom-step-node';
              if (step > s.num) nodeClass += ' completed';
              else if (step === s.num) nodeClass += ' active';
              return (
                <div key={s.num} className={nodeClass}>
                  <div className="iom-step-circle">{step > s.num ? '✓' : s.num}</div>
                  <span className="iom-step-label">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="iom-body">

          {/* Step 1 */}
          {step === 1 && (
            <div className="iom-step-panel active">
              <div className="iom-section-head">
                <div className="iom-section-icon">📊</div>
                <div>
                  <div className="iom-section-title">Investor Profile</div>
                  <div className="iom-section-sub">Basic details to set up your BSE investor account</div>
                </div>
              </div>

              <div className="iom-row iom-row-2">
                <div className="iom-field">
                  <label className="iom-label">Full Name <span>*</span></label>
                  <input className={`iom-input${showErrors && !name ? ' iom-input-error' : ''}`} type="text" placeholder="Priya Sharma" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="iom-field">
                  <label className="iom-label">Email Address <span>*</span></label>
                  <input className={`iom-input${showErrors && !email ? ' iom-input-error' : ''}`} type="email" placeholder="priya@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="iom-row iom-row-2">
                <div className="iom-field">
                  <label className="iom-label">Mobile Number <span>*</span></label>
                  <input className={`iom-input${showErrors && !phone ? ' iom-input-error' : ''}`} type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="iom-field">
                  <label className="iom-label">City</label>
                  <input className="iom-input" type="text" placeholder="Mumbai" value={city} onChange={e => setCity(e.target.value)} />
                </div>
              </div>

              <div className="iom-row iom-row-2">
                <div className="iom-field">
                  <label className="iom-label">Investor Category <span>*</span></label>
                  <select className={`iom-input${showErrors && !investorType ? ' iom-input-error' : ''}`} value={investorType} onChange={e => setInvestorType(e.target.value)}>
                    <option value="">Select category…</option>
                    <option value="retail">Retail Investor</option>
                    <option value="hni">HNI (High Net Worth)</option>
                    <option value="institutional">Institutional Investor</option>
                    <option value="nri">NRI Investor</option>
                    <option value="family">Family Office</option>
                  </select>
                </div>
                <div className="iom-field">
                  <label className="iom-label">Investing Experience</label>
                  <select className="iom-select" value={experience} onChange={e => setExperience(e.target.value)}>
                    <option value="">Select…</option>
                    <option value="new">New to investing</option>
                    <option value="1-3">1–3 years</option>
                    <option value="3-7">3–7 years</option>
                    <option value="7+">7+ years</option>
                  </select>
                </div>
              </div>

              <div className="iom-row iom-row-1">
                <div className="iom-field">
                  <label className="iom-label">Risk Appetite <span>*</span></label>
                  <div className={`iom-pill-group${showErrors && !risk ? ' iom-input-error' : ''}`}>
                    {['conservative', 'moderate', 'aggressive', 'impact'].map((r, i) => (
                      <button key={r} className={`iom-pill${risk === r ? ' selected' : ''}`} onClick={() => setRisk(r)}>
                        {['Conservative', 'Moderate', 'Growth', 'Impact First'][i]}
                      </button>
                    ))}
                  </div>
                  <span className="iom-hint">This helps us surface the most relevant crop tokens for your portfolio</span>
                </div>
              </div>

              {error && <p className="iom-error-msg">{error}</p>}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="iom-step-panel active">
              <div className="iom-section-head">
                <div className="iom-section-icon">🔐</div>
                <div>
                  <div className="iom-section-title">KYC & Bank Details</div>
                  <div className="iom-section-sub">Verified within 24 hours · Required by SEBI AgriToken Framework</div>
                </div>
              </div>

              <div className="iom-row iom-row-2">
                <div className="iom-field">
                  <label className="iom-label">PAN Number <span>*</span></label>
                  <input className="iom-input" type="text" placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase' }} value={pan} onChange={e => setPan(e.target.value.toUpperCase())} />
                  <span className="iom-hint">Required for SEBI registration and tax reporting</span>
                </div>
                <div className="iom-field">
                  <label className="iom-label">Demat Account (optional)</label>
                  <input className="iom-input" type="text" placeholder="1234567890123456" value={demat} onChange={e => setDemat(e.target.value)} />
                  <span className="iom-hint">NSDL / CDSL · For token custody</span>
                </div>
              </div>

              <div className="iom-row iom-row-2">
                <div className="iom-field">
                  <label className="iom-label">Aadhaar / Identity Proof <span>*</span></label>
                  <div className="iom-upload">
                    <div className="iom-upload-icon">🪪</div>
                    <div className="iom-upload-label">Upload Aadhaar / Passport</div>
                    <div className="iom-upload-sub">PDF or JPG · Max 5 MB</div>
                    {aadhaarFile && <div className="iom-upload-filename">{aadhaarFile}</div>}
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setAadhaarFile(e.target.files[0]?.name || '')} />
                  </div>
                </div>
                <div className="iom-field">
                  <label className="iom-label">Address Proof</label>
                  <div className="iom-upload">
                    <div className="iom-upload-icon">🏠</div>
                    <div className="iom-upload-label">Upload Utility Bill / Bank Statement</div>
                    <div className="iom-upload-sub">PDF or JPG · Max 5 MB</div>
                    {addressFile && <div className="iom-upload-filename">{addressFile}</div>}
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setAddressFile(e.target.files[0]?.name || '')}   />
                  </div>
                </div>
              </div>

              <div className="iom-row iom-row-1">
                <div className="iom-field">
                  <label className="iom-label">UPI ID or Bank Account</label>
                  <input className="iom-input" type="text" placeholder="priya@upi  or  Account No + IFSC" value={upi} onChange={e => setUpi(e.target.value)} />
                  <span className="iom-hint">Used for profit distribution after harvest settlement · Zero charges</span>
                </div>
              </div>

              {error && <p className="iom-error-msg">{error}</p>}
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="iom-step-panel active">
              <div className="iom-section-head">
                <div className="iom-section-icon">🌱</div>
                <div>
                  <div className="iom-section-title">Your Investment Preferences</div>
                  <div className="iom-section-sub">We surface the best crops based on your interests — you always choose what to invest in</div>
                </div>
              </div>

              <div className="iom-row iom-row-1">
                <div className="iom-field">
                  <label className="iom-label">Preferred Crops</label>
                  <div className="iom-crop-grid">
                    {CROPS.map(c => (
                      <button key={c.key} className={`iom-crop-pill${selectedCrops.includes(c.key) ? ' selected' : ''}`} onClick={() => toggleCrop(c.key)}>
                        <span className="iom-crop-emoji">{c.emoji}</span>
                        <span className="iom-crop-name">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="iom-row iom-row-1">
                <div className="iom-field">
                  <label className="iom-label">Ticket Size per Investment</label>
                  <div className="iom-slider-wrap">
                    <div className="iom-slider-row">
                      <input className="iom-slider" type="range" min="500" max="500000" step="500" value={ticket} onChange={e => setTicket(Number(e.target.value))} />
                      <span className="iom-slider-val">₹{ticket.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="iom-slider-minmax">
                      <span>₹500</span>
                      <span>₹5,00,000</span>
                    </div>
                  </div>
                  <span className="iom-hint">Minimum ₹500 per crop token · Fractional ownership</span>
                </div>
              </div>

              <div className="iom-row iom-row-1">
                <div className="iom-field">
                  <label className="iom-label">Preferred Regions</label>
                  <div className="iom-region-group">
                    {REGIONS.map(r => (
                      <button key={r} className={`iom-region-pill${selectedRegions.includes(r) ? ' selected' : ''}`} onClick={() => toggleRegion(r)}>{r}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="iom-row iom-row-1">
                <div className="iom-field">
                  <label className="iom-label">Harvest Horizon</label>
                  <div className="iom-pill-group">
                    {[['short', 'Short (3–4 months)'], ['medium', 'Medium (5–7 months)'], ['long', 'Long (8–12 months)'], ['any', 'Any horizon']].map(([key, label]) => (
                      <button key={key} className={`iom-pill${horizon === key ? ' selected' : ''}`} onClick={() => setHorizon(key)}>{label}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Portfolio Preview */}
              <div className="iom-portfolio-preview">
                <div className="iom-pp-header">
                  <div>
                    <div className="iom-pp-investor-name">{name || '—'}</div>
                    <div className="iom-pp-category">{investorType || '—'}</div>
                  </div>
                  <span className="iom-pp-badge">Pending Verification</span>
                </div>
                <div className="iom-pp-grid">
                  <div>
                    <span className="iom-pp-stat-val">₹{ticket.toLocaleString('en-IN')}</span>
                    <span className="iom-pp-stat-key">Ticket Size</span>
                  </div>
                  <div>
                    <span className="iom-pp-stat-val">{horizon || '—'}</span>
                    <span className="iom-pp-stat-key">Horizon</span>
                  </div>
                  <div>
                    <span className="iom-pp-stat-val">18.5%</span>
                    <span className="iom-pp-stat-key">Target Return</span>
                  </div>
                </div>
                <div className="iom-crops-chosen">
                  {selectedCrops.map(k => {
                    const c = CROPS.find(x => x.key === k);
                    return c ? <span key={k}>{c.emoji} {c.name}</span> : null;
                  })}
                </div>
              </div>

              <div className="iom-row iom-row-1">
                <div className="iom-field">
                  <div className="iom-checkbox-group">
                    <div className="iom-checkbox-label" onClick={() => setAgreeTerms(v => !v)}>
                        <span className="iom-checkbox-box" style={{ 
                          background: agreeTerms ? 'rgba(200, 134, 10, 0.15)' : 'transparent', 
                          borderColor: agreeTerms ? 'var(--harvest)' : undefined,
                          color: 'var(--harvest)'}}>
                          {agreeTerms ? '✓' : ''}
                        </span>
                        I understand that crop token investments carry agricultural risk, and returns depend on harvest outcomes settled via smart contract.
                      </div>
                      <div className="iom-checkbox-label" onClick={() => setAgreeSebi(v => !v)}>
                        <span className="iom-checkbox-box" style={{ 
                          background: agreeSebi ? 'rgba(200, 134, 10, 0.15)' : 'transparent', 
                          borderColor: agreeSebi ? 'var(--harvest)' : undefined,
                          color: 'var(--harvest)' }}>
                          {agreeSebi ? '✓' : ''}
                        </span>
                      I confirm I meet the eligibility criteria under SEBI's AgriToken Framework and consent to BSE verifying my KYC documents.
                    </div>
                  </div>
                </div>
              </div>

              {error && <p className="iom-error-msg">{error}</p>}
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="iom-step-panel active">
              <div className="iom-success">
                <div className="iom-success-orb">💰</div>
                <div className="iom-success-title">Account Activated</div>
                <div className="iom-success-sub">निवेशक खाता सक्रिय — Investor account is live</div>
                <p className="iom-success-body">
                  Your BSE investor profile is set up and pending KYC verification — usually done within 24 hours.
                  In the meantime, you can explore crop listings and add tokens to your watchlist.
                </p>
                <div className="iom-success-ref">{investorId}</div>
                <div className="iom-success-actions">
                  <button className="iom-success-browse" onClick={onClose}>Browse Markets →</button>
                  <button className="iom-success-portfolio" onClick={() => { onClose(); setPortfolioOpen(true); }}>My Portfolio</button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="iom-footer">
          <div className="iom-footer-left">
            <span>🔒</span>
            <span>256-bit encrypted · SEBI AgriToken Framework</span>
          </div>
          <div className="iom-footer-right">
            {step > 1 && step < 4 && (
              <button className="iom-btn-back" onClick={handleBack}>← Back</button>
            )}
            {step < 3 && (
              <button className="iom-btn-next" onClick={handleNext}>Continue <span className="iom-btn-next-arrow">→</span></button>
            )}
            {step === 3 && (
              <button className="iom-btn-submit" onClick={handleNext}>Activate Account 📊</button>
            )}
            {step === 4 && (
              <button className="iom-btn-done" onClick={onClose}>Close</button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
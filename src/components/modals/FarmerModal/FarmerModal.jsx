import { useState } from "react";
import { useAppContext } from "../../../context/AppContext";

const STEPS = [
  { num: 1, label: "Crop Details" },
  { num: 2, label: "Land & Docs" },
  { num: 3, label: "Token Preview" },
  { num: 4, label: "Submitted" },
];

const INITIAL_FORM = {
  farmerName: "", phone: "", state: "", district: "",
  cropType: "", harvestMonth: "", cropDesc: "",
  landArea: "", irrigation: "", capital: 50000,
  agreeTerms: false, agreeKyc: false, agreeData: false,
};

function formatCapital(val) {
  return "₹" + Number(val).toLocaleString("en-IN");
}

function getTokenCount(capital) {
  return Math.floor(capital / 500);
}

function getCropSymbol(cropType) {
  const map = { wheat: "WHT", rice: "BSM", cotton: "CTN", sugarcane: "SGC", maize: "MZE", soybean: "SOY", groundnut: "GND", turmeric: "TRM" };
  return (map[cropType] || "CRP") + "-25";
}

export default function FarmerModal() {
  const { farmerModal, setFarmerModal } = useAppContext();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [refCode] = useState("BSE-" + Math.floor(100000 + Math.random() * 900000));

  if (!farmerModal) return null;

  function handleClose() {
    setFarmerModal(false);
    setTimeout(() => { setStep(1); setForm(INITIAL_FORM); setErrors({}); }, 300);
  }

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function validateStep1() {
    if (!form.farmerName.trim() || !form.phone.trim() || !form.state || !form.cropType) {
      setErrors({ step1: true });
      return false;
    }
    setErrors({});
    return true;
  }

  function validateStep2() {
    if (!form.landArea || parseFloat(form.landArea) < 0.5) {
      setErrors({ step2: true });
      return false;
    }
    setErrors({});
    return true;
  }

  function handleNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  }

  function handleBack() {
    if (step > 1) setStep(s => s - 1);
  }

  const tokenCount = getTokenCount(form.capital);
  const cropSymbol = getCropSymbol(form.cropType);

  return (
          <div
        id="farmer-modal-backdrop"
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
      <div className="fom-shell">

        {/* Close */}
        <button className="fom-close" onClick={handleClose} aria-label="Close">✕</button>

        {/* Header */}
        <div className="fom-header">
          <p className="fom-eyebrow">Farmer Registration · बीज</p>
          <h2 className="fom-title">List your crop.<br /><em>Raise capital. Keep dignity.</em></h2>
        </div>

        {/* Step progress */}
        <div className="fom-progress">
          <div className="fom-steps-row">
            {STEPS.map(s => (
              <div key={s.num} className={`fom-step-node${step >= s.num ? " active" : ""}`}>
                <div className="fom-step-circle">{step > s.num ? "✓" : s.num}</div>
                <span className="fom-step-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="fom-body">

          {/* STEP 1: Crop Details */}
          <div className={`fom-step-panel${step === 1 ? " active" : ""}`}>
            <div className="fom-section-head">
              <div className="fom-section-icon">🌾</div>
              <div className="fom-section-info">
                <div className="fom-section-title">Your Crop & Contact</div>
                <div className="fom-section-sub">Basic information to get your listing started</div>
              </div>
            </div>

            <div className="fom-row fom-row-2">
              <div className="fom-field">
                <label className="fom-label" htmlFor="fom-farmer-name">Full Name <span>*</span></label>
                <input className="fom-input" id="fom-farmer-name" type="text" placeholder="Ramesh Kumar Singh" autoComplete="name" value={form.farmerName} onChange={e => set("farmerName", e.target.value)} />
              </div>
              <div className="fom-field">
                <label className="fom-label" htmlFor="fom-phone">Mobile Number <span>*</span></label>
                <input className="fom-input" id="fom-phone" type="tel" placeholder="+91 98765 43210" autoComplete="tel" value={form.phone} onChange={e => set("phone", e.target.value)} />
              </div>
            </div>

            <div className="fom-row fom-row-2">
              <div className="fom-field">
                <label className="fom-label" htmlFor="fom-state">State <span>*</span></label>
                <select className="fom-select" id="fom-state" value={form.state} onChange={e => set("state", e.target.value)}>
                  <option value="">Select state…</option>
                  {["Punjab","Haryana","Uttar Pradesh","Madhya Pradesh","Rajasthan","Maharashtra","Gujarat","Karnataka","Andhra Pradesh","Telangana","Tamil Nadu","West Bengal","Bihar","Odisha","Chhattisgarh"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="fom-field">
                <label className="fom-label" htmlFor="fom-district">District</label>
                <input className="fom-input" id="fom-district" type="text" placeholder="e.g. Ludhiana" value={form.district} onChange={e => set("district", e.target.value)} />
              </div>
            </div>

            <div className="fom-row fom-row-2">
              <div className="fom-field">
                <label className="fom-label" htmlFor="fom-crop-type">Crop Type <span>*</span></label>
                <select className="fom-select" id="fom-crop-type" value={form.cropType} onChange={e => set("cropType", e.target.value)}>
                  <option value="">Select crop…</option>
                  <option value="wheat">Wheat (गेहूँ)</option>
                  <option value="rice">Basmati Rice (बासमती)</option>
                  <option value="cotton">Cotton (कपास)</option>
                  <option value="sugarcane">Sugarcane (गन्ना)</option>
                  <option value="maize">Maize (मक्का)</option>
                  <option value="soybean">Soybean (सोयाबीन)</option>
                  <option value="groundnut">Groundnut (मूंगफली)</option>
                  <option value="turmeric">Turmeric (हल्दी)</option>
                </select>
              </div>
              <div className="fom-field">
                <label className="fom-label" htmlFor="fom-harvest-month">Expected Harvest Month</label>
                <select className="fom-select" id="fom-harvest-month" value={form.harvestMonth} onChange={e => set("harvestMonth", e.target.value)}>
                  <option value="">Select month…</option>
                  {["Jul 2025","Aug 2025","Sep 2025","Oct 2025","Nov 2025","Dec 2025","Jan 2026","Feb 2026","Mar 2026","Apr 2026"].map(m => <option key={m} value={m}>{m.replace("2025","2025").replace("2026","2026")}</option>)}
                </select>
              </div>
            </div>

            <div className="fom-row fom-row-1">
              <div className="fom-field">
                <label className="fom-label" htmlFor="fom-crop-desc">Describe Your Crop (optional)</label>
                <textarea className="fom-textarea fom-input" id="fom-crop-desc" placeholder="e.g. Organically grown, drip-irrigated, third consecutive harvest on this plot…" value={form.cropDesc} onChange={e => set("cropDesc", e.target.value)} />
              </div>
            </div>

            {errors.step1 && <p className="fom-error-msg">Please fill in all required fields before continuing.</p>}
          </div>

          {/* STEP 2: Land & Docs */}
          <div className={`fom-step-panel${step === 2 ? " active" : ""}`}>
            <div className="fom-section-head">
              <div className="fom-section-icon">📋</div>
              <div className="fom-section-info">
                <div className="fom-section-title">Land Verification & Capital Request</div>
                <div className="fom-section-sub">Documents are reviewed within 48 hours by our agronomist team</div>
              </div>
            </div>

            <div className="fom-row fom-row-2">
              <div className="fom-field">
                <label className="fom-label" htmlFor="fom-land-area">Land Area (acres) <span>*</span></label>
                <input className="fom-input" id="fom-land-area" type="number" min="0.5" max="50" step="0.5" placeholder="e.g. 4.5" value={form.landArea} onChange={e => set("landArea", e.target.value)} />
                <span className="fom-hint">Minimum 0.5 acres to list on BSE</span>
              </div>
              <div className="fom-field">
                <label className="fom-label" htmlFor="fom-irrigation">Irrigation Source</label>
                <select className="fom-select" id="fom-irrigation" value={form.irrigation} onChange={e => set("irrigation", e.target.value)}>
                  <option value="">Select…</option>
                  <option>Canal / River</option>
                  <option>Borewell / Tubewell</option>
                  <option>Drip Irrigation</option>
                  <option>Rainwater (Barani)</option>
                  <option>Tank / Pond</option>
                </select>
              </div>
            </div>

            <div className="fom-row fom-row-1">
              <div className="fom-field">
                <label className="fom-label">Capital Required</label>
                <div className="fom-slider-wrap">
                  <div className="fom-slider-row">
                    <input className="fom-slider" type="range" min="10000" max="500000" step="5000" value={form.capital} onChange={e => set("capital", Number(e.target.value))} />
                    <span className="fom-slider-val">{formatCapital(form.capital)}</span>
                  </div>
                  <div className="fom-slider-minmax">
                    <span>₹10,000</span>
                    <span>₹5,00,000</span>
                  </div>
                </div>
                <span className="fom-hint">Funds disbursed within 7 working days of approval · Zero interest</span>
              </div>
            </div>

            <div className="fom-row fom-row-2">
              <div className="fom-field">
                <label className="fom-label">Land Ownership Document</label>
                <div className="fom-upload">
                  <div className="fom-upload-icon">📄</div>
                  <div className="fom-upload-label">Upload Khatauni / 7/12</div>
                  <div className="fom-upload-sub">PDF or JPG · Max 5 MB</div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                </div>
              </div>
              <div className="fom-field">
                <label className="fom-label">Aadhaar / Farmer ID</label>
                <div className="fom-upload">
                  <div className="fom-upload-icon">🪪</div>
                  <div className="fom-upload-label">Upload Identity Proof</div>
                  <div className="fom-upload-sub">PDF or JPG · Max 5 MB</div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                </div>
              </div>
            </div>

            {errors.step2 && <p className="fom-error-msg">Please enter a valid land area to continue.</p>}
          </div>

          {/* STEP 3: Token Preview */}
          <div className={`fom-step-panel${step === 3 ? " active" : ""}`}>
            <div className="fom-section-head">
              <div className="fom-section-icon">🪙</div>
              <div className="fom-section-info">
                <div className="fom-section-title">Your Token Preview</div>
                <div className="fom-section-sub">How your crop will appear to investors on the BSE marketplace</div>
              </div>
            </div>

            <div className="fom-token-preview">
              <div className="fom-tp-header">
                <div>
                  <div className="fom-tp-crop-name">{form.cropType ? form.cropType.charAt(0).toUpperCase() + form.cropType.slice(1) : "Crop"}</div>
                  <div className="fom-tp-crop-sub">{form.state ? `${form.state} · ` : ""}BSE Crop Token · Season 2025</div>
                </div>
                <div className="fom-tp-token-badge">
                  <span className="fom-tp-symbol">{cropSymbol}</span>
                  <span className="fom-tp-price">₹500 / token</span>
                </div>
              </div>
              <div className="fom-tp-grid">
                <div className="fom-tp-stat">
                  <span className="fom-tp-stat-val">{tokenCount || "—"}</span>
                  <span className="fom-tp-stat-key">Total Tokens</span>
                </div>
                <div className="fom-tp-stat">
                  <span className="fom-tp-stat-val">{formatCapital(form.capital)}</span>
                  <span className="fom-tp-stat-key">Capital Raised</span>
                </div>
                <div className="fom-tp-stat">
                  <span className="fom-tp-stat-val">{form.landArea ? `${(form.landArea * 45).toFixed(0)} Q` : "—"}</span>
                  <span className="fom-tp-stat-key">Est. Yield</span>
                </div>
                <div className="fom-tp-stat">
                  <span className="fom-tp-stat-val">18.5%</span>
                  <span className="fom-tp-stat-key">Investor Return</span>
                </div>
                <div className="fom-tp-stat">
                  <span className="fom-tp-stat-val">{form.harvestMonth || "—"}</span>
                  <span className="fom-tp-stat-key">Harvest Month</span>
                </div>
                <div className="fom-tp-stat">
                  <span className="fom-tp-stat-val">Smart Contract</span>
                  <span className="fom-tp-stat-key">Settlement</span>
                </div>
              </div>
            </div>

            <div className="fom-row fom-row-1">
              <div className="fom-field">
                <div className="fom-checkbox-group">
                  {[
                    { field: "agreeTerms", text: "I understand that token prices reflect my capital requirement, and investor returns are paid post-harvest via smart contract settlement." },
                    { field: "agreeKyc", text: "I agree to complete the BSE KYC process within 5 days of approval, as required by SEBI's AgriToken framework." },
                    { field: "agreeData", text: "I consent to sharing my land and crop data with verified investors on the BSE platform for the purpose of this listing." },
                  ].map(({ field, text }) => (
                    <label key={field} className="fom-checkbox-label">
                      <input type="checkbox" checked={form[field]} onChange={e => set(field, e.target.checked)} />
                      <span className="fom-checkbox-box">✓</span>
                      {text}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: Success */}
          <div className={`fom-step-panel${step === 4 ? " active" : ""}`}>
            <div className="fom-success">
              <div className="fom-success-orb">🌱</div>
              <div className="fom-success-title">Application Submitted</div>
              <div className="fom-success-sub">बीज बोया गया — The seed is sown</div>
              <p className="fom-success-body">
                Our agronomist team will review your listing and reach out within 48 hours.
                Once approved, your crop tokens go live on the BSE marketplace —
                and capital flows to your account within 7 working days.
              </p>
              <div className="fom-success-ref">Application ID: {refCode}</div>
            </div>
          </div>

        </div>{/* /fom-body */}

        {/* Footer */}
        <div className="fom-footer">
          <div className="fom-footer-left">
            <span>🔒</span>
            <span>256-bit encrypted · SEBI AgriToken Framework</span>
          </div>
          <div className="fom-footer-right">
            {step < 4 && (
              <button className="fom-btn-back" onClick={handleBack} disabled={step === 1}>← Back</button>
            )}
            {step < 3 && (
              <button className="fom-btn-next" onClick={handleNext}>Continue <span className="fom-btn-next-arrow">→</span></button>
            )}
            {step === 3 && (
              <button
                className="fom-btn-submit"
                onClick={handleNext}
                disabled={!form.agreeTerms || !form.agreeKyc || !form.agreeData}
              >
                Submit Application 🌾
              </button>
            )}
            {step === 4 && (
              <button className="fom-btn-done" onClick={handleClose}>Close</button>
            )}
          </div>
        </div>

      </div>{/* /fom-shell */}
    </div>
  );
}
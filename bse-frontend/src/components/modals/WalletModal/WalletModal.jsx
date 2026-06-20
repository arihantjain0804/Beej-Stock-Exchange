import { useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { authApi } from "../../../api/index";
import './WalletModal.css';

const WALLETS = [
  { id: "MetaMask",        emoji: "🦊", name: "MetaMask",          desc: "Browser extension · EVM compatible",  tag: "Popular", tagClass: "wm-tag-pop",    bg: "rgba(245,130,32,0.12)" },
  { id: "WalletConnect",   emoji: "🔗", name: "WalletConnect",     desc: "Scan QR · Any mobile wallet",         tag: "Secure",  tagClass: "wm-tag-secure", bg: "rgba(59,153,252,0.1)"  },
  { id: "Coinbase Wallet", emoji: "🔵", name: "Coinbase Wallet",   desc: "Self-custody · Mobile & extension",   tag: "Secure",  tagClass: "wm-tag-secure", bg: "rgba(0,82,255,0.08)"   },
  { id: "BSE Wallet",      emoji: "🌾", name: "BSE Native Wallet", desc: "Built-in · No extension needed",      tag: "New",     tagClass: "wm-tag-new",    bg: "rgba(58,92,42,0.2)"    },
];

export default function WalletModal() {
  const {
    walletOpen, setWalletOpen,
    setPortfolioOpen, handleConnect, setInvestorModal,
  } = useAppContext();

  // panels: "choose" | "otp" | "connecting" | "connected"
  const [panel, setPanel]                   = useState("choose");
  const [activeWallet, setActiveWallet]     = useState(WALLETS[0]);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [copied, setCopied]                 = useState(false);

  // OTP flow state
  const [phone, setPhone]       = useState("");
  const [otp, setOtp]           = useState("");
  const [otpSent, setOtpSent]   = useState(false);
  const [devOtp, setDevOtp]     = useState("");   // shown in dev mode
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  if (!walletOpen) return null;

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleClose() {
    setWalletOpen(false);
    setTimeout(() => {
      setPanel("choose");
      setPhone(""); setOtp(""); setOtpSent(false);
      setDevOtp(""); setOtpError("");
    }, 300);
  }

  function handleWalletClick(wallet) {
    setActiveWallet(wallet);
    setPanel("connecting");
    setTimeout(() => {
      const addr = "0x3f4a…8c2d";
      setConnectedAddress(addr);
      setPanel("connected");
      handleConnect(wallet.name, addr);
    }, 2200);
  }

  async function handleSendOtp() {
    const cleaned = phone.trim();
    if (!cleaned) return;
    // Auto-prefix +91 if not present
    const formatted = cleaned.startsWith('+') ? cleaned : `+91${cleaned}`;
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await authApi.sendOTP(formatted);
      setPhone(formatted);
      setOtpSent(true);
      // Show dev OTP if backend returns it (Twilio not wired)
      if (res.data?._dev_otp) setDevOtp(res.data._dev_otp);
    } catch (err) {
      setOtpError(err.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otp.trim()) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await authApi.verifyOTP(phone, otp.trim());
      const { user, tokens } = res.data;
      setConnectedAddress(user.phone);
      setPanel("connected");
      handleConnect("BSE Phone Auth", user.phone, { user, tokens });
    } catch (err) {
      setOtpError(err.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(connectedAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDisconnect() {
    setPanel("choose");
    setPhone(""); setOtp(""); setOtpSent(false); setDevOtp(""); setOtpError("");
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      id="wallet-modal-backdrop"
      className="wallet-modal-backdrop open"
      onClick={e => e.target === e.currentTarget && handleClose()}
    >
      <div className="wm-shell" role="dialog" aria-modal="true" aria-label="Connect Wallet">

        {/* ── PANEL 1: Choose Method ── */}
        <div className={`wm-panel${panel === "choose" ? " active" : ""}`}>
          <div className="wm-header">
            <div>
              <p className="wm-eyebrow">BSE · Connect</p>
              <h2 className="wm-title">Sign in or connect<br />your wallet</h2>
            </div>
            <button className="wm-close" onClick={handleClose}>✕</button>
          </div>

          <div className="wm-body">
            {/* Phone OTP */}
            <p className="wm-section-label">Sign in with Phone (OTP)</p>
            <div className="wm-upi-row">
              <input
                className="wm-upi-input"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendOtp()}
              />
              <button
                className="wm-upi-verify"
                onClick={handleSendOtp}
                disabled={otpLoading}
              >
                {otpLoading ? "…" : "Send OTP →"}
              </button>
            </div>
            {otpError && (
              <p style={{ color: '#e05', fontSize: '0.75rem', marginTop: '4px', paddingLeft: '2px' }}>
                {otpError}
              </p>
            )}
            {otpSent && (
              <div style={{ marginTop: '10px' }}>
                <div className="wm-upi-row">
                  <input
                    className="wm-upi-input"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
                    autoFocus
                  />
                  <button
                    className="wm-upi-verify"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading}
                  >
                    {otpLoading ? "…" : "Verify →"}
                  </button>
                </div>
                {devOtp && (
                  <p style={{ color: 'var(--harvest)', fontSize: '0.8rem', marginTop: '8px', paddingLeft: '2px' }}>
                    DEV MODE — Your OTP is: <strong>{devOtp}</strong>
                  </p>
                )}
              </div>
            )}

            <div className="wm-divider">
              <div className="wm-divider-line"></div>
              <span className="wm-divider-text">or connect wallet</span>
              <div className="wm-divider-line"></div>
            </div>

            {/* Wallet options */}
            <p className="wm-section-label">Web3 Wallets</p>
            <div className="wm-options">
              {WALLETS.map(w => (
                <div
                  key={w.id}
                  className="wm-option"
                  onClick={() => handleWalletClick(w)}
                >
                  <div className="wm-option-logo" style={{ background: w.bg }}>{w.emoji}</div>
                  <div className="wm-option-info">
                    <span className="wm-option-name">{w.name}</span>
                    <span className="wm-option-desc">{w.desc}</span>
                  </div>
                  <span className={`wm-option-tag ${w.tagClass}`}>{w.tag}</span>
                  <span className="wm-option-arrow">→</span>
                </div>
              ))}
            </div>

            <div className="wm-trust">
              <div className="wm-trust-dot"></div>
              <span>Non-custodial · BSE never holds your keys</span>
              <div className="wm-trust-dot"></div>
              <span>SEBI AgriToken Framework</span>
            </div>
          </div>
        </div>

        {/* ── PANEL 2: Connecting ── */}
        <div className={`wm-panel${panel === "connecting" ? " active" : ""}`}>
          <div className="wm-connecting">
            <div className="wm-connecting-orb">{activeWallet.emoji}</div>
            <p className="wm-connecting-name">{activeWallet.name}</p>
            <p className="wm-connecting-status">Waiting for confirmation…</p>
            <div className="wm-progress-dots">
              <div className="wm-dot"></div>
              <div className="wm-dot"></div>
              <div className="wm-dot"></div>
            </div>
          </div>
        </div>

        {/* ── PANEL 3: Connected ── */}
        <div className={`wm-panel${panel === "connected" ? " active" : ""}`}>
          <div className="wm-success">
            <div className="wm-success-check">✓</div>
            <div className="wm-success-title">Connected</div>
            <div className="wm-success-sub">via {activeWallet.name}</div>
            <div className="wm-address-box">
              <span className="wm-address-text">{connectedAddress}</span>
              <button className="wm-address-copy" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="wm-success-actions">
              <button
                className="wm-btn-browse"
                onClick={() => { setPortfolioOpen(true); handleClose(); }}
              >
                My Portfolio →
              </button>
              <button
                className="wm-btn-disconnect"
                style={{ borderColor: "rgba(200,134,10,0.35)", color: "var(--sky)" }}
                onClick={() => { handleClose(); setInvestorModal(true); }}
              >
                Investor Profile →
              </button>
              <button
                className="wm-btn-disconnect"
                style={{ borderColor: "var(--glass-border)", color: "var(--straw-dim)" }}
                onClick={() => {
                  handleClose();
                  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Browse Markets
              </button>
              <button className="wm-btn-disconnect" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
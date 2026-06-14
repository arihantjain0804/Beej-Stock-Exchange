import { useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import './WalletModal.css';

const WALLETS = [
  {
    id: "MetaMask",
    emoji: "🦊",
    name: "MetaMask",
    desc: "Browser extension · EVM compatible",
    tag: "Popular",
    tagClass: "wm-tag-pop",
    bg: "rgba(245,130,32,0.12)",
  },
  {
    id: "WalletConnect",
    emoji: "🔗",
    name: "WalletConnect",
    desc: "Scan QR · Any mobile wallet",
    tag: "Secure",
    tagClass: "wm-tag-secure",
    bg: "rgba(59,153,252,0.1)",
  },
  {
    id: "Coinbase Wallet",
    emoji: "🔵",
    name: "Coinbase Wallet",
    desc: "Self-custody · Mobile & extension",
    tag: "Secure",
    tagClass: "wm-tag-secure",
    bg: "rgba(0,82,255,0.08)",
  },
  {
    id: "BSE Wallet",
    emoji: "🌾",
    name: "BSE Native Wallet",
    desc: "Built-in · No extension needed",
    tag: "New",
    tagClass: "wm-tag-new",
    bg: "rgba(58,92,42,0.2)",
  },
];

export default function WalletModal() {
  const { walletOpen, setWalletOpen, setPortfolioOpen, handleConnect } = useAppContext();

  const [panel, setPanel] = useState("choose"); // "choose" | "connecting" | "connected"
  const [activeWallet, setActiveWallet] = useState(WALLETS[0]);
  const [connectedAddress, setConnectedAddress] = useState("0x3f4a…8c2d");
  const [upiValue, setUpiValue] = useState("");
  const [copied, setCopied] = useState(false);

  if (!walletOpen) return null;

  function handleWalletClick(wallet) {
    setActiveWallet(wallet);
    setPanel("connecting");

    // Simulate connection delay
    setTimeout(() => {
      setConnectedAddress("0x3f4a…8c2d");
      setPanel("connected");
      handleConnect(activeWallet.name, "0x3f4a…8c2d");
    }, 2200);
  }

  function handleUpiVerify() {
    if (!upiValue.trim()) return;
    setActiveWallet({ id: "UPI", emoji: "💳", name: upiValue });
    setPanel("connecting");
    setTimeout(() => {
      setConnectedAddress(upiValue);
      setPanel("connected");
    }, 1800);
  }

  function handleCopy() {
    navigator.clipboard.writeText(connectedAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleClose() {
    setWalletOpen(false);
    setTimeout(() => setPanel("choose"), 300);
  }

  function handleDisconnect() {
    setPanel("choose");
    setUpiValue("");
  }

  return (
    <div id="wallet-modal-backdrop" className="wallet-modal-backdrop open" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="wm-shell">

        {/* ── PANEL 1: Choose Method ── */}
        <div className={`wm-panel${panel === "choose" ? " active" : ""}`} id="wm-panel-choose">
          <div className="wm-header">
            <div>
              <p className="wm-eyebrow">BSE · Connect</p>
              <h2 className="wm-title">Connect your<br />wallet or UPI</h2>
            </div>
            <button className="wm-close" onClick={handleClose}>✕</button>
          </div>

          <div className="wm-body">
            {/* UPI */}
            <p className="wm-section-label">Pay via UPI</p>
            <div className="wm-upi-row">
              <input
                className="wm-upi-input"
                id="wm-upi-input"
                type="text"
                placeholder="yourname@upi"
                autoComplete="off"
                spellCheck={false}
                value={upiValue}
                onChange={(e) => setUpiValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpiVerify()}
              />
              <button className="wm-upi-verify" onClick={handleUpiVerify}>Verify →</button>
            </div>

            <div className="wm-divider">
              <div className="wm-divider-line"></div>
              <span className="wm-divider-text">or connect wallet</span>
              <div className="wm-divider-line"></div>
            </div>

            {/* Wallet options */}
            <p className="wm-section-label">Web3 Wallets</p>
            <div className="wm-options">
              {WALLETS.map((w) => (
                <div
                  key={w.id}
                  className="wm-option"
                  data-wallet={w.id}
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
              <div className="wm-trust-dot"></div>
            </div>
          </div>
        </div>

        {/* ── PANEL 2: Connecting ── */}
        <div className={`wm-panel${panel === "connecting" ? " active" : ""}`} id="wm-panel-connecting">
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
        <div className={`wm-panel${panel === "connected" ? " active" : ""}`} id="wm-panel-success">
          <div className="wm-success">
            <div className="wm-success-check">✓</div>
            <div className="wm-success-title">Wallet Connected</div>
            <div className="wm-success-sub">via {activeWallet.name}</div>
            <div className="wm-address-box">
              <span className="wm-address-text">{connectedAddress}</span>
              <button className="wm-address-copy" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="wm-balance-row">
              <div className="wm-balance-item">
                <span className="wm-balance-val">₹0.00</span>
                <span className="wm-balance-key">INR Balance</span>
              </div>
              <div className="wm-balance-item">
                <span className="wm-balance-val">0 Tokens</span>
                <span className="wm-balance-key">BSE Holdings</span>
              </div>
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
                onClick={() => { handleClose(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Browse Markets
              </button>
              <button className="wm-btn-disconnect" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
          </div>
        </div>

      </div>{/* /wm-shell */}
    </div>/* /wallet-modal-backdrop */
  );
}
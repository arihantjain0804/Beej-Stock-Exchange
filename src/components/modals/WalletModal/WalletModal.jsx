import { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';

export default function WalletModal() {
  const { setWalletOpen, handleConnect } = useAppContext();
  const [panel, setPanel] = useState('choose');
  const [connecting, setConnecting] = useState('');
  const [addr] = useState('0x3f4a…8c2d');

  const onClose = () => setWalletOpen(false);

  const handleWalletOption = (name) => {
    setConnecting(name);
    setPanel('connecting');
    setTimeout(() => {
      setPanel('success');
      handleConnect(name, addr);
    }, 2000);
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wm-shell">

        {panel === 'choose' && (
          <>
            <div className="wm-header">
              <div>
                <p className="wm-eyebrow">BSE · Connect</p>
                <h2 className="wm-title">Connect your<br />wallet or UPI</h2>
              </div>
              <button className="wm-close" onClick={onClose}>✕</button>
            </div>
            <div className="wm-body">
              <p className="wm-section-label">Pay via UPI</p>
              <div className="wm-upi-row">
                <input className="wm-upi-input" type="text" placeholder="yourname@upi" />
                <button className="wm-upi-verify" onClick={() => handleWalletOption('UPI')}>Verify →</button>
              </div>
              <div className="wm-divider">
                <div className="wm-divider-line"></div>
                <span className="wm-divider-text">or connect wallet</span>
                <div className="wm-divider-line"></div>
              </div>
              <p className="wm-section-label">Web3 Wallets</p>
              <div className="wm-options">
                {[
                  ['MetaMask',     '🦊', 'rgba(245,130,32,0.12)', 'Popular',  'wm-tag-pop'],
                  ['WalletConnect','🔗', 'rgba(59,153,252,0.1)',  'Secure',   'wm-tag-secure'],
                  ['BSE Wallet',   '🌾', 'rgba(58,92,42,0.2)',    'New',      'wm-tag-new'],
                ].map(([name, emoji, bg, tag, tagCls]) => (
                  <div key={name} className="wm-option" onClick={() => handleWalletOption(name)}>
                    <div className="wm-option-logo" style={{ background: bg }}>{emoji}</div>
                    <div className="wm-option-info">
                      <span className="wm-option-name">{name}</span>
                      <span className="wm-option-desc">Click to connect</span>
                    </div>
                    <span className={`wm-option-tag ${tagCls}`}>{tag}</span>
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
          </>
        )}

        {panel === 'connecting' && (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>
              {connecting === 'MetaMask' ? '🦊' : connecting === 'WalletConnect' ? '🔗' : connecting === 'BSE Wallet' ? '🌾' : '💳'}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem', color: 'var(--grain)' }}>
              Connecting to {connecting}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.55rem', color: 'var(--straw-dim)', opacity: 0.5 }}>
              Waiting for confirmation…
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--harvest)', opacity: 0.4, animation: 'pulse 1.2s ease infinite', animationDelay: `${i * 0.2}s` }}></div>
              ))}
            </div>
          </div>
        )}

        {panel === 'success' && (
          <div className="wm-success">
            <div className="wm-success-check">✓</div>
            <div className="wm-success-title">Wallet Connected</div>
            <div className="wm-success-sub">via {connecting}</div>
            <div className="wm-address-box">
              <span className="wm-address-text">{addr}</span>
              <button className="wm-address-copy">Copy</button>
            </div>
            <div className="wm-success-actions">
              <button className="wm-btn-browse" onClick={onClose}>Browse Markets →</button>
              <button className="wm-btn-disconnect" onClick={onClose}>Close</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
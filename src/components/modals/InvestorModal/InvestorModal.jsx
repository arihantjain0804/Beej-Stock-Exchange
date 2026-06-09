import { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';

export default function InvestorModal() {
  const { setInvestorModal } = useAppContext();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [risk, setRisk] = useState('');
  const onClose = () => setInvestorModal(false);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#0a0804', border: '1px solid var(--glass-border)', maxWidth: '580px', width: '100%', maxHeight: '85vh', overflow: 'auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(to right,transparent,var(--harvest),transparent)' }}></div>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.5rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--harvest)', opacity: 0.65, marginBottom: '0.35rem' }}>Investor Registration · बीज</p>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 300, color: 'var(--grain)', lineHeight: 1.2 }}>Grow your capital.<br /><em style={{ color: 'var(--sky)' }}>From seed to return.</em></h2>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--straw-dim)', fontSize: '1.1rem', cursor: 'pointer' }} onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '2rem' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--harvest)', opacity: 0.65 }}>Step 1 — Your Profile</p>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--straw-dim)', opacity: 0.5, marginBottom: '0.5rem' }}>Full Name</div>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Priya Sharma"
                  style={{ width: '100%', background: 'rgba(200,134,10,0.04)', border: '1px solid var(--glass-border-dim)', color: 'var(--grain)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', padding: '0.7rem 0.9rem', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--straw-dim)', opacity: 0.5, marginBottom: '0.6rem' }}>Risk Appetite</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['Conservative', 'Moderate', 'Growth', 'Impact First'].map(r => (
                    <button key={r} onClick={() => setRisk(r)}
                      style={{ background: risk === r ? 'rgba(200,134,10,0.15)' : 'none', border: `1px solid ${risk === r ? 'var(--harvest)' : 'var(--glass-border-dim)'}`, color: risk === r ? 'var(--harvest)' : 'var(--straw-dim)', padding: '0.45rem 0.9rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.58rem', letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setStep(2)} style={{ background: 'linear-gradient(135deg,var(--harvest),var(--ember))', border: 'none', color: 'var(--soil)', padding: '0.9rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', marginTop: '0.5rem' }}>Activate Account →</button>
            </div>
          )}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '3rem' }}>💰</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 300, color: 'var(--grain)' }}>Account Activated</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: 'var(--harvest)', opacity: 0.7 }}>निवेशक खाता सक्रिय — Investor account is live</div>
              <p style={{ fontSize: '0.95rem', color: 'var(--straw-dim)', lineHeight: 1.9, fontStyle: 'italic', maxWidth: '420px' }}>Your BSE investor profile is set up and pending KYC verification — usually done within 24 hours. Browse crop listings in the meantime.</p>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: 'var(--straw-dim)', opacity: 0.45, border: '1px solid var(--glass-border-dim)', padding: '0.5rem 1.5rem' }}>Investor ID: BSE-INV-{Math.floor(Math.random() * 900000 + 100000)}</div>
              <button onClick={onClose} style={{ background: 'linear-gradient(135deg,var(--harvest),var(--ember))', border: 'none', color: 'var(--soil)', padding: '0.75rem 2.5rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>Browse Markets →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
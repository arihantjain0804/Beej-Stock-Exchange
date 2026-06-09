import { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';

export default function FarmerModal() {
  const { setFarmerModal } = useAppContext();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const onClose = () => setFarmerModal(false);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#0a0804', border: '1px solid var(--glass-border)', maxWidth: '620px', width: '100%', maxHeight: '85vh', overflow: 'auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(to right,transparent,var(--harvest),transparent)' }}></div>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.5rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--harvest)', opacity: 0.65, marginBottom: '0.35rem' }}>Farmer Registration · बीज</p>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 300, color: 'var(--grain)', lineHeight: 1.2 }}>List your crop.<br /><em style={{ color: 'var(--sky)' }}>Capital in 7 days.</em></h2>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--straw-dim)', fontSize: '1.1rem', cursor: 'pointer' }} onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '2rem' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--harvest)', opacity: 0.65 }}>Step 1 — Your Details</p>
              {[['Full Name', 'text', name, setName, 'Ramesh Kumar'], ['State / District', 'text', state, setState, 'Punjab, Ludhiana']].map(([label, type, val, setter, ph]) => (
                <div key={label}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--straw-dim)', opacity: 0.5, marginBottom: '0.5rem' }}>{label}</div>
                  <input type={type} value={val} onChange={e => setter(e.target.value)} placeholder={ph}
                    style={{ width: '100%', background: 'rgba(200,134,10,0.04)', border: '1px solid var(--glass-border-dim)', color: 'var(--grain)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', padding: '0.7rem 0.9rem', outline: 'none' }} />
                </div>
              ))}
              <button onClick={() => setStep(2)} style={{ background: 'linear-gradient(135deg,var(--harvest),var(--ember))', border: 'none', color: 'var(--soil)', padding: '0.9rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', marginTop: '0.5rem' }}>Continue →</button>
            </div>
          )}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '3rem' }}>🌱</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 300, color: 'var(--grain)' }}>Application Submitted</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: 'var(--harvest)', opacity: 0.7 }}>बीज बोया गया — The seed is sown</div>
              <p style={{ fontSize: '0.95rem', color: 'var(--straw-dim)', lineHeight: 1.9, fontStyle: 'italic', maxWidth: '420px' }}>Our agronomist team will review your listing and reach out within 48 hours. Once approved, capital flows to your account within 7 working days.</p>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.6rem', color: 'var(--straw-dim)', opacity: 0.45, border: '1px solid var(--glass-border-dim)', padding: '0.5rem 1.5rem' }}>Application ID: BSE-{Math.floor(Math.random() * 900000 + 100000)}</div>
              <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'var(--straw-dim)', padding: '0.75rem 2.5rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
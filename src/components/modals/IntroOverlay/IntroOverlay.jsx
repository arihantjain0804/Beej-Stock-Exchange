import { useState, useRef } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useHandTracking } from '../../../hooks/useHandTracking';
import './IntroOverlay.css';
// ─── IntroOverlay (v24) ───────────────────────────────────────────────────────
// Shows on first load. User can enter with mouse or enable hand tracking
// via MediaPipe before entering the exchange.

export default function IntroOverlay() {
  const { setEntered } = useAppContext();
  const [handBtnText, setHandBtnText] = useState('USE HAND TRACKING');
  const [handBtnDisabled, setHandBtnDisabled] = useState(false);
  const cursorRef = useRef(null);
  const { startHandTracking } = useHandTracking(cursorRef);

  const handleMouse = () => setEntered(true);

  const handleHand = async () => {
    setHandBtnDisabled(true);
    setHandBtnText('LOADING MODEL...');
    await startHandTracking(
      // onLoad — tracking started, dismiss overlay
      () => setEntered(true),
      // onError — fall back to mouse
      () => {
        setHandBtnText('USE HAND TRACKING');
        setHandBtnDisabled(false);
        setEntered(true);
      }
    );
  };

  return (
    <>
      {/* Custom hand cursor — always in DOM so tracking can move it */}
      <div id="hand-cursor" ref={cursorRef}>
        <div className="hc-dot"></div>
        <div className="hc-ring"></div>
      </div>

      {/* Overlay */}
      <div className="intro-overlay">
        <div className="intro-box">
          <div className="intro-seed-icon">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="40" cy="38" rx="14" ry="20" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
              <path d="M40 18 L40 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M40 12 Q48 8 52 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
              <path d="M40 14 Q32 10 28 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
              <path d="M40 58 L40 70" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
              <path d="M40 64 Q32 68 30 74" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
              <path d="M40 66 Q48 70 50 74" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
              <circle cx="40" cy="6" r="2.5" fill="currentColor" opacity="0.9" />
            </svg>
          </div>

          <p className="intro-hindi">बीज स्टॉक एक्सचेंज</p>
          <h1 className="intro-title">BEEJ</h1>
          <p className="intro-desc">
            Where seeds become stocks,<br />and harvests become returns.
          </p>
          <p className="intro-hand-note">
            Choose hand tracking to navigate with your index finger.<br />
            Make a fist to click. Mouse to scroll edges.
          </p>

          <div className="intro-btns">
            <button className="btn-enter-mouse" onClick={handleMouse}>
              ENTER WITH MOUSE
            </button>
            <button
              className="btn-enter-hand"
              onClick={handleHand}
              disabled={handBtnDisabled}
            >
              {handBtnText}
            </button>
          </div>

          <p className="intro-privacy">
            All hand tracking is processed locally. No video data leaves your device.
          </p>
        </div>
      </div>
    </>
  );
}
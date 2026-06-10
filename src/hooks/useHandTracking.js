import { useRef, useCallback } from 'react';

// ─── One Euro Filter (smooths jittery hand landmark positions) ────────────────
class LowPassFilter {
  constructor(alpha = 0.5) { this.y = null; this.alpha = alpha; }
  filter(x, alpha = this.alpha) {
    if (this.y === null) { this.y = x; return x; }
    this.y = alpha * x + (1 - alpha) * this.y;
    return this.y;
  }
  last() { return this.y ?? 0.5; }
  reset(v = 0.5) { this.y = v; }
}

class OneEuroFilter {
  constructor(minCutoff = 0.4, beta = 0.002, dCutoff = 1.0) {
    this.minCutoff = minCutoff; this.beta = beta; this.dCutoff = dCutoff;
    this.xF = new LowPassFilter(); this.dxF = new LowPassFilter();
    this.lastT = -1;
  }
  filter(v, t) {
    if (this.lastT < 0) { this.lastT = t; this.xF.reset(v); return v; }
    const te = Math.max(t - this.lastT, 0.001);
    this.lastT = t;
    const dx = (v - this.xF.last()) / te;
    const sf = (c) => 1 / (1 + (1 / (2 * Math.PI * c * te)));
    const edx = this.dxF.filter(dx, sf(this.dCutoff));
    return this.xF.filter(v, sf(this.minCutoff + this.beta * Math.abs(edx)));
  }
  reset(v = 0.5) { this.xF.reset(v); this.dxF.reset(0); this.lastT = -1; }
}

// ─── useHandTracking Hook ─────────────────────────────────────────────────────
// Loads MediaPipe HandLandmarker, tracks the index fingertip,
// moves the custom hand cursor div, and fires click events on fist gestures.
//
// Returns: { startHandTracking, stopHandTracking, isTracking }
export function useHandTracking(cursorRef) {
  const state = useRef({
    handLandmarker: null,
    videoEl: null,
    stream: null,
    rafId: 0,
    isTracking: false,
    gazeX: 0.5,
    gazeY: 0.5,
    isFist: false,
    wasFist: false,
    lastFistClick: 0,
    fxFilter: new OneEuroFilter(0.4, 0.002),
    fyFilter: new OneEuroFilter(0.4, 0.002),
  });

  const RAW_MIN = 0.30, RAW_MAX = 0.70, COOLDOWN = 500;
  const remap = (v) => Math.max(0, Math.min(1, (v - RAW_MIN) / (RAW_MAX - RAW_MIN)));

  const updateCursor = useCallback(() => {
    const s = state.current;
    const el = cursorRef.current;
    if (!el || !s.isTracking) return;
    el.style.left = (s.gazeX * 100) + 'vw';
    el.style.top = (s.gazeY * 100) + 'vh';
    el.dataset.fist = s.isFist ? 'true' : 'false';
  }, [cursorRef]);

  const fireFistClick = useCallback(() => {
    const s = state.current;
    const x = s.gazeX * window.innerWidth;
    const y = s.gazeY * window.innerHeight;
    const el = document.elementFromPoint(x, y);
    if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y, view: window }));
  }, []);

  const handleGaze = useCallback((raw) => {
    const s = state.current;
    const now = performance.now() / 1000;
    s.gazeX = s.fxFilter.filter(raw.x, now);
    s.gazeY = s.fyFilter.filter(raw.y, now);
    s.isFist = raw.isFist;
    const nowMs = performance.now();
    if (s.isFist && !s.wasFist && nowMs - s.lastFistClick > COOLDOWN) {
      s.lastFistClick = nowMs;
      fireFistClick();
    }
    s.wasFist = s.isFist;
    updateCursor();
  }, [fireFistClick, updateCursor]);

  const startHandTracking = useCallback(async (onLoad, onError) => {
    const s = state.current;
    try {
      // Dynamically load MediaPipe
      if (!window.HandLandmarker) {
        await new Promise((res, rej) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.js';
          script.crossOrigin = 'anonymous';
          script.onload = res;
          script.onerror = rej;
          setTimeout(rej, 20000);
          document.head.appendChild(script);
        });
      }

      const { HandLandmarker, FilesetResolver } = window.vision ?? window;
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      s.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
      });

      s.stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
      s.videoEl = document.createElement('video');
      s.videoEl.srcObject = s.stream;
      s.videoEl.setAttribute('playsinline', '');
      s.videoEl.style.display = 'none';
      document.body.appendChild(s.videoEl);
      await s.videoEl.play();

      s.isTracking = true;
      document.body.classList.add('hand-tracking-active');
      if (cursorRef.current) cursorRef.current.classList.add('active');

      const DETECT_INTERVAL = 1000 / 30;
      let lastDetect = 0;

      function detect() {
        s.rafId = requestAnimationFrame(detect);
        const now = performance.now();
        if (now - lastDetect < DETECT_INTERVAL) return;
        lastDetect = now;
        if (!s.handLandmarker || !s.videoEl || s.videoEl.readyState < 2) return;
        const res = s.handLandmarker.detectForVideo(s.videoEl, now);
        if (res.landmarks && res.landmarks.length > 0) {
          const hand = res.landmarks[0];
          const tip = hand[8];
          const fist = hand[8].y > hand[5].y && hand[12].y > hand[9].y &&
                       hand[16].y > hand[13].y && hand[20].y > hand[17].y;
          handleGaze({ x: remap(1 - tip.x), y: remap(tip.y), isFist: fist });
        }
      }
      detect();
      if (onLoad) onLoad();

    } catch (err) {
      console.warn('Hand tracking failed, falling back to mouse:', err);
      if (onError) onError();
    }
  }, [cursorRef, handleGaze]);

  const stopHandTracking = useCallback(() => {
    const s = state.current;
    if (s.rafId) cancelAnimationFrame(s.rafId);
    if (s.stream) s.stream.getTracks().forEach(t => t.stop());
    if (s.videoEl) s.videoEl.remove();
    s.isTracking = false;
    s.handLandmarker = null;
    s.videoEl = null;
    s.stream = null;
    document.body.classList.remove('hand-tracking-active');
    if (cursorRef.current) cursorRef.current.classList.remove('active');
  }, [cursorRef]);

  return { startHandTracking, stopHandTracking };
}
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
    scrollDirection: null, // 'up' | 'down' | null — for cursor visual feedback
    // Tuned for less jitter at rest: lower minCutoff smooths harder when
    // the hand is nearly still (where jitter is most visible), and beta
    // raised to the standard value from the original One Euro Filter paper
    // for cursor-style tracking — it backs the smoothing off quickly once
    // real movement starts, so this doesn't trade jitter for lag.
    fxFilter: new OneEuroFilter(0.5, 0.007),
    fyFilter: new OneEuroFilter(0.5, 0.007),
  });

  // Trigger zone enlarged (was top/bottom 20%, now 30%) so scroll kicks in
  // without needing your finger right at the screen edge. Max speed raised
  // and the ramp curve softened from squared to ^1.5 — squared kept speed
  // near-zero until you were almost exactly at the edge, which read as
  // unresponsive/laggy even though it was technically "working."
  const DEAD_ZONE_TOP = 0.30, DEAD_ZONE_BOTTOM = 0.70, MAX_SCROLL_SPEED = 180;
  const SCROLL_CURVE = 1.5;

  const RAW_MIN = 0.22, RAW_MAX = 0.78, COOLDOWN = 500;
  const remap = (v) => Math.max(0, Math.min(1, (v - RAW_MIN) / (RAW_MAX - RAW_MIN)));

  const INTERACTIVE_SELECTOR = 'nav, .mobile-bottom-nav, button, a, [role="button"], input, select, textarea';
  const isOverInteractive = useCallback((px, py) => {
    const el = document.elementFromPoint(px, py);
    return !!(el && el.closest(INTERACTIVE_SELECTOR));
  }, []);

  const updateScroll = useCallback((gazeX, gazeY) => {
    const s = state.current;
    const container = document.scrollingElement || document.documentElement;

    if (isOverInteractive(gazeX * window.innerWidth, gazeY * window.innerHeight)) {
      s.scrollDirection = null;
      return;
    }

    let speed = 0;
    if (gazeY > DEAD_ZONE_BOTTOM) {
      const intensity = (gazeY - DEAD_ZONE_BOTTOM) / (1 - DEAD_ZONE_BOTTOM);
      speed = Math.pow(intensity, SCROLL_CURVE) * MAX_SCROLL_SPEED;
      s.scrollDirection = 'down';
    } else if (gazeY < DEAD_ZONE_TOP) {
      const intensity = (DEAD_ZONE_TOP - gazeY) / DEAD_ZONE_TOP;
      speed = -Math.pow(intensity, SCROLL_CURVE) * MAX_SCROLL_SPEED;
      s.scrollDirection = 'up';
    } else {
      s.scrollDirection = null;
    }

    if (Math.abs(speed) > 0.5) {
      container.scrollBy(0, speed);
    }
  }, [isOverInteractive]);

  const updateCursor = useCallback(() => {
    const s = state.current;
    const el = cursorRef.current;
    if (!el || !s.isTracking) return;
    el.style.left = (s.gazeX * 100) + 'vw';
    el.style.top = (s.gazeY * 100) + 'vh';
    el.dataset.fist = s.isFist ? 'true' : 'false';
    el.dataset.scroll = s.scrollDirection ?? '';
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
    updateScroll(s.gazeX, s.gazeY);
    updateCursor();
  }, [fireFistClick, updateScroll, updateCursor]);

  const startHandTracking = useCallback(async (onLoad, onError) => {
    const s = state.current;
    try {

      // Pinned to a known-working version. This was previously
      // `@mediapipe/tasks-vision@latest` — since jsdelivr resolves
      // `@latest` fresh on every page load, any new upstream release
      // (MediaPipe ships these frequently) can silently change behavior
      // or break entirely with zero commits on our side. That's almost
      // certainly why this "worked before and then stopped" with no
      // code change in between. Bump this deliberately, not automatically.
      // Verified against the npm registry (registry.npmjs.org) that this is
      // an actual published stable release, not a guess — the previous pin
      // (0.10.22) was never published as stable, only as an RC build
      // (0.10.22-rc.20250304), so jsdelivr had nothing to serve at that
      // exact version and the dynamic import 404'd outright.
      const MEDIAPIPE_VERSION = '1.0.1';
      // Verified against the actual published package contents: as of
      // 1.0.1, MediaPipe ships two separate bundle files —
      // vision_bundle.js (a plain IIFE script, assigns to a global `Vision`
      // object, has NO `export` statements) and vision_bundle.mjs (the real
      // ES module, has `export { FilesetResolver, HandLandmarker, ... }`).
      // Dynamic import() needs actual ESM exports to destructure from, so
      // it must be the .mjs file — .js silently resolves every named
      // import to undefined instead of throwing, which is why this failed
      // with "Cannot read properties of undefined" instead of a clearer error.
      const { HandLandmarker, FilesetResolver } = await import(
        /* @vite-ignore */ `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/vision_bundle.mjs`
      );
      const vision = await FilesetResolver.forVisionTasks(
        `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`
      );
      s.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          // Back to GPU. CPU was a defensive guess made earlier when the
          // failure was completely silent (no error visible at all) — it
          // was never actually confirmed to be the cause. The real bug
          // turned out to be the version pin and bundle file, both fixed
          // above. CPU-based detection can't sustain the 30fps detection
          // loop below, so positions update less often with bigger jumps
          // between them — that's the jitter. If GPU genuinely fails on a
          // given machine, the onError path now surfaces the real message
          // instead of failing silently, so we'll know for certain instead
          // of guessing again.
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
      // Was: silently swallowed except for a console.warn nobody looks at
      // mid-demo. Now passes the real error message back to the caller so
      // it can be surfaced to the user instead of failing invisibly.
      console.warn('Hand tracking failed, falling back to mouse:', err);
      if (onError) onError(err?.message || String(err));
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
    s.scrollDirection = null;
    document.body.classList.remove('hand-tracking-active');
    if (cursorRef.current) cursorRef.current.classList.remove('active');
  }, [cursorRef]);

  return { startHandTracking, stopHandTracking };
}
import { useEffect, useRef } from 'react';

const WS_URL = (() => {
  const api = import.meta.env.VITE_API_URL || '';
  if (!api) return null;
  // Convert https://... → wss://..., http://... → ws://...
  return api.replace(/^https/, 'wss').replace(/^http/, 'ws') + '/ws';
})();

const RECONNECT_DELAY_MS = 5000;
const TICK_FALLBACK_MS   = 4000;

/**
 * Connects to the backend WebSocket price server.
 * Falls back to random-drift simulation if WS is unavailable.
 */
export function useLivePrices(setTokens) {
  const wsRef          = useRef(null);
  const reconnectTimer = useRef(null);
  const fallbackTimer  = useRef(null);
  const mountedRef     = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // ── Fallback: random drift ────────────────────────────────────────────
    function startFallback() {
      if (fallbackTimer.current) return;
      fallbackTimer.current = setInterval(() => {
        setTokens(prev =>
          prev.map(t => {
            const drift = (t.basePrice - t.price) * 0.04;
            const noise = (Math.random() - 0.49) * t.price * 0.015;
            const newPrice = Math.max(
              t.basePrice * 0.75,
              parseFloat((t.price + drift + noise).toFixed(2))
            );
            return { ...t, prevPrice: t.price, price: newPrice };
          })
        );
      }, TICK_FALLBACK_MS);
    }

    function stopFallback() {
      if (fallbackTimer.current) {
        clearInterval(fallbackTimer.current);
        fallbackTimer.current = null;
      }
    }

    // ── WebSocket connection ───────────────────────────────────────────────
    function connect() {
      if (!WS_URL || !mountedRef.current) {
        startFallback();
        return;
      }

      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          stopFallback();
          ws.send(JSON.stringify({ type: 'subscribe_all' }));
        };

        ws.onmessage = (event) => {
          if (!mountedRef.current) return;
          try {
            const { type, data } = JSON.parse(event.data);

            if (type === 'ticker' || type === 'price_update') {
              // ticker:       data = { [SYMBOL]: { price, change_pct }, ... }
              // price_update: data = { symbol, price, change_pct }
              const updates = type === 'ticker'
                ? data
                : { [data.symbol]: data };

              setTokens(prev =>
                prev.map(t => {
                  const key = t.symbol?.toUpperCase() || t.id?.toUpperCase();
                  const update = updates[key];
                  if (!update) return t;
                  const newPrice = parseFloat(update.price);
                  if (isNaN(newPrice)) return t;
                  return { ...t, prevPrice: t.price, price: newPrice };
                })
              );
            }
          } catch { /* malformed frame — ignore */ }
        };

        ws.onerror = () => {
          // errors are handled in onclose
        };

        ws.onclose = () => {
          wsRef.current = null;
          if (!mountedRef.current) return;
          startFallback();
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
        };

      } catch {
        startFallback();
      }
    }

    connect();

    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectTimer.current);
      stopFallback();
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect loop on unmount
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [setTokens]);
}
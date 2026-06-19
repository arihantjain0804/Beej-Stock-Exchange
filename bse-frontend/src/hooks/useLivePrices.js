import { useEffect } from 'react';

// Simulates live price updates every 4 seconds.
// Takes the setTokens state setter from the parent and updates
// each token's price with a small random drift toward its base price.
export function useLivePrices(setTokens) {
  useEffect(() => {
    const interval = setInterval(() => {
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
    }, 4000);

    return () => clearInterval(interval);
  }, [setTokens]);
}
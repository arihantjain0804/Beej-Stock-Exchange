// ─── Ticker Tokens (live price data) ─────────────────────────────────────────
export const TOKENS = [
  { id: 'wheat',   crop: 'Punjab Wheat',     symbol: 'WHEAT',  basePrice: 45.2, fill: 94, days: 38, region: 'Punjab',    emoji: '🌾' },
  { id: 'soy',     crop: 'Vidarbha Soy',      symbol: 'SOY',    basePrice: 38.6, fill: 67, days: 62, region: 'Vidarbha',  emoji: '🫘' },
  { id: 'rice',    crop: 'Krishna Rice',      symbol: 'RICE',   basePrice: 52.1, fill: 82, days: 51, region: 'Andhra',    emoji: '🍚' },
  { id: 'onion',   crop: 'Nashik Onion',      symbol: 'ONION',  basePrice: 29.4, fill: 45, days: 88, region: 'Nashik',    emoji: '🧅' },
  { id: 'cotton',  crop: 'Gujarat Cotton',    symbol: 'COTTON', basePrice: 67.8, fill: 71, days: 74, region: 'Gujarat',   emoji: '☁️' },
  { id: 'mustard', crop: 'Rajasthan Mustard', symbol: 'MSTRD',  basePrice: 41.3, fill: 59, days: 55, region: 'Rajasthan', emoji: '🌼' },
  { id: 'coconut', crop: 'Kerala Coconut',    symbol: 'COCNT',  basePrice: 83.5, fill: 88, days: 22, region: 'Kerala',    emoji: '🥥' },
  { id: 'gram',    crop: 'MP Gram',           symbol: 'GRAM',   basePrice: 35.9, fill: 37, days: 95, region: 'MP',        emoji: '🟡' },
];

// Seeds initial price history for each token (called once on app load)
export function seedPrices(tokens) {
  return tokens.map(t => {
    const history = [];
    let p = t.basePrice * (0.94 + Math.random() * 0.06);
    for (let i = 0; i < 12; i++) {
      p = Math.max(t.basePrice * 0.8, p + (Math.random() - 0.48) * t.basePrice * 0.018);
      history.push(parseFloat(p.toFixed(2)));
    }
    return {
      ...t,
      history,
      price: history[history.length - 1],
      prevPrice: history[history.length - 2],
    };
  });
}

// ─── BEEJ-50 Index Constituents ───────────────────────────────────────────────
export const BSI_CONSTITUENTS = [
  { symbol: 'WHTPUN24',  name: 'Punjab Wheat',      region: 'Punjab',    weight: '18.5%', price: '₹45.20', change: '+2.1%', changeDir: 'up',   barW: 18.5 },
  { symbol: 'RICETEL24', name: 'Krishna Rice',       region: 'Andhra',    weight: '16.2%', price: '₹52.10', change: '+1.4%', changeDir: 'up',   barW: 16.2 },
  { symbol: 'COTMAH24',  name: 'Gujarat Cotton',     region: 'Gujarat',   weight: '14.8%', price: '₹67.80', change: '-0.8%', changeDir: 'down', barW: 14.8 },
  { symbol: 'GRPRAJ24',  name: 'Rajasthan Mustard',  region: 'Rajasthan', weight: '12.1%', price: '₹41.30', change: '+0.5%', changeDir: 'up',   barW: 12.1 },
  { symbol: 'TURGUJ24',  name: 'MP Gram',            region: 'MP',        weight: '10.4%', price: '₹35.90', change: '-1.2%', changeDir: 'down', barW: 10.4 },
  { symbol: 'MZKAR24',   name: 'Nashik Onion',       region: 'Nashik',    weight: '9.8%',  price: '₹29.40', change: '+3.2%', changeDir: 'up',   barW: 9.8  },
  { symbol: 'PEPKER24',  name: 'Kerala Coconut',     region: 'Kerala',    weight: '8.6%',  price: '₹83.50', change: '+1.8%', changeDir: 'up',   barW: 8.6  },
  { symbol: 'SOYVID24',  name: 'Vidarbha Soy',       region: 'Vidarbha',  weight: '9.6%',  price: '₹38.60', change: '+0.3%', changeDir: 'up',   barW: 9.6  },
];

// ─── Season Calendar Months ───────────────────────────────────────────────────
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
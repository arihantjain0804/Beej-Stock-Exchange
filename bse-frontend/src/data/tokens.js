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
  { symbol: 'PNJ-WHT', name: 'Punjab Wheat',     region: 'Ludhiana, Punjab',       sector: 'Cereals',     color: '#C8860A', weight: 18.4, basePrice: 847.50  },
  { symbol: 'KRS-RCE', name: 'Krishna Rice',     region: 'Vijayawada, AP',         sector: 'Cereals',     color: '#E8C87A', weight: 14.6, basePrice: 512.75  },
  { symbol: 'VDB-SOY', name: 'Vidarbha Soy',     region: 'Amravati, Maharashtra',  sector: 'Oilseeds',    color: '#6daf4a', weight: 11.2, basePrice: 623.00  },
  { symbol: 'UP-SGC',  name: 'UP Sugarcane',     region: 'Meerut, Uttar Pradesh',  sector: 'Cash Crops',  color: '#a8d060', weight: 9.1,  basePrice: 185.50  },
  { symbol: 'GUJ-GND', name: 'Gujarat Groundnut',region: 'Saurashtra, Gujarat',    sector: 'Oilseeds',    color: '#e07a2a', weight: 8.3,  basePrice: 1240.00 },
  { symbol: 'MH-CTN',  name: 'Vidarbha Cotton',  region: 'Nagpur, Maharashtra',    sector: 'Cash Crops',  color: '#d4a030', weight: 7.5,  basePrice: 2150.00 },
  { symbol: 'TN-BSM',  name: 'Tamil Basmati',    region: 'Thanjavur, Tamil Nadu',  sector: 'Cereals',     color: '#d0b848', weight: 7.0,  basePrice: 680.00  },
  { symbol: 'MP-SOY',  name: 'MP Soybean',       region: 'Indore, Madhya Pradesh', sector: 'Oilseeds',    color: '#78b44a', weight: 6.8,  basePrice: 598.25  },
  { symbol: 'RJ-CUM',  name: 'Rajasthan Cumin',  region: 'Jodhpur, Rajasthan',     sector: 'Spices',      color: '#b85020', weight: 5.6,  basePrice: 1875.00 },
  { symbol: 'KAR-RGI', name: 'Karnataka Ragi',   region: 'Tumkur, Karnataka',      sector: 'Millets',     color: '#c87040', weight: 4.2,  basePrice: 320.50  },
  { symbol: 'KER-CCO', name: 'Kerala Coconut',   region: 'Thrissur, Kerala',       sector: 'Horticulture',color: '#50a870', weight: 3.8,  basePrice: 480.00  },
  { symbol: 'AP-TRM',  name: 'Andhra Turmeric',  region: 'Nizamabad, Telangana',   sector: 'Spices',      color: '#f0a000', weight: 3.5,  basePrice: 2340.00 },
];

// ─── Season Calendar Months ───────────────────────────────────────────────────
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
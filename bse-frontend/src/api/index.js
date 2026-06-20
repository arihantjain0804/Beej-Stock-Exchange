// ─── BSE API Domain Methods ───────────────────────────────────────────────────
import { api, tokenStore } from './client';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  sendOTP: (phone) =>
    api.post('/auth/send-otp', { phone }),

  verifyOTP: (phone, otp, role = 'investor', full_name) => {
    const body = { phone, otp, role };
    if (full_name) body.full_name = full_name;
    return api.post('/auth/verify-otp', body);
  },

  getMe: () =>
    api.get('/auth/me', { auth: true }),

  logout: () => {
    tokenStore.clear();
  },
};

// ─── Tokens ───────────────────────────────────────────────────────────────────
export const tokensApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/tokens${qs ? '?' + qs : ''}`);
  },

  get: (symbol) =>
    api.get(`/tokens/${symbol}`),

  priceHistory: (symbol, limit = 30) =>
    api.get(`/tokens/${symbol}/price-history?limit=${limit}`),

  orderBook: (symbol) =>
    api.get(`/tokens/${symbol}/order-book`),

  recentTrades: (symbol, limit = 20) =>
    api.get(`/tokens/${symbol}/trades?limit=${limit}`),
};

// ─── Portfolio ────────────────────────────────────────────────────────────────
export const portfolioApi = {
  get: () =>
    api.get('/portfolio', { auth: true }),

  transactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/portfolio/transactions${qs ? '?' + qs : ''}`, { auth: true });
  },
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersApi = {
  place: ({ symbol, side, type, quantity, price_inr }) =>
    api.post('/orders', { symbol, side, type, quantity, price_inr }, { auth: true }),

  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/orders${qs ? '?' + qs : ''}`, { auth: true });
  },

  cancel: (id) =>
    api.delete(`/orders/${id}`, { auth: true }),
};

// ─── Watchlist ────────────────────────────────────────────────────────────────
export const watchlistApi = {
  get: () =>
    api.get('/watchlist', { auth: true }),

  add: (symbol) =>
    api.post('/watchlist', { symbol }, { auth: true }),

  remove: (symbol) =>
    api.delete(`/watchlist/${symbol}`, { auth: true }),
};

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const alertsApi = {
  get: () =>
    api.get('/alerts', { auth: true }),

  create: ({ symbol, condition, target_price_inr }) =>
    api.post('/alerts', { symbol, condition, target_price_inr }, { auth: true }),

  delete: (id) =>
    api.delete(`/alerts/${id}`, { auth: true }),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  get: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/notifications${qs ? '?' + qs : ''}`, { auth: true });
  },

  markRead: (id) =>
    api.patch(`/notifications/${id}/read`, {}, { auth: true }),

  markAllRead: () =>
    api.patch('/notifications/read-all', {}, { auth: true }),
};

// ─── BEEJ-50 Index ────────────────────────────────────────────────────────────
export const beej50Api = {
  get: () =>
    api.get('/beej50'),

  history: (days = 30) =>
    api.get(`/beej50/history?days=${days}`),
};
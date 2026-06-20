// ─── BSE API Client ───────────────────────────────────────────────────────────
// Thin wrapper around fetch that:
//   - Injects Authorization header from localStorage
//   - Transparently refreshes access tokens on 401
//   - Normalises error responses into thrown Error objects
//   - Reads base URL from VITE_API_URL env var

const BASE = import.meta.env.VITE_API_URL || '';

// ─── Token Storage ────────────────────────────────────────────────────────────
const KEYS = { access: 'bse_access', refresh: 'bse_refresh' };

export const tokenStore = {
  getAccess: () => localStorage.getItem(KEYS.access),
  getRefresh: () => localStorage.getItem(KEYS.refresh),
  set: (access, refresh) => {
    if (access) localStorage.setItem(KEYS.access, access);
    if (refresh) localStorage.setItem(KEYS.refresh, refresh);
  },
  clear: () => {
    localStorage.removeItem(KEYS.access);
    localStorage.removeItem(KEYS.refresh);
  },
};

// ─── Refresh Logic ────────────────────────────────────────────────────────────
// Serialises concurrent refresh attempts so we don't hit the endpoint 5× at once.
let refreshPromise = null;

async function attemptRefresh() {
  const refresh_token = tokenStore.getRefresh();
  if (!refresh_token) throw new Error('No refresh token');

  const res = await fetch(`${BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error('Refresh failed');
  tokenStore.set(body.data.access, null);
  return body.data.access;
}

async function getAccessToken() {
  const token = tokenStore.getAccess();
  if (token) return token;

  // No access token — try refresh
  if (!refreshPromise) {
    refreshPromise = attemptRefresh().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

// ─── Core Request ─────────────────────────────────────────────────────────────
export async function request(path, options = {}) {
  const { auth = false, body, method = 'GET', ...rest } = options;

  const headers = { 'Content-Type': 'application/json', ...rest.headers };

  if (auth) {
    try {
      const token = await getAccessToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch {
      tokenStore.clear();
      throw new AuthError('Session expired. Please log in again.');
    }
  }

  const init = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);

  const res = await fetch(`${BASE}/api${path}`, { ...init });

  // 401 — maybe token just expired, try one refresh cycle
  if (res.status === 401 && auth && !options._retried) {
    tokenStore.set(null, null); // wipe access token to force refresh
    localStorage.removeItem('bse_access');
    return request(path, { ...options, _retried: true });
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`;
    const code = data?.error?.code || 'API_ERROR';
    throw new ApiError(msg, res.status, code);
  }

  return data;
}

// ─── Convenience Methods ──────────────────────────────────────────────────────
export const api = {
  get: (path, opts = {}) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
  delete: (path, opts = {}) => request(path, { method: 'DELETE', ...opts }),
  patch: (path, body, opts = {}) => request(path, { method: 'PATCH', body, ...opts }),
};

// ─── Error Classes ────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}
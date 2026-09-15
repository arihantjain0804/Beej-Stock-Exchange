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
// Fix: fetch() here previously had no timeout and no retry. A single
// transient network stall (not a server problem — UptimeRobot confirms
// 2+ days of continuous uptime) would hang this promise indefinitely,
// leaving tokensLoading stuck `true` and pages permanently blank until a
// manual reload issued a fresh request. That's the "sometimes the market
// page doesn't load" symptom. Now: every request times out at 10s and,
// for safe idempotent GETs, retries once automatically before giving up.
export async function request(path, options = {}, attempt = 0) {
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

  const init = { method, headers, signal: AbortSignal.timeout(10000) };
  if (body !== undefined) init.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, { ...init });
  } catch (err) {
    // Network failure or timeout (AbortSignal.timeout throws a TimeoutError/AbortError)
    const isRetryable = method === 'GET' && attempt === 0;
    if (isRetryable) {
      await new Promise(r => setTimeout(r, 500)); // brief backoff
      return request(path, options, attempt + 1);
    }
    throw new ApiError('Network error — please check your connection and try again.', 0, 'NETWORK_ERROR');
  }

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
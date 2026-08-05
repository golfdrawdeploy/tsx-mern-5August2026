import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

/**
 * The access token lives ONLY in memory (a module-level variable), never in
 * localStorage/sessionStorage. This is a deliberate XSS-hardening choice:
 * an injected script can't read it off disk, and it naturally disappears
 * on a hard refresh (at which point AuthContext re-derives it via a silent
 * refresh call, since the httpOnly refresh cookie survives a reload).
 */
let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

/**
 * A callback the AuthContext registers so this module can tell React
 * "the refresh token is dead, log the user out" without importing React
 * state directly into a plain axios file (keeps this module framework-agnostic).
 */
let onAuthExpired: (() => void) | null = null;
export function registerAuthExpiredHandler(handler: () => void): void {
  onAuthExpired = handler;
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // required so the httpOnly refresh cookie is sent/received
});

// --- Request interceptor: attach the current access token, if we have one. ---
httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (inMemoryAccessToken) {
    config.headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }
  return config;
});

/**
 * Silent-refresh machinery.
 *
 * `refreshPromise` coalesces concurrent 401s: if five requests fail at once
 * because the access token just expired, we do NOT fire five refresh calls -
 * the first 401 kicks off one refresh request, and everyone else awaits the
 * same in-flight promise.
 */
let refreshPromise: Promise<string> | null = null;

async function performSilentRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ accessToken: string }>(`${API_BASE_URL}/auth/refresh`, null, { withCredentials: true })
      .then((response) => {
        const newToken = response.data.accessToken;
        setAccessToken(newToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

// --- Response interceptor: on 401, try one silent refresh, then retry once. ---
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh');

    if (status === 401 && originalRequest && !originalRequest._retried && !isRefreshCall) {
      originalRequest._retried = true;
      try {
        const newToken = await performSilentRefresh();
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
        return httpClient(originalRequest);
      } catch (refreshError) {
        // Refresh token itself is invalid/expired - there's no path back in
        // without a real login, so tell the app to show the login screen.
        setAccessToken(null);
        onAuthExpired?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

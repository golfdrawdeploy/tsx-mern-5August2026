import type { AuthTokenResponse } from '../types';
import { httpClient } from './httpClient';

/** Sends credentials to the backend; on success the server also sets the httpOnly refresh cookie. */
export async function login(username: string, password: string): Promise<AuthTokenResponse> {
  const response = await httpClient.post<AuthTokenResponse>('/auth/login', { username, password });
  return response.data;
}

/**
 * Exchanges the httpOnly refresh cookie for a new access token.
 * Used directly by AuthContext on app boot (page reload case).
 * NOTE: the interceptor in httpClient.ts calls the same endpoint internally
 * for mid-session 401s; this export is for the *initial* bootstrap check.
 */
export async function refresh(): Promise<AuthTokenResponse> {
  const response = await httpClient.post<AuthTokenResponse>('/auth/refresh');
  return response.data;
}

/** Clears the refresh cookie server-side. Client-side token clearing happens in AuthContext. */
export async function logout(): Promise<void> {
  await httpClient.post('/auth/logout');
}

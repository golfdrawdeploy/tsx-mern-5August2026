import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/authApi';
import { registerAuthExpiredHandler, setAccessToken } from '../api/httpClient';
import type { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True only while the app is doing its very first "am I still logged in?" check on load. */
  isBootstrapping: boolean;
  loginError: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    setLoginError(null);
    try {
      const { accessToken, user: loggedInUser } = await authApi.login(username, password);
      setAccessToken(accessToken);
      setUser(loggedInUser);
    } catch (err) {
      setAccessToken(null);
      setUser(null);
      setLoginError('Invalid username or password. Try admin / password123.');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      // Always clear client-side state even if the network call fails,
      // so a flaky connection never traps the user in a "logged in" limbo.
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  // On first mount, attempt a silent refresh: if the httpOnly refresh
  // cookie from a previous session is still valid, this logs the user
  // back in transparently without them re-entering credentials.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const { accessToken, user: refreshedUser } = await authApi.refresh();
        if (!cancelled) {
          setAccessToken(accessToken);
          setUser(refreshedUser);
        }
      } catch {
        // No valid refresh cookie (first visit, expired session, etc.) -
        // this is an expected, non-error path, not a failure to surface.
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  // Let the low-level http client tell us "the refresh token died mid-session"
  // so we can drop the user back to the login screen.
  useEffect(() => {
    registerAuthExpiredHandler(() => {
      setUser(null);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isBootstrapping,
      loginError,
      login,
      logout,
    }),
    [user, isBootstrapping, loginError, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

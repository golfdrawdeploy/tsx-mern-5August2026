import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SpinnerIcon } from './icons';
import './LoginForm.css';

/**
 * Minimal login screen. Accepts the hardcoded demo credentials the backend
 * seeds on first boot (admin / password123).
 */
export function LoginForm(): React.ReactElement {
  const { login, loginError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch {
      // loginError is already set inside AuthContext; nothing more to do here.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__mesh" aria-hidden="true" />
      <form className="login-card glass-strong" onSubmit={handleSubmit}>
        <span className="login-card__wordmark micro-label">Star-wars</span>
        <h1 className="login-card__title">Sign in to the archive</h1>
        <p className="login-card__subtitle">Secure access to the Star Wars character database.</p>

        <label className="login-card__label micro-label" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          className="login-card__input glass-inset"
          type="text"
          placeholder="admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label className="login-card__label micro-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="login-card__input glass-inset"
          type="password"
          placeholder="password123"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {loginError && (
          <p className="login-card__error" role="alert">
            {loginError}
          </p>
        )}

        <button className="btn-accent login-card__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting && <SpinnerIcon className="login-card__spinner" />}
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="login-card__hint mono">demo credentials — admin / password123</p>
      </form>
    </div>
  );
}

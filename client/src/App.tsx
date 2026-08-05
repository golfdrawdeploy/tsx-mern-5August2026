import React, { useRef, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { LoginForm } from './components/LoginForm';
import { CharacterList, type CharacterListHandle, type ListStats } from './components/CharacterList';
import { Loader } from './components/Loader';
import { SearchIcon, SunIcon, MoonIcon } from './components/icons';
import './App.css';

const INITIAL_STATS: ListStats = { total: 0, page: 1, totalPages: 1, activeFilterCount: 0, searchText: '' };

/**
 * Top-level router (no react-router needed for a 2-screen app):
 * - While bootstrapping (checking for a still-valid refresh cookie), show a loader.
 * - If not authenticated afterward, show the login screen.
 * - Once authenticated, show the character explorer, gated behind auth as required.
 */
export function App(): React.ReactElement {
  const { isAuthenticated, isBootstrapping, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const listRef = useRef<CharacterListHandle>(null);
  const [stats, setStats] = useState<ListStats>(INITIAL_STATS);

  if (isBootstrapping) {
    return <Loader label="Checking your session" />;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="app">
      <header className="app__topbar glass">
        <div className="app__topbar-inner">
          <span className="app__wordmark micro-label">STAR WARS</span>

          

          <div className="app__topbar-actions">
            <button
              type="button"
              className="app__theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              <span className={`app__theme-icon ${theme === 'dark' ? 'app__theme-icon--visible' : ''}`}>
                <MoonIcon />
              </span>
              <span className={`app__theme-icon ${theme === 'light' ? 'app__theme-icon--visible' : ''}`}>
                <SunIcon />
              </span>
            </button>

            <div className="app__auth">
              <span className="app__avatar" aria-hidden="true">
                {user?.username?.[0]?.toUpperCase() ?? '?'}
                <span className="app__avatar-tick" title="Session verified" />
              </span>
              <span className="app__username">{user?.username}</span>
              <button type="button" className="btn-ghost app__logout" onClick={() => logout()}>
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="app__hero">
        <div className="app__hero-mesh" aria-hidden="true" />
        <div className="app__hero-content">
          <span className="app__hero-eyebrow micro-label">Archive online · {stats.total} records indexed</span>
          <h1 className="app__hero-title">
            Star <em>Wars</em> Characters
          </h1>
          <p className="app__hero-subline">
            Search, filter and explore every character catalogued across the Holonet database — with live
            homeworld, species and film intelligence.
          </p>
        </div>
      </section>

      <CharacterList ref={listRef} onStatsChange={setStats} />
    </div>
  );
}

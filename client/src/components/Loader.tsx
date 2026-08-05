import React from 'react';
import './Loader.css';

interface LoaderProps {
  label?: string;
  /** Renders without the full-viewport min-height, for use inside cards/sections. */
  inline?: boolean;
}

/**
 * Reusable loading indicator: a soft dual-tone ring with a pulsing core and an
 * animated ellipsis. Used across list/homeworld/auth-bootstrap loading states.
 */
export function Loader({ label = 'Loading', inline = false }: LoaderProps): React.ReactElement {
  return (
    <div className={`loader ${inline ? 'loader--inline' : ''}`} role="status" aria-live="polite">
      <div className="loader__ring" aria-hidden="true">
        <span className="loader__core" />
      </div>
      <span className="loader__label">
        {label}
        <span className="loader__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </span>
    </div>
  );
}

import React from 'react';
import { AlertIcon } from './icons';
import './ErrorState.css';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

/** Reused wherever a fetch can fail: character list, homeworld lookup, auth refresh. */
export function ErrorState({ message, onRetry, compact = false }: ErrorStateProps): React.ReactElement {
  return (
    <div className={`error-state glass ${compact ? 'error-state--compact' : ''}`} role="alert">
      <AlertIcon className="error-state__icon" />
      <p className="error-state__message">{message}</p>
      {onRetry && (
        <button type="button" className="btn-ghost error-state__retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

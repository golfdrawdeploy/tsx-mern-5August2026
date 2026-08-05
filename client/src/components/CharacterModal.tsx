import React, { useEffect, useRef } from 'react';
import type { Person } from '../types';
import { useHomeworld } from '../hooks/useCharacters';
import { formatDateDDMMYYYY, formatHeightInMeters, formatMassInKg, formatPopulation } from '../utils/formatters';
import { ErrorState } from './ErrorState';
import { CloseIcon } from './icons';
import './CharacterModal.css';

interface CharacterModalProps {
  person: Person;
  speciesName: string | null;
  onClose: () => void;
}

interface StatTileProps {
  label: string;
  value: React.ReactNode;
}

function StatTile({ label, value }: StatTileProps): React.ReactElement {
  return (
    <div className="character-modal__stat glass-inset">
      <dt className="micro-label">{label}</dt>
      <dd className="mono">{value}</dd>
    </div>
  );
}

/**
 * Detail modal for a single character. The homeworld is fetched lazily
 * (only once the modal is open, via `useHomeworld`) so we never fetch
 * planet data for characters the user hasn't clicked on, and a failed
 * homeworld fetch is isolated to its own section - it never breaks the modal.
 */
export function CharacterModal({ person, speciesName, onClose }: CharacterModalProps): React.ReactElement {
  const homeworldQuery = useHomeworld(person.homeworld);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Let Escape close the modal, prevent background scroll, and move focus in.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="character-modal__overlay" onClick={onClose} role="presentation">
      {/* Stop propagation so clicking inside the card doesn't close the modal */}
      <div
        className="character-modal__card glass-strong"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="character-modal-title"
      >
        <button type="button" className="character-modal__close" onClick={onClose} aria-label="Close" ref={closeButtonRef}>
          <CloseIcon />
        </button>

        <h2 id="character-modal-title" className="character-modal__title">
          {person.name}
        </h2>
        <span className="character-modal__species-badge micro-label">{speciesName ?? 'Unknown species'}</span>

        <dl className="character-modal__stats">
          <StatTile label="Height" value={formatHeightInMeters(person.height)} />
          <StatTile label="Mass" value={formatMassInKg(person.mass)} />
          <StatTile label="Birth Year" value={person.birth_year} />
          <StatTile label="Films" value={person.films.length} />
          <StatTile label="Added to API" value={formatDateDDMMYYYY(person.created)} />
          <StatTile label="Gender" value={person.gender} />
        </dl>

        <div className="character-modal__divider" />

        <h3 className="character-modal__subheading micro-label">Homeworld</h3>

        {homeworldQuery.isLoading && (
          <div className="character-modal__stats">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="character-modal__stat character-modal__stat--skeleton glass-inset">
                <div className="skeleton character-modal__skeleton-line" style={{ width: '50%' }} />
                <div className="skeleton character-modal__skeleton-line" style={{ width: '75%' }} />
              </div>
            ))}
          </div>
        )}

        {homeworldQuery.isError && (
          <ErrorState compact message="Couldn't load homeworld data." onRetry={() => homeworldQuery.refetch()} />
        )}

        {homeworldQuery.data && (
          <dl className="character-modal__stats">
            <StatTile label="Planet" value={homeworldQuery.data.name} />
            <StatTile label="Terrain" value={homeworldQuery.data.terrain} />
            <StatTile label="Climate" value={homeworldQuery.data.climate} />
            <StatTile label="Population" value={formatPopulation(homeworldQuery.data.population)} />
            <StatTile label="Residents" value={homeworldQuery.data.residents.length} />
          </dl>
        )}
      </div>
    </div>
  );
}

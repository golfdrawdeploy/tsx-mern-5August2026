import React, { useState } from 'react';
import type { Person } from '../types';
import { speciesGradientToken } from '../utils/colorHash';
import './CharacterCard.css';

interface CharacterCardProps {
  person: Person;
  speciesName: string | null; // resolved species name (or null for "unknown"/no species)
  filmCount: number;
  index: number; // grid position, used to stagger the fade-in
  onSelect: (person: Person) => void;
}

/**
 * A single character card.
 * - Image: Picsum seeded with the character's name so the same character
 *   always gets the same 4:3 picture, even across re-renders.
 * - Tint: a species-derived `--gradient-species-*` token, never a hardcoded color.
 * - Hover animation: CSS-only lift, glow bloom, and specular sheen; see CharacterCard.css.
 */
export function CharacterCard({ person, speciesName, filmCount, index, onSelect }: CharacterCardProps): React.ReactElement {
  const [imageLoaded, setImageLoaded] = useState(false);
  const speciesToken = speciesGradientToken(speciesName);
  // encodeURIComponent keeps the seed URL-safe for names with apostrophes/spaces (e.g. "Owen Lars").
 const imageUrl = `https://picsum.photos/600/450?random=${Date.now()}-${index}`;

  return (
    <button
      type="button"
      className="character-card"
      style={{ animationDelay: `${index * 40}ms`, ['--card-species-tint' as string]: `var(--gradient-species-${speciesToken})` }}
      onClick={() => onSelect(person)}
      aria-label={`View details for ${person.name}`}
    >
      <span className="character-card__sheen" aria-hidden="true" />
      <div className="character-card__image-wrap">
        {!imageLoaded && <div className="character-card__image-skeleton skeleton" aria-hidden="true" />}
        <img
          className="character-card__image"
          src={imageUrl}
          alt={person.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
        <div className="character-card__scrim" aria-hidden="true" />
        <span className="character-card__badge">{speciesName ?? 'Unknown'}</span>
      </div>
      <div className="character-card__body">
        <h3 className="character-card__name">{person.name}</h3>
        <span className="character-card__meta mono">
          
          {person.birth_year} · {filmCount} film{filmCount === 1 ? '' : 's'}
        </span>
      </div>
    </button>
  );
}

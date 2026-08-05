import React from 'react';
import './CharacterCard.css';

interface CharacterCardSkeletonProps {
  index: number;
}

/** Shimmering glass placeholder rendered in a grid of 10 while the character list is first loading. */
export function CharacterCardSkeleton({ index }: CharacterCardSkeletonProps): React.ReactElement {
  return (
    <div className="character-card character-card--skeleton" style={{ animationDelay: `${index * 40}ms` }} aria-hidden="true">
      <div className="character-card__image-wrap skeleton" />
      <div className="character-card__body">
        <div className="skeleton character-card__skeleton-line character-card__skeleton-line--title" />
        <div className="skeleton character-card__skeleton-line character-card__skeleton-line--meta" />
      </div>
    </div>
  );
}

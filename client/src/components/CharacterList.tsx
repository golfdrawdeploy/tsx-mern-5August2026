import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import type { CharacterFilters, FilterOption, Person } from '../types';
import { useCharacters, useFilms, usePlanets, useAllSpecies } from '../hooks/useCharacters';
import { CharacterCard } from './CharacterCard';
import { CharacterCardSkeleton } from './CharacterCardSkeleton';
import { CharacterModal } from './CharacterModal';
import { SearchFilterBar } from './SearchFilterBar';
import { Pagination } from './Pagination';
import { ErrorState } from './ErrorState';
import { SpyglassIcon } from './icons';
import { extractIdFromUrl } from '../utils/formatters';
import './CharacterList.css';

const CHARACTERS_PER_PAGE = 10;
const SKELETON_COUNT = 10;

const EMPTY_FILTERS: CharacterFilters = {
  searchText: '',
  homeworldUrl: '',
  filmUrl: '',
  speciesUrl: '',
};

export interface ListStats {
  total: number;
  page: number;
  totalPages: number;
  activeFilterCount: number;
  searchText: string;
}

export interface CharacterListHandle {
  /** Lets the sticky top-bar global search drive the same filter state as the control rail. */
  setSearchText: (text: string) => void;
}

interface CharacterListProps {
  onStatsChange?: (stats: ListStats) => void;
}

function readPageFromUrl(): number {
  if (typeof window === 'undefined') return 1;
  const raw = new URLSearchParams(window.location.search).get('page');
  const parsed = raw ? Number(raw) : 1;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function writePageToUrl(page: number): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (page <= 1) {
    params.delete('page');
  } else {
    params.set('page', String(page));
  }
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
  window.history.replaceState(null, '', nextUrl);
}

export const CharacterList = forwardRef<CharacterListHandle, CharacterListProps>(function CharacterList(
  { onStatsChange },
  ref,
) {
  const peopleQuery = useCharacters(true);
  const filmsQuery = useFilms(true);
  const planetsQuery = usePlanets(true);
  const speciesQuery = useAllSpecies(true);

  const [filters, setFilters] = useState<CharacterFilters>(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState<number>(readPageFromUrl);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      setSearchText: (text: string) => setFilters((prev) => ({ ...prev, searchText: text })),
    }),
    [],
  );

  // Resetting to page 1 whenever ANY filter/search value changes, per spec.
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchText, filters.homeworldUrl, filters.filmUrl, filters.speciesUrl]);

  useEffect(() => {
    writePageToUrl(currentPage);
  }, [currentPage]);

  // Map every species URL -> species name once, so cards + filtering don't
  // need to re-fetch anything per-character.
  const speciesNameByUrl = useMemo(() => {
    const map = new Map<string, string>();
    speciesQuery.data?.forEach((species) => map.set(species.url, species.name));
    return map;
  }, [speciesQuery.data]);

  /** Resolves a Person's first species name, or null if they have none listed. */
  const resolveSpeciesName = useCallback(
    (person: Person): string | null => {
      if (person.species.length === 0) return null;
      return speciesNameByUrl.get(person.species[0]) ?? null;
    },
    [speciesNameByUrl],
  );

  // Filter dropdown option lists, derived from whatever SWAPI actually returned
  // (rather than hardcoded), sorted alphabetically for a predictable UI.
  const homeworldOptions: FilterOption[] = useMemo(
    () =>
      (planetsQuery.data ?? [])
        .map((planet) => ({ url: planet.url, label: planet.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [planetsQuery.data],
  );

  const filmOptions: FilterOption[] = useMemo(
    () =>
      (filmsQuery.data ?? [])
        .map((film) => ({ url: film.url, label: film.title }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [filmsQuery.data],
  );

  const speciesOptions: FilterOption[] = useMemo(
    () =>
      (speciesQuery.data ?? [])
        .map((species) => ({ url: species.url, label: species.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [speciesQuery.data],
  );

  /**
   * The core combined search+filter logic. Every clause below is optional
   * (empty filter = "no constraint"), and they compose with AND by chaining
   * .filter() calls - each call narrows down what the previous one already narrowed.
   */
  const filteredCharacters = useMemo(() => {
    const people = peopleQuery.data ?? [];
    const searchLower = filters.searchText.trim().toLowerCase();

    return people
      .filter((person) => (searchLower ? person.name.toLowerCase().includes(searchLower) : true))
      .filter((person) => (filters.homeworldUrl ? person.homeworld === filters.homeworldUrl : true))
      .filter((person) => (filters.filmUrl ? person.films.includes(filters.filmUrl) : true))
      .filter((person) => (filters.speciesUrl ? person.species.includes(filters.speciesUrl) : true));
  }, [peopleQuery.data, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredCharacters.length / CHARACTERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * CHARACTERS_PER_PAGE;
  const visibleCharacters = filteredCharacters.slice(pageStart, pageStart + CHARACTERS_PER_PAGE);

  const activeFilterCount = [filters.homeworldUrl, filters.filmUrl, filters.speciesUrl, filters.searchText.trim()].filter(
    Boolean,
  ).length;

  useEffect(() => {
    onStatsChange?.({
      total: filteredCharacters.length,
      page: safePage,
      totalPages,
      activeFilterCount,
      searchText: filters.searchText,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCharacters.length, safePage, totalPages, activeFilterCount, filters.searchText]);

  if (peopleQuery.isError) {
    return (
      <ErrorState
        message="The archive is unreachable. Check your connection and try again."
        onRetry={() => peopleQuery.refetch()}
      />
    );
  }

  return (
    <div className="character-list">
      {peopleQuery.isFetching && !peopleQuery.isLoading && (
        <div className="character-list__progress" aria-hidden="true">
          <div className="character-list__progress-bar" />
        </div>
      )}

      <SearchFilterBar
        filters={filters}
        onChange={setFilters}
        homeworldOptions={homeworldOptions}
        filmOptions={filmOptions}
        speciesOptions={speciesOptions}
      />

      {peopleQuery.isLoading ? (
        <div className="character-list__grid">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <CharacterCardSkeleton key={i} index={i} />
          ))}
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="character-list__empty glass">
          <SpyglassIcon className="character-list__empty-icon" />
          <p>No characters match your search and filters.</p>
          <button type="button" className="btn-ghost" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="character-list__grid">
          {visibleCharacters.map((person, i) => (
            <CharacterCard
              key={person.url ?? person.name}
              person={person}
              speciesName={resolveSpeciesName(person)}
              filmCount={person.films.length}
              index={i}
              onSelect={setSelectedPerson}
            />
          ))}
        </div>
      )}

      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {selectedPerson && (
        <CharacterModal
          person={selectedPerson}
          speciesName={resolveSpeciesName(selectedPerson)}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
});

// Re-exported for tests/utilities that need a stable per-character key.
export { extractIdFromUrl };

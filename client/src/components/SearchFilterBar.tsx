import React, { useMemo, useState } from 'react';
import type { CharacterFilters, FilterOption } from '../types';
import { SearchIcon, CloseIcon, SlidersIcon } from './icons';
import { FilterSelect } from './FilterSelect';
import './SearchFilterBar.css';

interface SearchFilterBarProps {
  filters: CharacterFilters;
  onChange: (filters: CharacterFilters) => void;
  homeworldOptions: FilterOption[];
  filmOptions: FilterOption[];
  speciesOptions: FilterOption[];
}

const EMPTY_FILTERS: CharacterFilters = {
  searchText: '',
  homeworldUrl: '',
  filmUrl: '',
  speciesUrl: '',
};

interface Chip {
  key: keyof CharacterFilters;
  label: string;
  tone: 'violet' | 'cyan' | 'amber' | 'neutral';
}

/**
 * Search + filter control rail.
 * - The search field is a full-height pill with a solid gradient Search button.
 * - Filters live in a responsive auto-fit grid and collapse behind a
 *   "Filters" toggle on small screens, so long option lists never overflow.
 */
export function SearchFilterBar({
  filters,
  onChange,
  homeworldOptions,
  filmOptions,
  speciesOptions,
}: SearchFilterBarProps): React.ReactElement {
  const [panelOpen, setPanelOpen] = useState(false);

  const chips: Chip[] = useMemo(() => {
    const list: Chip[] = [];
    if (filters.searchText.trim())
      list.push({ key: 'searchText', label: `"${filters.searchText.trim()}"`, tone: 'neutral' });
    if (filters.homeworldUrl) {
      const found = homeworldOptions.find((o) => o.url === filters.homeworldUrl);
      list.push({ key: 'homeworldUrl', label: found?.label ?? 'Homeworld', tone: 'violet' });
    }
    if (filters.filmUrl) {
      const found = filmOptions.find((o) => o.url === filters.filmUrl);
      list.push({ key: 'filmUrl', label: found?.label ?? 'Film', tone: 'cyan' });
    }
    if (filters.speciesUrl) {
      const found = speciesOptions.find((o) => o.url === filters.speciesUrl);
      list.push({ key: 'speciesUrl', label: found?.label ?? 'Species', tone: 'amber' });
    }
    return list;
  }, [filters, homeworldOptions, filmOptions, speciesOptions]);

  function removeChip(key: keyof CharacterFilters) {
    onChange({ ...filters, [key]: '' });
  }

  const hasActiveFilters = chips.length > 0;
  const dropdownCount = chips.filter((c) => c.key !== 'searchText').length;

  return (
    <div className="search-filter-bar">
      <form className="search-filter-bar__searchrow" onSubmit={(e) => e.preventDefault()} role="search">
        <div className="search-filter-bar__search-wrap">
          <SearchIcon className="search-filter-bar__search-icon" />
          <input
            type="search"
            className="search-filter-bar__search"
            placeholder="Search characters by name..."
            value={filters.searchText}
            onChange={(e) => onChange({ ...filters, searchText: e.target.value })}
            aria-label="Search characters by name"
          />
          {filters.searchText && (
            <button
              type="button"
              className="search-filter-bar__search-clear"
              onClick={() => onChange({ ...filters, searchText: '' })}
              aria-label="Clear search text"
            >
              <CloseIcon className="search-filter-bar__search-clear-icon" />
            </button>
          )}
          <button type="submit" className="btn-accent search-filter-bar__submit">
            <SearchIcon className="search-filter-bar__submit-icon" />
            <span>Search</span>
          </button>
        </div>

        <button
          type="button"
          className={`search-filter-bar__toggle ${panelOpen ? 'search-filter-bar__toggle--open' : ''}`}
          onClick={() => setPanelOpen((v) => !v)}
          aria-expanded={panelOpen}
        >
          <SlidersIcon />
          <span>Filters</span>
          {dropdownCount > 0 && <span className="search-filter-bar__toggle-count">{dropdownCount}</span>}
        </button>
      </form>

      <div className={`search-filter-bar__filters ${panelOpen ? 'search-filter-bar__filters--open' : ''}`}>
        <FilterSelect
          label="Homeworld"
          allLabel="All homeworlds"
          value={filters.homeworldUrl}
          options={homeworldOptions}
          onChange={(v) => onChange({ ...filters, homeworldUrl: v })}
          accent="violet"
        />
        <FilterSelect
          label="Film"
          allLabel="All films"
          value={filters.filmUrl}
          options={filmOptions}
          onChange={(v) => onChange({ ...filters, filmUrl: v })}
          accent="cyan"
        />
        <FilterSelect
          label="Species"
          allLabel="All species"
          value={filters.speciesUrl}
          options={speciesOptions}
          onChange={(v) => onChange({ ...filters, speciesUrl: v })}
          accent="amber"
        />
        <div className="search-filter-bar__reset-slot">
          <button
            type="button"
            className="btn-ghost search-filter-bar__clear"
            onClick={() => onChange(EMPTY_FILTERS)}
            disabled={!hasActiveFilters}
          >
            Clear all
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="search-filter-bar__chips" aria-label="Active filters">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className={`search-filter-bar__chip search-filter-bar__chip--${chip.tone}`}
              onClick={() => removeChip(chip.key)}
              aria-label={`Remove filter ${chip.label}`}
            >
              <span>{chip.label}</span>
              <CloseIcon className="search-filter-bar__chip-close" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { FilterOption } from '../types';
import { ChevronDownIcon, SearchIcon, CloseIcon } from './icons';
import './FilterSelect.css';

interface FilterSelectProps {
  label: string;
  allLabel: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  accent?: 'violet' | 'cyan' | 'amber';
}

/**
 * A premium, responsive replacement for the native <select>.
 * Long option lists (planets, films, species) are handled with an inline
 * type-to-filter field and a scroll-capped listbox, so the dropdown never
 * runs off screen on small viewports.
 */
export function FilterSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
  accent = 'violet',
}: FilterSelectProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.url === value) ?? null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    searchRef.current?.focus();
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function pick(next: string) {
    onChange(next);
    setOpen(false);
    setQuery('');
  }

  return (
    <div className={`filter-select filter-select--${accent}`} ref={rootRef}>
      <span className="filter-select__label micro-label">{label}</span>
      <button
        type="button"
        className={`filter-select__trigger ${value ? 'filter-select__trigger--active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Filter by ${label.toLowerCase()}`}
      >
        <span className="filter-select__value">{selected?.label ?? allLabel}</span>
        {value ? (
          <span
            className="filter-select__clear"
            role="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={(e) => {
              e.stopPropagation();
              pick('');
            }}
          >
            <CloseIcon className="filter-select__clear-icon" />
          </span>
        ) : (
          <ChevronDownIcon className={`filter-select__chevron ${open ? 'filter-select__chevron--open' : ''}`} />
        )}
      </button>

      {open && (
        <div className="filter-select__panel" role="listbox">
          <div className="filter-select__search">
            <SearchIcon className="filter-select__search-icon" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              placeholder={`Find ${label.toLowerCase()}...`}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={`Search ${label} options`}
            />
          </div>

          <div className="filter-select__options">
            <button
              type="button"
              role="option"
              aria-selected={value === ''}
              className={`filter-select__option ${value === '' ? 'filter-select__option--selected' : ''}`}
              onClick={() => pick('')}
            >
              {allLabel}
            </button>
            {visible.map((opt) => (
              <button
                key={opt.url}
                type="button"
                role="option"
                aria-selected={value === opt.url}
                className={`filter-select__option ${value === opt.url ? 'filter-select__option--selected' : ''}`}
                onClick={() => pick(opt.url)}
              >
                {opt.label}
              </button>
            ))}
            {visible.length === 0 && <p className="filter-select__empty">No matches</p>}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useMemo } from 'react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PageToken = number | 'ellipsis-start' | 'ellipsis-end';

/** Builds a compact [1, ellipsis, ...neighbors..., ellipsis, last] page list. */
function buildPageTokens(current: number, total: number): PageToken[] {
  const tokens: PageToken[] = [];
  const neighbors = 1;
  const first = 1;
  const last = total;

  const start = Math.max(first + 1, current - neighbors);
  const end = Math.min(last - 1, current + neighbors);

  tokens.push(first);
  if (start > first + 1) tokens.push('ellipsis-start');
  for (let page = start; page <= end; page++) tokens.push(page);
  if (end < last - 1) tokens.push('ellipsis-end');
  if (last !== first) tokens.push(last);

  return tokens;
}

/** Centered glass-pill prev/next + numbered pagination for the character grid. */
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps): React.ReactElement | null {
  const pageTokens = useMemo(() => buildPageTokens(currentPage, totalPages), [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Character list pagination">
      <div className="pagination__pill glass">
        <button
          type="button"
          className="pagination__nav"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ← Prev
        </button>

        <div className="pagination__pages">
          {pageTokens.map((token, i) =>
            typeof token === 'number' ? (
              <button
                key={token}
                type="button"
                className={`pagination__page mono ${token === currentPage ? 'pagination__page--active' : ''}`}
                onClick={() => onPageChange(token)}
                aria-current={token === currentPage ? 'page' : undefined}
              >
                {token}
              </button>
            ) : (
              <span key={`${token}-${i}`} className="pagination__ellipsis mono" aria-hidden="true">
                …
              </span>
            ),
          )}
        </div>

        <button
          type="button"
          className="pagination__nav"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>
    </nav>
  );
}

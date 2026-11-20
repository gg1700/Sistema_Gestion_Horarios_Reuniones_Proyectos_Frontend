import { useEffect, useState } from 'react';
import { Button } from './Button';
import { classNames } from '../../utils/classNames';

export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;

  return {
    page: current,
    totalPages,
    setPage,
    pageItems: items.slice(start, start + pageSize),
    from: items.length === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, items.length),
    total: items.length,
  };
}

export function Pagination({
  page,
  totalPages,
  onChange,
  summary,
  className,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  summary?: string;
  className?: string;
}) {
  if (totalPages <= 1 && !summary) return null;

  return (
    <nav className={classNames('ui-pagination', className)} aria-label="Paginación">
      {summary && <span className="ui-pagination__summary">{summary}</span>}
      {totalPages > 1 && (
        <div className="ui-pagination__controls">
          <Button size="small" variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
            Anterior
          </Button>
          <span aria-live="polite">Página {page} de {totalPages}</span>
          <Button size="small" variant="secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
            Siguiente
          </Button>
        </div>
      )}
    </nav>
  );
}
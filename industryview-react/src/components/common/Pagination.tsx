import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  perPage: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalPages,
  perPage,
  totalItems,
  onPageChange,
  onPerPageChange,
  perPageOptions = [5, 10, 15, 20, 100],
}: PaginationProps) {
  const { t } = useTranslation();

  const startItem = totalItems != null && totalItems > 0 ? (currentPage - 1) * perPage + 1 : 0;
  const endItem = totalItems != null ? Math.min(currentPage * perPage, totalItems) : 0;

  return (
    <div className="pagination" style={{ justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onPerPageChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
              {t('common.linesPerPage')}
            </span>
            <SearchableSelect
              options={perPageOptions.map(opt => ({ value: opt, label: String(opt) }))}
              value={perPage}
              onChange={(value) => onPerPageChange(value ? Number(value) : perPage)}
              allowClear={false}
              style={{ width: 'auto', minWidth: '80px', fontSize: '12px' }}
            />
          </div>
        )}
        {totalItems != null && (
          <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
            {startItem}-{endItem} {t('common.of', 'de')} {totalItems} {t('common.results', 'resultados')}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
          {currentPage} / {totalPages || 1}
        </span>
        <button
          className="btn btn-icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{ opacity: currentPage <= 1 ? 0.4 : 1 }}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          className="btn btn-icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{ opacity: currentPage >= totalPages ? 0.4 : 1 }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

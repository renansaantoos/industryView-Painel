import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

interface SortableHeaderProps {
  label: string;
  field: string;
  currentField: string | null;
  currentDirection: SortDirection;
  onSort: (field: string) => void;
  style?: React.CSSProperties;
}

export default function SortableHeader({
  label,
  field,
  currentField,
  currentDirection,
  onSort,
  style,
}: SortableHeaderProps) {
  const isActive = currentField === field;

  return (
    <th
      onClick={() => onSort(field)}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span>{label}</span>
        {isActive && currentDirection === 'asc' ? (
          <ArrowUp size={14} color="var(--color-primary)" />
        ) : isActive && currentDirection === 'desc' ? (
          <ArrowDown size={14} color="var(--color-primary)" />
        ) : (
          <ArrowUpDown size={14} color="var(--color-secondary-text)" style={{ opacity: 0.4 }} />
        )}
      </div>
    </th>
  );
}

export function useBackendSort() {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') { setSortField(null); setSortDirection(null); }
      else setSortDirection('asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return { sortField, sortDirection, handleSort };
}


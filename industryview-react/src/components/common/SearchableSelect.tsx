import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { dropdownVariants } from '../../lib/motion';

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string | number;
  onChange: (value: string | number | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  allowClear?: boolean;
  style?: React.CSSProperties;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Pesquisar...',
  allowClear = true,
  style,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number; openUp: boolean }>({ top: 0, left: 0, width: 0, openUp: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => String(o.value) === String(value));

  const filtered = search
    ? options.filter((o) => (o.label || '').toLowerCase().includes(search.toLowerCase()))
    : options;

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      setDropdownPos({
        top: openUp ? rect.top - 4 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        openUp,
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  }, [isOpen, updatePosition]);

  const handleSelect = (opt: Option) => {
    onChange(opt.value);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setSearch('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', ...style }}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          width: '100%',
          minWidth: '240px',
          height: '40px',
          padding: '0 12px',
          border: '1px solid var(--color-alternate)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-secondary-bg)',
          fontSize: 'var(--font-size-md)',
          fontFamily: 'var(--font-family)',
          color: selectedOption ? 'var(--color-primary-text)' : 'var(--color-accent4)',
          cursor: 'pointer',
          transition: 'border-color var(--transition-fast)',
          outline: 'none',
          ...(isOpen ? { borderColor: 'var(--color-primary)', boxShadow: '0 0 0 3px var(--color-accent2)' } : {}),
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {allowClear && selectedOption && (
            <span
              onClick={handleClear}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-secondary-text)',
              }}
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            style={{
              color: 'var(--color-secondary-text)',
              transition: 'transform var(--transition-fast)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </button>

      {/* Dropdown via portal */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              variants={dropdownVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: 'fixed',
                ...(dropdownPos.openUp
                  ? { bottom: window.innerHeight - dropdownPos.top }
                  : { top: dropdownPos.top }),
                left: dropdownPos.left,
                width: dropdownPos.width,
                minWidth: '240px',
                backgroundColor: 'var(--color-secondary-bg)',
                border: '1px solid var(--color-alternate)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 99999,
                overflow: 'hidden',
              }}
            >
              {/* Search */}
              <div style={{ padding: '8px', borderBottom: '1px solid var(--color-alternate)' }}>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-accent4)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    style={{
                      width: '100%',
                      height: '36px',
                      padding: '0 10px 0 34px',
                      border: '1px solid var(--color-alternate)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-sm)',
                      fontFamily: 'var(--font-family)',
                      backgroundColor: 'var(--color-primary-bg)',
                      color: 'var(--color-primary-text)',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--color-alternate)')}
                  />
                </div>
              </div>

              {/* Options */}
              <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {filtered.length === 0 ? (
                  <div
                    style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-secondary-text)',
                    }}
                  >
                    Nenhum resultado
                  </div>
                ) : (
                  filtered.map((opt) => {
                    const isSelected = String(opt.value) === String(value);
                    return (
                      <div
                        key={opt.value}
                        onClick={() => handleSelect(opt)}
                        style={{
                          padding: '10px 12px',
                          fontSize: 'var(--font-size-md)',
                          fontFamily: 'var(--font-family)',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-primary-text)',
                          backgroundColor: isSelected ? 'var(--color-tertiary-bg)' : 'transparent',
                          fontWeight: isSelected ? 500 : 400,
                          cursor: 'pointer',
                          transition: 'background-color var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isSelected ? 'var(--color-tertiary-bg)' : 'transparent';
                        }}
                      >
                        {opt.label}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

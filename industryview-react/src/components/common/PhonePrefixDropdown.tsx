import { useState, useRef, useEffect } from 'react';

export const COUNTRY_CODES = [
  { code: '+55', label: '+55 Brasil' },
  { code: '+1',  label: '+1 EUA / Canadá' },
  { code: '+44', label: '+44 Reino Unido' },
  { code: '+49', label: '+49 Alemanha' },
  { code: '+33', label: '+33 França' },
  { code: '+34', label: '+34 Espanha' },
  { code: '+39', label: '+39 Itália' },
  { code: '+54', label: '+54 Argentina' },
  { code: '+56', label: '+56 Chile' },
  { code: '+57', label: '+57 Colômbia' },
  { code: '+51', label: '+51 Peru' },
  { code: '+598', label: '+598 Uruguai' },
  { code: '+595', label: '+595 Paraguai' },
  { code: '+591', label: '+591 Bolívia' },
  { code: '+58', label: '+58 Venezuela' },
  { code: '+86', label: '+86 China' },
  { code: '+81', label: '+81 Japão' },
];

// Sorted longest-first for safe prefix matching
const SORTED_CODES = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);

/** Extract country prefix and local digits from a stored phone string. */
export function parsePhonePrefix(stored: string): { prefix: string; localDigits: string } {
  if (!stored) return { prefix: '+55', localDigits: '' };
  const allDigits = stored.replace(/\D/g, '');
  if (stored.startsWith('+')) {
    for (const { code } of SORTED_CODES) {
      const codeDigits = code.replace(/\D/g, '');
      if (allDigits.startsWith(codeDigits)) {
        return { prefix: code, localDigits: allDigits.slice(codeDigits.length) };
      }
    }
  }
  return { prefix: '+55', localDigits: allDigits };
}

interface PhonePrefixDropdownProps {
  prefix: string;
  onChange: (prefix: string) => void;
}

export function PhonePrefixDropdown({ prefix, onChange }: PhonePrefixDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input-field"
        style={{ width: '68px', cursor: 'pointer', textAlign: 'center', fontWeight: 600, fontSize: '0.82rem', userSelect: 'none' }}
      >
        {prefix}
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 200,
          background: 'var(--color-surface, #fff)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
          minWidth: '190px',
          maxHeight: '220px',
          overflowY: 'auto',
        }}>
          {COUNTRY_CODES.map((c) => (
            <div
              key={c.code}
              onMouseDown={(e) => { e.preventDefault(); onChange(c.code); setOpen(false); }}
              style={{
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: '0.82rem',
                background: c.code === prefix ? 'var(--color-primary)' : 'transparent',
                color: c.code === prefix ? '#fff' : 'var(--color-text)',
              }}
              onMouseEnter={(e) => { if (c.code !== prefix) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-alternate, rgba(0,0,0,0.05))'; }}
              onMouseLeave={(e) => { if (c.code !== prefix) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              {c.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

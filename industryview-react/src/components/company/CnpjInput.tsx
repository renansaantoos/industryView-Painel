import { useState, useCallback } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface CnpjInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}

function applyCnpjMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/**
 * Validates CNPJ check digits according to the Brazilian algorithm.
 */
function isValidCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;

  // Reject all-same-digit sequences
  if (/^(\d)\1+$/.test(digits)) return false;

  const calcDigit = (slice: string, weights: number[]): number => {
    const sum = slice.split('').reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const firstDigit = calcDigit(digits.slice(0, 12), weights1);
  if (firstDigit !== parseInt(digits[12])) return false;

  const secondDigit = calcDigit(digits.slice(0, 13), weights2);
  return secondDigit === parseInt(digits[13]);
}

export function CnpjInput({
  value,
  onChange,
  disabled,
  label = 'CNPJ',
  required,
}: CnpjInputProps) {
  const [touched, setTouched] = useState(false);

  const digits = value.replace(/\D/g, '');
  const isComplete = digits.length === 14;
  const isValid = isComplete && isValidCnpj(digits);
  const isInvalid = touched && isComplete && !isValid;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(applyCnpjMask(e.target.value));
  }, [onChange]);

  const handleBlur = () => setTouched(true);

  const showValid = touched && isComplete && isValid;

  return (
    <div className="input-group">
      <label>
        {label}
        {required && <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span>}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          className={`input-field ${isInvalid ? 'error' : ''}`}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="00.000.000/0000-00"
          maxLength={18}
          disabled={disabled}
          style={{ paddingRight: '36px' }}
        />
        {showValid && (
          <CheckCircle
            size={16}
            color="var(--color-success)"
            style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }}
          />
        )}
        {isInvalid && (
          <XCircle
            size={16}
            color="var(--color-error)"
            style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }}
          />
        )}
      </div>
      {isInvalid && (
        <span className="input-error">CNPJ inválido</span>
      )}
    </div>
  );
}

export default CnpjInput;

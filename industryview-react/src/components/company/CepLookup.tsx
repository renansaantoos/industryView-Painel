import { useState, useCallback } from 'react';
import { Search, Loader } from 'lucide-react';

export interface CepAddress {
  address_line: string;
  complemento: string;
  bairro: string;
  city: string;
  state: string;
}

interface CepLookupProps {
  value: string;
  onChange: (value: string) => void;
  onAddressFound: (address: CepAddress) => void;
  disabled?: boolean;
  error?: string;
}

const VIACEP_URL = 'https://viacep.com.br/ws';

function applyCepMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function CepLookup({ value, onChange, onAddressFound, disabled, error: externalError }: CepLookupProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCep = useCallback(async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${VIACEP_URL}/${digits}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        return;
      }

      onAddressFound({
        address_line: data.logradouro || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      });
    } catch {
      setError('Erro ao buscar CEP');
    } finally {
      setLoading(false);
    }
  }, [onAddressFound]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyCepMask(e.target.value);
    onChange(masked);
    if (error) setError('');
  };

  const handleBlur = () => {
    fetchCep(value);
  };

  const handleSearchClick = () => {
    fetchCep(value);
  };

  return (
    <div className="input-group">
      <label>CEP</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          className={`input-field ${error || externalError ? 'error' : ''}`}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="00000-000"
          maxLength={9}
          disabled={disabled || loading}
          style={{ paddingRight: '40px' }}
        />
        <button
          type="button"
          className="btn btn-icon"
          onClick={handleSearchClick}
          disabled={disabled || loading}
          style={{
            position: 'absolute',
            right: '4px',
            padding: '4px',
            minWidth: 'unset',
          }}
          title="Buscar CEP"
        >
          {loading
            ? <Loader size={16} color="var(--color-secondary-text)" style={{ animation: 'spin 0.8s linear infinite' }} />
            : <Search size={16} color="var(--color-secondary-text)" />
          }
        </button>
      </div>
      {error && <span className="input-error">{error}</span>}
      {!error && externalError && <span className="input-error">{externalError}</span>}
    </div>
  );
}

export default CepLookup;

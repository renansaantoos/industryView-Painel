import { useState, useEffect, useCallback } from 'react';
import { X, Save } from 'lucide-react';
import type { CompanyBranch, BranchPayload } from '../../types/company';
import CepLookup, { type CepAddress } from './CepLookup';
import CnpjInput from './CnpjInput';

interface BranchFormProps {
  /** Pass null to create, pass branch to edit */
  branch: CompanyBranch | null;
  onSave: (data: BranchPayload) => Promise<void>;
  onClose: () => void;
}

interface FormState {
  brand_name: string;
  legal_name: string;
  cnpj: string;
  inscricao_estadual: string;
  inscricao_municipal: string;
  cnae: string;
  phone: string;
  email: string;
  website: string;
  cep: string;
  address_line: string;
  complemento: string;
  numero: string;
  bairro: string;
  city: string;
  state: string;
  pais: string;
  responsavel_legal: string;
  responsavel_cpf: string;
  ativo: boolean;
}

const emptyForm: FormState = {
  brand_name: '',
  legal_name: '',
  cnpj: '',
  inscricao_estadual: '',
  inscricao_municipal: '',
  cnae: '',
  phone: '',
  email: '',
  website: '',
  cep: '',
  address_line: '',
  complemento: '',
  numero: '',
  bairro: '',
  city: '',
  state: '',
  pais: 'Brasil',
  responsavel_legal: '',
  responsavel_cpf: '',
  ativo: true,
};

function branchToForm(branch: CompanyBranch): FormState {
  return {
    brand_name: branch.brand_name || '',
    legal_name: branch.legal_name || '',
    cnpj: branch.cnpj || '',
    inscricao_estadual: branch.inscricao_estadual || '',
    inscricao_municipal: branch.inscricao_municipal || '',
    cnae: branch.cnae || '',
    phone: branch.phone || '',
    email: branch.email || '',
    website: branch.website || '',
    cep: branch.cep || '',
    address_line: branch.address_line || '',
    complemento: branch.complemento || '',
    numero: branch.numero || '',
    bairro: branch.bairro || '',
    city: branch.city || '',
    state: branch.state || '',
    pais: branch.pais || 'Brasil',
    responsavel_legal: branch.responsavel_legal || '',
    responsavel_cpf: branch.responsavel_cpf || '',
    ativo: branch.ativo,
  };
}

type Tab = 'identificacao' | 'contato' | 'endereco' | 'responsavel';

const TABS: { key: Tab; label: string }[] = [
  { key: 'identificacao', label: 'Identificação' },
  { key: 'contato', label: 'Contato' },
  { key: 'endereco', label: 'Endereço' },
  { key: 'responsavel', label: 'Responsável' },
];

// Map fields to their tabs
const FIELD_TAB_MAP: Record<string, Tab> = {
  brand_name: 'identificacao',
  legal_name: 'identificacao',
  cnpj: 'identificacao',
  cnae: 'identificacao',
  phone: 'contato',
  email: 'contato',
  cep: 'endereco',
  address_line: 'endereco',
  numero: 'endereco',
  bairro: 'endereco',
  city: 'endereco',
  state: 'endereco',
  responsavel_legal: 'responsavel',
  responsavel_cpf: 'responsavel',
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export function BranchForm({ branch, onSave, onClose }: BranchFormProps) {
  const isEditing = branch !== null;
  const [form, setForm] = useState<FormState>(isEditing ? branchToForm(branch) : emptyForm);
  const [activeTab, setActiveTab] = useState<Tab>('identificacao');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setForm(isEditing ? branchToForm(branch) : emptyForm);
    setActiveTab('identificacao');
    setError('');
    setFieldErrors({});
  }, [branch, isEditing]);

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setFieldErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleAddressFound = useCallback((address: CepAddress) => {
    setForm(prev => ({
      ...prev,
      address_line: address.address_line || prev.address_line,
      complemento: address.complemento || prev.complemento,
      bairro: address.bairro || prev.bairro,
      city: address.city || prev.city,
      state: address.state || prev.state,
    }));
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next.address_line;
      delete next.bairro;
      delete next.city;
      delete next.state;
      return next;
    });
  }, []);

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    // Identificação
    if (!form.brand_name.trim()) errors.brand_name = 'Nome Fantasia é obrigatório';
    if (!form.legal_name.trim()) errors.legal_name = 'Razão Social é obrigatória';
    if (!form.cnpj.replace(/\D/g, '')) errors.cnpj = 'CNPJ é obrigatório';
    else if (form.cnpj.replace(/\D/g, '').length !== 14) errors.cnpj = 'CNPJ deve ter 14 dígitos';
    if (!form.cnae.replace(/\D/g, '')) errors.cnae = 'CNAE é obrigatório';
    else if (form.cnae.replace(/\D/g, '').length !== 7) errors.cnae = 'CNAE deve ter 7 dígitos';

    // Contato
    if (!form.phone.replace(/\D/g, '')) errors.phone = 'Telefone é obrigatório';
    else if (form.phone.replace(/\D/g, '').length < 10) errors.phone = 'Telefone inválido';
    if (!form.email.trim()) errors.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'E-mail inválido';

    // Endereço
    if (!form.cep.replace(/\D/g, '')) errors.cep = 'CEP é obrigatório';
    if (!form.address_line.trim()) errors.address_line = 'Logradouro é obrigatório';
    if (!form.numero.trim()) errors.numero = 'Número é obrigatório';
    if (!form.bairro.trim()) errors.bairro = 'Bairro é obrigatório';
    if (!form.city.trim()) errors.city = 'Cidade é obrigatória';
    if (!form.state.trim()) errors.state = 'UF é obrigatória';

    // Responsável
    if (!form.responsavel_legal.trim()) errors.responsavel_legal = 'Nome do responsável é obrigatório';
    if (!form.responsavel_cpf.replace(/\D/g, '')) errors.responsavel_cpf = 'CPF é obrigatório';
    else if (form.responsavel_cpf.replace(/\D/g, '').length !== 11) errors.responsavel_cpf = 'CPF deve ter 11 dígitos';

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Navigate to the first tab that has errors
      const firstErrorField = Object.keys(errors)[0];
      const targetTab = FIELD_TAB_MAP[firstErrorField];
      if (targetTab) setActiveTab(targetTab);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    setError('');
    try {
      const payload: BranchPayload = {
        brand_name: form.brand_name.trim(),
        legal_name: form.legal_name.trim() || undefined,
        cnpj: form.cnpj.replace(/\D/g, '') ? form.cnpj : undefined,
        inscricao_estadual: form.inscricao_estadual.trim() || undefined,
        inscricao_municipal: form.inscricao_municipal.trim() || undefined,
        cnae: form.cnae.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        website: form.website.trim() || undefined,
        cep: form.cep.replace(/\D/g, '') || undefined,
        address_line: form.address_line.trim() || undefined,
        complemento: form.complemento.trim() || undefined,
        numero: form.numero.trim() || undefined,
        bairro: form.bairro.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pais: form.pais.trim() || undefined,
        responsavel_legal: form.responsavel_legal.trim() || undefined,
        responsavel_cpf: form.responsavel_cpf.replace(/\D/g, '') || undefined,
        ativo: form.ativo,
      };
      await onSave(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar filial');
    } finally {
      setSaving(false);
    }
  };

  // Count errors per tab for indicators
  const tabErrorCount = (tab: Tab): number => {
    return Object.keys(fieldErrors).filter(k => FIELD_TAB_MAP[k] === tab).length;
  };

  const inputField = (
    label: string,
    key: keyof FormState,
    opts?: { placeholder?: string; type?: string; required?: boolean }
  ) => (
    <div className="input-group">
      <label>
        {label}
        {opts?.required && <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span>}
      </label>
      <input
        type={opts?.type || 'text'}
        className={`input-field ${fieldErrors[key] ? 'error' : ''}`}
        value={form[key] as string}
        onChange={e => setField(key, e.target.value as FormState[typeof key])}
        placeholder={opts?.placeholder}
      />
      {fieldErrors[key] && <span className="input-error">{fieldErrors[key]}</span>}
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ width: '640px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
            {isEditing ? 'Editar Filial' : 'Nova Filial'}
          </h3>
          <button className="btn btn-icon" onClick={onClose} title="Fechar">
            <X size={18} color="var(--color-secondary-text)" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '20px', borderBottom: '2px solid var(--color-alternate)' }}>
          {TABS.map(tab => {
            const errCount = tabErrorCount(tab.key);
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  color: activeTab === tab.key ? 'var(--color-primary)' : errCount > 0 ? 'var(--color-error)' : 'var(--color-secondary-text)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--color-primary)' : '2px solid transparent',
                  marginBottom: '-2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {tab.label}
                {errCount > 0 && (
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'var(--color-error)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {errCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '280px' }}>

          {activeTab === 'identificacao' && (
            <>
              {inputField('Nome Fantasia', 'brand_name', { placeholder: 'Nome Fantasia', required: true })}
              {inputField('Razão Social', 'legal_name', { placeholder: 'Razão Social', required: true })}
              <CnpjInput
                value={form.cnpj}
                onChange={v => setField('cnpj', v)}
                error={fieldErrors.cnpj}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {inputField('Inscrição Estadual', 'inscricao_estadual', { placeholder: 'Inscrição Estadual' })}
                {inputField('Inscrição Municipal', 'inscricao_municipal', { placeholder: 'Inscrição Municipal' })}
              </div>
              <div className="input-group">
                <label>CNAE <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span></label>
                <input
                  type="text"
                  className={`input-field ${fieldErrors.cnae ? 'error' : ''}`}
                  value={form.cnae}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 7);
                    let masked = digits;
                    if (digits.length > 4) masked = digits.slice(0, 4) + '-' + digits.slice(4);
                    if (digits.length > 5) masked = digits.slice(0, 4) + '-' + digits.slice(4, 5) + '/' + digits.slice(5);
                    setField('cnae', masked);
                  }}
                  placeholder="0000-0/00"
                  maxLength={9}
                />
                {fieldErrors.cnae && <span className="input-error">{fieldErrors.cnae}</span>}
              </div>
              {isEditing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500 }}>Filial Ativa</label>
                  <button
                    type="button"
                    onClick={() => setField('ativo', !form.ativo)}
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      border: 'none',
                      background: form.ativo ? 'var(--color-success)' : 'var(--color-alternate)',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                    role="switch"
                    aria-checked={form.ativo}
                    title={form.ativo ? 'Ativa' : 'Inativa'}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '2px',
                        left: form.ativo ? '22px' : '2px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'white',
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    />
                  </button>
                  <span style={{ fontSize: '13px', color: form.ativo ? 'var(--color-success)' : 'var(--color-secondary-text)' }}>
                    {form.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              )}
            </>
          )}

          {activeTab === 'contato' && (
            <>
              <div className="input-group">
                <label>Telefone <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span></label>
                <input
                  type="tel"
                  className={`input-field ${fieldErrors.phone ? 'error' : ''}`}
                  value={form.phone}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                    let masked = '';
                    if (digits.length === 0) masked = '';
                    else if (digits.length <= 2) masked = `(${digits}`;
                    else if (digits.length <= 7) masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
                    else if (digits.length <= 10) masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
                    else masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
                    setField('phone', masked);
                  }}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
                {fieldErrors.phone && <span className="input-error">{fieldErrors.phone}</span>}
              </div>
              <div className="input-group">
                <label>E-mail <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span></label>
                <input
                  type="email"
                  className={`input-field ${fieldErrors.email ? 'error' : ''}`}
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  placeholder="email@empresa.com.br"
                />
                {fieldErrors.email && <span className="input-error">{fieldErrors.email}</span>}
              </div>
              <div className="input-group">
                <label>Website</label>
                <input
                  type="url"
                  className="input-field"
                  value={form.website}
                  onChange={e => setField('website', e.target.value)}
                  placeholder="https://www.empresa.com.br"
                />
              </div>
            </>
          )}

          {activeTab === 'endereco' && (
            <>
              <CepLookup
                value={form.cep}
                onChange={v => setField('cep', v)}
                onAddressFound={handleAddressFound}
                error={fieldErrors.cep}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  {inputField('Logradouro', 'address_line', { placeholder: 'Rua, Avenida...', required: true })}
                </div>
                <div style={{ width: '100px' }}>
                  {inputField('Número', 'numero', { placeholder: 'Nº', required: true })}
                </div>
              </div>
              {inputField('Complemento', 'complemento', { placeholder: 'Apto, Sala...' })}
              {inputField('Bairro', 'bairro', { placeholder: 'Bairro', required: true })}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '12px' }}>
                <div>{inputField('Cidade', 'city', { placeholder: 'Cidade', required: true })}</div>
                <div>{inputField('UF', 'state', { placeholder: 'SP', required: true })}</div>
              </div>
              {inputField('País', 'pais', { placeholder: 'Brasil' })}
            </>
          )}

          {activeTab === 'responsavel' && (
            <>
              {inputField('Nome do Responsável Legal', 'responsavel_legal', { placeholder: 'Nome completo', required: true })}
              <div className="input-group">
                <label>CPF do Responsável <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span></label>
                <input
                  type="text"
                  className={`input-field ${fieldErrors.responsavel_cpf ? 'error' : ''}`}
                  value={form.responsavel_cpf}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                    let masked = digits;
                    if (digits.length > 3) masked = digits.slice(0, 3) + '.' + digits.slice(3);
                    if (digits.length > 6) masked = digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6);
                    if (digits.length > 9) masked = digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6, 9) + '-' + digits.slice(9);
                    setField('responsavel_cpf', masked);
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {fieldErrors.responsavel_cpf && <span className="input-error">{fieldErrors.responsavel_cpf}</span>}
              </div>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop: '16px', padding: '10px 12px', borderRadius: '8px', background: 'var(--color-status-05)', color: 'var(--color-error)', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <span className="spinner" /> : <><Save size={16} /> Salvar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BranchForm;

import { useState, useEffect, useCallback } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import type { CompanyBranch, BranchPayload, RepresentanteLegal } from '../../types/company';
import CepLookup, { type CepAddress } from './CepLookup';
import CnpjInput, { isValidCnpj } from './CnpjInput';
import { isValidCpf } from '../../utils/validators';

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
  contact_name: string;
  website: string;
  cep: string;
  address_line: string;
  complemento: string;
  numero: string;
  bairro: string;
  city: string;
  state: string;
  pais: string;
  representantes_legais: RepresentanteLegal[];
  ativo: boolean;
}

function formatCpfMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  let masked = digits;
  if (digits.length > 3) masked = digits.slice(0, 3) + '.' + digits.slice(3);
  if (digits.length > 6) masked = digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6);
  if (digits.length > 9) masked = digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6, 9) + '-' + digits.slice(9);
  return masked;
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
  contact_name: '',
  website: '',
  cep: '',
  address_line: '',
  complemento: '',
  numero: '',
  bairro: '',
  city: '',
  state: '',
  pais: 'Brasil',
  representantes_legais: [],
  ativo: true,
};

function branchToForm(branch: CompanyBranch): FormState {
  // Build representantes list from new field or fallback to legacy fields
  let representantes: RepresentanteLegal[] = [];
  if (branch.representantes_legais && branch.representantes_legais.length > 0) {
    representantes = branch.representantes_legais.map(r => ({
      nome: r.nome || '',
      cpf: r.cpf || '',
    }));
  } else if (branch.responsavel_legal) {
    representantes = [{
      nome: branch.responsavel_legal || '',
      cpf: branch.responsavel_cpf || '',
    }];
  }

  return {
    brand_name: branch.brand_name || '',
    legal_name: branch.legal_name || '',
    cnpj: branch.cnpj || '',
    inscricao_estadual: branch.inscricao_estadual || '',
    inscricao_municipal: branch.inscricao_municipal || '',
    cnae: branch.cnae || '',
    phone: branch.phone || '',
    email: branch.email || '',
    contact_name: branch.contact_name || '',
    website: branch.website || '',
    cep: branch.cep || '',
    address_line: branch.address_line || '',
    complemento: branch.complemento || '',
    numero: branch.numero || '',
    bairro: branch.bairro || '',
    city: branch.city || '',
    state: branch.state || '',
    pais: branch.pais || 'Brasil',
    representantes_legais: representantes,
    ativo: branch.ativo,
  };
}

type Tab = 'identificacao' | 'contato' | 'endereco' | 'responsavel';

const TABS: { key: Tab; label: string }[] = [
  { key: 'identificacao', label: 'Identificacao' },
  { key: 'contato', label: 'Contato' },
  { key: 'endereco', label: 'Endereco' },
  { key: 'responsavel', label: 'Responsavel' },
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
  representantes_legais: 'responsavel',
};

type FieldErrors = Partial<Record<string, string>>;

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

  // Representantes helpers
  const addRepresentante = () => {
    setForm(prev => ({
      ...prev,
      representantes_legais: [...prev.representantes_legais, { nome: '', cpf: '' }],
    }));
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next.representantes_legais;
      return next;
    });
  };

  const removeRepresentante = (index: number) => {
    setForm(prev => ({
      ...prev,
      representantes_legais: prev.representantes_legais.filter((_, i) => i !== index),
    }));
  };

  const updateRepresentante = (index: number, field: keyof RepresentanteLegal, value: string) => {
    setForm(prev => ({
      ...prev,
      representantes_legais: prev.representantes_legais.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      ),
    }));
    if (field === 'cpf') {
      setFieldErrors(prev => {
        if (!prev[`rep_cpf_${index}`]) return prev;
        const next = { ...prev };
        delete next[`rep_cpf_${index}`];
        return next;
      });
    }
  };

  const normalizeWebsite = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    // Identificacao
    if (!form.brand_name.trim()) errors.brand_name = 'Nome Fantasia e obrigatorio';
    if (!form.legal_name.trim()) errors.legal_name = 'Razao Social e obrigatoria';
    if (!form.cnpj.replace(/\D/g, '')) errors.cnpj = 'CNPJ e obrigatorio';
    else if (form.cnpj.replace(/\D/g, '').length < 14) errors.cnpj = 'CNPJ incompleto — informe todos os 14 dígitos';
    else if (!isValidCnpj(form.cnpj.replace(/\D/g, ''))) errors.cnpj = 'CNPJ inválido — verifique os dígitos informados';
    if (form.cnae.replace(/\D/g, '') && form.cnae.replace(/\D/g, '').length !== 7) errors.cnae = 'CNAE deve ter 7 digitos';

    // Contato
    if (!form.phone.replace(/\D/g, '')) errors.phone = 'Telefone e obrigatorio';
    else if (form.phone.replace(/\D/g, '').length < 10) errors.phone = 'Telefone invalido';
    if (!form.email.trim()) errors.email = 'E-mail e obrigatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'E-mail invalido';

    // Endereco
    if (!form.cep.replace(/\D/g, '')) errors.cep = 'CEP e obrigatorio';
    if (!form.address_line.trim()) errors.address_line = 'Logradouro e obrigatorio';
    if (!form.numero.trim()) errors.numero = 'Numero e obrigatorio';
    if (!form.bairro.trim()) errors.bairro = 'Bairro e obrigatorio';
    if (!form.city.trim()) errors.city = 'Cidade e obrigatoria';
    if (!form.state.trim()) errors.state = 'UF e obrigatoria';

    // Responsavel - at least one representante with nome filled
    const validReps = form.representantes_legais.filter(r => r.nome.trim());
    if (validReps.length === 0) errors.representantes_legais = 'Pelo menos um representante legal e obrigatorio';

    // CPF validation per representante
    form.representantes_legais.forEach((r, i) => {
      const cpfDigits = r.cpf.replace(/\D/g, '');
      if (cpfDigits && !isValidCpf(cpfDigits)) {
        errors[`rep_cpf_${i}`] = 'CPF inválido';
      }
    });

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
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
      // Build representantes - filter out empty entries and strip CPF mask
      const representantes = form.representantes_legais
        .filter(r => r.nome.trim())
        .map(r => ({
          nome: r.nome.trim(),
          cpf: r.cpf.replace(/\D/g, ''),
        }));

      // Keep legacy fields in sync
      const firstRep = representantes[0];

      const payload: BranchPayload = {
        brand_name: form.brand_name.trim(),
        legal_name: form.legal_name.trim() || undefined,
        cnpj: form.cnpj.replace(/\D/g, '') ? form.cnpj : undefined,
        inscricao_estadual: form.inscricao_estadual.trim() || undefined,
        inscricao_municipal: form.inscricao_municipal.trim() || undefined,
        cnae: form.cnae.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        contact_name: form.contact_name.trim() || null,
        website: normalizeWebsite(form.website),
        cep: form.cep.replace(/\D/g, '') || undefined,
        address_line: form.address_line.trim() || undefined,
        complemento: form.complemento.trim() || undefined,
        numero: form.numero.trim() || undefined,
        bairro: form.bairro.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pais: form.pais.trim() || undefined,
        responsavel_legal: firstRep?.nome || undefined,
        responsavel_cpf: firstRep?.cpf || undefined,
        representantes_legais: representantes.length > 0 ? representantes : null,
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
    return Object.keys(fieldErrors).filter(k => {
      if (FIELD_TAB_MAP[k]) return FIELD_TAB_MAP[k] === tab;
      if (k.startsWith('rep_')) return tab === 'responsavel';
      return false;
    }).length;
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
              {inputField('Razao Social', 'legal_name', { placeholder: 'Razao Social', required: true })}
              <CnpjInput
                value={form.cnpj}
                onChange={v => setField('cnpj', v)}
                error={fieldErrors.cnpj}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {inputField('Inscricao Estadual', 'inscricao_estadual', { placeholder: 'Inscricao Estadual' })}
                {inputField('Inscricao Municipal', 'inscricao_municipal', { placeholder: 'Inscricao Municipal' })}
              </div>
              <div className="input-group">
                <label>CNAE</label>
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
              {inputField('Nome do Contato', 'contact_name', { placeholder: 'Nome da pessoa de contato' })}
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
                  type="text"
                  className="input-field"
                  value={form.website}
                  onChange={e => setField('website', e.target.value)}
                  placeholder="www.empresa.com.br"
                />
                <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
                  O protocolo https:// sera adicionado automaticamente se nao informado
                </span>
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
                  {inputField('Numero', 'numero', { placeholder: 'No', required: true })}
                </div>
              </div>
              {inputField('Complemento', 'complemento', { placeholder: 'Apto, Sala...' })}
              {inputField('Bairro', 'bairro', { placeholder: 'Bairro', required: true })}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '12px' }}>
                <div>{inputField('Cidade', 'city', { placeholder: 'Cidade', required: true })}</div>
                <div>{inputField('UF', 'state', { placeholder: 'SP', required: true })}</div>
              </div>
              {inputField('Pais', 'pais', { placeholder: 'Brasil' })}
            </>
          )}

          {activeTab === 'responsavel' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>
                  Representantes Legais <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span>
                </label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addRepresentante}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>

              {fieldErrors.representantes_legais && (
                <span className="input-error">{fieldErrors.representantes_legais}</span>
              )}

              {form.representantes_legais.length === 0 && (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: 'var(--color-secondary-text)',
                  fontSize: '13px',
                  border: `1px dashed ${fieldErrors.representantes_legais ? 'var(--color-error)' : 'var(--color-alternate)'}`,
                  borderRadius: '8px',
                }}>
                  Nenhum representante legal adicionado. Clique em "Adicionar" para incluir.
                </div>
              )}

              {form.representantes_legais.map((rep, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    border: '1px solid var(--color-alternate)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)' }}>
                      Representante {index + 1}
                    </span>
                    <button
                      type="button"
                      className="btn btn-icon"
                      onClick={() => removeRepresentante(index)}
                      title="Remover representante"
                    >
                      <Trash2 size={14} color="var(--color-error)" />
                    </button>
                  </div>
                  <div className="input-group">
                    <label>Nome</label>
                    <input
                      type="text"
                      className="input-field"
                      value={rep.nome}
                      onChange={e => updateRepresentante(index, 'nome', e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="input-group">
                    <label>CPF</label>
                    <input
                      type="text"
                      className={`input-field${fieldErrors[`rep_cpf_${index}`] ? ' error' : ''}`}
                      value={rep.cpf}
                      onChange={e => updateRepresentante(index, 'cpf', formatCpfMask(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    {fieldErrors[`rep_cpf_${index}`] && (
                      <span className="input-error">{fieldErrors[`rep_cpf_${index}`]}</span>
                    )}
                  </div>
                </div>
              ))}
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

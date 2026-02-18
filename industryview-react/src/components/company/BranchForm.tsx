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

export function BranchForm({ branch, onSave, onClose }: BranchFormProps) {
  const isEditing = branch !== null;
  const [form, setForm] = useState<FormState>(isEditing ? branchToForm(branch) : emptyForm);
  const [activeTab, setActiveTab] = useState<Tab>('identificacao');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(isEditing ? branchToForm(branch) : emptyForm);
    setActiveTab('identificacao');
    setError('');
  }, [branch, isEditing]);

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
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
  }, []);

  const handleSubmit = async () => {
    if (!form.brand_name.trim()) {
      setError('O Nome Fantasia é obrigatório');
      setActiveTab('identificacao');
      return;
    }

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
        className="input-field"
        value={form[key] as string}
        onChange={e => setField(key, e.target.value as FormState[typeof key])}
        placeholder={opts?.placeholder}
      />
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
          {TABS.map(tab => (
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
                color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-secondary-text)',
                borderBottom: activeTab === tab.key ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: '-2px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '280px' }}>

          {activeTab === 'identificacao' && (
            <>
              {inputField('Nome Fantasia', 'brand_name', { placeholder: 'Nome Fantasia', required: true })}
              {inputField('Razão Social', 'legal_name', { placeholder: 'Razão Social' })}
              <CnpjInput
                value={form.cnpj}
                onChange={v => setField('cnpj', v)}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {inputField('Inscrição Estadual', 'inscricao_estadual', { placeholder: 'Inscrição Estadual' })}
                {inputField('Inscrição Municipal', 'inscricao_municipal', { placeholder: 'Inscrição Municipal' })}
              </div>
              {inputField('CNAE', 'cnae', { placeholder: '0000-0/00' })}
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
              {inputField('Telefone', 'phone', { placeholder: '(00) 00000-0000' })}
              {inputField('E-mail', 'email', { type: 'email', placeholder: 'email@empresa.com.br' })}
              {inputField('Website', 'website', { placeholder: 'https://www.empresa.com.br' })}
            </>
          )}

          {activeTab === 'endereco' && (
            <>
              <CepLookup
                value={form.cep}
                onChange={v => setField('cep', v)}
                onAddressFound={handleAddressFound}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  {inputField('Logradouro', 'address_line', { placeholder: 'Rua, Avenida...' })}
                </div>
                <div style={{ width: '100px' }}>
                  {inputField('Número', 'numero', { placeholder: 'Nº' })}
                </div>
              </div>
              {inputField('Complemento', 'complemento', { placeholder: 'Apto, Sala...' })}
              {inputField('Bairro', 'bairro', { placeholder: 'Bairro' })}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '12px' }}>
                <div>{inputField('Cidade', 'city', { placeholder: 'Cidade' })}</div>
                <div>{inputField('UF', 'state', { placeholder: 'SP' })}</div>
              </div>
              {inputField('País', 'pais', { placeholder: 'Brasil' })}
            </>
          )}

          {activeTab === 'responsavel' && (
            <>
              {inputField('Nome do Responsável Legal', 'responsavel_legal', { placeholder: 'Nome completo' })}
              {inputField('CPF do Responsável', 'responsavel_cpf', { placeholder: '000.000.000-00' })}
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

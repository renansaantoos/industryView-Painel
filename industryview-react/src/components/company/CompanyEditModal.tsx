import { useState, useEffect, useCallback } from 'react';
import { X, Save } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CompanyFull, CompanyUpdatePayload, RegimeTributario } from '../../types/company';
import CepLookup, { type CepAddress } from './CepLookup';
import CnpjInput from './CnpjInput';
import SearchableSelect from '../common/SearchableSelect';
import { modalBackdropVariants, modalContentVariants } from '../../lib/motion';

interface CompanyEditModalProps {
  isOpen?: boolean;
  company: CompanyFull;
  onSave: (data: CompanyUpdatePayload) => Promise<void>;
  onClose: () => void;
}

interface FormState {
  brand_name: string;
  legal_name: string;
  cnpj: string;
  inscricao_estadual: string;
  inscricao_municipal: string;
  cnae: string;
  regime_tributario: RegimeTributario | '';
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
}

const REGIME_OPTIONS: { value: RegimeTributario; label: string }[] = [
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
  { value: 'mei', label: 'MEI' },
  { value: 'isento', label: 'Isento' },
];

type Tab = 'identificacao' | 'contato' | 'endereco' | 'responsavel';

const TABS: { key: Tab; label: string }[] = [
  { key: 'identificacao', label: 'Identificacao' },
  { key: 'contato', label: 'Contato' },
  { key: 'endereco', label: 'Endereco' },
  { key: 'responsavel', label: 'Responsavel Legal' },
];

function companyToForm(company: CompanyFull): FormState {
  return {
    brand_name: company.brand_name || '',
    legal_name: company.legal_name || '',
    cnpj: company.cnpj || '',
    inscricao_estadual: company.inscricao_estadual || '',
    inscricao_municipal: company.inscricao_municipal || '',
    cnae: company.cnae || '',
    regime_tributario: company.regime_tributario || '',
    phone: company.phone || '',
    email: company.email || '',
    website: company.website || '',
    cep: company.cep || '',
    address_line: company.address_line || '',
    complemento: company.complemento || '',
    numero: company.numero || '',
    bairro: company.bairro || '',
    city: company.city || '',
    state: company.state || '',
    pais: company.pais || 'Brasil',
    responsavel_legal: company.responsavel_legal || '',
    responsavel_cpf: company.responsavel_cpf || '',
  };
}

export function CompanyEditModal({ isOpen = true, company, onSave, onClose }: CompanyEditModalProps) {
  const [form, setForm] = useState<FormState>(companyToForm(company));
  const [activeTab, setActiveTab] = useState<Tab>('identificacao');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(companyToForm(company));
  }, [company]);

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
      setError('O Nome Fantasia e obrigatorio');
      setActiveTab('identificacao');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload: CompanyUpdatePayload = {
        brand_name: form.brand_name.trim(),
        legal_name: form.legal_name.trim() || undefined,
        cnpj: form.cnpj || undefined,
        inscricao_estadual: form.inscricao_estadual.trim() || undefined,
        inscricao_municipal: form.inscricao_municipal.trim() || undefined,
        cnae: form.cnae.trim() || undefined,
        regime_tributario: (form.regime_tributario as RegimeTributario) || undefined,
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
      };
      await onSave(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar empresa');
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
          style={{ animation: 'none' }}
        >
          <motion.div
            className="modal-content"
            variants={modalContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={e => e.stopPropagation()}
            style={{ width: '680px', padding: '24px' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Editar Empresa</h3>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '300px' }}>

              {activeTab === 'identificacao' && (
                <>
                  {inputField('Nome Fantasia', 'brand_name', { placeholder: 'Nome Fantasia', required: true })}
                  {inputField('Razao Social', 'legal_name', { placeholder: 'Razao Social' })}
                  <CnpjInput
                    value={form.cnpj}
                    onChange={v => setField('cnpj', v)}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {inputField('Inscricao Estadual', 'inscricao_estadual')}
                    {inputField('Inscricao Municipal', 'inscricao_municipal')}
                  </div>
                  {inputField('CNAE', 'cnae', { placeholder: '0000-0/00' })}
                  <div className="input-group">
                    <label>Regime Tributario</label>
                    <SearchableSelect
                      options={REGIME_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                      value={form.regime_tributario || undefined}
                      onChange={(value) => setField('regime_tributario', (value as RegimeTributario) || '')}
                      placeholder="Selecione o regime tributario"
                      searchPlaceholder="Pesquisar..."
                    />
                  </div>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
                    <div>{inputField('Logradouro', 'address_line', { placeholder: 'Rua, Avenida...' })}</div>
                    <div>{inputField('Numero', 'numero', { placeholder: 'No' })}</div>
                  </div>
                  {inputField('Complemento', 'complemento', { placeholder: 'Apto, Sala...' })}
                  {inputField('Bairro', 'bairro')}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '12px' }}>
                    <div>{inputField('Cidade', 'city')}</div>
                    <div>{inputField('UF', 'state', { placeholder: 'SP' })}</div>
                  </div>
                  {inputField('Pais', 'pais', { placeholder: 'Brasil' })}
                </>
              )}

              {activeTab === 'responsavel' && (
                <>
                  {inputField('Nome do Responsavel Legal', 'responsavel_legal', { placeholder: 'Nome completo' })}
                  {inputField('CPF do Responsavel', 'responsavel_cpf', { placeholder: '000.000.000-00' })}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CompanyEditModal;

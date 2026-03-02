import { useState, useEffect, useCallback } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CompanyFull, CompanyUpdatePayload, RegimeTributario, RepresentanteLegal } from '../../types/company';
import CepLookup, { type CepAddress } from './CepLookup';
import CnpjInput, { isValidCnpj } from './CnpjInput';
import SearchableSelect from '../common/SearchableSelect';
import { modalBackdropVariants, modalContentVariants } from '../../lib/motion';
import { isValidCpf } from '../../utils/validators';

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

function formatCpfMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  let masked = digits;
  if (digits.length > 3) masked = digits.slice(0, 3) + '.' + digits.slice(3);
  if (digits.length > 6) masked = digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6);
  if (digits.length > 9) masked = digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6, 9) + '-' + digits.slice(9);
  return masked;
}

function companyToForm(company: CompanyFull): FormState {
  // Build representantes list from new field or fallback to legacy fields
  let representantes: RepresentanteLegal[] = [];
  if (company.representantes_legais && company.representantes_legais.length > 0) {
    representantes = company.representantes_legais.map(r => ({
      nome: r.nome || '',
      cpf: r.cpf || '',
    }));
  } else if (company.responsavel_legal) {
    representantes = [{
      nome: company.responsavel_legal || '',
      cpf: company.responsavel_cpf || '',
    }];
  }

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
    contact_name: company.contact_name || '',
    website: company.website || '',
    cep: company.cep || '',
    address_line: company.address_line || '',
    complemento: company.complemento || '',
    numero: company.numero || '',
    bairro: company.bairro || '',
    city: company.city || '',
    state: company.state || '',
    pais: company.pais || 'Brasil',
    representantes_legais: representantes,
  };
}

export function CompanyEditModal({ isOpen = true, company, onSave, onClose }: CompanyEditModalProps) {
  const [form, setForm] = useState<FormState>(companyToForm(company));
  const [activeTab, setActiveTab] = useState<Tab>('identificacao');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cpfErrors, setCpfErrors] = useState<Record<number, string>>({});

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

  // Representantes helpers
  const addRepresentante = () => {
    setForm(prev => ({
      ...prev,
      representantes_legais: [...prev.representantes_legais, { nome: '', cpf: '' }],
    }));
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
      setCpfErrors(prev => {
        if (!prev[index]) return prev;
        const next = { ...prev };
        delete next[index];
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

  const handleSubmit = async () => {
    if (!form.brand_name.trim()) {
      setError('O Nome Fantasia e obrigatorio');
      setActiveTab('identificacao');
      return;
    }

    const cnpjDigits = form.cnpj.replace(/\D/g, '');
    if (cnpjDigits.length > 0 && cnpjDigits.length < 14) {
      setError('CNPJ incompleto — informe todos os 14 dígitos');
      setActiveTab('identificacao');
      return;
    }
    if (cnpjDigits.length === 14 && !isValidCnpj(cnpjDigits)) {
      setError('CNPJ inválido — verifique os dígitos informados');
      setActiveTab('identificacao');
      return;
    }

    const newCpfErrors: Record<number, string> = {};
    form.representantes_legais.forEach((r, i) => {
      const cpfDigits = r.cpf.replace(/\D/g, '');
      if (cpfDigits && !isValidCpf(cpfDigits)) {
        newCpfErrors[i] = 'CPF inválido';
      }
    });
    if (Object.keys(newCpfErrors).length > 0) {
      setCpfErrors(newCpfErrors);
      setActiveTab('responsavel');
      return;
    }

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

      // Keep legacy fields in sync for backward compatibility
      const firstRep = representantes[0];

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
        responsavel_legal: firstRep?.nome ?? undefined,
        responsavel_cpf: firstRep?.cpf ?? undefined,
        representantes_legais: representantes.length > 0 ? representantes : undefined,
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
                  <div className="input-group">
                    <label>CNAE</label>
                    <input
                      type="text"
                      className="input-field"
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
                  </div>
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
                  {inputField('Nome do Contato', 'contact_name', { placeholder: 'Nome da pessoa de contato' })}
                  <div className="input-group">
                    <label>Telefone</label>
                    <input
                      type="tel"
                      className="input-field"
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
                  </div>
                  <div className="input-group">
                    <label>E-mail</label>
                    <input
                      type="email"
                      className="input-field"
                      value={form.email}
                      onChange={e => setField('email', e.target.value)}
                      placeholder="email@empresa.com.br"
                    />
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 500 }}>Representantes Legais</label>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={addRepresentante}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>

                  {form.representantes_legais.length === 0 && (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: 'var(--color-secondary-text)',
                      fontSize: '13px',
                      border: '1px dashed var(--color-alternate)',
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
                          className={`input-field${cpfErrors[index] ? ' error' : ''}`}
                          value={rep.cpf}
                          onChange={e => updateRepresentante(index, 'cpf', formatCpfMask(e.target.value))}
                          placeholder="000.000.000-00"
                          maxLength={14}
                        />
                        {cpfErrors[index] && (
                          <span className="input-error">{cpfErrors[index]}</span>
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CompanyEditModal;

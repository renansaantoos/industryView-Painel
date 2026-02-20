import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { pageVariants, fadeUpChild } from '../../lib/motion';
import { usersApi, employeesApi } from '../../services';
import type { EmployeeHrData } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import SearchableSelect from '../../components/common/SearchableSelect';
import { ArrowLeft, Save, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type HrFormData = Omit<EmployeeHrData, 'id' | 'users_id' | 'foto_documento_url' | 'created_at' | 'updated_at' | 'user'>;

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

// ─── Required fields config (field → { message, section }) ───────────────────
// Based on Brazilian labor law (CLT/eSocial), HR best practices, and UX:
//
// Dados Pessoais: CPF (identificador único), Data Nascimento (eSocial/benefícios)
// Endereço: CEP, Logradouro, Número, Bairro, Cidade, Estado (exigência eSocial)
// Profissional: Data Admissão, Cargo, Tipo Contrato (registro CLT obrigatório)
// Emergência: Nome, Telefone (NR de segurança industrial)
// CNH, Bancário, Escolaridade, Observações: opcionais (preenchidos quando necessário)

const REQUIRED_HR_FIELDS: Record<string, { message: string; section: string }> = {
  // Dados Pessoais
  nome_completo:       { message: 'Nome completo é obrigatório',      section: 'pessoal' },
  cpf:                 { message: 'CPF é obrigatório',                section: 'pessoal' },
  data_nascimento:     { message: 'Data de nascimento é obrigatória', section: 'pessoal' },
  // Endereço
  cep:                 { message: 'CEP é obrigatório',                section: 'endereco' },
  logradouro:          { message: 'Logradouro é obrigatório',         section: 'endereco' },
  numero:              { message: 'Número é obrigatório',             section: 'endereco' },
  bairro:              { message: 'Bairro é obrigatório',             section: 'endereco' },
  cidade:              { message: 'Cidade é obrigatória',             section: 'endereco' },
  estado:              { message: 'Estado é obrigatório',             section: 'endereco' },
  // Dados Profissionais
  data_admissao:       { message: 'Data de admissão é obrigatória',   section: 'profissional' },
  cargo:               { message: 'Cargo é obrigatório',              section: 'profissional' },
  tipo_contrato:       { message: 'Tipo de contrato é obrigatório',   section: 'profissional' },
  // Contato de Emergência
  emergencia_nome:     { message: 'Nome do contato é obrigatório',    section: 'emergencia' },
  emergencia_telefone: { message: 'Telefone de emergência é obrigatório', section: 'emergencia' },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_HR_FORM: HrFormData = {
  nome_completo: '', cpf: '', rg: '', rg_orgao_emissor: '', rg_data_emissao: '', data_nascimento: '',
  genero: '', estado_civil: '', nacionalidade: '', naturalidade: '', nome_mae: '', nome_pai: '',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
  matricula: '', data_admissao: '', data_demissao: '', tipo_contrato: '', cargo: '', departamento: '',
  salario: undefined, jornada_trabalho: '', pis_pasep: '', ctps_numero: '', ctps_serie: '', ctps_uf: '',
  cnh_numero: '', cnh_categoria: '', cnh_validade: '',
  banco_nome: '', banco_agencia: '', banco_conta: '', banco_tipo_conta: '', banco_pix: '',
  emergencia_nome: '', emergencia_parentesco: '', emergencia_telefone: '',
  escolaridade: '', curso: '', instituicao: '', observacoes: '',
};

const SECTION_HEADER_STYLE: React.CSSProperties = {
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
  padding: '12px 0', borderBottom: '1px solid var(--color-alternate)',
  marginBottom: 12, fontWeight: 600, fontSize: 15, userSelect: 'none',
};

const SECTION_GRID_STYLE: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24,
};

const SECTION_GRID_FULL_STYLE: React.CSSProperties = {
  ...SECTION_GRID_STYLE, gridTemplateColumns: '1fr',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, isOpen, onToggle, children, fullWidth = false, errorCount = 0 }: {
  title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode; fullWidth?: boolean; errorCount?: number;
}) {
  const hasErrors = errorCount > 0;
  return (
    <div>
      <div style={SECTION_HEADER_STYLE} onClick={onToggle} role="button" aria-expanded={isOpen}>
        {isOpen
          ? <ChevronDown size={16} color={hasErrors ? 'var(--color-error)' : 'var(--color-primary)'} />
          : <ChevronRight size={16} color={hasErrors ? 'var(--color-error)' : 'var(--color-secondary-text)'} />}
        <span style={{ color: isOpen ? (hasErrors ? 'var(--color-error)' : 'var(--color-primary)') : (hasErrors ? 'var(--color-error)' : 'var(--color-primary-text)') }}>
          {title}
        </span>
        {hasErrors && !isOpen && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 8,
            fontSize: 12, color: 'var(--color-error)', fontWeight: 500,
          }}>
            <AlertCircle size={14} />
            {errorCount} {errorCount === 1 ? 'campo obrigatório' : 'campos obrigatórios'}
          </span>
        )}
      </div>
      {isOpen && <div style={fullWidth ? SECTION_GRID_FULL_STYLE : SECTION_GRID_STYLE}>{children}</div>}
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="input-group">
      <label style={{ fontSize: 12, fontWeight: 500, color: error ? 'var(--color-error)' : 'var(--color-secondary-text)', marginBottom: 4, display: 'block' }}>
        {label}{required && ' *'}
      </label>
      {children}
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === parseInt(digits[10]);
}

// ─── Input masks ─────────────────────────────────────────────────────────────

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskCep(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

function maskRg(value: string): string {
  // Aceita dígitos + X no final (dígito verificador)
  const clean = value.replace(/[^\dXx]/g, '').toUpperCase().slice(0, 10);
  const d = clean.replace(/X/g, '');
  const hasX = clean.endsWith('X') && d.length >= 9;
  const digits = d.slice(0, 9);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  const base = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}`;
  return hasX ? `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-X` : base;
}

function maskCnh(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

/** Máscara moeda BR: digita da direita p/ esquerda em centavos. Ex: 150000 → "1.500,00" */
function maskCurrency(value: string): string {
  const d = value.replace(/\D/g, '').replace(/^0+/, '');
  if (!d) return '0,00';
  const padded = d.padStart(3, '0');
  const cents = padded.slice(-2);
  const intPart = padded.slice(0, -2);
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted},${cents}`;
}

/** Converte "1.500,00" → 1500.00 (number) */
function parseCurrency(masked: string): number {
  const raw = masked.replace(/\./g, '').replace(',', '.');
  return parseFloat(raw) || 0;
}

/** Agência bancária: XXXX-X */
function maskAgencia(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 5);
  if (d.length <= 4) return d;
  return `${d.slice(0, 4)}-${d.slice(4)}`;
}

/** Conta bancária: até 8 dígitos + dígito verificador → XXXXXXXX-X */
function maskConta(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 9);
  if (d.length <= 1) return d;
  return `${d.slice(0, -1)}-${d.slice(-1)}`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EmployeeCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Basic user fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // HR data
  const [form, setForm] = useState<HrFormData>(EMPTY_HR_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [salarioDisplay, setSalarioDisplay] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    pessoal: true, endereco: false, profissional: false,
    cnh: false, bancario: false, emergencia: false, escolaridade: false, observacoes: false,
  });

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  function clearError(field: string) {
    setFieldErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleChange(field: keyof HrFormData, value: string | number | undefined) {
    setForm(prev => ({ ...prev, [field]: value }));
    clearError(field);
  }

  function toggleSection(section: string) {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  function countSectionErrors(section: string): number {
    let count = Object.entries(REQUIRED_HR_FIELDS)
      .filter(([field, cfg]) => cfg.section === section && fieldErrors[field])
      .length;
    if (section === 'pessoal') {
      count += fieldErrors.email ? 1 : 0;
    }
    return count;
  }

  const lastFetchedCep = useRef('');

  const fetchCepData = useCallback(async (raw: string) => {
    if (raw.length !== 8 || raw === lastFetchedCep.current) return;
    lastFetchedCep.current = raw;
    setIsFetchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const json: ViaCepResponse = await res.json();
      if (json.erro) { showToast('CEP não encontrado.', 'error'); return; }
      setForm(prev => ({
        ...prev,
        logradouro: json.logradouro ?? prev.logradouro,
        bairro: json.bairro ?? prev.bairro,
        cidade: json.localidade ?? prev.cidade,
        estado: json.uf ?? prev.estado,
      }));
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.cep;
        if (json.logradouro) delete next.logradouro;
        if (json.bairro) delete next.bairro;
        if (json.localidade) delete next.cidade;
        if (json.uf) delete next.estado;
        return next;
      });
    } catch {
      showToast('Falha ao consultar CEP.', 'error');
    } finally {
      setIsFetchingCep(false);
    }
  }, []);

  async function handleSave() {
    const errors: Record<string, string> = {};

    // ── Basic fields ──
    if (!email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Formato de email inválido';
    }

    // ── HR required fields ──
    for (const [field, config] of Object.entries(REQUIRED_HR_FIELDS)) {
      const value = form[field as keyof HrFormData];
      if (value === undefined || value === null || String(value).trim() === '') {
        errors[field] = config.message;
      }
    }

    // ── Format validations ──
    const cpfRaw = form.cpf?.replace(/\D/g, '') ?? '';
    if (cpfRaw && !isValidCpf(cpfRaw)) {
      errors.cpf = 'CPF inválido';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Collect sections that have errors and open them
      const sectionsWithErrors = new Set<string>();
      if (errors.email) sectionsWithErrors.add('pessoal');
      for (const [field, config] of Object.entries(REQUIRED_HR_FIELDS)) {
        if (errors[field]) sectionsWithErrors.add(config.section);
      }
      if (errors.cpf) sectionsWithErrors.add('pessoal');

      setOpenSections(prev => {
        const next = { ...prev };
        sectionsWithErrors.forEach(s => { next[s] = true; });
        return next;
      });

      // Count total errors for toast summary
      const total = Object.keys(errors).length;
      showToast(`${total} ${total === 1 ? 'campo obrigatório não preenchido' : 'campos obrigatórios não preenchidos'}`, 'error');

      // Scroll to first error
      requestAnimationFrame(() => {
        const firstError = document.querySelector('.input-field.error, .select-field.error');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    setIsSaving(true);
    try {
      // 1. Create user
      const newUser = await usersApi.addUser({
        name: (form.nome_completo ?? '').trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });

      // 2. Save HR data if any field was filled
      const hrPayload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === '' ? undefined : v])
      ) as Partial<EmployeeHrData>;
      const hasHrData = Object.values(hrPayload).some(v => v !== undefined);
      if (hasHrData) {
        await employeesApi.upsertHrData(newUser.id, hrPayload);
      }

      // 3. Navigate to profile
      navigate(`/funcionario/${newUser.id}`);
    } catch {
      showToast('Erro ao criar funcionário. Verifique os dados e tente novamente.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Input helpers (with error support) ─────────────────────────────────────

  function isRequired(field: keyof HrFormData): boolean {
    return field in REQUIRED_HR_FIELDS;
  }

  function textInput(field: keyof HrFormData, placeholder?: string) {
    const err = fieldErrors[field];
    return (
      <input className={`input-field${err ? ' error' : ''}`} type="text"
        value={(form[field] as string | undefined) ?? ''}
        placeholder={placeholder} onChange={e => handleChange(field, e.target.value)} />
    );
  }

  function dateInput(field: keyof HrFormData) {
    const err = fieldErrors[field];
    return (
      <input className={`input-field${err ? ' error' : ''}`} type="date"
        value={(form[field] as string | undefined) ?? ''}
        onChange={e => handleChange(field, e.target.value)} />
    );
  }

  function selectInput(field: keyof HrFormData, options: { value: string; label: string }[], placeholder?: string) {
    const err = fieldErrors[field];
    return (
      <SearchableSelect
        options={options}
        value={(form[field] as string | undefined) || undefined}
        onChange={(val) => handleChange(field, String(val ?? ''))}
        placeholder={placeholder}
        allowClear
        style={err ? { border: '1px solid var(--color-error)', borderRadius: '6px' } : {}}
      />
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <PageHeader
        title={t('employees.addEmployee')}
        subtitle={t('employees.createSubtitle')}
        breadcrumb={`${t('employees.title')} / ${t('employees.addEmployee')}`}
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/funcionario')}>
            <ArrowLeft size={18} /> {t('common.back')}
          </button>
        }
      />

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 2000,
          padding: '12px 20px', borderRadius: 'var(--radius-md)',
          background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
          color: '#fff', fontWeight: 500, fontSize: 14, boxShadow: 'var(--shadow-lg)', maxWidth: 340,
          display: 'flex', alignItems: 'center', gap: 8,
        }} role="alert" aria-live="polite">
          {toast.type === 'error' && <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <motion.div variants={fadeUpChild} className="card" style={{ padding: '24px' }}>
        {/* ── Dados Pessoais ─────────────────────────────────────────── */}
        <Section title="Dados Pessoais" isOpen={openSections.pessoal} onToggle={() => toggleSection('pessoal')} errorCount={countSectionErrors('pessoal')}>
          <Field label="Nome Completo" required error={fieldErrors.nome_completo}>
            <input className={`input-field${fieldErrors.nome_completo ? ' error' : ''}`} type="text"
              value={form.nome_completo ?? ''} placeholder="Nome completo do funcionário"
              onChange={e => handleChange('nome_completo', e.target.value)} />
          </Field>
          <Field label={t('employees.email')} required error={fieldErrors.email}>
            <input className={`input-field${fieldErrors.email ? ' error' : ''}`} type="email" value={email} placeholder={t('employees.emailPlaceholder')}
              onChange={e => { setEmail(e.target.value); clearError('email'); }} />
          </Field>
          <Field label={t('employees.phone')}>
            <input className="input-field" type="text" value={phone} placeholder="(00) 00000-0000"
              onChange={e => setPhone(maskPhone(e.target.value))} />
          </Field>
          <Field label="CPF" required error={fieldErrors.cpf}>
            <input className={`input-field${fieldErrors.cpf ? ' error' : ''}`} type="text"
              value={form.cpf ?? ''} placeholder="000.000.000-00"
              onChange={e => handleChange('cpf', maskCpf(e.target.value))} />
          </Field>
          <Field label="RG">
            <input className={`input-field${fieldErrors.rg ? ' error' : ''}`} type="text"
              value={form.rg ?? ''} placeholder="00.000.000-0"
              onChange={e => handleChange('rg', maskRg(e.target.value))} />
          </Field>
          <Field label="Órgão Emissor RG">{textInput('rg_orgao_emissor', 'Ex: SSP-SP')}</Field>
          <Field label="Data Emissão RG">{dateInput('rg_data_emissao')}</Field>
          <Field label="Data de Nascimento" required error={fieldErrors.data_nascimento}>{dateInput('data_nascimento')}</Field>
          <Field label="Gênero">
            {selectInput('genero', [
              { value: 'masculino', label: 'Masculino' }, { value: 'feminino', label: 'Feminino' },
              { value: 'outro', label: 'Outro' }, { value: 'nao_informado', label: 'Prefiro não informar' },
            ], 'Selecione')}
          </Field>
          <Field label="Estado Civil">
            {selectInput('estado_civil', [
              { value: 'solteiro', label: 'Solteiro(a)' }, { value: 'casado', label: 'Casado(a)' },
              { value: 'divorciado', label: 'Divorciado(a)' }, { value: 'viuvo', label: 'Viúvo(a)' },
              { value: 'uniao_estavel', label: 'União Estável' },
            ], 'Selecione')}
          </Field>
          <Field label="Nacionalidade">{textInput('nacionalidade', 'Ex: Brasileiro(a)')}</Field>
          <Field label="Naturalidade">{textInput('naturalidade', 'Cidade/UF')}</Field>
          <Field label="Nome da Mãe">{textInput('nome_mae')}</Field>
          <Field label="Nome do Pai">{textInput('nome_pai')}</Field>
        </Section>

        {/* ── Endereço ───────────────────────────────────────────────── */}
        <Section title="Endereço" isOpen={openSections.endereco} onToggle={() => toggleSection('endereco')} errorCount={countSectionErrors('endereco')}>
          <Field label={isFetchingCep ? 'CEP (buscando...)' : 'CEP'} required error={fieldErrors.cep}>
            <input className={`input-field${fieldErrors.cep ? ' error' : ''}`} type="text" value={form.cep ?? ''} placeholder="00000-000"
              onChange={e => {
                const masked = maskCep(e.target.value);
                handleChange('cep', masked);
                const raw = masked.replace(/\D/g, '');
                if (raw.length === 8) fetchCepData(raw);
              }}
              onBlur={() => { const raw = (form.cep ?? '').replace(/\D/g, ''); if (raw.length === 8) fetchCepData(raw); }}
              disabled={isFetchingCep} />
          </Field>
          <Field label="Logradouro" required error={fieldErrors.logradouro}>{textInput('logradouro', 'Rua, Av...')}</Field>
          <Field label="Número" required error={fieldErrors.numero}>{textInput('numero')}</Field>
          <Field label="Complemento">{textInput('complemento', 'Apto, Bloco...')}</Field>
          <Field label="Bairro" required error={fieldErrors.bairro}>{textInput('bairro')}</Field>
          <Field label="Cidade" required error={fieldErrors.cidade}>{textInput('cidade')}</Field>
          <Field label="Estado (UF)" required error={fieldErrors.estado}>{textInput('estado', 'Ex: SP')}</Field>
        </Section>

        {/* ── Dados Profissionais ────────────────────────────────────── */}
        <Section title="Dados Profissionais" isOpen={openSections.profissional} onToggle={() => toggleSection('profissional')} errorCount={countSectionErrors('profissional')}>
          <Field label="Matrícula">{textInput('matricula')}</Field>
          <Field label="Data de Admissão" required error={fieldErrors.data_admissao}>{dateInput('data_admissao')}</Field>
          <Field label="Data de Demissão">{dateInput('data_demissao')}</Field>
          <Field label="Tipo de Contrato" required error={fieldErrors.tipo_contrato}>
            {selectInput('tipo_contrato', [
              { value: 'clt', label: 'CLT' }, { value: 'pj', label: 'PJ' },
              { value: 'estagio', label: 'Estágio' }, { value: 'temporario', label: 'Temporário' },
              { value: 'autonomo', label: 'Autônomo' },
            ], 'Selecione')}
          </Field>
          <Field label="Cargo" required error={fieldErrors.cargo}>{textInput('cargo')}</Field>
          <Field label="Departamento">{textInput('departamento')}</Field>
          <Field label="Salário (R$)">
            <input className="input-field" type="text" inputMode="numeric"
              value={salarioDisplay} placeholder="0,00"
              onChange={e => {
                const masked = maskCurrency(e.target.value);
                setSalarioDisplay(masked);
                handleChange('salario', parseCurrency(masked));
              }} />
          </Field>
          <Field label="Jornada de Trabalho">{textInput('jornada_trabalho', 'Ex: 44h semanais')}</Field>
          <Field label="PIS/PASEP">{textInput('pis_pasep')}</Field>
          <Field label="CTPS Número">{textInput('ctps_numero')}</Field>
          <Field label="CTPS Série">{textInput('ctps_serie')}</Field>
          <Field label="CTPS UF">{textInput('ctps_uf', 'Ex: SP')}</Field>
        </Section>

        {/* ── CNH ────────────────────────────────────────────────────── */}
        <Section title="Carteira de Habilitação (CNH)" isOpen={openSections.cnh} onToggle={() => toggleSection('cnh')}>
          <Field label="Número da CNH">
            <input className={`input-field${fieldErrors.cnh_numero ? ' error' : ''}`} type="text"
              value={form.cnh_numero ?? ''} placeholder="00000000000"
              onChange={e => handleChange('cnh_numero', maskCnh(e.target.value))} />
          </Field>
          <Field label="Categoria">
            {selectInput('cnh_categoria', [
              { value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'AB', label: 'AB' },
              { value: 'C', label: 'C' }, { value: 'D', label: 'D' }, { value: 'E', label: 'E' },
            ], 'Selecione')}
          </Field>
          <Field label="Validade">{dateInput('cnh_validade')}</Field>
        </Section>

        {/* ── Dados Bancários ────────────────────────────────────────── */}
        <Section title="Dados Bancários" isOpen={openSections.bancario} onToggle={() => toggleSection('bancario')}>
          <Field label="Banco">{textInput('banco_nome', 'Nome do banco')}</Field>
          <Field label="Agência">
            <input className={`input-field${fieldErrors.banco_agencia ? ' error' : ''}`} type="text"
              value={form.banco_agencia ?? ''} placeholder="0000-0"
              onChange={e => handleChange('banco_agencia', maskAgencia(e.target.value))} />
          </Field>
          <Field label="Conta">
            <input className={`input-field${fieldErrors.banco_conta ? ' error' : ''}`} type="text"
              value={form.banco_conta ?? ''} placeholder="00000000-0"
              onChange={e => handleChange('banco_conta', maskConta(e.target.value))} />
          </Field>
          <Field label="Tipo de Conta">
            {selectInput('banco_tipo_conta', [
              { value: 'corrente', label: 'Conta Corrente' }, { value: 'poupanca', label: 'Conta Poupança' },
              { value: 'salario', label: 'Conta Salário' },
            ], 'Selecione')}
          </Field>
          <Field label="Chave PIX">{textInput('banco_pix', 'CPF, e-mail, telefone ou aleatória')}</Field>
        </Section>

        {/* ── Contato de Emergência ──────────────────────────────────── */}
        <Section title="Contato de Emergência" isOpen={openSections.emergencia} onToggle={() => toggleSection('emergencia')} errorCount={countSectionErrors('emergencia')}>
          <Field label="Nome" required error={fieldErrors.emergencia_nome}>{textInput('emergencia_nome')}</Field>
          <Field label="Parentesco">{textInput('emergencia_parentesco', 'Ex: Cônjuge, Pai, Mãe')}</Field>
          <Field label="Telefone" required error={fieldErrors.emergencia_telefone}>
            <input className={`input-field${fieldErrors.emergencia_telefone ? ' error' : ''}`} type="text"
              value={form.emergencia_telefone ?? ''} placeholder="(00) 00000-0000"
              onChange={e => handleChange('emergencia_telefone', maskPhone(e.target.value))} />
          </Field>
        </Section>

        {/* ── Escolaridade ───────────────────────────────────────────── */}
        <Section title="Escolaridade" isOpen={openSections.escolaridade} onToggle={() => toggleSection('escolaridade')}>
          <Field label="Grau de Instrução">
            {selectInput('escolaridade', [
              { value: 'fundamental_incompleto', label: 'Fundamental Incompleto' },
              { value: 'fundamental_completo', label: 'Fundamental Completo' },
              { value: 'medio_incompleto', label: 'Médio Incompleto' },
              { value: 'medio_completo', label: 'Médio Completo' },
              { value: 'superior_incompleto', label: 'Superior Incompleto' },
              { value: 'superior_completo', label: 'Superior Completo' },
              { value: 'pos_graduacao', label: 'Pós-Graduação' },
              { value: 'mestrado', label: 'Mestrado' },
              { value: 'doutorado', label: 'Doutorado' },
            ], 'Selecione')}
          </Field>
          <Field label="Curso">{textInput('curso', 'Ex: Engenharia Civil')}</Field>
          <Field label="Instituição">{textInput('instituicao')}</Field>
        </Section>

        {/* ── Observações ────────────────────────────────────────────── */}
        <Section title="Observações" isOpen={openSections.observacoes} onToggle={() => toggleSection('observacoes')} fullWidth>
          <Field label="Observações gerais">
            <textarea className="input-field" rows={4} value={form.observacoes ?? ''}
              placeholder="Informações adicionais sobre o colaborador..."
              onChange={e => handleChange('observacoes', e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          </Field>
        </Section>

        {/* ── Save button ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: 16, borderTop: '1px solid var(--color-alternate)' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/funcionario')}>
            {t('common.cancel')}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}
            style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
            {isSaving
              ? <><div className="spinner" style={{ width: 16, height: 16 }} /> {t('common.loading')}</>
              : <><Save size={16} /> {t('common.save')}</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

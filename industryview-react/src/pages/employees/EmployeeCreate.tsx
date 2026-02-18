import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { pageVariants, fadeUpChild } from '../../lib/motion';
import { usersApi, employeesApi } from '../../services';
import type { EmployeeHrData } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import { ArrowLeft, Save, ChevronDown, ChevronRight } from 'lucide-react';

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

function Section({ title, isOpen, onToggle, children, fullWidth = false }: {
  title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode; fullWidth?: boolean;
}) {
  return (
    <div>
      <div style={SECTION_HEADER_STYLE} onClick={onToggle} role="button" aria-expanded={isOpen}>
        {isOpen
          ? <ChevronDown size={16} color="var(--color-primary)" />
          : <ChevronRight size={16} color="var(--color-secondary-text)" />}
        <span style={{ color: isOpen ? 'var(--color-primary)' : 'var(--color-primary-text)' }}>{title}</span>
      </div>
      {isOpen && <div style={fullWidth ? SECTION_GRID_FULL_STYLE : SECTION_GRID_STYLE}>{children}</div>}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="input-group">
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-secondary-text)', marginBottom: 4, display: 'block' }}>
        {label}{required && ' *'}
      </label>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EmployeeCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Basic user fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // HR data
  const [form, setForm] = useState<HrFormData>(EMPTY_HR_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basico: true, pessoal: true, endereco: false, profissional: false,
    cnh: false, bancario: false, emergencia: false, escolaridade: false, observacoes: false,
  });

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleChange(field: keyof HrFormData, value: string | number | undefined) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleSection(section: string) {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  const handleCepBlur = useCallback(async () => {
    const raw = form.cep?.replace(/\D/g, '') ?? '';
    if (raw.length !== 8) return;
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
    } catch {
      showToast('Falha ao consultar CEP.', 'error');
    } finally {
      setIsFetchingCep(false);
    }
  }, [form.cep]);

  async function handleSave() {
    if (!name.trim() || !email.trim()) {
      showToast('Nome e email são obrigatórios.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      // 1. Create user
      const newUser = await usersApi.addUser({
        name: name.trim(),
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

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function textInput(field: keyof HrFormData, placeholder?: string) {
    return (
      <input className="input-field" type="text" value={(form[field] as string | undefined) ?? ''}
        placeholder={placeholder} onChange={e => handleChange(field, e.target.value)} />
    );
  }

  function dateInput(field: keyof HrFormData) {
    return (
      <input className="input-field" type="date" value={(form[field] as string | undefined) ?? ''}
        onChange={e => handleChange(field, e.target.value)} />
    );
  }

  function selectInput(field: keyof HrFormData, options: { value: string; label: string }[], placeholder?: string) {
    return (
      <select className="select-field" value={(form[field] as string | undefined) ?? ''}
        onChange={e => handleChange(field, e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
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
        }} role="alert" aria-live="polite">
          {toast.message}
        </div>
      )}

      <motion.div variants={fadeUpChild} className="card" style={{ padding: '24px' }}>
        {/* ── Dados Básicos (Nome, Email, Telefone) ────────────────────── */}
        <Section title={t('employees.basicData')} isOpen={openSections.basico} onToggle={() => toggleSection('basico')}>
          <Field label={t('employees.name')} required>
            <input className="input-field" type="text" value={name} placeholder={t('employees.namePlaceholder')}
              onChange={e => setName(e.target.value)} />
          </Field>
          <Field label={t('employees.email')} required>
            <input className="input-field" type="email" value={email} placeholder={t('employees.emailPlaceholder')}
              onChange={e => setEmail(e.target.value)} />
          </Field>
          <Field label={t('employees.phone')}>
            <input className="input-field" type="text" value={phone} placeholder={t('employees.phonePlaceholder')}
              onChange={e => setPhone(e.target.value)} />
          </Field>
        </Section>

        {/* ── Dados Pessoais ─────────────────────────────────────────── */}
        <Section title="Dados Pessoais" isOpen={openSections.pessoal} onToggle={() => toggleSection('pessoal')}>
          <Field label="Nome Completo">{textInput('nome_completo', 'Nome completo do funcionário')}</Field>
          <Field label="CPF">{textInput('cpf', '000.000.000-00')}</Field>
          <Field label="RG">{textInput('rg')}</Field>
          <Field label="Órgão Emissor RG">{textInput('rg_orgao_emissor', 'Ex: SSP-SP')}</Field>
          <Field label="Data Emissão RG">{dateInput('rg_data_emissao')}</Field>
          <Field label="Data de Nascimento">{dateInput('data_nascimento')}</Field>
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
        <Section title="Endereço" isOpen={openSections.endereco} onToggle={() => toggleSection('endereco')}>
          <Field label={isFetchingCep ? 'CEP (buscando...)' : 'CEP'}>
            <input className="input-field" type="text" value={form.cep ?? ''} placeholder="00000-000"
              onChange={e => handleChange('cep', e.target.value)} onBlur={handleCepBlur} disabled={isFetchingCep} />
          </Field>
          <Field label="Logradouro">{textInput('logradouro', 'Rua, Av...')}</Field>
          <Field label="Número">{textInput('numero')}</Field>
          <Field label="Complemento">{textInput('complemento', 'Apto, Bloco...')}</Field>
          <Field label="Bairro">{textInput('bairro')}</Field>
          <Field label="Cidade">{textInput('cidade')}</Field>
          <Field label="Estado (UF)">{textInput('estado', 'Ex: SP')}</Field>
        </Section>

        {/* ── Dados Profissionais ────────────────────────────────────── */}
        <Section title="Dados Profissionais" isOpen={openSections.profissional} onToggle={() => toggleSection('profissional')}>
          <Field label="Matrícula">{textInput('matricula')}</Field>
          <Field label="Data de Admissão">{dateInput('data_admissao')}</Field>
          <Field label="Data de Demissão">{dateInput('data_demissao')}</Field>
          <Field label="Tipo de Contrato">
            {selectInput('tipo_contrato', [
              { value: 'clt', label: 'CLT' }, { value: 'pj', label: 'PJ' },
              { value: 'estagio', label: 'Estágio' }, { value: 'temporario', label: 'Temporário' },
              { value: 'autonomo', label: 'Autônomo' },
            ], 'Selecione')}
          </Field>
          <Field label="Cargo">{textInput('cargo')}</Field>
          <Field label="Departamento">{textInput('departamento')}</Field>
          <Field label="Salário (R$)">
            <input className="input-field" type="number" min={0} step={0.01}
              value={form.salario ?? ''} placeholder="0,00"
              onChange={e => handleChange('salario', e.target.value === '' ? undefined : parseFloat(e.target.value))} />
          </Field>
          <Field label="Jornada de Trabalho">{textInput('jornada_trabalho', 'Ex: 44h semanais')}</Field>
          <Field label="PIS/PASEP">{textInput('pis_pasep')}</Field>
          <Field label="CTPS Número">{textInput('ctps_numero')}</Field>
          <Field label="CTPS Série">{textInput('ctps_serie')}</Field>
          <Field label="CTPS UF">{textInput('ctps_uf', 'Ex: SP')}</Field>
        </Section>

        {/* ── CNH ────────────────────────────────────────────────────── */}
        <Section title="Carteira de Habilitação (CNH)" isOpen={openSections.cnh} onToggle={() => toggleSection('cnh')}>
          <Field label="Número da CNH">{textInput('cnh_numero')}</Field>
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
          <Field label="Agência">{textInput('banco_agencia')}</Field>
          <Field label="Conta">{textInput('banco_conta')}</Field>
          <Field label="Tipo de Conta">
            {selectInput('banco_tipo_conta', [
              { value: 'corrente', label: 'Conta Corrente' }, { value: 'poupanca', label: 'Conta Poupança' },
              { value: 'salario', label: 'Conta Salário' },
            ], 'Selecione')}
          </Field>
          <Field label="Chave PIX">{textInput('banco_pix', 'CPF, e-mail, telefone ou aleatória')}</Field>
        </Section>

        {/* ── Contato de Emergência ──────────────────────────────────── */}
        <Section title="Contato de Emergência" isOpen={openSections.emergencia} onToggle={() => toggleSection('emergencia')}>
          <Field label="Nome">{textInput('emergencia_nome')}</Field>
          <Field label="Parentesco">{textInput('emergencia_parentesco', 'Ex: Cônjuge, Pai, Mãe')}</Field>
          <Field label="Telefone">{textInput('emergencia_telefone', '(00) 00000-0000')}</Field>
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

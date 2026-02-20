import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fadeUpChild } from '../../../lib/motion';
import { employeesApi } from '../../../services';
import type { EmployeeHrData } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { Save, ChevronDown, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HrDataTabProps {
  usersId: number;
}

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

const EMPTY_FORM: HrFormData = {
  nome_completo: '',
  cpf: '',
  rg: '',
  rg_orgao_emissor: '',
  rg_data_emissao: '',
  data_nascimento: '',
  genero: '',
  estado_civil: '',
  nacionalidade: '',
  naturalidade: '',
  nome_mae: '',
  nome_pai: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  matricula: '',
  data_admissao: '',
  data_demissao: '',
  tipo_contrato: '',
  cargo: '',
  departamento: '',
  salario: undefined,
  jornada_trabalho: '',
  pis_pasep: '',
  ctps_numero: '',
  ctps_serie: '',
  ctps_uf: '',
  cnh_numero: '',
  cnh_categoria: '',
  cnh_validade: '',
  banco_nome: '',
  banco_agencia: '',
  banco_conta: '',
  banco_tipo_conta: '',
  banco_pix: '',
  emergencia_nome: '',
  emergencia_parentesco: '',
  emergencia_telefone: '',
  escolaridade: '',
  curso: '',
  instituicao: '',
  observacoes: '',
};

const SECTION_HEADER_STYLE: React.CSSProperties = {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 0',
  borderBottom: '1px solid var(--color-alternate)',
  marginBottom: 12,
  fontWeight: 600,
  fontSize: 15,
  userSelect: 'none',
};

const SECTION_GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 12,
  marginBottom: 24,
};

const SECTION_GRID_FULL_STYLE: React.CSSProperties = {
  ...SECTION_GRID_STYLE,
  gridTemplateColumns: '1fr',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  fullWidth?: boolean;
}

function Section({ title, isOpen, onToggle, children, fullWidth = false }: SectionProps) {
  return (
    <div>
      <div style={SECTION_HEADER_STYLE} onClick={onToggle} role="button" aria-expanded={isOpen}>
        {isOpen
          ? <ChevronDown size={16} color="var(--color-primary)" />
          : <ChevronRight size={16} color="var(--color-secondary-text)" />}
        <span style={{ color: isOpen ? 'var(--color-primary)' : 'var(--color-primary-text)' }}>
          {title}
        </span>
      </div>
      {isOpen && (
        <div style={fullWidth ? SECTION_GRID_FULL_STYLE : SECTION_GRID_STYLE}>
          {children}
        </div>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="input-group">
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-secondary-text)', marginBottom: 4, display: 'block' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HrDataTab({ usersId }: HrDataTabProps) {
  const [form, setForm] = useState<HrFormData>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Track open/closed state per section
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    pessoal: true,
    endereco: true,
    profissional: true,
    cnh: true,
    bancario: true,
    emergencia: true,
    escolaridade: true,
    observacoes: true,
  });

  // ─── Data loading ──────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    // Dropdown fields that must be normalized for matching option values
    const enumFields = new Set([
      'genero', 'estado_civil', 'tipo_contrato', 'banco_tipo_conta', 'escolaridade',
    ]);
    // cnh_categoria is uppercase (A, B, AB, etc.)
    const upperEnumFields = new Set(['cnh_categoria']);

    // Normalize DB values to match option values: strip accents, lowercase, replace spaces/hyphens with _
    // e.g. "União Estável" → "uniao_estavel", "Pós-Graduação" → "pos_graduacao", "Viúvo(a)" → "viuvo"
    function normalizeEnumValue(val: string): string {
      let normalized = val
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
        .toLowerCase()
        .trim()
        .replace(/\(.*?\)/g, '')       // remove parentheses content like (a)
        .trim()
        .replace(/[\s\-]+/g, '_')      // spaces and hyphens → underscore
        .replace(/_+$/, '');            // trailing underscores
      // Strip common prefixes: "ensino_" (e.g. "Ensino Médio Completo" → "medio_completo")
      normalized = normalized.replace(/^ensino_/, '');
      return normalized;
    }

    // Fallback: known DB labels → option values for escolaridade
    const escolaridadeMap: Record<string, string> = {
      'fundamental incompleto': 'fundamental_incompleto',
      'fundamental completo': 'fundamental_completo',
      'ensino fundamental incompleto': 'fundamental_incompleto',
      'ensino fundamental completo': 'fundamental_completo',
      'medio incompleto': 'medio_incompleto',
      'medio completo': 'medio_completo',
      'ensino medio incompleto': 'medio_incompleto',
      'ensino medio completo': 'medio_completo',
      'superior incompleto': 'superior_incompleto',
      'superior completo': 'superior_completo',
      'ensino superior incompleto': 'superior_incompleto',
      'ensino superior completo': 'superior_completo',
      'pos graduacao': 'pos_graduacao',
      'pos-graduacao': 'pos_graduacao',
      'mestrado': 'mestrado',
      'doutorado': 'doutorado',
    };

    async function loadHrData() {
      setIsLoading(true);
      try {
        const data = await employeesApi.getHrData(usersId);
        if (cancelled) return;

        if (data) {
          const dateFields = new Set([
            'rg_data_emissao', 'data_nascimento', 'data_admissao',
            'data_demissao', 'cnh_validade',
          ]);
          setForm({
            ...EMPTY_FORM,
            ...Object.fromEntries(
              Object.entries(data)
                .filter(([key]) => key in EMPTY_FORM)
                .map(([k, v]) => {
                  if (v == null) return [k, ''];
                  if (dateFields.has(k)) {
                    // Numeric timestamp → YYYY-MM-DD
                    if (typeof v === 'number') {
                      return [k, new Date(v).toISOString().substring(0, 10)];
                    }
                    // ISO string → YYYY-MM-DD
                    if (typeof v === 'string' && v.length > 10) {
                      return [k, v.substring(0, 10)];
                    }
                  }
                  // Normalize enum fields to match dropdown option values
                  if (enumFields.has(k) && typeof v === 'string') {
                    if (k === 'escolaridade') {
                      const stripped = v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
                      const mapped = escolaridadeMap[stripped];
                      if (mapped) return [k, mapped];
                    }
                    return [k, normalizeEnumValue(v)];
                  }
                  if (upperEnumFields.has(k) && typeof v === 'string') {
                    return [k, v.toUpperCase().trim()];
                  }
                  return [k, v];
                })
            ),
          });
        }
      } catch {
        if (!cancelled) showToast('Erro ao carregar dados do colaborador.', 'error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadHrData();
    return () => { cancelled = true; };
  }, [usersId]);

  // ─── Toast ─────────────────────────────────────────────────────────────────

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

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

      if (json.erro) {
        showToast('CEP não encontrado.', 'error');
        return;
      }

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
    setIsSaving(true);
    try {
      const dateFields = new Set([
        'rg_data_emissao', 'data_nascimento', 'data_admissao',
        'data_demissao', 'cnh_validade',
      ]);

      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => {
          if (v === '' || v == null) return [k, undefined];
          // Ensure date fields are always sent as YYYY-MM-DD strings
          if (dateFields.has(k) && typeof v === 'number') {
            return [k, new Date(v).toISOString().substring(0, 10)];
          }
          return [k, v];
        })
      ) as Partial<EmployeeHrData>;

      await employeesApi.upsertHrData(usersId, payload);
      showToast('Dados salvos com sucesso.', 'success');
    } catch {
      showToast('Erro ao salvar dados. Tente novamente.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function textInput(field: keyof HrFormData, placeholder?: string) {
    return (
      <input
        className="input-field"
        type="text"
        value={(form[field] as string | undefined) ?? ''}
        placeholder={placeholder}
        onChange={e => handleChange(field, e.target.value)}
      />
    );
  }

  function dateInput(field: keyof HrFormData) {
    return (
      <input
        className="input-field"
        type="date"
        value={(form[field] as string | undefined) ?? ''}
        onChange={e => handleChange(field, e.target.value)}
      />
    );
  }

  function selectInput(field: keyof HrFormData, options: { value: string; label: string }[], placeholder?: string) {
    return (
      <SearchableSelect
        options={options}
        value={(form[field] as string | undefined) || undefined}
        onChange={(val) => handleChange(field, String(val ?? ''))}
        placeholder={placeholder}
        allowClear
      />
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  if (isLoading) return <LoadingSpinner />;

  return (
    <motion.div variants={fadeUpChild} initial="initial" animate="animate" style={{ padding: '24px 0' }}>

      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 2000,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            color: '#fff',
            fontWeight: 500,
            fontSize: 14,
            boxShadow: 'var(--shadow-lg)',
            maxWidth: 340,
          }}
          role="alert"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      {/* ── Dados Pessoais ─────────────────────────────────────────────── */}
      <Section title="Dados Pessoais" isOpen={openSections.pessoal} onToggle={() => toggleSection('pessoal')}>
        <Field label="Nome Completo">{textInput('nome_completo', 'Nome completo do funcionário')}</Field>
        <Field label="CPF">{textInput('cpf', '000.000.000-00')}</Field>
        <Field label="RG">{textInput('rg')}</Field>
        <Field label="Órgão Emissor RG">{textInput('rg_orgao_emissor', 'Ex: SSP-SP')}</Field>
        <Field label="Data Emissão RG">{dateInput('rg_data_emissao')}</Field>
        <Field label="Data de Nascimento">{dateInput('data_nascimento')}</Field>
        <Field label="Gênero">
          {selectInput('genero', [
            { value: 'masculino', label: 'Masculino' },
            { value: 'feminino', label: 'Feminino' },
            { value: 'outro', label: 'Outro' },
            { value: 'nao_informado', label: 'Prefiro não informar' },
          ], 'Selecione')}
        </Field>
        <Field label="Estado Civil">
          {selectInput('estado_civil', [
            { value: 'solteiro', label: 'Solteiro(a)' },
            { value: 'casado', label: 'Casado(a)' },
            { value: 'divorciado', label: 'Divorciado(a)' },
            { value: 'viuvo', label: 'Viúvo(a)' },
            { value: 'uniao_estavel', label: 'União Estável' },
          ], 'Selecione')}
        </Field>
        <Field label="Nacionalidade">{textInput('nacionalidade', 'Ex: Brasileiro(a)')}</Field>
        <Field label="Naturalidade">{textInput('naturalidade', 'Cidade/UF')}</Field>
        <Field label="Nome da Mãe">{textInput('nome_mae')}</Field>
        <Field label="Nome do Pai">{textInput('nome_pai')}</Field>
      </Section>

      {/* ── Endereço ───────────────────────────────────────────────────── */}
      <Section title="Endereço" isOpen={openSections.endereco} onToggle={() => toggleSection('endereco')}>
        <Field label={isFetchingCep ? 'CEP (buscando...)' : 'CEP'}>
          <input
            className="input-field"
            type="text"
            value={form.cep ?? ''}
            placeholder="00000-000"
            onChange={e => handleChange('cep', e.target.value)}
            onBlur={handleCepBlur}
            disabled={isFetchingCep}
          />
        </Field>
        <Field label="Logradouro">{textInput('logradouro', 'Rua, Av...')}</Field>
        <Field label="Número">{textInput('numero')}</Field>
        <Field label="Complemento">{textInput('complemento', 'Apto, Bloco...')}</Field>
        <Field label="Bairro">{textInput('bairro')}</Field>
        <Field label="Cidade">{textInput('cidade')}</Field>
        <Field label="Estado (UF)">{textInput('estado', 'Ex: SP')}</Field>
      </Section>

      {/* ── Dados Profissionais ────────────────────────────────────────── */}
      <Section title="Dados Profissionais" isOpen={openSections.profissional} onToggle={() => toggleSection('profissional')}>
        <Field label="Matrícula">{textInput('matricula')}</Field>
        <Field label="Data de Admissão">{dateInput('data_admissao')}</Field>
        <Field label="Data de Demissão">{dateInput('data_demissao')}</Field>
        <Field label="Tipo de Contrato">
          {selectInput('tipo_contrato', [
            { value: 'clt', label: 'CLT' },
            { value: 'pj', label: 'PJ' },
            { value: 'estagio', label: 'Estágio' },
            { value: 'temporario', label: 'Temporário' },
            { value: 'autonomo', label: 'Autônomo' },
          ], 'Selecione')}
        </Field>
        <Field label="Cargo">{textInput('cargo')}</Field>
        <Field label="Departamento">{textInput('departamento')}</Field>
        <Field label="Salário (R$)">
          <input
            className="input-field"
            type="number"
            min={0}
            step={0.01}
            value={form.salario ?? ''}
            placeholder="0,00"
            onChange={e => handleChange('salario', e.target.value === '' ? undefined : parseFloat(e.target.value))}
          />
        </Field>
        <Field label="Jornada de Trabalho">{textInput('jornada_trabalho', 'Ex: 44h semanais')}</Field>
        <Field label="PIS/PASEP">{textInput('pis_pasep')}</Field>
        <Field label="CTPS Número">{textInput('ctps_numero')}</Field>
        <Field label="CTPS Série">{textInput('ctps_serie')}</Field>
        <Field label="CTPS UF">{textInput('ctps_uf', 'Ex: SP')}</Field>
      </Section>

      {/* ── CNH ────────────────────────────────────────────────────────── */}
      <Section title="Carteira de Habilitação (CNH)" isOpen={openSections.cnh} onToggle={() => toggleSection('cnh')}>
        <Field label="Número da CNH">{textInput('cnh_numero')}</Field>
        <Field label="Categoria">
          {selectInput('cnh_categoria', [
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'AB', label: 'AB' },
            { value: 'C', label: 'C' },
            { value: 'D', label: 'D' },
            { value: 'E', label: 'E' },
          ], 'Selecione')}
        </Field>
        <Field label="Validade">{dateInput('cnh_validade')}</Field>
      </Section>

      {/* ── Dados Bancários ────────────────────────────────────────────── */}
      <Section title="Dados Bancários" isOpen={openSections.bancario} onToggle={() => toggleSection('bancario')}>
        <Field label="Banco">{textInput('banco_nome', 'Nome do banco')}</Field>
        <Field label="Agência">{textInput('banco_agencia')}</Field>
        <Field label="Conta">{textInput('banco_conta')}</Field>
        <Field label="Tipo de Conta">
          {selectInput('banco_tipo_conta', [
            { value: 'corrente', label: 'Conta Corrente' },
            { value: 'poupanca', label: 'Conta Poupança' },
            { value: 'salario', label: 'Conta Salário' },
          ], 'Selecione')}
        </Field>
        <Field label="Chave PIX">{textInput('banco_pix', 'CPF, e-mail, telefone ou aleatória')}</Field>
      </Section>

      {/* ── Contato de Emergência ──────────────────────────────────────── */}
      <Section title="Contato de Emergência" isOpen={openSections.emergencia} onToggle={() => toggleSection('emergencia')}>
        <Field label="Nome">{textInput('emergencia_nome')}</Field>
        <Field label="Parentesco">{textInput('emergencia_parentesco', 'Ex: Cônjuge, Pai, Mãe')}</Field>
        <Field label="Telefone">{textInput('emergencia_telefone', '(00) 00000-0000')}</Field>
      </Section>

      {/* ── Escolaridade ───────────────────────────────────────────────── */}
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

      {/* ── Observações ────────────────────────────────────────────────── */}
      <Section title="Observações" isOpen={openSections.observacoes} onToggle={() => toggleSection('observacoes')} fullWidth>
        <Field label="Observações gerais">
          <textarea
            className="input-field"
            rows={4}
            value={form.observacoes ?? ''}
            placeholder="Informações adicionais sobre o colaborador..."
            onChange={e => handleChange('observacoes', e.target.value)}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
        </Field>
      </Section>

      {/* ── Save button ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--color-alternate)' }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSaving}
          style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}
        >
          {isSaving
            ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Salvando...</>
            : <><Save size={16} /> Salvar Dados</>}
        </button>
      </div>
    </motion.div>
  );
}

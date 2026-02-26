import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  staggerParent,
  tableRowVariants,
  fadeUpChild,
  modalBackdropVariants,
  modalContentVariants,
} from '../../../lib/motion';
import { employeesApi } from '../../../services';
import SearchableSelect from '../../../components/common/SearchableSelect';
import type { EmployeeVacation, VacationBalance } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Filter, Calendar, AlertTriangle, Info, FileText, Baby, Heart, Clock } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const PER_PAGE = 10;

const TIPO_LABELS: Record<string, string> = {
  ferias: 'Ferias',
  licenca_medica: 'Licenca Medica',
  licenca_maternidade: 'Licenca Maternidade',
  licenca_paternidade: 'Licenca Paternidade',
  abono: 'Abono',
};

const TIPO_OPTIONS = Object.entries(TIPO_LABELS).map(([value, label]) => ({ value, label }));

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  pendente: { bg: '#FFF9E6', color: '#B98E00', label: 'Pendente' },
  aprovado: { bg: '#F4FEF9', color: '#028F58', label: 'Aprovado' },
  em_andamento: { bg: '#EEF4FF', color: '#1D5CC6', label: 'Em Andamento' },
  concluido: { bg: '#F0F0F0', color: '#555555', label: 'Concluido' },
  cancelado: { bg: '#FDE8E8', color: '#C0392B', label: 'Cancelado' },
};

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos os status' },
  ...Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({ value, label })),
];

// ── Licencas CLT Info ─────────────────────────────────────────────────────────

const LICENCAS_INFO: {
  tipo: string;
  label: string;
  duracao: string;
  quemPaga: string;
  icon: typeof FileText;
  color: string;
}[] = [
    {
      tipo: 'licenca_medica',
      label: 'Licenca Medica',
      duracao: 'Ate 15 dias (empresa) / 16+ dias (INSS)',
      quemPaga: 'Empresa ate 15d, INSS apos',
      icon: Heart,
      color: '#E74C3C',
    },
    {
      tipo: 'licenca_maternidade',
      label: 'Licenca Maternidade',
      duracao: '120 dias (pode ser 180 com Empresa Cidada)',
      quemPaga: 'INSS (empresa adianta)',
      icon: Baby,
      color: '#E91E90',
    },
    {
      tipo: 'licenca_paternidade',
      label: 'Licenca Paternidade',
      duracao: '5 dias (pode ser 20 com Empresa Cidada)',
      quemPaga: 'Empresa',
      icon: Baby,
      color: '#2980B9',
    },
    {
      tipo: 'abono',
      label: 'Abono / Falta Justificada',
      duracao: 'Varia conforme motivo (CLT Art. 473)',
      quemPaga: 'Empresa (sem desconto)',
      icon: Clock,
      color: '#7D3C98',
    },
  ];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatDateLocal(dateStr: string): string {
  // Avoids UTC shift: treats "2026-01-15" as local midnight
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
}

function calcDaysBetween(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

function toDateInput(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
}

function isEndBeforeStart(startStr: string, endStr: string): boolean {
  if (!startStr || !endStr) return false;
  return endStr < startStr;
}

// Returns days until date string (YYYY-MM-DD). Negative = already past.
function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr + 'T00:00:00').getTime() - Date.now()) / 86400000);
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { bg: '#F0F0F0', color: '#555', label: status };
  return (
    <span
      style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 500,
        background: config.bg,
        color: config.color,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  );
}

// ── Inline error alert ────────────────────────────────────────────────────────

interface FormErrorAlertProps {
  message: string;
}

function FormErrorAlert({ message }: FormErrorAlertProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 14px',
        background: '#FDE8E8',
        borderLeft: '4px solid #C0392B',
        borderRadius: '6px',
        marginBottom: '14px',
      }}
    >
      <AlertTriangle size={16} style={{ color: '#C0392B', flexShrink: 0, marginTop: '1px' }} />
      <span style={{ color: '#C0392B', fontSize: '13px', lineHeight: '1.4' }}>{message}</span>
    </div>
  );
}

// ── Form state ────────────────────────────────────────────────────────────────

interface VacationFormState {
  tipo: string;
  data_inicio: string;
  data_fim: string;
  dias_total: number;
  periodo_aquisitivo_inicio: string;
  periodo_aquisitivo_fim: string;
  observacoes: string;
}

const EMPTY_FORM: VacationFormState = {
  tipo: 'ferias',
  data_inicio: '',
  data_fim: '',
  dias_total: 0,
  periodo_aquisitivo_inicio: '',
  periodo_aquisitivo_fim: '',
  observacoes: '',
};

// ── Vacation Form Modal ───────────────────────────────────────────────────────

interface VacationFormModalProps {
  isOpen: boolean;
  editTarget: EmployeeVacation | null;
  onClose: () => void;
  onSaved: () => void;
  usersId: number;
  balance: VacationBalance | null;
  vacations: EmployeeVacation[];
}

function VacationFormModal({
  isOpen,
  editTarget,
  onClose,
  onSaved,
  usersId,
  balance,
  vacations,
}: VacationFormModalProps) {
  const [form, setForm] = useState<VacationFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Whether the periodo aquisitivo fields were auto-populated from balance
  const [periodoAutoFilled, setPeriodoAutoFilled] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editTarget) {
      setForm({
        tipo: editTarget.tipo,
        data_inicio: toDateInput(editTarget.data_inicio),
        data_fim: toDateInput(editTarget.data_fim),
        dias_total: editTarget.dias_total,
        periodo_aquisitivo_inicio: toDateInput(editTarget.periodo_aquisitivo_inicio),
        periodo_aquisitivo_fim: toDateInput(editTarget.periodo_aquisitivo_fim),
        observacoes: editTarget.observacoes ?? '',
      });
      setPeriodoAutoFilled(false);
    } else {
      // New record: auto-populate periodo aquisitivo from balance if available
      const autoInicio = balance?.periodo_aquisitivo_inicio
        ? toDateInput(balance.periodo_aquisitivo_inicio)
        : '';
      const autoFim = balance?.periodo_aquisitivo_fim
        ? toDateInput(balance.periodo_aquisitivo_fim)
        : '';

      setForm({
        ...EMPTY_FORM,
        periodo_aquisitivo_inicio: autoInicio,
        periodo_aquisitivo_fim: autoFim,
      });
      setPeriodoAutoFilled(!!(autoInicio && autoFim));
    }

    setError('');
    setTouched({});
  }, [isOpen, editTarget, balance]);

  // When tipo changes to 'ferias' on a new record, re-apply auto-fill
  useEffect(() => {
    if (!isOpen || editTarget) return;
    if (form.tipo === 'ferias') {
      const autoInicio = balance?.periodo_aquisitivo_inicio
        ? toDateInput(balance.periodo_aquisitivo_inicio)
        : '';
      const autoFim = balance?.periodo_aquisitivo_fim
        ? toDateInput(balance.periodo_aquisitivo_fim)
        : '';
      if (autoInicio && autoFim) {
        setForm(prev => ({
          ...prev,
          periodo_aquisitivo_inicio: autoInicio,
          periodo_aquisitivo_fim: autoFim,
        }));
        setPeriodoAutoFilled(true);
      } else {
        setPeriodoAutoFilled(false);
      }
    } else {
      setPeriodoAutoFilled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.tipo]);

  // Auto-calculate dias_total whenever dates change
  function handleDateChange(field: 'data_inicio' | 'data_fim', value: string) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      next.dias_total = calcDaysBetween(next.data_inicio, next.data_fim);
      return next;
    });
  }

  function handleFieldChange(
    field: keyof VacationFormState,
    value: string | number,
  ) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // Count existing non-cancelled ferias records that share the same accrual period
  const existingFeriasPeriods = vacations.filter(v => {
    if (v.tipo !== 'ferias') return false;
    if (v.status === 'cancelado') return false;
    if (editTarget && v.id === editTarget.id) return false;
    if (!form.periodo_aquisitivo_inicio || !form.periodo_aquisitivo_fim) return true;
    const vInicio = toDateInput(v.periodo_aquisitivo_inicio);
    const vFim = toDateInput(v.periodo_aquisitivo_fim);
    return (
      vInicio === form.periodo_aquisitivo_inicio &&
      vFim === form.periodo_aquisitivo_fim
    );
  });
  const existingCount = existingFeriasPeriods.length;

  // Real-time CLT validations for ferias type
  const diasDisponiveis = balance?.dias_disponiveis ?? 0;
  const diasDireito = balance?.dias_direito ?? 0;
  const isFeriasTipo = form.tipo === 'ferias';
  const hasDias = form.dias_total > 0;
  const belowMinimum = isFeriasTipo && hasDias && form.dias_total < 5;
  const exceedsSaldo = isFeriasTipo && hasDias && form.dias_total > diasDisponiveis && balance !== null;

  const submitDisabled =
    saving ||
    (isFeriasTipo && (belowMinimum || exceedsSaldo));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ tipo: true, data_inicio: true, data_fim: true });
    const errors: string[] = [];
    if (!form.tipo) errors.push('Tipo de Ausencia');
    if (!form.data_inicio) errors.push('Data de Inicio');
    if (!form.data_fim) errors.push('Data de Fim');
    if (errors.length > 0) {
      setError(`Preencha os campos obrigatorios: ${errors.join(', ')}`);
      return;
    }
    if (form.dias_total <= 0) {
      setError('A data de fim deve ser posterior a data de inicio.');
      return;
    }
    if (isEndBeforeStart(form.data_inicio, form.data_fim)) {
      setError('A data de fim nao pode ser menor que a data de inicio.');
      return;
    }
    if (form.tipo === 'ferias' && form.dias_total < 5) {
      setError('Periodo minimo de ferias e de 5 dias corridos (CLT Art. 134 §1).');
      return;
    }
    if (
      form.periodo_aquisitivo_inicio &&
      form.periodo_aquisitivo_fim &&
      form.periodo_aquisitivo_fim < form.periodo_aquisitivo_inicio
    ) {
      setError('Periodo aquisitivo fim nao pode ser menor que o inicio.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editTarget) {
        await employeesApi.updateVacation(editTarget.id, {
          tipo: form.tipo,
          data_inicio: form.data_inicio,
          data_fim: form.data_fim,
          dias_total: form.dias_total,
          periodo_aquisitivo_inicio: form.periodo_aquisitivo_inicio || undefined,
          periodo_aquisitivo_fim: form.periodo_aquisitivo_fim || undefined,
          observacoes: form.observacoes || undefined,
        });
      } else {
        await employeesApi.createVacation({
          users_id: usersId,
          tipo: form.tipo,
          data_inicio: form.data_inicio,
          data_fim: form.data_fim,
          dias_total: form.dias_total,
          periodo_aquisitivo_inicio: form.periodo_aquisitivo_inicio || undefined,
          periodo_aquisitivo_fim: form.periodo_aquisitivo_fim || undefined,
          observacoes: form.observacoes || undefined,
        });
      }
      onSaved();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Ocorreu um erro ao salvar. Tente novamente.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const readonlyPeriodo = isFeriasTipo && periodoAutoFilled && !editTarget;

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
            style={{ width: '520px', maxWidth: '95vw', padding: '28px' }}
          >
            <h3 style={{ marginBottom: '16px' }}>
              {editTarget ? 'Editar Solicitacao' : 'Nova Solicitacao'}
            </h3>

            {/* ── Saldo disponivel info bar ── */}
            {balance !== null && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  background: diasDisponiveis <= 0 ? '#FDE8E8' : 'var(--color-primary-bg, #EEF4FF)',
                  border: `1px solid ${diasDisponiveis <= 0 ? '#C0392B' : 'var(--color-primary-border, #B8CFFE)'}`,
                  borderRadius: '6px',
                  marginBottom: '16px',
                }}
              >
                <Info
                  size={15}
                  style={{
                    color: diasDisponiveis <= 0 ? '#C0392B' : 'var(--color-primary)',
                    flexShrink: 0,
                  }}
                />
                {diasDisponiveis <= 0 ? (
                  <span style={{ fontSize: '13px', color: '#C0392B', fontWeight: 600 }}>
                    Sem saldo disponivel para ferias
                  </span>
                ) : (
                  <span style={{ fontSize: '13px', color: 'var(--color-primary-text)' }}>
                    Saldo disponivel:{' '}
                    <strong style={{ color: 'var(--color-primary)' }}>
                      {diasDisponiveis} dias
                    </strong>{' '}
                    de {diasDireito}
                  </span>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Tipo */}
              <div className="input-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                  Tipo de Ausencia <span style={{ color: '#C0392B' }}>*</span>
                </label>
                <SearchableSelect
                  options={TIPO_OPTIONS}
                  value={form.tipo || undefined}
                  onChange={v => handleFieldChange('tipo', v != null ? String(v) : '')}
                  placeholder="Selecione o tipo"
                  style={{
                    ...(touched.tipo && !form.tipo ? { borderColor: '#C0392B' } : {}),
                  }}
                />
                {touched.tipo && !form.tipo && (
                  <span style={{ color: '#C0392B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Campo obrigatorio
                  </span>
                )}
              </div>

              {/* Dates row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '4px' }}>
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                    Data de Inicio <span style={{ color: '#C0392B' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.data_inicio}
                    onChange={e => handleDateChange('data_inicio', e.target.value)}
                    style={{
                      ...(touched.data_inicio && !form.data_inicio ? { borderColor: '#C0392B' } : {}),
                    }}
                  />
                  {touched.data_inicio && !form.data_inicio && (
                    <span style={{ color: '#C0392B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                      Campo obrigatorio
                    </span>
                  )}
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                    Data de Fim <span style={{ color: '#C0392B' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.data_fim}
                    onChange={e => handleDateChange('data_fim', e.target.value)}
                    min={form.data_inicio || undefined}
                    style={{
                      ...(touched.data_fim && !form.data_fim ? { borderColor: '#C0392B' } : {}),
                    }}
                  />
                  {touched.data_fim && !form.data_fim && (
                    <span style={{ color: '#C0392B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                      Campo obrigatorio
                    </span>
                  )}
                </div>
              </div>

              {/* Period counter for ferias */}
              {isFeriasTipo && form.data_inicio && form.data_fim && (
                <div style={{ marginBottom: '14px', marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      color: existingCount >= 3 ? '#C0392B' : 'var(--color-secondary-text)',
                      fontWeight: existingCount >= 3 ? 600 : 400,
                    }}
                  >
                    Periodo {existingCount + 1} de 3 permitidos
                    {existingCount >= 3 && ' — limite atingido'}
                  </span>
                </div>
              )}

              {/* Dias total (read-only, auto-calculated) */}
              <div className="input-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                  Total de Dias
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={form.dias_total}
                  readOnly
                  style={{ background: 'var(--color-secondary-bg)', cursor: 'not-allowed' }}
                />

                {/* CLT real-time feedback */}
                {isFeriasTipo && belowMinimum && (
                  <span style={{ color: '#C0392B', fontSize: '11px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    Minimo de 5 dias corridos (CLT Art. 134 §1)
                  </span>
                )}
                {isFeriasTipo && exceedsSaldo && !belowMinimum && (
                  <span style={{ color: '#C0392B', fontSize: '11px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    Excede o saldo disponivel ({diasDisponiveis} dias)
                  </span>
                )}

                {/* Compact CLT info box */}
                {isFeriasTipo && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '7px 10px',
                      background: '#EEF4FF',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#1D5CC6',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px',
                    }}
                  >
                    <Info size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span>
                      Ferias podem ser divididas em ate 3 periodos: um com no minimo 14 dias e os demais com no minimo 5 dias (CLT Art. 134 §1).
                    </span>
                  </div>
                )}
              </div>

              {/* Periodo aquisitivo */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500 }}>
                    Periodo Aquisitivo
                  </label>
                  {readonlyPeriodo && (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        background: '#EEF4FF',
                        color: '#1D5CC6',
                        borderRadius: '4px',
                        fontWeight: 500,
                      }}
                    >
                      Auto
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <input
                      type="date"
                      className="input-field"
                      value={form.periodo_aquisitivo_inicio}
                      onChange={e => handleFieldChange('periodo_aquisitivo_inicio', e.target.value)}
                      readOnly={readonlyPeriodo}
                      style={readonlyPeriodo ? { background: 'var(--color-secondary-bg)', cursor: 'not-allowed' } : {}}
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="date"
                      className="input-field"
                      value={form.periodo_aquisitivo_fim}
                      onChange={e => handleFieldChange('periodo_aquisitivo_fim', e.target.value)}
                      min={form.periodo_aquisitivo_inicio || undefined}
                      readOnly={readonlyPeriodo}
                      style={readonlyPeriodo ? { background: 'var(--color-secondary-bg)', cursor: 'not-allowed' } : {}}
                    />
                  </div>
                </div>
                {readonlyPeriodo && (
                  <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '4px', display: 'block' }}>
                    Preenchido automaticamente com base na admissao. Altere o tipo para editar manualmente.
                  </span>
                )}
              </div>

              {/* Observacoes */}
              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                  Observacoes
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={form.observacoes}
                  onChange={e => handleFieldChange('observacoes', e.target.value)}
                  placeholder="Informacoes adicionais..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Error banner */}
              {error && <FormErrorAlert message={error} />}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitDisabled}
                  title={
                    belowMinimum
                      ? 'Minimo de 5 dias corridos'
                      : exceedsSaldo
                        ? `Excede o saldo disponivel (${diasDisponiveis} dias)`
                        : undefined
                  }
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Licencas Info Cards ──────────────────────────────────────────────────────

interface LicencasInfoCardsProps {
  vacations: EmployeeVacation[];
}

function LicencasInfoCards({ vacations }: LicencasInfoCardsProps) {
  return (
    <div
      style={{
        padding: '10px 14px',
        background: 'var(--color-card-bg)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <FileText size={13} style={{ color: 'var(--color-secondary-text)' }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary-text)' }}>
          Licencas e Abonos
        </span>
        <span style={{ fontSize: '10px', color: 'var(--color-secondary-text)' }}>
          (informativo — regras variam por empresa)
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {LICENCAS_INFO.map(lic => {
          const used = vacations.filter(
            v => v.tipo === lic.tipo && v.status !== 'cancelado'
          );
          const totalDias = used.reduce((acc, v) => acc + (v.dias_total ?? 0), 0);
          const IconComp = lic.icon;

          return (
            <div
              key={lic.tipo}
              style={{
                flex: '1 1 0',
                minWidth: '180px',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                borderLeft: `3px solid ${lic.color}`,
                background: 'var(--color-secondary-bg, #fafafa)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <IconComp size={12} style={{ color: lic.color, flexShrink: 0 }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary-text)' }}>{lic.label}</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-secondary-text)', lineHeight: 1.4 }}>
                {lic.duracao}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-secondary-text)', marginTop: '3px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>{lic.quemPaga}</span>
                <span style={{ fontWeight: 600, color: used.length > 0 ? 'var(--color-primary-text)' : 'var(--color-secondary-text)' }}>
                  {used.length > 0 ? `${used.length}x · ${totalDias}d` : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Banner component ──────────────────────────────────────────────────────────

interface VacationBannerProps {
  balance: VacationBalance;
}

function VacationBanner({ balance }: VacationBannerProps) {
  // Determine urgency level based on concessivo end date
  const urgency: 'expired' | 'warning' | 'normal' | 'no-date' = (() => {
    if (!balance.data_prevista_ferias) return 'no-date';
    if (!balance.periodo_concessivo_fim) return 'normal';
    const diff = daysUntil(balance.periodo_concessivo_fim.substring(0, 10));
    if (diff < 0) return 'expired';
    if (diff <= 60) return 'warning';
    return 'normal';
  })();

  const bannerBg =
    urgency === 'expired'
      ? '#FDE8E8'
      : urgency === 'warning'
        ? '#FFFBF0'
        : 'var(--color-primary-bg, #EEF4FF)';

  const bannerBorder =
    urgency === 'expired'
      ? '#F5C6C6'
      : urgency === 'warning'
        ? '#F7DFA0'
        : 'var(--color-primary-border, #C5D8FF)';

  if (urgency === 'no-date') {
    return (
      <motion.div
        variants={fadeUpChild}
        initial="initial"
        animate="animate"
        style={{
          padding: '10px 16px',
          background: 'var(--color-card-bg)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <Calendar size={15} style={{ color: 'var(--color-secondary-text)', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)', fontStyle: 'italic' }}>
          Cadastre a data de admissao para calculo automatico das proximas ferias.
        </span>
      </motion.div>
    );
  }

  const diffDays = balance.periodo_concessivo_fim
    ? daysUntil(balance.periodo_concessivo_fim.substring(0, 10))
    : null;

  return (
    <motion.div
      variants={fadeUpChild}
      initial="initial"
      animate="animate"
      style={{
        padding: '10px 16px',
        background: bannerBg,
        borderRadius: '8px',
        border: `1px solid ${bannerBorder}`,
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        flexWrap: 'wrap',
        minHeight: '44px',
      }}
    >
      {/* Left: Proximas Ferias */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 auto', marginRight: '20px' }}>
        <Calendar size={15} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
        <div>
          <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)', display: 'block', lineHeight: 1.2 }}>
            Proximas Ferias
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-text)', lineHeight: 1.2 }}>
            {formatDateLocal(balance.data_prevista_ferias!.substring(0, 10))}
          </span>
        </div>
      </div>

      {/* Separator */}
      {balance.periodo_aquisitivo_inicio && balance.periodo_aquisitivo_fim && (
        <span style={{ color: 'var(--color-border)', fontSize: '18px', marginRight: '20px', opacity: 0.5 }}>|</span>
      )}

      {/* Center: Periodo Aquisitivo */}
      {balance.periodo_aquisitivo_inicio && balance.periodo_aquisitivo_fim && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 auto' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>Periodo Aquisitivo:</span>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-primary-text)' }}>
            {formatDateLocal(balance.periodo_aquisitivo_inicio.substring(0, 10))}
            {' a '}
            {formatDateLocal(balance.periodo_aquisitivo_fim.substring(0, 10))}
          </span>
        </div>
      )}

      {/* Right: Alert badge */}
      {diffDays !== null && urgency !== 'normal' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', flexShrink: 0 }}>
          {urgency === 'expired' ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                background: '#C0392B',
                color: '#fff',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              <AlertTriangle size={12} />
              Periodo Concessivo Vencido
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                background: '#B98E00',
                color: '#fff',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              <AlertTriangle size={12} />
              {diffDays}d para vencer
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface VacationsTabProps {
  usersId: number;
}

export default function VacationsTab({ usersId }: VacationsTabProps) {
  const [vacations, setVacations] = useState<EmployeeVacation[]>([]);
  const [balance, setBalance] = useState<VacationBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [statusFilter, setStatusFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EmployeeVacation | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<EmployeeVacation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [approvingId, setApprovingId] = useState<number | null>(null);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchVacations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await employeesApi.listVacations({
        users_id: usersId,
        status: statusFilter || undefined,
        page,
        per_page: perPage,
      });
      setVacations(result.items ?? []);
      setTotalPages(result.pageTotal ?? 1);
      setTotalItems(result.itemsTotal ?? 0);
    } catch {
      setVacations([]);
    } finally {
      setLoading(false);
    }
  }, [usersId, statusFilter, page, perPage]);

  const fetchBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const result = await employeesApi.getVacationBalance(usersId);
      setBalance(result);
    } catch {
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  }, [usersId]);

  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleFilterChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  function openCreateModal() {
    setEditTarget(null);
    setIsFormOpen(true);
  }

  function openEditModal(vacation: EmployeeVacation) {
    setEditTarget(vacation);
    setIsFormOpen(true);
  }

  function handleFormSaved() {
    setIsFormOpen(false);
    fetchVacations();
    fetchBalance();
  }

  async function handleApprove(vacation: EmployeeVacation, status: 'aprovado' | 'cancelado') {
    setApprovingId(vacation.id);
    try {
      await employeesApi.approveVacation(vacation.id, status);
      fetchVacations();
      fetchBalance();
    } catch {
      // silently ignore — UI will reflect unchanged state
    } finally {
      setApprovingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await employeesApi.deleteVacation(deleteTarget.id);
      setDeleteTarget(null);
      fetchVacations();
      fetchBalance();
    } catch {
      // silently ignore
    } finally {
      setDeleting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Banner Data Prevista de Ferias */}
      {!balanceLoading && balance && <VacationBanner balance={balance} />}
      {!balanceLoading && !balance && (
        <motion.div
          variants={fadeUpChild}
          initial="initial"
          animate="animate"
          style={{
            padding: '10px 16px',
            background: 'var(--color-card-bg)',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Calendar size={15} style={{ color: 'var(--color-secondary-text)', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)', fontStyle: 'italic' }}>
            Cadastre a data de admissao para calculo automatico das proximas ferias.
          </span>
        </motion.div>
      )}

      {/* Licencas info cards */}
      {!loading && (
        <motion.div variants={staggerParent} initial="initial" animate="animate">
          <LicencasInfoCards vacations={vacations} />
        </motion.div>
      )}

      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: 'var(--color-secondary-text)' }} />
          <SearchableSelect
            options={STATUS_FILTER_OPTIONS.filter(o => o.value !== '')}
            value={statusFilter || undefined}
            onChange={v => handleFilterChange(v != null ? String(v) : '')}
            placeholder="Todos os status"
            allowClear
            style={{ minWidth: '180px' }}
          />
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} style={{ marginRight: '6px' }} />
          Nova Solicitacao
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <LoadingSpinner />
        </div>
      ) : vacations.length === 0 ? (
        <EmptyState
          message="Nenhuma solicitacao encontrada. Adicione uma nova solicitacao de ferias ou ausencia para este colaborador."
        />
      ) : (
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Tipo', 'Data Inicio', 'Data Fim', 'Dias', 'Status', 'Acoes'].map(col => (
                  <th
                    key={col}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--color-secondary-text)',
                      borderBottom: '1px solid var(--color-border)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {vacations.map(vacation => (
                <motion.tr
                  key={vacation.id}
                  variants={tableRowVariants}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td style={{ padding: '12px 14px', fontSize: '14px' }}>
                    {TIPO_LABELS[vacation.tipo] ?? vacation.tipo}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '14px' }}>
                    {formatDate(vacation.data_inicio)}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '14px' }}>
                    {formatDate(vacation.data_fim)}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 600 }}>
                    {vacation.dias_total}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <StatusBadge status={vacation.status} />
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {vacation.status === 'pendente' && (
                        <>
                          <button
                            className="btn btn-icon"
                            title="Aprovar"
                            disabled={approvingId === vacation.id}
                            onClick={() => handleApprove(vacation, 'aprovado')}
                            style={{ color: '#028F58' }}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            className="btn btn-icon"
                            title="Cancelar"
                            disabled={approvingId === vacation.id}
                            onClick={() => handleApprove(vacation, 'cancelado')}
                            style={{ color: '#C0392B' }}
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {vacation.status !== 'aprovado' && vacation.status !== 'cancelado' && (
                        <button
                          className="btn btn-icon"
                          title="Editar"
                          onClick={() => openEditModal(vacation)}
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {vacation.status !== 'aprovado' && vacation.status !== 'cancelado' && (
                        <button
                          className="btn btn-icon"
                          title="Excluir"
                          onClick={() => setDeleteTarget(vacation)}
                          style={{ color: '#C0392B' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          perPage={perPage}
          totalItems={totalItems}
          onPageChange={setPage}
          onPerPageChange={newPerPage => {
            setPerPage(newPerPage);
            setPage(1);
          }}
        />
      )}

      {/* Form modal */}
      <VacationFormModal
        isOpen={isFormOpen}
        editTarget={editTarget}
        onClose={() => setIsFormOpen(false)}
        onSaved={handleFormSaved}
        usersId={usersId}
        balance={balance}
        vacations={vacations}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Excluir Solicitacao"
        message={`Deseja excluir a solicitacao de ${deleteTarget ? (TIPO_LABELS[deleteTarget.tipo] ?? deleteTarget.tipo) : ''} de ${deleteTarget ? formatDate(deleteTarget.data_inicio) : ''} a ${deleteTarget ? formatDate(deleteTarget.data_fim) : ''}? Esta acao nao pode ser desfeita.`}
        confirmLabel={deleting ? 'Excluindo...' : 'Excluir'}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

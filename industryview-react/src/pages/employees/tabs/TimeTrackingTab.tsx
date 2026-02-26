import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  staggerParent,
  tableRowVariants,
  modalBackdropVariants,
  modalContentVariants,
} from '../../../lib/motion';
import { workforceApi, workScheduleApi } from '../../../services';
import type { WorkforceDailyLog, EmployeeWorkSchedule } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { Clock, CalendarDays, Plus, Edit, Trash2, LogOut, FileSpreadsheet, Download, Settings } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface TimeTrackingTabProps {
  usersId: number;
}

type AttendanceStatus = 'presente' | 'ausente' | 'meio_periodo';

interface LogFormState {
  date: string;
  entrada1: string;    // check_in
  saida1: string;      // saida_intervalo (1ª saída → intervalo)
  entrada2: string;    // entrada_intervalo (retorno do intervalo)
  saida2: string;      // check_out
  observation: string;
}

interface FormErrors {
  date?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PER_PAGE_OPTIONS = [10, 20, 50];

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; bg: string; color: string }> = {
  presente:     { label: 'Presente',     bg: '#F4FEF9', color: '#028F58' },
  ausente:      { label: 'Ausente',      bg: '#FDE8E8', color: '#C0392B' },
  meio_periodo: { label: 'Meio Período', bg: '#FFF9E6', color: '#B98E00' },
};

const STATUS_OPTIONS: AttendanceStatus[] = ['presente', 'ausente', 'meio_periodo'];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildDefaultForm(): LogFormState {
  return {
    date: todayIso(),
    entrada1: '',
    saida1: '',
    entrada2: '',
    saida2: '',
    observation: '',
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  // log_date is "YYYY-MM-DD" — parse as local date to avoid UTC offset shift
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
}

function formatTime(timeStr?: string | null): string {
  if (!timeStr) return '-';
  if (timeStr.includes('T')) {
    return new Date(timeStr).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return timeStr.slice(0, 5);
}

function extractTime(dateStr?: string | null): string {
  if (!dateStr) return '';
  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return dateStr.slice(0, 5);
}


function buildIsoDateTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

function formatDecimalHours(val?: number | string | null): string {
  if (val == null || Number(val) === 0) return '-';
  const n = Number(val);
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return m > 0 ? `${h}h ${String(m).padStart(2, '0')}min` : `${h}h`;
}

/** Compute interval duration from two ISO or HH:MM strings */
function computeIntervalo(saida1?: string | null, entrada2?: string | null): string {
  if (!saida1 || !entrada2) return '-';
  const parseMs = (val: string) =>
    val.includes('T') ? new Date(val).getTime() : new Date(`1970-01-01T${val}`).getTime();
  const diffMs = parseMs(entrada2) - parseMs(saida1);
  if (diffMs <= 0) return '-';
  const totalMinutes = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}min`;
}

/** Client-side interval display from HH:MM strings only */
function calcIntervaloDisplay(saida1: string, entrada2: string): string {
  if (!saida1 || !entrada2) return '-';
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const diff = toMin(entrada2) - toMin(saida1);
  if (diff <= 0) return '-';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}min`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: AttendanceStatus | null }) {
  if (!status) {
    return <span style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>-</span>;
  }
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="badge"
      style={{ backgroundColor: cfg.bg, color: cfg.color, borderRadius: '12px' }}
    >
      {cfg.label}
    </span>
  );
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

function SummaryCard({ icon, label, value, color }: SummaryCardProps) {
  return (
    <div
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          backgroundColor: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', margin: 0 }}>
          {label}
        </p>
      </div>
    </div>
  );
}

// ── Log Form Modal ────────────────────────────────────────────────────────────

interface LogFormModalProps {
  isOpen: boolean;
  editingLog: WorkforceDailyLog | null;
  onClose: () => void;
  onSaved: () => void;
  usersId: number;
}

function LogFormModal({ isOpen, editingLog, onClose, onSaved, usersId }: LogFormModalProps) {
  const [form, setForm] = useState<LogFormState>(buildDefaultForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Populate form when editing an existing log
  useEffect(() => {
    if (editingLog) {
      setForm({
        date: editingLog.log_date.slice(0, 10),
        entrada1: extractTime(editingLog.check_in),
        saida1:   extractTime(editingLog.saida_intervalo),
        entrada2: extractTime(editingLog.entrada_intervalo),
        saida2:   extractTime(editingLog.check_out),
        observation: editingLog.observation || '',
      });
    } else {
      setForm(buildDefaultForm());
    }
    setErrors({});
    setToastMessage('');
  }, [editingLog, isOpen]);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.date) next.date = 'Campo obrigatório';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        log_date:          form.date,
        check_in:          form.entrada1 ? buildIsoDateTime(form.date, form.entrada1) : undefined,
        saida_intervalo:   form.saida1   ? buildIsoDateTime(form.date, form.saida1)   : undefined,
        entrada_intervalo: form.entrada2 ? buildIsoDateTime(form.date, form.entrada2) : undefined,
        check_out:         form.saida2   ? buildIsoDateTime(form.date, form.saida2)   : undefined,
        observation: form.observation || undefined,
      };
      if (editingLog) {
        await workforceApi.updateDailyLog(editingLog.id, payload);
      } else {
        await workforceApi.createDailyLog({ ...payload, users_id: usersId });
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save daily log:', err);
      setToastMessage('Erro ao salvar registro. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  const isEditing = Boolean(editingLog);
  const intervaloDisplay = calcIntervaloDisplay(form.saida1, form.entrada2);

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
            onClick={(e) => e.stopPropagation()}
            style={{ width: '560px', maxWidth: '95vw', padding: '28px' }}
          >
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                {isEditing ? 'Editar Registro de Ponto' : 'Registrar Ponto'}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                {isEditing ? 'Atualize as informações do registro.' : 'Preencha os dados do novo registro.'}
              </p>
            </div>

            {/* Error toast */}
            {toastMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FDE8E8',
                  border: '1px solid #F5B7B1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#C0392B',
                  marginBottom: '16px',
                }}
              >
                {toastMessage}
              </div>
            )}

            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Date */}
              <div className="input-group">
                <label>
                  Data <span style={{ color: '#C0392B' }}>*</span>
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={form.date}
                  max={todayIso()}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, date: e.target.value }));
                    if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                  }}
                  style={errors.date ? { borderColor: '#C0392B' } : undefined}
                />
                {errors.date && (
                  <span style={{ color: '#C0392B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    {errors.date}
                  </span>
                )}
              </div>

              {/* Período 1: Entrada → Saída */}
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Período 1
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label>Entrada</label>
                    <input
                      type="time"
                      className="input-field"
                      value={form.entrada1}
                      onChange={(e) => setForm((f) => ({ ...f, entrada1: e.target.value }))}
                    />
                  </div>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label>Saída (para intervalo)</label>
                    <input
                      type="time"
                      className="input-field"
                      value={form.saida1}
                      onChange={(e) => setForm((f) => ({ ...f, saida1: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Intervalo calculado */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                  color: 'var(--color-secondary-text)',
                }}
              >
                <Clock size={14} />
                <span>
                  Intervalo: <strong style={{ color: 'var(--color-text)' }}>{intervaloDisplay}</strong>
                </span>
              </div>

              {/* Período 2: Entrada → Saída */}
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Período 2
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label>Entrada (retorno)</label>
                    <input
                      type="time"
                      className="input-field"
                      value={form.entrada2}
                      onChange={(e) => setForm((f) => ({ ...f, entrada2: e.target.value }))}
                    />
                  </div>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label>Saída</label>
                    <input
                      type="time"
                      className="input-field"
                      value={form.saida2}
                      onChange={(e) => setForm((f) => ({ ...f, saida2: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Observation */}
              <div className="input-group">
                <label>Observação</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={form.observation}
                  placeholder="Informações adicionais (opcional)"
                  onChange={(e) => setForm((f) => ({ ...f, observation: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: '60px' }}
                />
              </div>
            </div>

            {/* Footer actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Registrar'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Work Schedule Section ─────────────────────────────────────────────────────

type DayKey = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';

interface DayConfig {
  key: DayKey;
  label: string;
}

const WEEK_DAYS: DayConfig[] = [
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
  { key: 'sab', label: 'Sab' },
  { key: 'dom', label: 'Dom' },
];

type ScheduleFormState = Omit<EmployeeWorkSchedule, 'id' | 'users_id' | 'created_at' | 'updated_at'>;

function buildDefaultSchedule(): ScheduleFormState {
  return {
    tolerancia_entrada: 5,
    intervalo_almoco_min: 60,
    seg_ativo: true,  seg_entrada: '08:00', seg_saida: '17:00',
    ter_ativo: true,  ter_entrada: '08:00', ter_saida: '17:00',
    qua_ativo: true,  qua_entrada: '08:00', qua_saida: '17:00',
    qui_ativo: true,  qui_entrada: '08:00', qui_saida: '17:00',
    sex_ativo: true,  sex_entrada: '08:00', sex_saida: '17:00',
    sab_ativo: false, sab_entrada: null,    sab_saida: null,
    dom_ativo: false, dom_entrada: null,    dom_saida: null,
  };
}

function scheduleToFormState(schedule: EmployeeWorkSchedule): ScheduleFormState {
  return {
    tolerancia_entrada: schedule.tolerancia_entrada,
    intervalo_almoco_min: schedule.intervalo_almoco_min,
    seg_ativo: schedule.seg_ativo, seg_entrada: schedule.seg_entrada, seg_saida: schedule.seg_saida,
    ter_ativo: schedule.ter_ativo, ter_entrada: schedule.ter_entrada, ter_saida: schedule.ter_saida,
    qua_ativo: schedule.qua_ativo, qua_entrada: schedule.qua_entrada, qua_saida: schedule.qua_saida,
    qui_ativo: schedule.qui_ativo, qui_entrada: schedule.qui_entrada, qui_saida: schedule.qui_saida,
    sex_ativo: schedule.sex_ativo, sex_entrada: schedule.sex_entrada, sex_saida: schedule.sex_saida,
    sab_ativo: schedule.sab_ativo, sab_entrada: schedule.sab_entrada, sab_saida: schedule.sab_saida,
    dom_ativo: schedule.dom_ativo, dom_entrada: schedule.dom_entrada, dom_saida: schedule.dom_saida,
  };
}

interface WorkScheduleSectionProps {
  usersId: number;
}

function WorkScheduleSection({ usersId }: WorkScheduleSectionProps) {
  const [schedule, setSchedule] = useState<EmployeeWorkSchedule | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ScheduleFormState>(buildDefaultSchedule());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchSchedule = useCallback(async () => {
    setLoadingSchedule(true);
    setNotConfigured(false);
    try {
      const data = await workScheduleApi.getWorkSchedule(usersId);
      setSchedule(data);
      setForm(scheduleToFormState(data));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setNotConfigured(true);
        setSchedule(null);
      } else {
        console.error('Failed to load work schedule:', err);
      }
    } finally {
      setLoadingSchedule(false);
    }
  }, [usersId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  function handleStartEdit() {
    if (notConfigured || !schedule) {
      setForm(buildDefaultSchedule());
    } else {
      setForm(scheduleToFormState(schedule));
    }
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const saved = await workScheduleApi.upsertWorkSchedule(usersId, form);
      setSchedule(saved);
      setNotConfigured(false);
      setIsEditing(false);
      showToast('Regra de ponto salva com sucesso!', 'success');
    } catch (err) {
      console.error('Failed to save work schedule:', err);
      showToast('Erro ao salvar regra de ponto. Tente novamente.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function setDayField(day: DayKey, field: 'ativo' | 'entrada' | 'saida', value: boolean | string | null) {
    const fullKey = `${day}_${field}` as keyof ScheduleFormState;
    setForm((prev) => ({ ...prev, [fullKey]: value }));
  }

  // ── Render helpers ──────────────────────────────────────────────────────────

  function renderDayView(day: DayConfig) {
    const ativo = form[`${day.key}_ativo` as keyof ScheduleFormState] as boolean;
    const entrada = form[`${day.key}_entrada` as keyof ScheduleFormState] as string | null;
    const saida = form[`${day.key}_saida` as keyof ScheduleFormState] as string | null;

    return (
      <div
        key={day.key}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          padding: '12px 8px',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          backgroundColor: ativo ? 'var(--color-card-bg)' : 'var(--color-bg)',
          minWidth: '72px',
          flex: 1,
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {day.label}
        </span>
        {!ativo ? (
          <span
            className="badge"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-secondary-text)', border: '1px solid var(--color-border)', fontSize: '11px' }}
          >
            Folga
          </span>
        ) : (
          <span style={{ fontSize: '13px', fontVariantNumeric: 'tabular-nums', color: 'var(--color-text)', fontWeight: 500 }}>
            {entrada && saida ? `${entrada.slice(0, 5)} → ${saida.slice(0, 5)}` : '-'}
          </span>
        )}
      </div>
    );
  }

  function renderDayEdit(day: DayConfig) {
    const ativo = form[`${day.key}_ativo` as keyof ScheduleFormState] as boolean;
    const entrada = (form[`${day.key}_entrada` as keyof ScheduleFormState] as string | null) ?? '';
    const saida = (form[`${day.key}_saida` as keyof ScheduleFormState] as string | null) ?? '';

    return (
      <div
        key={day.key}
        style={{
          padding: '14px',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          backgroundColor: ativo ? 'var(--color-card-bg)' : 'var(--color-bg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Day header with toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => {
              setDayField(day.key, 'ativo', e.target.checked);
              if (!e.target.checked) {
                setDayField(day.key, 'entrada', null);
                setDayField(day.key, 'saida', null);
              } else {
                setDayField(day.key, 'entrada', '08:00');
                setDayField(day.key, 'saida', '17:00');
              }
            }}
            style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
            {day.label}
          </span>
          {!ativo && (
            <span
              className="badge"
              style={{ fontSize: '11px', backgroundColor: 'var(--color-bg)', color: 'var(--color-secondary-text)', border: '1px solid var(--color-border)', marginLeft: 'auto' }}
            >
              Folga
            </span>
          )}
        </label>

        {/* Time inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>Entrada</label>
            <input
              type="time"
              className="input-field"
              value={entrada}
              disabled={!ativo}
              onChange={(e) => setDayField(day.key, 'entrada', e.target.value || null)}
              style={{ fontSize: '13px', opacity: ativo ? 1 : 0.4 }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>Saída</label>
            <input
              type="time"
              className="input-field"
              value={saida}
              disabled={!ativo}
              onChange={(e) => setDayField(day.key, 'saida', e.target.value || null)}
              style={{ fontSize: '13px', opacity: ativo ? 1 : 0.4 }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary)18',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              flexShrink: 0,
            }}
          >
            <Settings size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
              Regra de Ponto
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-secondary-text)' }}>
              Jornada semanal e tolerâncias
            </p>
          </div>
        </div>

        {/* Action buttons */}
        {!loadingSchedule && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {isEditing ? (
              <>
                <button className="btn btn-secondary" onClick={handleCancel} disabled={saving}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={handleStartEdit}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Edit size={14} />
                {notConfigured ? 'Configurar' : 'Editar'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px',
            backgroundColor: toast.type === 'success' ? '#F4FEF9' : '#FDE8E8',
            border: `1px solid ${toast.type === 'success' ? '#028F5830' : '#F5B7B1'}`,
            color: toast.type === 'success' ? '#028F58' : '#C0392B',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Loading state */}
      {loadingSchedule ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
          <LoadingSpinner />
        </div>
      ) : notConfigured && !isEditing ? (
        /* Not configured empty state */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            padding: '28px 0',
            color: 'var(--color-secondary-text)',
          }}
        >
          <Settings size={36} style={{ opacity: 0.35 }} />
          <p style={{ margin: 0, fontSize: '14px' }}>Nenhuma regra de ponto configurada.</p>
          <button className="btn btn-primary" onClick={handleStartEdit} style={{ marginTop: '4px' }}>
            Configurar agora
          </button>
        </div>
      ) : isEditing ? (
        /* Edit mode */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {WEEK_DAYS.map((day) => renderDayEdit(day))}
          </div>

          {/* Tolerance fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>
                Tolerância de entrada (min)
              </label>
              <input
                type="number"
                className="input-field"
                min={0}
                max={60}
                value={form.tolerancia_entrada ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tolerancia_entrada: e.target.value === '' ? null : Number(e.target.value) }))
                }
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>
                Intervalo de almoço (min)
              </label>
              <input
                type="number"
                className="input-field"
                min={0}
                max={120}
                value={form.intervalo_almoco_min ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, intervalo_almoco_min: e.target.value === '' ? null : Number(e.target.value) }))
                }
              />
            </div>
          </div>
        </div>
      ) : (
        /* View mode */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Days overview row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {WEEK_DAYS.map((day) => renderDayView(day))}
          </div>

          {/* Tolerance summary row */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
              paddingTop: '12px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <span style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
              Tolerancia entrada:{' '}
              <strong style={{ color: 'var(--color-text)' }}>
                {schedule?.tolerancia_entrada != null ? `${schedule.tolerancia_entrada} min` : '-'}
              </strong>
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
              Intervalo almoco:{' '}
              <strong style={{ color: 'var(--color-text)' }}>
                {schedule?.intervalo_almoco_min != null ? `${schedule.intervalo_almoco_min} min` : '-'}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function TimeTrackingTab({ usersId }: TimeTrackingTabProps) {
  const [logs, setLogs] = useState<WorkforceDailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | ''>('');

  // Modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkforceDailyLog | null>(null);
  const [deletingLog, setDeletingLog] = useState<WorkforceDailyLog | null>(null);
  const [checkOutLog, setCheckOutLog] = useState<WorkforceDailyLog | null>(null);
  const [checkOutTime, setCheckOutTime] = useState('');
  const [checkOutSaving, setCheckOutSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Import modal state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: { row: number; message: string }[] } | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await workforceApi.listDailyLogs({
        users_id: usersId,
        page,
        per_page: perPage,
        log_date: startDate || undefined,
      });

      let items: WorkforceDailyLog[] = data.items || [];

      // Client-side end-date bound (API may not support date range natively)
      if (endDate) {
        items = items.filter((log) => log.log_date.slice(0, 10) <= endDate);
      }

      // Client-side status filter
      if (statusFilter) {
        items = items.filter((log) => log.status === statusFilter);
      }

      setLogs(items);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load time tracking data:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, page, perPage, startDate, endDate, statusFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Summary computations from currently loaded page
  const daysPresent = logs.filter((l) => l.status === 'presente').length;

  function sumDecimalField(field: 'hours_normal' | 'hours_overtime' | 'hours_he_100'): string {
    const total = logs.reduce((acc, log) => acc + Number(log[field] || 0), 0);
    return formatDecimalHours(total > 0 ? total : null);
  }

  // ── Event handlers ──────────────────────────────────────────────────────────

  function openCreateModal() {
    setEditingLog(null);
    setFormModalOpen(true);
  }

  function openEditModal(log: WorkforceDailyLog) {
    setEditingLog(log);
    setFormModalOpen(true);
  }

  function openDeleteModal(log: WorkforceDailyLog) {
    setDeletingLog(log);
  }

  function openCheckOutModal(log: WorkforceDailyLog) {
    setCheckOutLog(log);
    setCheckOutTime(extractTime(undefined) || formatCurrentTime());
  }

  function formatCurrentTime(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  async function handleDelete() {
    if (!deletingLog) return;
    setDeleteLoading(true);
    try {
      await workforceApi.deleteDailyLog(deletingLog.id);
      setDeletingLog(null);
      loadLogs();
    } catch (err) {
      console.error('Failed to delete daily log:', err);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleCheckOut() {
    if (!checkOutLog || !checkOutTime) return;
    setCheckOutSaving(true);
    try {
      const isoCheckOut = buildIsoDateTime(checkOutLog.log_date.slice(0, 10), checkOutTime);
      await workforceApi.checkOut(checkOutLog.id, { check_out: isoCheckOut });
      setCheckOutLog(null);
      loadLogs();
    } catch (err) {
      console.error('Failed to register check-out:', err);
    } finally {
      setCheckOutSaving(false);
    }
  }

  function clearFilters() {
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    setPage(1);
  }

  const hasActiveFilters = Boolean(startDate || endDate || statusFilter);

  // ── Import helpers ───────────────────────────────────────────────────────────

  function downloadTemplate() {
    const csvContent = 'Data,Hora Entrada,Hora Saida,Status,Observacao\n01/02/2026,07:30,17:30,presente,\n02/02/2026,08:00,12:00,meio_periodo,Consulta medica\n03/02/2026,,,ausente,Falta justificada';
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_ponto.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const result = await workforceApi.importTimesheet(importFile, usersId);
      setImportResult(result);
      if (result.imported > 0) {
        loadLogs();
      }
    } catch {
      setImportResult({ imported: 0, errors: [{ row: 0, message: 'Erro ao processar o arquivo. Verifique o formato.' }] });
    } finally {
      setImporting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Work Schedule Section */}
      <WorkScheduleSection usersId={usersId} />

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <SummaryCard
          icon={<Clock size={20} />}
          label="H. Normais (página atual)"
          value={sumDecimalField('hours_normal')}
          color="var(--color-primary)"
        />
        <SummaryCard
          icon={<Clock size={20} />}
          label="HE 50% (página atual)"
          value={sumDecimalField('hours_overtime')}
          color="#E67E22"
        />
        <SummaryCard
          icon={<Clock size={20} />}
          label="HE 100% (página atual)"
          value={sumDecimalField('hours_he_100')}
          color="#C0392B"
        />
        <SummaryCard
          icon={<CalendarDays size={20} />}
          label="Dias Presentes (página atual)"
          value={String(daysPresent)}
          color="#028F58"
        />
      </div>

      {/* Filter Bar + Action Button */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
            Data Inicial
          </label>
          <input
            type="date"
            className="input-field"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            style={{ minWidth: '160px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
            Data Final
          </label>
          <input
            type="date"
            className="input-field"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            style={{ minWidth: '160px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
            Status
          </label>
          <select
            className="select-field"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as AttendanceStatus | '');
              setPage(1);
            }}
            style={{ minWidth: '150px' }}
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button className="btn btn-secondary" onClick={clearFilters}>
            Limpar filtros
          </button>
        )}

        {/* Spacer */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setIsImportOpen(true);
              setImportFile(null);
              setImportResult(null);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <FileSpreadsheet size={16} />
            Importar Excel
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} style={{ marginRight: '6px' }} />
            Registrar Ponto
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<Clock size={48} />}
          message="Nenhum registro de ponto encontrado."
        />
      ) : (
        <div className="table-container">
          <table style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Entrada</th>
                <th style={{ whiteSpace: 'nowrap' }}>Saída</th>
                <th>Intervalo</th>
                <th style={{ whiteSpace: 'nowrap' }}>Entrada</th>
                <th style={{ whiteSpace: 'nowrap' }}>Saída</th>
                <th>Status</th>
                <th style={{ whiteSpace: 'nowrap' }}>H. Norm.</th>
                <th style={{ whiteSpace: 'nowrap' }}>HE 50%</th>
                <th style={{ whiteSpace: 'nowrap' }}>HE 100%</th>
                <th>Ações</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {logs.map((log) => {
                const hasCheckIn = Boolean(log.check_in);
                const hasCheckOut = Boolean(log.check_out);
                const canCheckOut = hasCheckIn && !hasCheckOut;

                return (
                  <motion.tr key={log.id} variants={tableRowVariants}>
                    <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{formatDate(log.log_date)}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(log.check_in)}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(log.saida_intervalo)}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-secondary-text)' }}>
                      {computeIntervalo(log.saida_intervalo, log.entrada_intervalo)}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(log.entrada_intervalo)}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(log.check_out)}
                    </td>
                    <td>
                      <StatusBadge status={log.status as AttendanceStatus | null} />
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatDecimalHours(log.hours_normal)}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', color: '#E67E22' }}>
                      {formatDecimalHours(log.hours_overtime)}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', color: '#C0392B' }}>
                      {formatDecimalHours(log.hours_he_100)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {canCheckOut && (
                          <button
                            className="btn btn-icon"
                            title="Registrar saída final"
                            onClick={() => openCheckOutModal(log)}
                            style={{ color: '#028F58' }}
                          >
                            <LogOut size={15} />
                          </button>
                        )}
                        <button
                          className="btn btn-icon"
                          title="Editar registro"
                          onClick={() => openEditModal(log)}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          className="btn btn-icon"
                          title="Excluir registro"
                          onClick={() => openDeleteModal(log)}
                          style={{ color: '#C0392B' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            perPage={perPage}
            totalItems={totalItems}
            onPageChange={(p) => setPage(p)}
            onPerPageChange={(pp) => {
              setPerPage(pp);
              setPage(1);
            }}
            perPageOptions={PER_PAGE_OPTIONS}
          />
        </div>
      )}

      {/* Create / Edit Modal */}
      <LogFormModal
        isOpen={formModalOpen}
        editingLog={editingLog}
        onClose={() => {
          setFormModalOpen(false);
          setEditingLog(null);
        }}
        onSaved={loadLogs}
        usersId={usersId}
      />

      {/* Check-out quick modal */}
      <AnimatePresence>
        {checkOutLog && (
          <motion.div
            className="modal-backdrop"
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => setCheckOutLog(null)}
            style={{ animation: 'none' }}
          >
            <motion.div
              className="modal-content"
              variants={modalContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              style={{ width: '360px', maxWidth: '95vw', padding: '28px' }}
            >
              <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 600 }}>
                Registrar Saída
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                Confirme o horário de saída do dia{' '}
                <strong>{formatDate(checkOutLog.log_date)}</strong>.
              </p>

              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label>
                  Hora de Saída <span style={{ color: '#C0392B' }}>*</span>
                </label>
                <input
                  type="time"
                  className="input-field"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setCheckOutLog(null)} disabled={checkOutSaving}>
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCheckOut}
                  disabled={checkOutSaving || !checkOutTime}
                  style={{ backgroundColor: '#028F58', borderColor: '#028F58' }}
                >
                  {checkOutSaving ? 'Salvando...' : 'Confirmar Saída'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingLog)}
        title="Excluir Registro"
        message={
          deletingLog
            ? `Tem certeza que deseja excluir o registro do dia ${formatDate(deletingLog.log_date)}? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel={deleteLoading ? 'Excluindo...' : 'Excluir'}
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeletingLog(null)}
      />

      {/* Import Excel Modal */}
      <AnimatePresence>
        {isImportOpen && (
          <motion.div
            className="modal-backdrop"
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => setIsImportOpen(false)}
            style={{ animation: 'none' }}
          >
            <motion.div
              className="modal-content"
              variants={modalContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              style={{ width: '520px', maxWidth: '95vw', padding: '28px' }}
            >
              <h3 style={{ marginBottom: '20px' }}>Importar Planilha de Ponto</h3>

              {!importResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* File upload */}
                  <div className="input-group">
                    <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>
                      Arquivo Excel/CSV <span style={{ color: '#C0392B' }}>*</span>
                    </label>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                      className="input-field"
                      style={{ padding: '8px' }}
                    />
                  </div>

                  {/* Template download */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={downloadTemplate}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                    >
                      <Download size={14} />
                      Baixar modelo
                    </button>
                    <span style={{ fontSize: 12, color: 'var(--color-secondary-text)' }}>
                      Colunas: Data, Hora Entrada, Hora Saida, Status, Observacao
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setIsImportOpen(false)}
                      disabled={importing}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleImport}
                      disabled={importing || !importFile}
                    >
                      {importing ? 'Importando...' : 'Importar'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Results view */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Success count */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      background: importResult.imported > 0 ? '#F4FEF9' : '#FDE8E8',
                      border: `1px solid ${importResult.imported > 0 ? '#028F58' : '#C0392B'}20`,
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: 16,
                        color: importResult.imported > 0 ? '#028F58' : '#C0392B',
                        margin: 0,
                      }}
                    >
                      {importResult.imported > 0
                        ? `${importResult.imported} registro(s) importado(s) com sucesso!`
                        : 'Nenhum registro foi importado.'}
                    </p>
                  </div>

                  {/* Errors list */}
                  {importResult.errors.length > 0 && (
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#C0392B' }}>
                        {importResult.errors.length} erro(s) encontrado(s):
                      </p>
                      <div style={{ maxHeight: '200px', overflow: 'auto', fontSize: 13 }}>
                        {importResult.errors.map((err, idx) => (
                          <div
                            key={idx}
                            style={{ padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}
                          >
                            <strong>Linha {err.row}:</strong> {err.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Close button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={() => setIsImportOpen(false)}>
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  staggerParent,
  tableRowVariants,
  modalBackdropVariants,
  modalContentVariants,
} from '../../../lib/motion';
import { workforceApi } from '../../../services';
import type { WorkforceDailyLog } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { Clock, CalendarDays, Plus, Edit, Trash2, LogOut, FileSpreadsheet, Download } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface TimeTrackingTabProps {
  usersId: number;
}

type AttendanceStatus = 'presente' | 'ausente' | 'meio_periodo';

interface LogFormState {
  date: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
  observation: string;
}

interface FormErrors {
  date?: string;
  status?: string;
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
    checkIn: '',
    checkOut: '',
    status: 'presente',
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

function computeWorkedHours(checkIn?: string | null, checkOut?: string | null): string {
  if (!checkIn || !checkOut) return '-';
  const parseMs = (val: string) =>
    val.includes('T') ? new Date(val).getTime() : new Date(`1970-01-01T${val}`).getTime();
  const diffMs = parseMs(checkOut) - parseMs(checkIn);
  if (diffMs <= 0) return '-';
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}min`;
}

function buildIsoDateTime(date: string, time: string): string {
  return `${date}T${time}:00`;
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
        checkIn: extractTime(editingLog.check_in),
        checkOut: extractTime(editingLog.check_out),
        status: (editingLog.status as AttendanceStatus) || 'presente',
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
    if (!form.status) next.status = 'Campo obrigatório';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingLog) {
        await workforceApi.updateDailyLog(editingLog.id, {
          log_date: form.date,
          check_in: form.checkIn ? buildIsoDateTime(form.date, form.checkIn) : undefined,
          check_out: form.checkOut ? buildIsoDateTime(form.date, form.checkOut) : undefined,
          status: form.status,
          observation: form.observation || undefined,
        });
      } else {
        await workforceApi.createDailyLog({
          users_id: usersId,
          log_date: form.date,
          check_in: form.checkIn ? buildIsoDateTime(form.date, form.checkIn) : undefined,
          check_out: form.checkOut ? buildIsoDateTime(form.date, form.checkOut) : undefined,
          status: form.status,
          observation: form.observation || undefined,
        });
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
            style={{ width: '480px', maxWidth: '95vw', padding: '28px' }}
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

              {/* Check-in and Check-out side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Hora de Entrada</label>
                  <input
                    type="time"
                    className="input-field"
                    value={form.checkIn}
                    onChange={(e) => setForm((f) => ({ ...f, checkIn: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label>Hora de Saída</label>
                  <input
                    type="time"
                    className="input-field"
                    value={form.checkOut}
                    onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="input-group">
                <label>
                  Status <span style={{ color: '#C0392B' }}>*</span>
                </label>
                <select
                  className="select-field"
                  value={form.status}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, status: e.target.value as AttendanceStatus }));
                    if (errors.status) setErrors((prev) => ({ ...prev, status: undefined }));
                  }}
                  style={errors.status ? { borderColor: '#C0392B' } : undefined}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <span style={{ color: '#C0392B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    {errors.status}
                  </span>
                )}
              </div>

              {/* Observation */}
              <div className="input-group">
                <label>Observação</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={form.observation}
                  placeholder="Informações adicionais (opcional)"
                  onChange={(e) => setForm((f) => ({ ...f, observation: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: '72px' }}
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
  const totalWorkedMinutes = logs.reduce((acc, log) => {
    if (!log.check_in || !log.check_out) return acc;
    const parseMs = (val: string) =>
      val.includes('T') ? new Date(val).getTime() : new Date(`1970-01-01T${val}`).getTime();
    const diffMs = parseMs(log.check_out) - parseMs(log.check_in);
    return acc + Math.max(0, Math.floor(diffMs / 60000));
  }, 0);

  function formatTotalHours(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}min`;
  }

  const daysPresent = logs.filter((l) => l.status === 'presente').length;

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
      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <SummaryCard
          icon={<Clock size={20} />}
          label="Total de Horas (página atual)"
          value={formatTotalHours(totalWorkedMinutes)}
          color="var(--color-primary)"
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
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>Horas Trabalhadas</th>
                <th>Status</th>
                <th>Observação</th>
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
                    <td style={{ fontWeight: 500 }}>{formatDate(log.log_date)}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(log.check_in)}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(log.check_out)}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {computeWorkedHours(log.check_in, log.check_out)}
                    </td>
                    <td>
                      <StatusBadge status={log.status as AttendanceStatus | null} />
                    </td>
                    <td
                      style={{
                        color: 'var(--color-secondary-text)',
                        fontSize: '13px',
                        maxWidth: '180px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={log.observation || undefined}
                    >
                      {log.observation || '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {canCheckOut && (
                          <button
                            className="btn btn-icon"
                            title="Registrar saída"
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

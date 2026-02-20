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
import { Plus, Edit, Trash2, CheckCircle, XCircle, Filter } from 'lucide-react';

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
  pendente:     { bg: '#FFF9E6', color: '#B98E00', label: 'Pendente' },
  aprovado:     { bg: '#F4FEF9', color: '#028F58', label: 'Aprovado' },
  em_andamento: { bg: '#EEF4FF', color: '#1D5CC6', label: 'Em Andamento' },
  concluido:    { bg: '#F0F0F0', color: '#555555', label: 'Concluido' },
  cancelado:    { bg: '#FDE8E8', color: '#C0392B', label: 'Cancelado' },
};

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos os status' },
  ...Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({ value, label })),
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
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
  // handle both "2026-01-15" and "2026-01-15T03:00:00.000Z"
  return dateStr.substring(0, 10);
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface BalanceCardProps {
  label: string;
  value: number;
  highlight?: boolean;
}

function BalanceCard({ label, value, highlight = false }: BalanceCardProps) {
  return (
    <div
      style={{
        padding: '16px',
        background: 'var(--color-card-bg)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
        textAlign: 'center',
        flex: 1,
        minWidth: '100px',
      }}
    >
      <div
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: highlight ? 'var(--color-primary)' : 'var(--color-primary-text)',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
        {label}
      </div>
    </div>
  );
}

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
}

function VacationFormModal({
  isOpen,
  editTarget,
  onClose,
  onSaved,
  usersId,
}: VacationFormModalProps) {
  const [form, setForm] = useState<VacationFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
    } else {
      setForm(EMPTY_FORM);
    }
    setError('');
    setTouched({});
  }, [isOpen, editTarget]);

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
    } catch {
      setError('Ocorreu um erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

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
            <h3 style={{ marginBottom: '20px' }}>
              {editTarget ? 'Editar Solicitacao' : 'Nova Solicitacao'}
            </h3>

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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
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
              </div>

              {/* Periodo aquisitivo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                    Periodo Aquisitivo Inicio
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.periodo_aquisitivo_inicio}
                    onChange={e => handleFieldChange('periodo_aquisitivo_inicio', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                    Periodo Aquisitivo Fim
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.periodo_aquisitivo_fim}
                    onChange={e => handleFieldChange('periodo_aquisitivo_fim', e.target.value)}
                  />
                </div>
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

              {error && (
                <p style={{ color: '#C0392B', fontSize: '13px', marginBottom: '14px' }}>{error}</p>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Balance cards */}
      <motion.div
        style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
        variants={staggerParent}
        initial="initial"
        animate="animate"
      >
        {balanceLoading ? (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <LoadingSpinner />
          </div>
        ) : balance ? (
          <>
            <motion.div variants={fadeUpChild} style={{ flex: 1, minWidth: '120px' }}>
              <BalanceCard label="Dias de Direito" value={balance.dias_direito} />
            </motion.div>
            <motion.div variants={fadeUpChild} style={{ flex: 1, minWidth: '120px' }}>
              <BalanceCard label="Dias Usados" value={balance.dias_usados} />
            </motion.div>
            <motion.div variants={fadeUpChild} style={{ flex: 1, minWidth: '120px' }}>
              <BalanceCard label="Dias Pendentes" value={balance.dias_pendentes} />
            </motion.div>
            <motion.div variants={fadeUpChild} style={{ flex: 1, minWidth: '120px' }}>
              <BalanceCard label="Dias Disponiveis" value={balance.dias_disponiveis} highlight />
            </motion.div>
          </>
        ) : null}
      </motion.div>

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

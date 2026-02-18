import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, fadeUpChild, modalBackdropVariants, modalContentVariants } from '../../../lib/motion';
import { employeesApi } from '../../../services';
import type { EmployeeDayOff, DayOffBalance, PaginatedResponse } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { Plus, Edit, Trash2, Check, X, Clock, Calendar } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayOffsTabProps {
  usersId: number;
}

type DayOffTipo = 'folga_compensatoria' | 'banco_horas' | 'folga_escala' | 'troca_turno';
type DayOffStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado';

interface DayOffFormData {
  tipo: DayOffTipo | '';
  data: string;
  motivo: string;
  horas_banco: string;
  observacoes: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<DayOffTipo, string> = {
  folga_compensatoria: 'Folga Compensatoria',
  banco_horas: 'Banco de Horas',
  folga_escala: 'Folga de Escala',
  troca_turno: 'Troca de Turno',
};

const STATUS_COLORS: Record<DayOffStatus, string> = {
  pendente: '#d97706',
  aprovado: '#16a34a',
  rejeitado: '#dc2626',
  cancelado: '#6b7280',
};

const STATUS_BG: Record<DayOffStatus, string> = {
  pendente: '#fef3c7',
  aprovado: '#dcfce7',
  rejeitado: '#fee2e2',
  cancelado: '#f3f4f6',
};

const EMPTY_FORM: DayOffFormData = {
  tipo: '',
  data: '',
  motivo: '',
  horas_banco: '',
  observacoes: '',
};

const PER_PAGE = 10;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status as DayOffStatus;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 600,
      color: STATUS_COLORS[s] ?? '#6b7280',
      background: STATUS_BG[s] ?? '#f3f4f6',
    }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function BalanceCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 160, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ color: 'var(--color-alternate)' }}>{icon}</span>
        <span style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>{label}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text)' }}>{value}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DayOffsTab({ usersId }: DayOffsTabProps) {
  const [dayOffs, setDayOffs] = useState<EmployeeDayOff[]>([]);
  const [balance, setBalance] = useState<DayOffBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EmployeeDayOff | null>(null);
  const [form, setForm] = useState<DayOffFormData>(EMPTY_FORM);
  const [modalLoading, setModalLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [approveTarget, setApproveTarget] = useState<{ id: number; action: 'aprovado' | 'rejeitado' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const loadBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const data = await employeesApi.getDayOffBalance(usersId);
      setBalance(data);
    } catch (err) {
      console.error('Failed to load day off balance:', err);
    } finally {
      setBalanceLoading(false);
    }
  }, [usersId]);

  const loadDayOffs = useCallback(async () => {
    setLoading(true);
    try {
      const data: PaginatedResponse<EmployeeDayOff> = await employeesApi.listDayOffs({
        users_id: usersId,
        status: filterStatus || undefined,
        tipo: filterTipo || undefined,
        page,
        per_page: PER_PAGE,
      });
      setDayOffs(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load day offs:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, filterStatus, filterTipo, page]);

  useEffect(() => {
    loadDayOffs();
  }, [loadDayOffs]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  // ─── Toast ──────────────────────────────────────────────────────────────────

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Modal ──────────────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (item: EmployeeDayOff) => {
    setEditingItem(item);
    setForm({
      tipo: item.tipo as DayOffTipo,
      data: item.data.slice(0, 10),
      motivo: item.motivo ?? '',
      horas_banco: item.horas_banco != null ? String(item.horas_banco) : '',
      observacoes: item.observacoes ?? '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (field: keyof DayOffFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.tipo || !form.data) {
      showToast('Tipo e data sao obrigatorios.', 'error');
      return;
    }
    setModalLoading(true);
    try {
      const payload = {
        tipo: form.tipo,
        data: form.data,
        motivo: form.motivo || undefined,
        horas_banco: form.horas_banco ? Number(form.horas_banco) : undefined,
        observacoes: form.observacoes || undefined,
      };
      if (editingItem) {
        await employeesApi.updateDayOff(editingItem.id, payload);
        showToast('Folga atualizada com sucesso.', 'success');
      } else {
        await employeesApi.createDayOff({ users_id: usersId, ...payload });
        showToast('Folga registrada com sucesso.', 'success');
      }
      closeModal();
      loadDayOffs();
      loadBalance();
    } catch (err) {
      console.error('Failed to save day off:', err);
      showToast('Erro ao salvar. Tente novamente.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // ─── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (deleteTarget == null) return;
    setActionLoading(true);
    try {
      await employeesApi.deleteDayOff(deleteTarget);
      showToast('Folga removida.', 'success');
      setDeleteTarget(null);
      loadDayOffs();
      loadBalance();
    } catch (err) {
      console.error('Failed to delete day off:', err);
      showToast('Erro ao remover.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Approve / Reject ────────────────────────────────────────────────────────

  const handleApprove = async () => {
    if (!approveTarget) return;
    setActionLoading(true);
    try {
      await employeesApi.approveDayOff(approveTarget.id, approveTarget.action);
      const label = approveTarget.action === 'aprovado' ? 'aprovada' : 'rejeitada';
      showToast(`Folga ${label}.`, 'success');
      setApproveTarget(null);
      loadDayOffs();
      loadBalance();
    } catch (err) {
      console.error('Failed to approve/reject day off:', err);
      showToast('Erro ao atualizar status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Filter change resets page ───────────────────────────────────────────────

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              zIndex: 2000,
              padding: '12px 20px',
              borderRadius: 8,
              background: toast.type === 'success' ? '#16a34a' : '#dc2626',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Balance cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {balanceLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <BalanceCard
              label="Horas no Banco"
              value={balance ? `${balance.total_horas}h` : '0h'}
              icon={<Clock size={20} />}
            />
            <BalanceCard
              label="Folgas Pendentes"
              value={balance ? String(balance.folgas_pendentes) : '0'}
              icon={<Calendar size={20} />}
            />
          </>
        )}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <select
          className="select-field"
          value={filterStatus}
          onChange={handleFilterChange(setFilterStatus)}
          style={{ minWidth: 140 }}
        >
          <option value="">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="aprovado">Aprovado</option>
          <option value="rejeitado">Rejeitado</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <select
          className="select-field"
          value={filterTipo}
          onChange={handleFilterChange(setFilterTipo)}
          style={{ minWidth: 180 }}
        >
          <option value="">Todos os Tipos</option>
          {(Object.keys(TIPO_LABELS) as DayOffTipo[]).map(t => (
            <option key={t} value={t}>{TIPO_LABELS[t]}</option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={openCreateModal} style={{ marginLeft: 'auto' }}>
          <Plus size={16} style={{ marginRight: 6 }} />
          Nova Folga
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : dayOffs.length === 0 ? (
        <EmptyState
          message="Nenhuma folga registrada."
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={16} style={{ marginRight: 6 }} />
              Nova Folga
            </button>
          }
        />
      ) : (
        <motion.div
          className="table-container"
          variants={staggerParent}
          initial="initial"
          animate="animate"
        >
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Data</th>
                <th>Motivo</th>
                <th>Horas</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {dayOffs.map(item => (
                <motion.tr key={item.id} variants={fadeUpChild}>
                  <td>{TIPO_LABELS[item.tipo as DayOffTipo] ?? item.tipo}</td>
                  <td>{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.motivo ?? '—'}
                  </td>
                  <td>{item.horas_banco != null ? `${item.horas_banco}h` : '—'}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {item.status === 'pendente' && (
                        <>
                          <button
                            className="btn btn-icon"
                            title="Aprovar"
                            onClick={() => setApproveTarget({ id: item.id, action: 'aprovado' })}
                            style={{ color: '#16a34a' }}
                          >
                            <Check size={15} />
                          </button>
                          <button
                            className="btn btn-icon"
                            title="Rejeitar"
                            onClick={() => setApproveTarget({ id: item.id, action: 'rejeitado' })}
                            style={{ color: '#dc2626' }}
                          >
                            <X size={15} />
                          </button>
                        </>
                      )}
                      <button className="btn btn-icon" title="Editar" onClick={() => openEditModal(item)}>
                        <Edit size={15} />
                      </button>
                      <button
                        className="btn btn-icon"
                        title="Excluir"
                        onClick={() => setDeleteTarget(item.id)}
                        style={{ color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          perPage={PER_PAGE}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-backdrop"
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={closeModal}
            style={{ animation: 'none' }}
          >
            <motion.div
              className="modal-content"
              variants={modalContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={e => e.stopPropagation()}
              style={{ width: 480, maxWidth: '95vw' }}
            >
              <h3 style={{ marginBottom: 20 }}>
                {editingItem ? 'Editar Folga' : 'Nova Folga'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="input-group">
                  <label>Tipo *</label>
                  <select
                    className="select-field"
                    value={form.tipo}
                    onChange={e => handleFormChange('tipo', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {(Object.keys(TIPO_LABELS) as DayOffTipo[]).map(t => (
                      <option key={t} value={t}>{TIPO_LABELS[t]}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Data *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.data}
                    onChange={e => handleFormChange('data', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Motivo</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Descreva o motivo..."
                    value={form.motivo}
                    onChange={e => handleFormChange('motivo', e.target.value)}
                  />
                </div>

                {form.tipo === 'banco_horas' && (
                  <div className="input-group">
                    <label>Horas no Banco</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="0"
                      min="0"
                      step="0.5"
                      value={form.horas_banco}
                      onChange={e => handleFormChange('horas_banco', e.target.value)}
                    />
                  </div>
                )}

                <div className="input-group">
                  <label>Observacoes</label>
                  <textarea
                    className="input-field"
                    placeholder="Observacoes adicionais..."
                    rows={3}
                    value={form.observacoes}
                    onChange={e => handleFormChange('observacoes', e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
                <button className="btn btn-secondary" onClick={closeModal} disabled={modalLoading}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={modalLoading}>
                  {modalLoading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteTarget != null}
        title="Excluir Folga"
        message="Tem certeza que deseja excluir esta folga? Esta acao nao pode ser desfeita."
        confirmLabel={actionLoading ? 'Excluindo...' : 'Excluir'}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Approve / Reject Confirmation */}
      <ConfirmModal
        isOpen={approveTarget != null}
        title={approveTarget?.action === 'aprovado' ? 'Aprovar Folga' : 'Rejeitar Folga'}
        message={
          approveTarget?.action === 'aprovado'
            ? 'Confirma a aprovacao desta folga?'
            : 'Confirma a rejeicao desta folga?'
        }
        confirmLabel={actionLoading ? 'Aguarde...' : approveTarget?.action === 'aprovado' ? 'Aprovar' : 'Rejeitar'}
        variant={approveTarget?.action === 'aprovado' ? 'primary' : 'danger'}
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />
    </div>
  );
}

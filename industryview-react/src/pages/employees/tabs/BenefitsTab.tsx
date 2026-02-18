import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, fadeUpChild, modalBackdropVariants, modalContentVariants } from '../../../lib/motion';
import { employeesApi } from '../../../services';
import type { EmployeeBenefit, PaginatedResponse } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { Plus, Edit, Trash2, Gift } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BenefitsTabProps {
  usersId: number;
}

type BenefitTipo = 'vt' | 'vr' | 'va' | 'plano_saude' | 'plano_odonto' | 'seguro_vida' | 'outro';
type BenefitStatus = 'ativo' | 'suspenso' | 'cancelado';

interface BenefitFormData {
  tipo: BenefitTipo | '';
  descricao: string;
  valor: string;
  data_inicio: string;
  data_fim: string;
  status: BenefitStatus | '';
  observacoes: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<BenefitTipo, string> = {
  vt: 'Vale Transporte',
  vr: 'Vale Refeicao',
  va: 'Vale Alimentacao',
  plano_saude: 'Plano de Saude',
  plano_odonto: 'Plano Odontologico',
  seguro_vida: 'Seguro de Vida',
  outro: 'Outro',
};

const STATUS_COLORS: Record<BenefitStatus, string> = {
  ativo: '#16a34a',
  suspenso: '#d97706',
  cancelado: '#dc2626',
};

const STATUS_BG: Record<BenefitStatus, string> = {
  ativo: '#dcfce7',
  suspenso: '#fef3c7',
  cancelado: '#fee2e2',
};

const EMPTY_FORM: BenefitFormData = {
  tipo: '',
  descricao: '',
  valor: '',
  data_inicio: '',
  data_fim: '',
  status: '',
  observacoes: '',
};

const PER_PAGE = 10;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status as BenefitStatus;
  const label = s.charAt(0).toUpperCase() + s.slice(1);
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
      {label}
    </span>
  );
}

function formatCurrency(value?: number): string {
  if (value == null) return '—';
  return `R$ ${value.toFixed(2)}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BenefitsTab({ usersId }: BenefitsTabProps) {
  const [benefits, setBenefits] = useState<EmployeeBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterTipo, setFilterTipo] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EmployeeBenefit | null>(null);
  const [form, setForm] = useState<BenefitFormData>(EMPTY_FORM);
  const [modalLoading, setModalLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const loadBenefits = useCallback(async () => {
    setLoading(true);
    try {
      const data: PaginatedResponse<EmployeeBenefit> = await employeesApi.listBenefits({
        users_id: usersId,
        tipo: filterTipo || undefined,
        page,
        per_page: PER_PAGE,
      });
      setBenefits(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load benefits:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, filterTipo, page]);

  useEffect(() => {
    loadBenefits();
  }, [loadBenefits]);

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

  const openEditModal = (item: EmployeeBenefit) => {
    setEditingItem(item);
    setForm({
      tipo: item.tipo as BenefitTipo,
      descricao: item.descricao ?? '',
      valor: item.valor != null ? String(item.valor) : '',
      data_inicio: item.data_inicio.slice(0, 10),
      data_fim: item.data_fim ? item.data_fim.slice(0, 10) : '',
      status: item.status as BenefitStatus,
      observacoes: item.observacoes ?? '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (field: keyof BenefitFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.tipo || !form.data_inicio) {
      showToast('Tipo e data de inicio sao obrigatorios.', 'error');
      return;
    }
    setModalLoading(true);
    try {
      const payload = {
        tipo: form.tipo,
        descricao: form.descricao || undefined,
        valor: form.valor ? Number(form.valor) : undefined,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim || undefined,
        observacoes: form.observacoes || undefined,
      };

      if (editingItem) {
        const updatePayload: Partial<EmployeeBenefit> = {
          ...payload,
          status: form.status || undefined,
        };
        await employeesApi.updateBenefit(editingItem.id, updatePayload);
        showToast('Beneficio atualizado com sucesso.', 'success');
      } else {
        await employeesApi.createBenefit({ users_id: usersId, ...payload });
        showToast('Beneficio adicionado com sucesso.', 'success');
      }
      closeModal();
      loadBenefits();
    } catch (err) {
      console.error('Failed to save benefit:', err);
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
      await employeesApi.deleteBenefit(deleteTarget);
      showToast('Beneficio removido.', 'success');
      setDeleteTarget(null);
      loadBenefits();
    } catch (err) {
      console.error('Failed to delete benefit:', err);
      showToast('Erro ao remover.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Filter change resets page ───────────────────────────────────────────────

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterTipo(e.target.value);
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

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <select
          className="select-field"
          value={filterTipo}
          onChange={handleFilterChange}
          style={{ minWidth: 200 }}
        >
          <option value="">Todos os Tipos</option>
          {(Object.keys(TIPO_LABELS) as BenefitTipo[]).map(t => (
            <option key={t} value={t}>{TIPO_LABELS[t]}</option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={openCreateModal} style={{ marginLeft: 'auto' }}>
          <Plus size={16} style={{ marginRight: 6 }} />
          Novo Beneficio
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : benefits.length === 0 ? (
        <EmptyState
          message="Nenhum beneficio cadastrado."
          icon={<Gift size={48} />}
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={16} style={{ marginRight: 6 }} />
              Novo Beneficio
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
                <th>Descricao</th>
                <th>Valor</th>
                <th>Data Inicio</th>
                <th>Data Fim</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {benefits.map(item => (
                <motion.tr key={item.id} variants={fadeUpChild}>
                  <td>{TIPO_LABELS[item.tipo as BenefitTipo] ?? item.tipo}</td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.descricao ?? '—'}
                  </td>
                  <td>{formatCurrency(item.valor)}</td>
                  <td>{new Date(item.data_inicio).toLocaleDateString('pt-BR')}</td>
                  <td>{item.data_fim ? new Date(item.data_fim).toLocaleDateString('pt-BR') : '—'}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
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
              style={{ width: 500, maxWidth: '95vw' }}
            >
              <h3 style={{ marginBottom: 20 }}>
                {editingItem ? 'Editar Beneficio' : 'Novo Beneficio'}
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
                    {(Object.keys(TIPO_LABELS) as BenefitTipo[]).map(t => (
                      <option key={t} value={t}>{TIPO_LABELS[t]}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Descricao</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Descricao do beneficio..."
                    value={form.descricao}
                    onChange={e => handleFormChange('descricao', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Valor (R$)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={form.valor}
                    onChange={e => handleFormChange('valor', e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Data Inicio *</label>
                    <input
                      type="date"
                      className="input-field"
                      value={form.data_inicio}
                      onChange={e => handleFormChange('data_inicio', e.target.value)}
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Data Fim</label>
                    <input
                      type="date"
                      className="input-field"
                      value={form.data_fim}
                      onChange={e => handleFormChange('data_fim', e.target.value)}
                    />
                  </div>
                </div>

                {editingItem && (
                  <div className="input-group">
                    <label>Status</label>
                    <select
                      className="select-field"
                      value={form.status}
                      onChange={e => handleFormChange('status', e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      <option value="ativo">Ativo</option>
                      <option value="suspenso">Suspenso</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
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
        title="Excluir Beneficio"
        message="Tem certeza que deseja excluir este beneficio? Esta acao nao pode ser desfeita."
        confirmLabel={actionLoading ? 'Excluindo...' : 'Excluir'}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, fadeUpChild, modalBackdropVariants, modalContentVariants } from '../../../lib/motion';
import { employeesApi } from '../../../services';
import type { EmployeeBenefit, PaginatedResponse } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import ConfirmModal from '../../../components/common/ConfirmModal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { Plus, Edit, Trash2, Gift } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BenefitsTabProps {
  usersId: number;
}

type BenefitTipo = 'vt' | 'vr' | 'va' | 'plano_saude' | 'plano_odonto' | 'seguro_vida' | 'outro';
type BenefitStatus = 'ativo' | 'suspenso' | 'cancelado' | 'expirado' | 'futuro';

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
  expirado: '#6b7280',
  futuro: '#2563eb',
};

const STATUS_BG: Record<BenefitStatus, string> = {
  ativo: '#dcfce7',
  suspenso: '#fef3c7',
  cancelado: '#fee2e2',
  expirado: '#f3f4f6',
  futuro: '#dbeafe',
};

const STATUS_LABELS: Record<BenefitStatus, string> = {
  ativo: 'Ativo',
  suspenso: 'Suspenso',
  cancelado: 'Cancelado',
  expirado: 'Expirado',
  futuro: 'Futuro',
};

/**
 * Calcula status computado do beneficio baseado nas datas e status manual.
 * Prioridade: cancelado/suspenso manual > expirado (data_fim passou) > futuro (data_inicio nao chegou) > ativo
 */
function computeBenefitStatus(item: { status: string; data_inicio: string; data_fim?: string | null }): BenefitStatus {
  if (item.status === 'cancelado' || item.status === 'suspenso') {
    return item.status as BenefitStatus;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (item.data_fim) {
    const fim = new Date(item.data_fim);
    fim.setHours(0, 0, 0, 0);
    if (fim < today) return 'expirado';
  }
  const inicio = new Date(item.data_inicio);
  inicio.setHours(0, 0, 0, 0);
  if (inicio > today) return 'futuro';
  return 'ativo';
}

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
      {STATUS_LABELS[s] ?? status}
    </span>
  );
}

function formatCurrency(value?: number): string {
  if (value == null) return '—';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function centsToDisplay(cents: number): string {
  if (cents === 0) return '';
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function displayToCents(display: string): number {
  const digits = display.replace(/\D/g, '');
  return parseInt(digits, 10) || 0;
}

function centsToDecimal(cents: number): number {
  return cents / 100;
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
    setTouched({});
    setShowModal(true);
  };

  const openEditModal = (item: EmployeeBenefit) => {
    setEditingItem(item);
    setForm({
      tipo: item.tipo as BenefitTipo,
      descricao: item.descricao ?? '',
      valor: item.valor != null ? centsToDisplay(Math.round(item.valor * 100)) : '',
      data_inicio: item.data_inicio.slice(0, 10),
      data_fim: item.data_fim ? item.data_fim.slice(0, 10) : '',
      status: item.status as BenefitStatus,
      observacoes: item.observacoes ?? '',
    });
    setTouched({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setTouched({});
  };

  const handleFormChange = (field: keyof BenefitFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (value) setTouched(prev => ({ ...prev, [field]: false }));
  };

  const handleValorChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    const cents = parseInt(digits, 10) || 0;
    const display = centsToDisplay(cents);
    setForm(prev => ({ ...prev, valor: display }));
  };

  const handleSave = async () => {
    setTouched({ tipo: true, data_inicio: true });
    const errors: string[] = [];
    if (!form.tipo) errors.push('Tipo');
    if (!form.data_inicio) errors.push('Data Início');
    if (errors.length > 0) {
      showToast(`Preencha os campos obrigatórios: ${errors.join(', ')}`, 'error');
      return;
    }
    setModalLoading(true);
    try {
      const payload = {
        tipo: form.tipo,
        descricao: form.descricao || undefined,
        valor: form.valor ? centsToDecimal(displayToCents(form.valor)) : undefined,
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
        <SearchableSelect
          options={(Object.keys(TIPO_LABELS) as BenefitTipo[]).map(t => ({ value: t, label: TIPO_LABELS[t] }))}
          value={filterTipo || undefined}
          onChange={(val) => { setFilterTipo(String(val ?? '')); setPage(1); }}
          placeholder="Todos os Tipos"
          allowClear
          style={{ minWidth: 200 }}
        />

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
                  <td><StatusBadge status={computeBenefitStatus(item)} /></td>
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
                  <label>Tipo <span style={{ color: '#dc2626' }}>*</span></label>
                  <div style={{ ...(touched.tipo && !form.tipo ? { border: '1px solid #dc2626', borderRadius: 6 } : {}) }}>
                    <SearchableSelect
                      options={(Object.keys(TIPO_LABELS) as BenefitTipo[]).map(t => ({ value: t, label: TIPO_LABELS[t] }))}
                      value={form.tipo || undefined}
                      onChange={(val) => handleFormChange('tipo', String(val ?? ''))}
                      placeholder="Selecione..."
                      allowClear
                    />
                  </div>
                  {touched.tipo && !form.tipo && (
                    <span style={{ color: '#dc2626', fontSize: '12px', marginTop: 2 }}>Campo obrigatório</span>
                  )}
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
                    type="text"
                    inputMode="numeric"
                    className="input-field"
                    placeholder="0,00"
                    value={form.valor}
                    onChange={e => handleValorChange(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Data Início <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      type="date"
                      className="input-field"
                      value={form.data_inicio}
                      onChange={e => handleFormChange('data_inicio', e.target.value)}
                      style={{ ...(touched.data_inicio && !form.data_inicio ? { borderColor: '#dc2626' } : {}) }}
                    />
                    {touched.data_inicio && !form.data_inicio && (
                      <span style={{ color: '#dc2626', fontSize: '12px', marginTop: 2 }}>Campo obrigatório</span>
                    )}
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
                    <SearchableSelect
                      options={[
                        { value: 'ativo', label: 'Ativo' },
                        { value: 'suspenso', label: 'Suspenso' },
                        { value: 'cancelado', label: 'Cancelado' },
                      ]}
                      value={form.status || undefined}
                      onChange={(val) => handleFormChange('status', String(val ?? ''))}
                      placeholder="Selecione..."
                      allowClear
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

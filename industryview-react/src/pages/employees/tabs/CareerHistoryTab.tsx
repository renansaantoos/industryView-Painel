import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, fadeUpChild, modalBackdropVariants, modalContentVariants } from '../../../lib/motion';
import { employeesApi } from '../../../services';
import type { EmployeeCareerHistory, PaginatedResponse } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import ConfirmModal from '../../../components/common/ConfirmModal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { Plus, Edit, Trash2, ArrowRight, TrendingUp } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CareerHistoryTabProps {
  usersId: number;
}

type CareerTipo = 'admissao' | 'promocao' | 'transferencia' | 'mudanca_salario' | 'demissao';

interface CareerFormData {
  tipo: CareerTipo | '';
  cargo_anterior: string;
  cargo_novo: string;
  departamento_anterior: string;
  departamento_novo: string;
  salario_anterior: string;
  salario_novo: string;
  data_efetivacao: string;
  motivo: string;
  observacoes: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<CareerTipo, string> = {
  admissao: 'Admissao',
  promocao: 'Promocao',
  transferencia: 'Transferencia',
  mudanca_salario: 'Mudanca Salarial',
  demissao: 'Demissao',
};

const TIPO_COLORS: Record<CareerTipo, string> = {
  admissao: '#16a34a',
  promocao: '#2563eb',
  transferencia: '#7c3aed',
  mudanca_salario: '#d97706',
  demissao: '#dc2626',
};

const TIPO_BG: Record<CareerTipo, string> = {
  admissao: '#dcfce7',
  promocao: '#dbeafe',
  transferencia: '#ede9fe',
  mudanca_salario: '#fef3c7',
  demissao: '#fee2e2',
};

const EMPTY_FORM: CareerFormData = {
  tipo: '',
  cargo_anterior: '',
  cargo_novo: '',
  departamento_anterior: '',
  departamento_novo: '',
  salario_anterior: '',
  salario_novo: '',
  data_efetivacao: '',
  motivo: '',
  observacoes: '',
};

const PER_PAGE = 20;

// ─── Sub-components ───────────────────────────────────────────────────────────

function TipoBadge({ tipo }: { tipo: string }) {
  const t = tipo as CareerTipo;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 600,
      color: TIPO_COLORS[t] ?? '#6b7280',
      background: TIPO_BG[t] ?? '#f3f4f6',
    }}>
      {TIPO_LABELS[t] ?? tipo}
    </span>
  );
}

function formatSalary(value?: number): string {
  if (value == null) return '—';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

/**
 * Formata centavos inteiros para string monetaria pt-BR.
 * Ex: 123456 → "1.234,56"  |  0 → ""  |  5 → "0,05"
 */
function centsToDisplay(cents: number): string {
  if (cents === 0) return '';
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Converte string de display (ex: "1.234,56") de volta para centavos inteiros.
 */
function displayToCents(display: string): number {
  const digits = display.replace(/\D/g, '');
  return parseInt(digits, 10) || 0;
}

/**
 * Converte centavos inteiros para valor decimal (para envio ao backend).
 * Ex: 123456 → 1234.56
 */
function centsToDecimal(cents: number): number {
  return cents / 100;
}

interface ChangeRowProps {
  label: string;
  before?: string;
  after?: string;
}

function ChangeRow({ label, before, after }: ChangeRowProps) {
  if (!before && !after) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: 'var(--color-text)' }}>
      <span style={{ color: 'var(--color-secondary-text)', minWidth: 100, fontSize: '12px' }}>{label}:</span>
      {before && <span style={{ color: 'var(--color-secondary-text)' }}>{before}</span>}
      {before && after && <ArrowRight size={13} style={{ flexShrink: 0, color: 'var(--color-alternate)' }} />}
      {after && <span style={{ fontWeight: 500 }}>{after}</span>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CareerHistoryTab({ usersId }: CareerHistoryTabProps) {
  const [history, setHistory] = useState<EmployeeCareerHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EmployeeCareerHistory | null>(null);
  const [form, setForm] = useState<CareerFormData>(EMPTY_FORM);
  const [modalLoading, setModalLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data: PaginatedResponse<EmployeeCareerHistory> = await employeesApi.listCareerHistory({
        users_id: usersId,
        page,
        per_page: PER_PAGE,
      });
      setHistory(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load career history:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, page]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

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

  const openEditModal = (item: EmployeeCareerHistory) => {
    setEditingItem(item);
    setForm({
      tipo: item.tipo as CareerTipo,
      cargo_anterior: item.cargo_anterior ?? '',
      cargo_novo: item.cargo_novo ?? '',
      departamento_anterior: item.departamento_anterior ?? '',
      departamento_novo: item.departamento_novo ?? '',
      salario_anterior: item.salario_anterior != null ? centsToDisplay(Math.round(item.salario_anterior * 100)) : '',
      salario_novo: item.salario_novo != null ? centsToDisplay(Math.round(item.salario_novo * 100)) : '',
      data_efetivacao: item.data_efetivacao.slice(0, 10),
      motivo: item.motivo ?? '',
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

  const handleFormChange = (field: keyof CareerFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (value) setTouched(prev => ({ ...prev, [field]: false }));
  };

  /** Handler especial para campos de salario - estilo caixa registradora */
  const handleSalaryChange = (field: 'salario_anterior' | 'salario_novo', raw: string) => {
    const digits = raw.replace(/\D/g, '');
    const cents = parseInt(digits, 10) || 0;
    const display = centsToDisplay(cents);
    setForm(prev => ({ ...prev, [field]: display }));
  };

  const handleSave = async () => {
    setTouched({ tipo: true, data_efetivacao: true });
    const errors: string[] = [];
    if (!form.tipo) errors.push('Tipo');
    if (!form.data_efetivacao) errors.push('Data de Efetivacao');
    if (errors.length > 0) {
      showToast(`Preencha os campos obrigatorios: ${errors.join(', ')}`, 'error');
      return;
    }
    setModalLoading(true);
    try {
      const payload = {
        tipo: form.tipo,
        cargo_anterior: form.cargo_anterior || undefined,
        cargo_novo: form.cargo_novo || undefined,
        departamento_anterior: form.departamento_anterior || undefined,
        departamento_novo: form.departamento_novo || undefined,
        salario_anterior: form.salario_anterior ? centsToDecimal(displayToCents(form.salario_anterior)) : undefined,
        salario_novo: form.salario_novo ? centsToDecimal(displayToCents(form.salario_novo)) : undefined,
        data_efetivacao: form.data_efetivacao,
        motivo: form.motivo || undefined,
        observacoes: form.observacoes || undefined,
      };

      if (editingItem) {
        await employeesApi.updateCareerHistory(editingItem.id, payload);
        showToast('Evento atualizado com sucesso.', 'success');
      } else {
        await employeesApi.createCareerHistory({ users_id: usersId, ...payload });
        showToast('Evento registrado com sucesso.', 'success');
      }
      closeModal();
      loadHistory();
    } catch (err) {
      console.error('Failed to save career event:', err);
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
      await employeesApi.deleteCareerHistory(deleteTarget);
      showToast('Evento removido.', 'success');
      setDeleteTarget(null);
      loadHistory();
    } catch (err) {
      console.error('Failed to delete career event:', err);
      showToast('Erro ao remover.', 'error');
    } finally {
      setActionLoading(false);
    }
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
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={openCreateModal} style={{ marginLeft: 'auto' }}>
          <Plus size={16} style={{ marginRight: 6 }} />
          Registrar Evento
        </button>
      </div>

      {/* Timeline */}
      {loading ? (
        <LoadingSpinner />
      ) : history.length === 0 ? (
        <EmptyState
          message="Nenhum evento de carreira registrado."
          icon={<TrendingUp size={48} />}
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={16} style={{ marginRight: 6 }} />
              Registrar Evento
            </button>
          }
        />
      ) : (
        <motion.div
          variants={staggerParent}
          initial="initial"
          animate="animate"
          style={{ position: 'relative', paddingLeft: 40 }}
        >
          {/* Vertical line */}
          <div style={{
            position: 'absolute',
            left: 16,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'var(--color-border)',
          }} />

          {history.map(item => {
            const tipo = item.tipo as CareerTipo;
            const dotColor = TIPO_COLORS[tipo] ?? '#6b7280';

            return (
              <motion.div
                key={item.id}
                variants={fadeUpChild}
                style={{ position: 'relative', marginBottom: 24 }}
              >
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: -31,
                  top: 18,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: dotColor,
                  border: '2px solid white',
                  boxShadow: `0 0 0 2px ${dotColor}40`,
                }} />

                {/* Date label above card */}
                <div style={{
                  fontSize: '12px',
                  color: 'var(--color-secondary-text)',
                  marginBottom: 6,
                  fontWeight: 500,
                }}>
                  {new Date(item.data_efetivacao).toLocaleDateString('pt-BR')}
                </div>

                {/* Event card */}
                <div style={{
                  background: 'var(--color-card-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: 16,
                }}>
                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <TipoBadge tipo={item.tipo} />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-icon" title="Editar" onClick={() => openEditModal(item)}>
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn btn-icon"
                        title="Excluir"
                        onClick={() => setDeleteTarget(item.id)}
                        style={{ color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Changes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <ChangeRow
                      label="Cargo"
                      before={item.cargo_anterior}
                      after={item.cargo_novo}
                    />
                    <ChangeRow
                      label="Departamento"
                      before={item.departamento_anterior}
                      after={item.departamento_novo}
                    />
                    <ChangeRow
                      label="Salario"
                      before={item.salario_anterior != null ? formatSalary(item.salario_anterior) : undefined}
                      after={item.salario_novo != null ? formatSalary(item.salario_novo) : undefined}
                    />
                  </div>

                  {/* Motivo */}
                  {item.motivo && (
                    <div style={{ marginTop: 10, fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                      <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>Motivo: </span>
                      {item.motivo}
                    </div>
                  )}

                  {/* Observacoes */}
                  {item.observacoes && (
                    <div style={{ marginTop: 6, fontSize: '13px', color: 'var(--color-secondary-text)', fontStyle: 'italic' }}>
                      {item.observacoes}
                    </div>
                  )}

                  {/* Registered by */}
                  {item.registrado_por && (
                    <div style={{ marginTop: 10, fontSize: '11px', color: 'var(--color-secondary-text)' }}>
                      Registrado por: {item.registrado_por.name}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
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
              style={{ width: 540, maxWidth: '95vw' }}
            >
              <h3 style={{ marginBottom: 20 }}>
                {editingItem ? 'Editar Evento' : 'Registrar Evento de Carreira'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Tipo <span style={{ color: '#dc2626' }}>*</span></label>
                    <div style={{ ...(touched.tipo && !form.tipo ? { border: '1px solid #dc2626', borderRadius: 6 } : {}) }}>
                      <SearchableSelect
                        options={(Object.keys(TIPO_LABELS) as CareerTipo[]).map(t => ({ value: t, label: TIPO_LABELS[t] }))}
                        value={form.tipo || undefined}
                        onChange={(val) => handleFormChange('tipo', String(val ?? ''))}
                        placeholder="Selecione..."
                        allowClear
                      />
                    </div>
                    {touched.tipo && !form.tipo && (
                      <span style={{ color: '#dc2626', fontSize: '12px', marginTop: 2, display: 'block' }}>Campo obrigatorio</span>
                    )}
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Data de Efetivacao <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      type="date"
                      className="input-field"
                      value={form.data_efetivacao}
                      onChange={e => handleFormChange('data_efetivacao', e.target.value)}
                      style={{ ...(touched.data_efetivacao && !form.data_efetivacao ? { borderColor: '#dc2626' } : {}) }}
                    />
                    {touched.data_efetivacao && !form.data_efetivacao && (
                      <span style={{ color: '#dc2626', fontSize: '12px', marginTop: 2, display: 'block' }}>Campo obrigatorio</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Cargo Anterior</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Cargo anterior..."
                      value={form.cargo_anterior}
                      onChange={e => handleFormChange('cargo_anterior', e.target.value)}
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Cargo Novo</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Novo cargo..."
                      value={form.cargo_novo}
                      onChange={e => handleFormChange('cargo_novo', e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Departamento Anterior</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Departamento anterior..."
                      value={form.departamento_anterior}
                      onChange={e => handleFormChange('departamento_anterior', e.target.value)}
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Departamento Novo</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Novo departamento..."
                      value={form.departamento_novo}
                      onChange={e => handleFormChange('departamento_novo', e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Salario Anterior (R$)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="input-field"
                      placeholder="0,00"
                      value={form.salario_anterior}
                      onChange={e => handleSalaryChange('salario_anterior', e.target.value)}
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Salario Novo (R$)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="input-field"
                      placeholder="0,00"
                      value={form.salario_novo}
                      onChange={e => handleSalaryChange('salario_novo', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Motivo</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Motivo do evento..."
                    value={form.motivo}
                    onChange={e => handleFormChange('motivo', e.target.value)}
                  />
                </div>

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
        title="Excluir Evento"
        message="Tem certeza que deseja excluir este evento de carreira? Esta acao nao pode ser desfeita."
        confirmLabel={actionLoading ? 'Excluindo...' : 'Excluir'}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

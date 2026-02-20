import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  staggerParent,
  tableRowVariants,
  modalBackdropVariants,
  modalContentVariants,
} from '../../../lib/motion';
import { healthApi } from '../../../services';
import type { HealthRecord } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import ConfirmModal from '../../../components/common/ConfirmModal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { FileHeart, CalendarClock, AlertCircle, Stethoscope, Plus, Edit, Trash2 } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface HealthTabProps {
  usersId: number;
}

type ValidityStatus = 'valido' | 'vencendo' | 'vencido' | 'sem_validade';

interface HealthFormData {
  exam_type: string;
  exam_date: string;
  expiry_date: string;
  result: string;
  doctor_name: string;
  crm: string;
  restriction_description: string;
  observation: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_FORM: HealthFormData = {
  exam_type: '',
  exam_date: '',
  expiry_date: '',
  result: '',
  doctor_name: '',
  crm: '',
  restriction_description: '',
  observation: '',
};

const EXAM_TYPE_LABELS: Record<string, string> = {
  admissional:      'Admissional',
  periodico:        'Periodico',
  retorno_trabalho: 'Retorno ao Trabalho',
  mudanca_funcao:   'Mudanca de Funcao',
  demissional:      'Demissional',
};

const EXAM_TYPE_OPTIONS = Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const RESULT_OPTIONS = [
  { value: 'apto',           label: 'Apto' },
  { value: 'apto_restricao', label: 'Apto com Restricao' },
  { value: 'inapto',         label: 'Inapto' },
];

const RESULT_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  apto:           { label: 'Apto',              bg: '#D1FAE5', color: '#065F46' },
  inapto:         { label: 'Inapto',            bg: '#FDE8E8', color: '#C0392B' },
  apto_restricao: { label: 'Apto c/ Restricao', bg: '#FEF3C7', color: '#92400E' },
};

const VALIDITY_CONFIG: Record<ValidityStatus, { label: string; bg: string; color: string }> = {
  valido:       { label: 'Valido',       bg: '#D1FAE5', color: '#065F46' },
  vencendo:     { label: 'Vencendo',     bg: '#FEF3C7', color: '#92400E' },
  vencido:      { label: 'Vencido',      bg: '#FDE8E8', color: '#C0392B' },
  sem_validade: { label: 'Sem Validade', bg: '#F3F4F6', color: '#6B7280' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function computeValidityStatus(record: HealthRecord): ValidityStatus {
  if (!record.expiry_date) return 'sem_validade';
  const expiry = new Date(record.expiry_date);
  const today = new Date();
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'vencido';
  if (diffDays <= 30) return 'vencendo';
  return 'valido';
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ResultBadge({ result }: { result: string }) {
  const cfg = RESULT_CONFIG[result] ?? { label: result, bg: '#F3F4F6', color: '#6B7280' };
  return (
    <span
      className="badge"
      style={{ backgroundColor: cfg.bg, color: cfg.color, borderRadius: '12px' }}
    >
      {cfg.label}
    </span>
  );
}

function ValidityBadge({ status }: { status: ValidityStatus }) {
  const cfg = VALIDITY_CONFIG[status];
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
  value: string | number;
  color: string;
}

function SummaryCard({ icon, label, value, color }: SummaryCardProps) {
  return (
    <div
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '140px' }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
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
        <p style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
          {value}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', margin: 0 }}>
          {label}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function HealthTab({ usersId }: HealthTabProps) {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<HealthRecord | null>(null);
  const [form, setForm] = useState<HealthFormData>(EMPTY_FORM);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await healthApi.listRecords({ users_id: usersId, page, per_page: perPage });
      setRecords(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load health records:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, page, perPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── KPI derivations ──────────────────────────────────────────────────────────

  const today = new Date();

  const nextExpiry = records
    .filter((r) => r.expiry_date && new Date(r.expiry_date) >= today)
    .sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime())[0];

  const expiredCount = records.filter(
    (r) => r.expiry_date && new Date(r.expiry_date) < today,
  ).length;

  const latestExam = records
    .slice()
    .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())[0];

  // ── Toast ───────────────────────────────────────────────────────────────────

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Modal handlers ──────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setTouched({});
    setShowModal(true);
  };

  const openEditModal = (item: HealthRecord) => {
    setEditingItem(item);
    setForm({
      exam_type: item.exam_type,
      exam_date: item.exam_date.slice(0, 10),
      expiry_date: item.expiry_date?.slice(0, 10) || '',
      result: item.result,
      doctor_name: item.doctor_name || '',
      crm: item.crm || '',
      restriction_description: item.restriction_description || '',
      observation: item.observation || '',
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

  const handleFormChange = (field: keyof HealthFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (value) setTouched((prev) => ({ ...prev, [field]: false }));
  };

  const handleSave = async () => {
    const requiredTouched = { exam_type: true, exam_date: true, result: true };
    setTouched(requiredTouched);

    const errors: string[] = [];
    if (!form.exam_type) errors.push('Tipo de Exame');
    if (!form.exam_date) errors.push('Data de Realizacao');
    if (!form.result) errors.push('Resultado');

    if (errors.length > 0) {
      showToast(`Preencha os campos obrigatorios: ${errors.join(', ')}`, 'error');
      return;
    }

    setModalLoading(true);
    try {
      if (editingItem) {
        await healthApi.updateRecord(editingItem.id, {
          exam_type: form.exam_type,
          exam_date: form.exam_date,
          expiry_date: form.expiry_date || undefined,
          result: form.result,
          doctor_name: form.doctor_name || undefined,
          crm: form.crm || undefined,
          restriction_description: form.restriction_description || undefined,
          observation: form.observation || undefined,
        });
        showToast('Exame atualizado com sucesso.', 'success');
      } else {
        await healthApi.createRecord({
          users_id: usersId,
          exam_type: form.exam_type,
          exam_date: form.exam_date,
          expiry_date: form.expiry_date || undefined,
          result: form.result,
          doctor_name: form.doctor_name || undefined,
          crm: form.crm || undefined,
          restriction_description: form.restriction_description || undefined,
          observation: form.observation || undefined,
        });
        showToast('Exame registrado com sucesso.', 'success');
      }
      closeModal();
      loadData();
    } catch (err) {
      console.error('Failed to save health record:', err);
      showToast('Erro ao salvar. Tente novamente.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // ── Delete handler ──────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (deleteTarget == null) return;
    setActionLoading(true);
    try {
      await healthApi.deleteRecord(deleteTarget);
      showToast('Exame removido com sucesso.', 'success');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete health record:', err);
      showToast('Erro ao remover o registro.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

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
          Novo Exame
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <SummaryCard
          icon={<FileHeart size={20} />}
          label="Total de Exames"
          value={totalItems}
          color="var(--color-primary)"
        />
        <SummaryCard
          icon={<CalendarClock size={20} />}
          label="Proximo Vencimento"
          value={nextExpiry ? formatDate(nextExpiry.expiry_date) : '-'}
          color="#028F58"
        />
        <SummaryCard
          icon={<AlertCircle size={20} />}
          label="Exames Vencidos"
          value={expiredCount}
          color="#C0392B"
        />
        <SummaryCard
          icon={<Stethoscope size={20} />}
          label="Ultimo Exame"
          value={latestExam ? formatDate(latestExam.exam_date) : '-'}
          color="#6B7280"
        />
      </div>

      {/* Table */}
      {records.length === 0 ? (
        <EmptyState
          message="Nenhum registro de saude encontrado para este colaborador."
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={16} style={{ marginRight: 6 }} />
              Novo Exame
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tipo Exame</th>
                <th>Data</th>
                <th>Validade</th>
                <th>Resultado</th>
                <th>Medico</th>
                <th>CRM</th>
                <th>Status Validade</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {records.map((record) => {
                const validityStatus = computeValidityStatus(record);
                return (
                  <motion.tr key={record.id} variants={tableRowVariants}>
                    <td style={{ fontWeight: 500 }}>
                      {EXAM_TYPE_LABELS[record.exam_type] ?? record.exam_type}
                    </td>
                    <td>{formatDate(record.exam_date)}</td>
                    <td>{formatDate(record.expiry_date)}</td>
                    <td>
                      <ResultBadge result={record.result} />
                    </td>
                    <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                      {record.doctor_name || '-'}
                    </td>
                    <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                      {record.crm || '-'}
                    </td>
                    <td>
                      <ValidityBadge status={validityStatus} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                          className="btn btn-icon"
                          title="Editar"
                          onClick={() => openEditModal(record)}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          className="btn btn-icon"
                          title="Excluir"
                          onClick={() => setDeleteTarget(record.id)}
                          style={{ color: 'var(--color-danger)' }}
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
          />
        </div>
      )}

      {/* Create / Edit Modal */}
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
              onClick={(e) => e.stopPropagation()}
              style={{ width: 540, maxWidth: '95vw' }}
            >
              <h3 style={{ marginBottom: 20 }}>
                {editingItem ? 'Editar Exame' : 'Novo Exame'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Tipo de Exame */}
                <div className="input-group">
                  <label>
                    Tipo de Exame <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div
                    style={
                      touched.exam_type && !form.exam_type
                        ? { border: '1px solid #dc2626', borderRadius: 6 }
                        : {}
                    }
                  >
                    <SearchableSelect
                      options={EXAM_TYPE_OPTIONS}
                      value={form.exam_type || undefined}
                      onChange={(val) => handleFormChange('exam_type', String(val ?? ''))}
                      placeholder="Selecione o tipo..."
                      allowClear
                    />
                  </div>
                  {touched.exam_type && !form.exam_type && (
                    <span style={{ color: '#dc2626', fontSize: '12px', marginTop: 2 }}>
                      Campo obrigatorio
                    </span>
                  )}
                </div>

                {/* Datas */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>
                      Data de Realizacao <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="date"
                      className="input-field"
                      value={form.exam_date}
                      onChange={(e) => handleFormChange('exam_date', e.target.value)}
                      style={
                        touched.exam_date && !form.exam_date ? { borderColor: '#dc2626' } : {}
                      }
                    />
                    {touched.exam_date && !form.exam_date && (
                      <span style={{ color: '#dc2626', fontSize: '12px', marginTop: 2 }}>
                        Campo obrigatorio
                      </span>
                    )}
                  </div>

                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Data de Validade</label>
                    <input
                      type="date"
                      className="input-field"
                      value={form.expiry_date}
                      onChange={(e) => handleFormChange('expiry_date', e.target.value)}
                    />
                  </div>
                </div>

                {/* Resultado */}
                <div className="input-group">
                  <label>
                    Resultado <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div
                    style={
                      touched.result && !form.result
                        ? { border: '1px solid #dc2626', borderRadius: 6 }
                        : {}
                    }
                  >
                    <SearchableSelect
                      options={RESULT_OPTIONS}
                      value={form.result || undefined}
                      onChange={(val) => handleFormChange('result', String(val ?? ''))}
                      placeholder="Selecione o resultado..."
                      allowClear
                    />
                  </div>
                  {touched.result && !form.result && (
                    <span style={{ color: '#dc2626', fontSize: '12px', marginTop: 2 }}>
                      Campo obrigatorio
                    </span>
                  )}
                </div>

                {/* Restricoes — mostrado apenas quando resultado e apto_restricao */}
                {form.result === 'apto_restricao' && (
                  <div className="input-group">
                    <label>Restricoes</label>
                    <textarea
                      className="input-field"
                      placeholder="Descreva as restricoes..."
                      rows={3}
                      value={form.restriction_description}
                      onChange={(e) => handleFormChange('restriction_description', e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                )}

                {/* Medico e CRM */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="input-group" style={{ flex: 2 }}>
                    <label>Medico</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Nome do medico..."
                      value={form.doctor_name}
                      onChange={(e) => handleFormChange('doctor_name', e.target.value)}
                    />
                  </div>

                  <div className="input-group" style={{ flex: 1 }}>
                    <label>CRM</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ex: 12345/SP"
                      value={form.crm}
                      onChange={(e) => handleFormChange('crm', e.target.value)}
                    />
                  </div>
                </div>

                {/* Observacoes */}
                <div className="input-group">
                  <label>Observacoes</label>
                  <textarea
                    className="input-field"
                    placeholder="Observacoes adicionais..."
                    rows={3}
                    value={form.observation}
                    onChange={(e) => handleFormChange('observation', e.target.value)}
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
        title="Excluir Exame"
        message="Tem certeza que deseja excluir este registro de saude?"
        confirmLabel={actionLoading ? 'Excluindo...' : 'Excluir'}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

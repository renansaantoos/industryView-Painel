import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, tableRowVariants, modalBackdropVariants, modalContentVariants } from '../../../lib/motion';
import { safetyApi } from '../../../services';
import type { WorkerTraining, TrainingType } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { ExternalLink, BookOpen, Plus } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface TrainingsTabProps {
  usersId: number;
}

type ValidityStatus = 'valido' | 'vencendo' | 'vencido';

interface TrainingFormData {
  training_types_id: string;
  training_date: string;
  instructor: string;
  institution: string;
  certificate_number: string;
  certificate_url: string;
  workload_hours: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

const EMPTY_TRAINING_FORM: TrainingFormData = {
  training_types_id: '',
  training_date: '',
  instructor: '',
  institution: '',
  certificate_number: '',
  certificate_url: '',
  workload_hours: '',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;

function getTodayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function computeValidityStatus(expiryDate?: string | null): ValidityStatus {
  if (!expiryDate) return 'valido';
  const now = Date.now();
  const expiry = new Date(expiryDate).getTime();
  if (expiry < now) return 'vencido';
  if (expiry < now + DAYS_30_MS) return 'vencendo';
  return 'valido';
}

const VALIDITY_CONFIG: Record<ValidityStatus, { label: string; bg: string; color: string }> = {
  valido:   { label: 'Válido',   bg: '#F4FEF9', color: '#028F58' },
  vencendo: { label: 'Vencendo', bg: '#FFF9E6', color: '#B98E00' },
  vencido:  { label: 'Vencido',  bg: '#FDE8E8', color: '#C0392B' },
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function buildTrainingTypeLabel(type: TrainingType): string {
  if (type.nr_reference) return `${type.nr_reference} - ${type.name}`;
  return type.name;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ValidityBadge({ expiryDate }: { expiryDate?: string | null }) {
  const status = computeValidityStatus(expiryDate);
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

// ── Main Component ────────────────────────────────────────────────────────────

export default function TrainingsTab({ usersId }: TrainingsTabProps) {
  const [trainings, setTrainings] = useState<WorkerTraining[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Create training modal state
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TrainingFormData>(EMPTY_TRAINING_FORM);
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const loadTrainings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safetyApi.listWorkerTrainings({
        users_id: usersId,
        page,
        per_page: perPage,
      });
      setTrainings(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load worker trainings:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, page, perPage]);

  useEffect(() => {
    loadTrainings();
  }, [loadTrainings]);

  useEffect(() => {
    safetyApi.listTrainingTypes().then(setTrainingTypes).catch(() => {});
  }, []);

  // ── Toast helper ──────────────────────────────────────────────────────────

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setForm({ ...EMPTY_TRAINING_FORM, training_date: getTodayISO() });
    setTouched({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(EMPTY_TRAINING_FORM);
    setTouched({});
  };

  const handleFormChange = (field: keyof TrainingFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: false }));
  };

  const handleSave = async () => {
    const requiredFields: (keyof TrainingFormData)[] = ['training_types_id', 'training_date'];
    const missing = requiredFields.filter((f) => !form[f]);

    if (missing.length > 0) {
      const newTouched: Record<string, boolean> = {};
      missing.forEach((f) => { newTouched[f] = true; });
      setTouched((prev) => ({ ...prev, ...newTouched }));
      showToast('Preencha os campos obrigatórios antes de continuar.', 'error');
      return;
    }

    setModalLoading(true);
    try {
      await safetyApi.createWorkerTraining({
        users_id: usersId,
        training_types_id: Number(form.training_types_id),
        training_date: form.training_date,
        instructor: form.instructor || undefined,
        institution: form.institution || undefined,
        certificate_number: form.certificate_number || undefined,
        certificate_url: form.certificate_url || undefined,
        workload_hours: form.workload_hours ? Number(form.workload_hours) : undefined,
      });
      closeModal();
      await loadTrainings();
      showToast('Treinamento vinculado com sucesso.', 'success');
    } catch (err) {
      console.error('Failed to create worker training:', err);
      showToast('Erro ao vincular treinamento. Tente novamente.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // ── Derived options ───────────────────────────────────────────────────────

  const trainingTypeOptions = trainingTypes.map((t) => ({
    value: String(t.id),
    label: buildTrainingTypeLabel(t),
  }));

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="training-toast"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '24px',
              zIndex: 2000,
              padding: '12px 18px',
              borderRadius: '10px',
              backgroundColor: toast.type === 'success' ? '#028F58' : '#C0392B',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
              maxWidth: '340px',
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
          Vincular Treinamento
        </button>
      </div>

      {/* Table or Empty State */}
      {trainings.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={48} />}
          message="Nenhum treinamento registrado para este colaborador."
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Treinamento</th>
                <th>Data Conclusão</th>
                <th>Validade</th>
                <th>Status</th>
                <th>Certificado</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {trainings.map((training) => (
                <motion.tr key={training.id} variants={tableRowVariants}>
                  <td style={{ fontWeight: 500 }}>
                    {training.training_type_name || '-'}
                  </td>
                  <td>{formatDate(training.training_date)}</td>
                  <td>{formatDate(training.expiry_date)}</td>
                  <td>
                    <ValidityBadge expiryDate={training.expiry_date} />
                  </td>
                  <td>
                    {training.certificate_url ? (
                      <a
                        href={training.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--color-primary)',
                          fontSize: '13px',
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={14} />
                        Ver certificado
                      </a>
                    ) : (
                      <span style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                        -
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
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

      {/* Create Training Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-backdrop"
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={closeModal}
          >
            <motion.div
              className="modal-content"
              variants={modalContentVariants}
              style={{ width: '520px', maxWidth: '95vw' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Vincular Treinamento
                </h3>
              </div>

              {/* Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Treinamento (required) */}
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Treinamento
                    <span style={{ color: '#C0392B' }}>*</span>
                  </label>
                  <SearchableSelect
                    options={trainingTypeOptions}
                    value={form.training_types_id}
                    onChange={(val) => handleFormChange('training_types_id', val ? String(val) : '')}
                    placeholder="Selecione o treinamento..."
                    style={
                      touched.training_types_id && !form.training_types_id
                        ? { outline: '2px solid #C0392B', borderRadius: 'var(--radius-md)' }
                        : undefined
                    }
                  />
                  {touched.training_types_id && !form.training_types_id && (
                    <span style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>
                      Campo obrigatório
                    </span>
                  )}
                </div>

                {/* Data do Treinamento (required) */}
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Data do Treinamento
                    <span style={{ color: '#C0392B' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.training_date}
                    onChange={(e) => handleFormChange('training_date', e.target.value)}
                    style={
                      touched.training_date && !form.training_date
                        ? { borderColor: '#C0392B' }
                        : undefined
                    }
                  />
                  {touched.training_date && !form.training_date && (
                    <span style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>
                      Campo obrigatório
                    </span>
                  )}
                </div>

                {/* Instrutor and Instituição side by side */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Instrutor</label>
                    <input
                      type="text"
                      className="input-field"
                      value={form.instructor}
                      onChange={(e) => handleFormChange('instructor', e.target.value)}
                      placeholder="Nome do instrutor"
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Instituição</label>
                    <input
                      type="text"
                      className="input-field"
                      value={form.institution}
                      onChange={(e) => handleFormChange('institution', e.target.value)}
                      placeholder="Nome da instituição"
                    />
                  </div>
                </div>

                {/* Nº Certificado and Carga Horária side by side */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>N&#186; Certificado</label>
                    <input
                      type="text"
                      className="input-field"
                      value={form.certificate_number}
                      onChange={(e) => handleFormChange('certificate_number', e.target.value)}
                      placeholder="Ex: CERT-2024-0001"
                    />
                  </div>
                  <div className="input-group" style={{ flex: '0 0 130px' }}>
                    <label>Carga Hor&#225;ria (h)</label>
                    <input
                      type="number"
                      className="input-field"
                      min={0}
                      value={form.workload_hours}
                      onChange={(e) => handleFormChange('workload_hours', e.target.value)}
                      placeholder="Ex: 8"
                    />
                  </div>
                </div>

                {/* URL Certificado */}
                <div className="input-group">
                  <label>URL Certificado</label>
                  <input
                    type="text"
                    className="input-field"
                    value={form.certificate_url}
                    onChange={(e) => handleFormChange('certificate_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>

              </div>

              {/* Modal footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '24px',
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={modalLoading}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={modalLoading}
                  style={{ minWidth: '130px' }}
                >
                  {modalLoading ? (
                    <>
                      <span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />
                      Salvando...
                    </>
                  ) : (
                    'Vincular'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

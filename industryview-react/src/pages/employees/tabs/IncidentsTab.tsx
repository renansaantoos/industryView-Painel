import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  staggerParent,
  tableRowVariants,
  modalBackdropVariants,
  modalContentVariants,
} from '../../../lib/motion';
import { safetyApi, usersApi } from '../../../services';
import type { SafetyIncident, PaginatedResponse } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { AlertTriangle, Calendar, Activity, Shield, Plus, Edit } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';

// ── Types ────────────────────────────────────────────────────────────────────

interface IncidentsTabProps {
  usersId: number;
}

interface IncidentFormData {
  incident_date: string;
  description: string;
  severity: string;
  classification: string;
  category: string;
  location_description: string;
  body_part_affected: string;
  days_lost: string;
  immediate_cause: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

// ── Config ───────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  quase_acidente:      { label: 'Quase Acidente',     bg: '#FEF3C7', color: '#92400E' },
  primeiros_socorros:  { label: 'Primeiros Socorros', bg: '#DBEAFE', color: '#1E40AF' },
  sem_afastamento:     { label: 'Sem Afastamento',    bg: '#FED7AA', color: '#9A3412' },
  com_afastamento:     { label: 'Com Afastamento',    bg: '#FDE8E8', color: '#C0392B' },
  fatal:               { label: 'Fatal',              bg: '#374151', color: '#FFFFFF' },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  registrado:       { label: 'Registrado',      bg: '#DBEAFE', color: '#1E40AF' },
  em_investigacao:  { label: 'Em Investigacao', bg: '#FEF3C7', color: '#92400E' },
  investigado:      { label: 'Investigado',     bg: '#D1FAE5', color: '#065F46' },
  encerrado:        { label: 'Encerrado',       bg: '#F3F4F6', color: '#6B7280' },
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  tipico:             'Tipico',
  trajeto:            'Trajeto',
  doenca_ocupacional: 'Doenca Ocupacional',
};

const EMPTY_FORM: IncidentFormData = {
  incident_date: '',
  description: '',
  severity: '',
  classification: '',
  category: '',
  location_description: '',
  body_part_affected: '',
  days_lost: '0',
  immediate_cause: '',
};

const SEVERITY_OPTIONS = [
  { value: 'quase_acidente',     label: 'Quase Acidente' },
  { value: 'primeiros_socorros', label: 'Primeiros Socorros' },
  { value: 'sem_afastamento',    label: 'Sem Afastamento' },
  { value: 'com_afastamento',    label: 'Com Afastamento' },
  { value: 'fatal',              label: 'Fatal' },
];

const CLASSIFICATION_OPTIONS = [
  { value: 'tipico',             label: 'Tipico' },
  { value: 'trajeto',            label: 'Trajeto' },
  { value: 'doenca_ocupacional', label: 'Doenca Ocupacional' },
];

const CATEGORY_OPTIONS = [
  { value: 'queda',     label: 'Queda' },
  { value: 'corte',     label: 'Corte' },
  { value: 'queimadura', label: 'Queimadura' },
  { value: 'esmagamento', label: 'Esmagamento' },
  { value: 'eletrico',  label: 'Choque Eletrico' },
  { value: 'quimico',   label: 'Exposicao Quimica' },
  { value: 'ergonomico', label: 'Ergonomico' },
  { value: 'outros',    label: 'Outros' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

/** Returns how many of the loaded incidents occurred within the past 12 months */
function countIncidentsLast12Months(incidents: SafetyIncident[]): number {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  return incidents.filter((i) => i.incident_date && new Date(i.incident_date) >= cutoff).length;
}

function deriveRiskStatus(countLast12m: number): { label: string; color: string } {
  if (countLast12m === 0) return { label: 'Baixo', color: '#028F58' };
  if (countLast12m === 1) return { label: 'Medio', color: '#D97706' };
  return { label: 'Alto', color: '#C0392B' };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const cfg = SEVERITY_CONFIG[severity] ?? { label: severity, bg: '#F3F4F6', color: '#6B7280' };
  return (
    <span
      className="badge"
      style={{ backgroundColor: cfg.bg, color: cfg.color, borderRadius: '12px' }}
    >
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: '#F3F4F6', color: '#6B7280' };
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

// ── Field helpers ─────────────────────────────────────────────────────────────

function requiredBorderStyle(isTouched: boolean, value: string): React.CSSProperties {
  return isTouched && !value ? { borderColor: '#C0392B' } : {};
}

function FieldError({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span style={{ fontSize: '11px', color: '#C0392B', marginTop: '2px', display: 'block' }}>
      Campo obrigatorio
    </span>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', marginBottom: '4px', display: 'block' }}>
      {children}
      {required && <span style={{ color: '#C0392B', marginLeft: '2px' }}>*</span>}
    </label>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function IncidentsTab({ usersId }: IncidentsTabProps) {
  const { user } = useAuthContext();

  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Projects for dropdown
  const [allProjects, setAllProjects] = useState<{ id: number; name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SafetyIncident | null>(null);
  const [form, setForm] = useState<IncidentFormData>(EMPTY_FORM);
  const [modalLoading, setModalLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Toast state
  const [toast, setToast] = useState<ToastState | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data: PaginatedResponse<SafetyIncident> = await safetyApi.listIncidents({
        involved_user_id: usersId,
        page,
        per_page: perPage,
      });
      setIncidents(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, page, perPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load only the projects this employee is linked to
  useEffect(() => {
    usersApi.getUser(usersId).then((res: any) => {
      const userData = res.result1 || res;
      const projects = (userData._projects || []).map((p: any) => ({ id: Number(p.id), name: p.name }));
      setAllProjects(projects);
    }).catch(() => {});
  }, [usersId]);

  // ── Derived KPI values ──────────────────────────────────────────────────────

  const totalDaysLost = incidents.reduce((acc, i) => acc + (i.days_lost ?? 0), 0);

  const latestIncidentDate = incidents.length > 0
    ? incidents.reduce((latest, i) => {
        if (!i.incident_date) return latest;
        return !latest || i.incident_date > latest ? i.incident_date : latest;
      }, null as string | null)
    : null;

  const countLast12m = countIncidentsLast12Months(incidents);
  const riskStatus = deriveRiskStatus(countLast12m);

  // ── Toast ───────────────────────────────────────────────────────────────────

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Modal handlers ───────────────────────────────────────────────────────────

  function openCreateModal() {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setTouched({});
    setSelectedProjectId(null);
    setShowModal(true);
  }

  function openEditModal(item: SafetyIncident) {
    setEditingItem(item);
    setForm({
      incident_date: item.incident_date ? item.incident_date.slice(0, 10) : '',
      description: item.description,
      severity: item.severity,
      classification: item.classification,
      category: item.category,
      location_description: item.location_description || '',
      body_part_affected: item.body_part_affected || '',
      days_lost: String(item.days_lost ?? 0),
      immediate_cause: item.immediate_cause || '',
    });
    setSelectedProjectId(item.projects_id);
    setTouched({});
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setTouched({});
    setSelectedProjectId(null);
  }

  function handleFormChange(field: keyof IncidentFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: false }));
  }

  async function handleSave() {
    // Mark all required fields as touched for validation display
    const requiredFields: (keyof IncidentFormData)[] = [
      'severity', 'classification', 'category', 'incident_date', 'description',
    ];
    const newTouched: Record<string, boolean> = {};
    requiredFields.forEach((f) => { newTouched[f] = true; });
    if (!editingItem) {
      newTouched['project'] = true;
    }
    setTouched(newTouched);

    const missing: string[] = [];
    if (!form.severity) missing.push('Severidade');
    if (!form.classification) missing.push('Classificacao');
    if (!form.category) missing.push('Categoria');
    if (!form.incident_date) missing.push('Data');
    if (form.description.trim().length < 10) missing.push('Descricao (min 10 caracteres)');
    if (!editingItem && !selectedProjectId) missing.push('Projeto');

    if (missing.length > 0) {
      showToast(`Preencha: ${missing.join(', ')}`, 'error');
      return;
    }

    setModalLoading(true);
    try {
      if (editingItem) {
        await safetyApi.updateIncident(editingItem.id, {
          description: form.description,
          severity: form.severity,
          classification: form.classification,
          category: form.category,
          location_description: form.location_description,
          body_part_affected: form.body_part_affected,
          days_lost: Number(form.days_lost) || 0,
          immediate_cause: form.immediate_cause,
        });
        showToast('Incidente atualizado com sucesso.', 'success');
      } else {
        const currentUserId = user?.id || usersId;
        await safetyApi.createIncident({
          projects_id: selectedProjectId!,
          reported_by: currentUserId,
          incident_date: form.incident_date,
          description: form.description,
          severity: form.severity,
          classification: form.classification,
          category: form.category,
          location_description: form.location_description || undefined,
          body_part_affected: form.body_part_affected || undefined,
          days_lost: Number(form.days_lost) || 0,
          immediate_cause: form.immediate_cause || undefined,
          involved_user_id: usersId,
        });
        showToast('Incidente registrado com sucesso.', 'success');
      }
      closeModal();
      loadData();
    } catch (err) {
      console.error('Failed to save incident:', err);
      showToast('Erro ao salvar incidente. Tente novamente.', 'error');
    } finally {
      setModalLoading(false);
    }
  }

  // ── Project options for SearchableSelect ─────────────────────────────────────

  const projectOptions = allProjects.map((p) => ({ value: p.id, label: p.name }));

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '24px',
              zIndex: 2000,
              padding: '12px 20px',
              borderRadius: '10px',
              backgroundColor: toast.type === 'success' ? '#028F58' : '#C0392B',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
              maxWidth: '360px',
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={openCreateModal} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          Novo Incidente
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <SummaryCard
          icon={<AlertTriangle size={20} />}
          label="Total de Incidentes"
          value={totalItems}
          color="var(--color-primary)"
        />
        <SummaryCard
          icon={<Calendar size={20} />}
          label="Dias Perdidos"
          value={totalDaysLost}
          color="#C0392B"
        />
        <SummaryCard
          icon={<Activity size={20} />}
          label="Ultimo Incidente"
          value={latestIncidentDate ? formatDate(latestIncidentDate) : '-'}
          color="#D97706"
        />
        <SummaryCard
          icon={<Shield size={20} />}
          label="Status de Risco"
          value={riskStatus.label}
          color={riskStatus.color}
        />
      </div>

      {/* Table */}
      {incidents.length === 0 ? (
        <EmptyState message="Nenhum incidente registrado para este colaborador." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>N Incidente</th>
                <th>Severidade</th>
                <th>Classificacao</th>
                <th>Parte do Corpo</th>
                <th>Dias Perdidos</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {incidents.map((incident) => (
                <motion.tr key={incident.id} variants={tableRowVariants}>
                  <td>{formatDate(incident.incident_date)}</td>
                  <td style={{ fontWeight: 500 }}>
                    {incident.incident_number || '-'}
                  </td>
                  <td>
                    <SeverityBadge severity={incident.severity} />
                  </td>
                  <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                    {CLASSIFICATION_LABELS[incident.classification] ?? incident.classification ?? '-'}
                  </td>
                  <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                    {incident.body_part_affected || '-'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {incident.days_lost ?? 0}
                  </td>
                  <td>
                    <StatusBadge status={incident.status} />
                  </td>
                  <td>
                    <button
                      className="btn btn-icon"
                      title="Editar"
                      onClick={() => openEditModal(incident)}
                    >
                      <Edit size={15} />
                    </button>
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
          >
            <motion.div
              className="modal-content"
              variants={modalContentVariants}
              style={{ width: '600px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {editingItem ? 'Editar Incidente' : 'Novo Incidente'}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                  {editingItem
                    ? `Editando incidente ${editingItem.incident_number || '#' + editingItem.id}`
                    : 'Registre um novo incidente para este colaborador.'}
                </p>
              </div>

              {/* Row 1: Projeto + Data */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <FieldLabel required>Projeto</FieldLabel>
                  <SearchableSelect
                    options={projectOptions}
                    value={selectedProjectId ?? undefined}
                    onChange={(val) => {
                      setSelectedProjectId(val !== undefined ? Number(val) : null);
                      setTouched((prev) => ({ ...prev, project: false }));
                    }}
                    placeholder="Selecione o projeto..."
                    style={
                      !editingItem && touched['project'] && !selectedProjectId
                        ? { outline: '1.5px solid #C0392B', borderRadius: 'var(--radius-md)' }
                        : {}
                    }
                  />
                  <FieldError show={!editingItem && !!touched['project'] && !selectedProjectId} />
                </div>
                <div>
                  <FieldLabel required>Data do Incidente</FieldLabel>
                  <input
                    type="date"
                    className="input-field"
                    value={form.incident_date}
                    onChange={(e) => handleFormChange('incident_date', e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, incident_date: true }))}
                    style={{ width: '100%', ...requiredBorderStyle(!!touched['incident_date'], form.incident_date) }}
                  />
                  <FieldError show={!!touched['incident_date'] && !form.incident_date} />
                </div>
              </div>

              {/* Row 2: Severidade + Classificação */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <FieldLabel required>Severidade</FieldLabel>
                  <SearchableSelect
                    options={SEVERITY_OPTIONS}
                    value={form.severity || undefined}
                    onChange={(val) => {
                      handleFormChange('severity', val !== undefined ? String(val) : '');
                      setTouched((p) => ({ ...p, severity: true }));
                    }}
                    placeholder="Selecione..."
                    allowClear={false}
                    style={
                      touched['severity'] && !form.severity
                        ? { outline: '1.5px solid #C0392B', borderRadius: 'var(--radius-md)' }
                        : {}
                    }
                  />
                  <FieldError show={!!touched['severity'] && !form.severity} />
                </div>
                <div>
                  <FieldLabel required>Classificacao</FieldLabel>
                  <SearchableSelect
                    options={CLASSIFICATION_OPTIONS}
                    value={form.classification || undefined}
                    onChange={(val) => {
                      handleFormChange('classification', val !== undefined ? String(val) : '');
                      setTouched((p) => ({ ...p, classification: true }));
                    }}
                    placeholder="Selecione..."
                    allowClear={false}
                    style={
                      touched['classification'] && !form.classification
                        ? { outline: '1.5px solid #C0392B', borderRadius: 'var(--radius-md)' }
                        : {}
                    }
                  />
                  <FieldError show={!!touched['classification'] && !form.classification} />
                </div>
              </div>

              {/* Row 3: Categoria + Dias Perdidos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <FieldLabel required>Categoria</FieldLabel>
                  <SearchableSelect
                    options={CATEGORY_OPTIONS}
                    value={form.category || undefined}
                    onChange={(val) => {
                      handleFormChange('category', val !== undefined ? String(val) : '');
                      setTouched((p) => ({ ...p, category: true }));
                    }}
                    placeholder="Selecione..."
                    allowClear={false}
                    style={
                      touched['category'] && !form.category
                        ? { outline: '1.5px solid #C0392B', borderRadius: 'var(--radius-md)' }
                        : {}
                    }
                  />
                  <FieldError show={!!touched['category'] && !form.category} />
                </div>
                <div>
                  <FieldLabel>Dias Perdidos</FieldLabel>
                  <input
                    type="number"
                    className="input-field"
                    min="0"
                    value={form.days_lost}
                    onChange={(e) => handleFormChange('days_lost', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Row 4: Parte do Corpo + Local */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <FieldLabel>Parte do Corpo Afetada</FieldLabel>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ex: Mao direita"
                    value={form.body_part_affected}
                    onChange={(e) => handleFormChange('body_part_affected', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <FieldLabel>Local do Incidente</FieldLabel>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ex: Area de medicao"
                    value={form.location_description}
                    onChange={(e) => handleFormChange('location_description', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Row 5: Descrição (full width) */}
              <div style={{ marginBottom: '14px' }}>
                <FieldLabel required>Descricao</FieldLabel>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Descreva o incidente com detalhes (minimo 10 caracteres)..."
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, description: true }))}
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    ...(touched['description'] && form.description.trim().length < 10
                      ? { borderColor: '#C0392B' }
                      : {}),
                  }}
                />
                <FieldError show={!!touched['description'] && form.description.trim().length < 10} />
              </div>

              {/* Row 6: Causa Imediata (full width) */}
              <div style={{ marginBottom: '24px' }}>
                <FieldLabel>Causa Imediata</FieldLabel>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Descreva a causa imediata do incidente (opcional)..."
                  value={form.immediate_cause}
                  onChange={(e) => handleFormChange('immediate_cause', e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={closeModal} disabled={modalLoading}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={modalLoading}>
                  {modalLoading ? 'Salvando...' : editingItem ? 'Salvar Alteracoes' : 'Registrar Incidente'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

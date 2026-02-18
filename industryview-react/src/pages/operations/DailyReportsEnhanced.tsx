import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { dailyReportsApi, projectsApi } from '../../services';
import type {
  DailyReport,
  DailyReportWorkforce,
  DailyReportActivity,
  DailyReportOccurrence,
  DailyReportEquipment,
} from '../../types';
import type { Project } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusBadge from '../../components/common/StatusBadge';
import ApprovalActions from '../../components/common/ApprovalActions';
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  Activity,
  AlertTriangle,
  Wrench,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type RdoTab = 'header' | 'workforce' | 'activities' | 'occurrences' | 'equipment';

const STATUS_COLOR_MAP: Record<string, { bg: string; color: string; label: string }> = {
  rascunho:  { bg: 'var(--color-alternate)',  color: 'var(--color-secondary-text)', label: 'Rascunho' },
  finalizado: { bg: '#dbeafe', color: '#1d4ed8', label: 'Finalizado' },
  aprovado:   { bg: '#dcfce7', color: '#15803d', label: 'Aprovado' },
  rejeitado:  { bg: '#fee2e2', color: '#b91c1c', label: 'Rejeitado' },
};

const SHIFT_OPTIONS = ['diurno', 'noturno', 'integral'];
const WEATHER_OPTIONS = ['ensolarado', 'nublado', 'chuvoso', 'parcialmente_nublado', 'tempestade'];

// ---------------------------------------------------------------------------
// Sub-types for forms
// ---------------------------------------------------------------------------

interface CreateRdoForm {
  projects_id: number | '';
  report_date: string;
  shift: string;
  weather: string;
  temperature_min: string;
  temperature_max: string;
  observations: string;
}

interface WorkforceForm {
  category: string;
  planned_count: string;
  present_count: string;
  absent_count: string;
  observation: string;
}

interface ActivityForm {
  backlog_name: string;
  description: string;
  quantity: string;
  unit: string;
  team: string;
}

interface OccurrenceForm {
  occurrence_type: string;
  description: string;
  start_time: string;
  end_time: string;
  impact: string;
}

interface EquipmentForm {
  equipment_type: string;
  description: string;
  quantity: string;
  operating_hours: string;
  idle_hours: string;
}

const EMPTY_RDO_FORM: CreateRdoForm = {
  projects_id: '',
  report_date: new Date().toISOString().split('T')[0],
  shift: '',
  weather: '',
  temperature_min: '',
  temperature_max: '',
  observations: '',
};

const EMPTY_WORKFORCE_FORM: WorkforceForm = {
  category: '',
  planned_count: '',
  present_count: '',
  absent_count: '',
  observation: '',
};

const EMPTY_ACTIVITY_FORM: ActivityForm = {
  backlog_name: '',
  description: '',
  quantity: '',
  unit: '',
  team: '',
};

const EMPTY_OCCURRENCE_FORM: OccurrenceForm = {
  occurrence_type: '',
  description: '',
  start_time: '',
  end_time: '',
  impact: '',
};

const EMPTY_EQUIPMENT_FORM: EquipmentForm = {
  equipment_type: '',
  description: '',
  quantity: '',
  operating_hours: '',
  idle_hours: '',
};

// ---------------------------------------------------------------------------
// Helper: tab button style
// ---------------------------------------------------------------------------

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--color-primary)' : 'var(--color-secondary-text)',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
    cursor: 'pointer',
    marginBottom: '-2px',
    whiteSpace: 'nowrap',
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DailyReportsEnhanced() {
  const { t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();

  // ------------------------------------------------------------------
  // List state
  // ------------------------------------------------------------------
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ------------------------------------------------------------------
  // Filters
  // ------------------------------------------------------------------
  const [filterInitialDate, setFilterInitialDate] = useState('');
  const [filterFinalDate, setFilterFinalDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ------------------------------------------------------------------
  // Projects (for create form when no project is selected)
  // ------------------------------------------------------------------
  const [projects, setProjects] = useState<Project[]>([]);

  // ------------------------------------------------------------------
  // Create modal
  // ------------------------------------------------------------------
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateRdoForm>(EMPTY_RDO_FORM);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // ------------------------------------------------------------------
  // Detail / expanded RDO
  // ------------------------------------------------------------------
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<RdoTab>('header');

  // ------------------------------------------------------------------
  // Edit header (when rascunho)
  // ------------------------------------------------------------------
  const [editingHeader, setEditingHeader] = useState(false);
  const [headerForm, setHeaderForm] = useState<Partial<CreateRdoForm>>({});
  const [headerSaving, setHeaderSaving] = useState(false);

  // ------------------------------------------------------------------
  // Approval / rejection
  // ------------------------------------------------------------------
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // ------------------------------------------------------------------
  // Workforce sub-tab
  // ------------------------------------------------------------------
  const [workforceForm, setWorkforceForm] = useState<WorkforceForm>(EMPTY_WORKFORCE_FORM);
  const [editingWorkforce, setEditingWorkforce] = useState<DailyReportWorkforce | null>(null);
  const [workforceLoading, setWorkforceLoading] = useState(false);
  const [deleteWorkforceId, setDeleteWorkforceId] = useState<number | null>(null);

  // ------------------------------------------------------------------
  // Activities sub-tab
  // ------------------------------------------------------------------
  const [activityForm, setActivityForm] = useState<ActivityForm>(EMPTY_ACTIVITY_FORM);
  const [editingActivity, setEditingActivity] = useState<DailyReportActivity | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [deleteActivityId, setDeleteActivityId] = useState<number | null>(null);

  // ------------------------------------------------------------------
  // Occurrences sub-tab
  // ------------------------------------------------------------------
  const [occurrenceForm, setOccurrenceForm] = useState<OccurrenceForm>(EMPTY_OCCURRENCE_FORM);
  const [editingOccurrence, setEditingOccurrence] = useState<DailyReportOccurrence | null>(null);
  const [occurrenceLoading, setOccurrenceLoading] = useState(false);
  const [deleteOccurrenceId, setDeleteOccurrenceId] = useState<number | null>(null);

  // ------------------------------------------------------------------
  // Equipment sub-tab
  // ------------------------------------------------------------------
  const [equipmentForm, setEquipmentForm] = useState<EquipmentForm>(EMPTY_EQUIPMENT_FORM);
  const [editingEquipment, setEditingEquipment] = useState<DailyReportEquipment | null>(null);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [deleteEquipmentId, setDeleteEquipmentId] = useState<number | null>(null);

  // ------------------------------------------------------------------
  // Delete RDO confirm
  // ------------------------------------------------------------------
  const [deleteReportId, setDeleteReportId] = useState<number | null>(null);

  // ------------------------------------------------------------------
  // Toast
  // ------------------------------------------------------------------
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ------------------------------------------------------------------
  // Nav selection
  // ------------------------------------------------------------------
  useEffect(() => {
    setNavBarSelection(21);
  }, []);

  // ------------------------------------------------------------------
  // Load projects for the create form (when no project is context-selected)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!projectsInfo) {
      projectsApi.queryAllProjects({ per_page: 100 })
        .then((data) => setProjects(data.items || []))
        .catch((err) => console.error('Failed to load projects:', err));
    }
  }, [projectsInfo]);

  // ------------------------------------------------------------------
  // Show toast helper
  // ------------------------------------------------------------------
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ------------------------------------------------------------------
  // Load list
  // ------------------------------------------------------------------
  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof dailyReportsApi.listDailyReports>[0] = {
        page,
        per_page: perPage,
        initial_date: filterInitialDate || undefined,
        final_date: filterFinalDate || undefined,
        status: filterStatus || undefined,
      };
      if (projectsInfo) params.projects_id = projectsInfo.id;
      const data = await dailyReportsApi.listDailyReports(params);
      setReports(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load daily reports:', err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, filterInitialDate, filterFinalDate, filterStatus, projectsInfo]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // ------------------------------------------------------------------
  // Open detail
  // ------------------------------------------------------------------
  const openDetail = async (report: DailyReport) => {
    setDetailLoading(true);
    setActiveTab('header');
    setEditingHeader(false);
    try {
      const full = await dailyReportsApi.getDailyReport(report.id);
      setSelectedReport(full);
    } catch (err) {
      console.error('Failed to load report detail:', err);
      showToast('Erro ao carregar RDO', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedReport(null);
    setEditingHeader(false);
    setWorkforceForm(EMPTY_WORKFORCE_FORM);
    setEditingWorkforce(null);
    setActivityForm(EMPTY_ACTIVITY_FORM);
    setEditingActivity(null);
    setOccurrenceForm(EMPTY_OCCURRENCE_FORM);
    setEditingOccurrence(null);
    setEquipmentForm(EMPTY_EQUIPMENT_FORM);
    setEditingEquipment(null);
  };

  // ------------------------------------------------------------------
  // Create RDO
  // ------------------------------------------------------------------
  const handleCreate = async () => {
    const projectId = projectsInfo ? projectsInfo.id : Number(createForm.projects_id);
    if (!projectId || !createForm.report_date) {
      setCreateError('Projeto e data são obrigatórios.');
      return;
    }
    setCreateLoading(true);
    setCreateError('');
    try {
      await dailyReportsApi.createDailyReport({
        projects_id: projectId,
        report_date: createForm.report_date,
        shift: createForm.shift || undefined,
        weather: createForm.weather || undefined,
        temperature_min: createForm.temperature_min ? Number(createForm.temperature_min) : undefined,
        temperature_max: createForm.temperature_max ? Number(createForm.temperature_max) : undefined,
        observations: createForm.observations || undefined,
      });
      setShowCreateModal(false);
      setCreateForm(EMPTY_RDO_FORM);
      showToast('RDO criado com sucesso!');
      loadReports();
    } catch (err) {
      console.error('Failed to create RDO:', err);
      setCreateError('Erro ao criar RDO.');
    } finally {
      setCreateLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Edit header
  // ------------------------------------------------------------------
  const startEditHeader = () => {
    if (!selectedReport) return;
    setHeaderForm({
      shift: selectedReport.shift || '',
      weather: selectedReport.weather || '',
      temperature_min: selectedReport.temperature_min != null ? String(selectedReport.temperature_min) : '',
      temperature_max: selectedReport.temperature_max != null ? String(selectedReport.temperature_max) : '',
      observations: selectedReport.observations || '',
    });
    setEditingHeader(true);
  };

  const saveHeader = async () => {
    if (!selectedReport) return;
    setHeaderSaving(true);
    try {
      const updated = await dailyReportsApi.updateDailyReport(selectedReport.id, {
        shift: headerForm.shift || undefined,
        weather: headerForm.weather || undefined,
        temperature_min: headerForm.temperature_min ? Number(headerForm.temperature_min) : undefined,
        temperature_max: headerForm.temperature_max ? Number(headerForm.temperature_max) : undefined,
        observations: headerForm.observations || undefined,
      });
      setSelectedReport(updated);
      setEditingHeader(false);
      showToast('RDO atualizado!');
      loadReports();
    } catch (err) {
      console.error('Failed to update header:', err);
      showToast('Erro ao salvar alterações.', 'error');
    } finally {
      setHeaderSaving(false);
    }
  };

  // ------------------------------------------------------------------
  // Approval flow
  // ------------------------------------------------------------------
  const handleFinalize = async () => {
    if (!selectedReport) return;
    setApprovalLoading(true);
    try {
      const updated = await dailyReportsApi.finalizeDailyReport(selectedReport.id);
      setSelectedReport(updated);
      showToast('RDO finalizado!');
      loadReports();
    } catch (err) {
      console.error('Failed to finalize RDO:', err);
      showToast('Erro ao finalizar RDO.', 'error');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedReport) return;
    setApprovalLoading(true);
    try {
      const updated = await dailyReportsApi.approveDailyReport(selectedReport.id);
      setSelectedReport(updated);
      showToast('RDO aprovado!');
      loadReports();
    } catch (err) {
      console.error('Failed to approve RDO:', err);
      showToast('Erro ao aprovar RDO.', 'error');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReport) return;
    setApprovalLoading(true);
    try {
      const updated = await dailyReportsApi.rejectDailyReport(selectedReport.id, {
        rejection_reason: rejectionReason || undefined,
      });
      setSelectedReport(updated);
      setShowRejectModal(false);
      setRejectionReason('');
      showToast('RDO rejeitado.');
      loadReports();
    } catch (err) {
      console.error('Failed to reject RDO:', err);
      showToast('Erro ao rejeitar RDO.', 'error');
    } finally {
      setApprovalLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Workforce CRUD
  // ------------------------------------------------------------------
  const handleAddWorkforce = async () => {
    if (!selectedReport || !workforceForm.category.trim()) return;
    setWorkforceLoading(true);
    try {
      const entry = await dailyReportsApi.addWorkforce(selectedReport.id, {
        category: workforceForm.category.trim(),
        planned_count: Number(workforceForm.planned_count) || 0,
        present_count: Number(workforceForm.present_count) || 0,
        absent_count: Number(workforceForm.absent_count) || 0,
        observation: workforceForm.observation || undefined,
      });
      setSelectedReport((prev) =>
        prev ? { ...prev, workforce: [...(prev.workforce || []), entry] } : prev,
      );
      setWorkforceForm(EMPTY_WORKFORCE_FORM);
      showToast('Mão de obra adicionada!');
    } catch (err) {
      console.error('Failed to add workforce:', err);
      showToast('Erro ao adicionar mão de obra.', 'error');
    } finally {
      setWorkforceLoading(false);
    }
  };

  const handleSaveWorkforce = async () => {
    if (!editingWorkforce) return;
    setWorkforceLoading(true);
    try {
      const updated = await dailyReportsApi.updateWorkforce(editingWorkforce.id, {
        category: workforceForm.category.trim(),
        planned_count: Number(workforceForm.planned_count) || 0,
        present_count: Number(workforceForm.present_count) || 0,
        absent_count: Number(workforceForm.absent_count) || 0,
        observation: workforceForm.observation || undefined,
      });
      setSelectedReport((prev) =>
        prev
          ? {
              ...prev,
              workforce: (prev.workforce || []).map((w) =>
                w.id === updated.id ? updated : w,
              ),
            }
          : prev,
      );
      setEditingWorkforce(null);
      setWorkforceForm(EMPTY_WORKFORCE_FORM);
      showToast('Mão de obra atualizada!');
    } catch (err) {
      console.error('Failed to update workforce:', err);
      showToast('Erro ao atualizar mão de obra.', 'error');
    } finally {
      setWorkforceLoading(false);
    }
  };

  const handleDeleteWorkforce = async (id: number) => {
    setWorkforceLoading(true);
    try {
      await dailyReportsApi.deleteWorkforce(id);
      setSelectedReport((prev) =>
        prev
          ? { ...prev, workforce: (prev.workforce || []).filter((w) => w.id !== id) }
          : prev,
      );
      showToast('Registro removido.');
    } catch (err) {
      console.error('Failed to delete workforce:', err);
      showToast('Erro ao remover registro.', 'error');
    } finally {
      setWorkforceLoading(false);
      setDeleteWorkforceId(null);
    }
  };

  const startEditWorkforce = (entry: DailyReportWorkforce) => {
    setEditingWorkforce(entry);
    setWorkforceForm({
      category: entry.category,
      planned_count: String(entry.planned_count),
      present_count: String(entry.present_count),
      absent_count: String(entry.absent_count),
      observation: entry.observation || '',
    });
  };

  // ------------------------------------------------------------------
  // Activities CRUD
  // ------------------------------------------------------------------
  const handleAddActivity = async () => {
    if (!selectedReport || !activityForm.description.trim()) return;
    setActivityLoading(true);
    try {
      const entry = await dailyReportsApi.addActivity(selectedReport.id, {
        backlog_name: activityForm.backlog_name || undefined,
        description: activityForm.description.trim(),
        quantity: activityForm.quantity ? Number(activityForm.quantity) : undefined,
        unit: activityForm.unit || undefined,
        team: activityForm.team || undefined,
      });
      setSelectedReport((prev) =>
        prev ? { ...prev, activities: [...(prev.activities || []), entry] } : prev,
      );
      setActivityForm(EMPTY_ACTIVITY_FORM);
      showToast('Atividade adicionada!');
    } catch (err) {
      console.error('Failed to add activity:', err);
      showToast('Erro ao adicionar atividade.', 'error');
    } finally {
      setActivityLoading(false);
    }
  };

  const handleSaveActivity = async () => {
    if (!editingActivity) return;
    setActivityLoading(true);
    try {
      const updated = await dailyReportsApi.updateActivity(editingActivity.id, {
        backlog_name: activityForm.backlog_name || undefined,
        description: activityForm.description.trim(),
        quantity: activityForm.quantity ? Number(activityForm.quantity) : undefined,
        unit: activityForm.unit || undefined,
        team: activityForm.team || undefined,
      });
      setSelectedReport((prev) =>
        prev
          ? {
              ...prev,
              activities: (prev.activities || []).map((a) =>
                a.id === updated.id ? updated : a,
              ),
            }
          : prev,
      );
      setEditingActivity(null);
      setActivityForm(EMPTY_ACTIVITY_FORM);
      showToast('Atividade atualizada!');
    } catch (err) {
      console.error('Failed to update activity:', err);
      showToast('Erro ao atualizar atividade.', 'error');
    } finally {
      setActivityLoading(false);
    }
  };

  const handleDeleteActivity = async (id: number) => {
    setActivityLoading(true);
    try {
      await dailyReportsApi.deleteActivity(id);
      setSelectedReport((prev) =>
        prev
          ? { ...prev, activities: (prev.activities || []).filter((a) => a.id !== id) }
          : prev,
      );
      showToast('Atividade removida.');
    } catch (err) {
      console.error('Failed to delete activity:', err);
      showToast('Erro ao remover atividade.', 'error');
    } finally {
      setActivityLoading(false);
      setDeleteActivityId(null);
    }
  };

  const startEditActivity = (entry: DailyReportActivity) => {
    setEditingActivity(entry);
    setActivityForm({
      backlog_name: entry.backlog_name || '',
      description: entry.description,
      quantity: entry.quantity != null ? String(entry.quantity) : '',
      unit: entry.unit || '',
      team: entry.team || '',
    });
  };

  // ------------------------------------------------------------------
  // Occurrences CRUD
  // ------------------------------------------------------------------
  const handleAddOccurrence = async () => {
    if (!selectedReport || !occurrenceForm.description.trim() || !occurrenceForm.occurrence_type.trim()) return;
    setOccurrenceLoading(true);
    try {
      const entry = await dailyReportsApi.addOccurrence(selectedReport.id, {
        occurrence_type: occurrenceForm.occurrence_type.trim(),
        description: occurrenceForm.description.trim(),
        start_time: occurrenceForm.start_time || undefined,
        end_time: occurrenceForm.end_time || undefined,
        impact: occurrenceForm.impact || undefined,
      });
      setSelectedReport((prev) =>
        prev ? { ...prev, occurrences: [...(prev.occurrences || []), entry] } : prev,
      );
      setOccurrenceForm(EMPTY_OCCURRENCE_FORM);
      showToast('Ocorrência adicionada!');
    } catch (err) {
      console.error('Failed to add occurrence:', err);
      showToast('Erro ao adicionar ocorrência.', 'error');
    } finally {
      setOccurrenceLoading(false);
    }
  };

  const handleSaveOccurrence = async () => {
    if (!editingOccurrence) return;
    setOccurrenceLoading(true);
    try {
      const updated = await dailyReportsApi.updateOccurrence(editingOccurrence.id, {
        occurrence_type: occurrenceForm.occurrence_type.trim(),
        description: occurrenceForm.description.trim(),
        start_time: occurrenceForm.start_time || undefined,
        end_time: occurrenceForm.end_time || undefined,
        impact: occurrenceForm.impact || undefined,
      });
      setSelectedReport((prev) =>
        prev
          ? {
              ...prev,
              occurrences: (prev.occurrences || []).map((o) =>
                o.id === updated.id ? updated : o,
              ),
            }
          : prev,
      );
      setEditingOccurrence(null);
      setOccurrenceForm(EMPTY_OCCURRENCE_FORM);
      showToast('Ocorrência atualizada!');
    } catch (err) {
      console.error('Failed to update occurrence:', err);
      showToast('Erro ao atualizar ocorrência.', 'error');
    } finally {
      setOccurrenceLoading(false);
    }
  };

  const handleDeleteOccurrence = async (id: number) => {
    setOccurrenceLoading(true);
    try {
      await dailyReportsApi.deleteOccurrence(id);
      setSelectedReport((prev) =>
        prev
          ? { ...prev, occurrences: (prev.occurrences || []).filter((o) => o.id !== id) }
          : prev,
      );
      showToast('Ocorrência removida.');
    } catch (err) {
      console.error('Failed to delete occurrence:', err);
      showToast('Erro ao remover ocorrência.', 'error');
    } finally {
      setOccurrenceLoading(false);
      setDeleteOccurrenceId(null);
    }
  };

  const startEditOccurrence = (entry: DailyReportOccurrence) => {
    setEditingOccurrence(entry);
    setOccurrenceForm({
      occurrence_type: entry.occurrence_type,
      description: entry.description,
      start_time: entry.start_time || '',
      end_time: entry.end_time || '',
      impact: entry.impact || '',
    });
  };

  // ------------------------------------------------------------------
  // Equipment CRUD
  // ------------------------------------------------------------------
  const handleAddEquipment = async () => {
    if (!selectedReport || !equipmentForm.equipment_type.trim()) return;
    setEquipmentLoading(true);
    try {
      const entry = await dailyReportsApi.addEquipment(selectedReport.id, {
        equipment_type: equipmentForm.equipment_type.trim(),
        description: equipmentForm.description || undefined,
        quantity: Number(equipmentForm.quantity) || 1,
        operating_hours: equipmentForm.operating_hours ? Number(equipmentForm.operating_hours) : undefined,
        idle_hours: equipmentForm.idle_hours ? Number(equipmentForm.idle_hours) : undefined,
      });
      setSelectedReport((prev) =>
        prev ? { ...prev, equipment: [...(prev.equipment || []), entry] } : prev,
      );
      setEquipmentForm(EMPTY_EQUIPMENT_FORM);
      showToast('Equipamento adicionado!');
    } catch (err) {
      console.error('Failed to add equipment:', err);
      showToast('Erro ao adicionar equipamento.', 'error');
    } finally {
      setEquipmentLoading(false);
    }
  };

  const handleSaveEquipment = async () => {
    if (!editingEquipment) return;
    setEquipmentLoading(true);
    try {
      const updated = await dailyReportsApi.updateEquipment(editingEquipment.id, {
        equipment_type: equipmentForm.equipment_type.trim(),
        description: equipmentForm.description || undefined,
        quantity: Number(equipmentForm.quantity) || 1,
        operating_hours: equipmentForm.operating_hours ? Number(equipmentForm.operating_hours) : undefined,
        idle_hours: equipmentForm.idle_hours ? Number(equipmentForm.idle_hours) : undefined,
      });
      setSelectedReport((prev) =>
        prev
          ? {
              ...prev,
              equipment: (prev.equipment || []).map((e) =>
                e.id === updated.id ? updated : e,
              ),
            }
          : prev,
      );
      setEditingEquipment(null);
      setEquipmentForm(EMPTY_EQUIPMENT_FORM);
      showToast('Equipamento atualizado!');
    } catch (err) {
      console.error('Failed to update equipment:', err);
      showToast('Erro ao atualizar equipamento.', 'error');
    } finally {
      setEquipmentLoading(false);
    }
  };

  const handleDeleteEquipment = async (id: number) => {
    setEquipmentLoading(true);
    try {
      await dailyReportsApi.deleteEquipment(id);
      setSelectedReport((prev) =>
        prev
          ? { ...prev, equipment: (prev.equipment || []).filter((e) => e.id !== id) }
          : prev,
      );
      showToast('Equipamento removido.');
    } catch (err) {
      console.error('Failed to delete equipment:', err);
      showToast('Erro ao remover equipamento.', 'error');
    } finally {
      setEquipmentLoading(false);
      setDeleteEquipmentId(null);
    }
  };

  const startEditEquipment = (entry: DailyReportEquipment) => {
    setEditingEquipment(entry);
    setEquipmentForm({
      equipment_type: entry.equipment_type,
      description: entry.description || '',
      quantity: String(entry.quantity),
      operating_hours: entry.operating_hours != null ? String(entry.operating_hours) : '',
      idle_hours: entry.idle_hours != null ? String(entry.idle_hours) : '',
    });
  };

  // ------------------------------------------------------------------
  // Render: Header tab
  // ------------------------------------------------------------------
  const renderHeaderTab = () => {
    if (!selectedReport) return null;
    const editable = selectedReport.status === 'rascunho';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Approval / workflow actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
          {editable && !editingHeader && (
            <button className="btn btn-secondary" onClick={startEditHeader}>
              <Edit size={16} /> Editar
            </button>
          )}
          {editingHeader && (
            <>
              <button className="btn btn-secondary" onClick={() => setEditingHeader(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={saveHeader} disabled={headerSaving}>
                {headerSaving ? <span className="spinner" /> : 'Salvar'}
              </button>
            </>
          )}
          <ApprovalActions
            status={selectedReport.status}
            onFinalize={handleFinalize}
            onApprove={handleApprove}
            onReject={() => setShowRejectModal(true)}
            loading={approvalLoading}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {renderInfoField('Data', selectedReport.report_date)}
          {renderInfoField('Turno', editingHeader
            ? undefined
            : (selectedReport.shift || '-'),
            editable && editingHeader
              ? <select className="select-field" value={headerForm.shift || ''} onChange={(e) => setHeaderForm((p) => ({ ...p, shift: e.target.value }))}>
                  <option value="">Selecione</option>
                  {SHIFT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              : undefined,
          )}
          {renderInfoField('Clima', editable && editingHeader
            ? undefined
            : (selectedReport.weather || '-'),
            editable && editingHeader
              ? <select className="select-field" value={headerForm.weather || ''} onChange={(e) => setHeaderForm((p) => ({ ...p, weather: e.target.value }))}>
                  <option value="">Selecione</option>
                  {WEATHER_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              : undefined,
          )}
          {renderInfoField('Temp. Min (°C)', editable && editingHeader
            ? undefined
            : (selectedReport.temperature_min != null ? String(selectedReport.temperature_min) : '-'),
            editable && editingHeader
              ? <input type="number" className="input-field" value={headerForm.temperature_min || ''} onChange={(e) => setHeaderForm((p) => ({ ...p, temperature_min: e.target.value }))} />
              : undefined,
          )}
          {renderInfoField('Temp. Max (°C)', editable && editingHeader
            ? undefined
            : (selectedReport.temperature_max != null ? String(selectedReport.temperature_max) : '-'),
            editable && editingHeader
              ? <input type="number" className="input-field" value={headerForm.temperature_max || ''} onChange={(e) => setHeaderForm((p) => ({ ...p, temperature_max: e.target.value }))} />
              : undefined,
          )}
          {renderInfoField('Criado por', selectedReport.creator_name || String(selectedReport.created_by))}
          {renderInfoField('Status', undefined, <StatusBadge status={selectedReport.status} colorMap={STATUS_COLOR_MAP} />)}
        </div>

        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Observações
          </div>
          {editable && editingHeader ? (
            <textarea
              className="input-field"
              rows={4}
              value={headerForm.observations || ''}
              onChange={(e) => setHeaderForm((p) => ({ ...p, observations: e.target.value }))}
            />
          ) : (
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-primary-text)', whiteSpace: 'pre-wrap', minHeight: '60px' }}>
              {selectedReport.observations || '-'}
            </p>
          )}
        </div>

        {selectedReport.rejection_reason && (
          <div style={{ padding: '12px 16px', background: '#fee2e2', borderRadius: '8px', borderLeft: '4px solid #b91c1c' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#b91c1c', marginBottom: '4px' }}>Motivo da Rejeição</div>
            <p style={{ fontSize: '14px', color: '#7f1d1d' }}>{selectedReport.rejection_reason}</p>
          </div>
        )}
      </div>
    );
  };

  const renderInfoField = (label: string, value?: string, customContent?: React.ReactNode) => (
    <div key={label}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
        {label}
      </div>
      {customContent ?? (
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-primary-text)' }}>
          {value || '-'}
        </div>
      )}
    </div>
  );

  // ------------------------------------------------------------------
  // Render: Workforce tab
  // ------------------------------------------------------------------
  const renderWorkforceTab = () => {
    if (!selectedReport) return null;
    const entries = selectedReport.workforce || [];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Add / Edit form */}
        <div className="card" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            {editingWorkforce ? 'Editar registro' : 'Adicionar mão de obra'}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            <div className="input-group">
              <label>Categoria *</label>
              <input className="input-field" value={workforceForm.category} onChange={(e) => setWorkforceForm((p) => ({ ...p, category: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Planejado</label>
              <input type="number" className="input-field" value={workforceForm.planned_count} onChange={(e) => setWorkforceForm((p) => ({ ...p, planned_count: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Presentes</label>
              <input type="number" className="input-field" value={workforceForm.present_count} onChange={(e) => setWorkforceForm((p) => ({ ...p, present_count: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Ausentes</label>
              <input type="number" className="input-field" value={workforceForm.absent_count} onChange={(e) => setWorkforceForm((p) => ({ ...p, absent_count: e.target.value }))} />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Observação</label>
              <input className="input-field" value={workforceForm.observation} onChange={(e) => setWorkforceForm((p) => ({ ...p, observation: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
            {editingWorkforce && (
              <button className="btn btn-secondary" onClick={() => { setEditingWorkforce(null); setWorkforceForm(EMPTY_WORKFORCE_FORM); }}>
                Cancelar
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={editingWorkforce ? handleSaveWorkforce : handleAddWorkforce}
              disabled={workforceLoading || !workforceForm.category.trim()}
            >
              {workforceLoading ? <span className="spinner" /> : (editingWorkforce ? 'Salvar' : <><Plus size={16} /> Adicionar</>)}
            </button>
          </div>
        </div>

        {entries.length === 0 ? (
          <EmptyState message="Nenhum registro de mão de obra." />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th style={{ textAlign: 'center' }}>Planejado</th>
                  <th style={{ textAlign: 'center' }}>Presentes</th>
                  <th style={{ textAlign: 'center' }}>Ausentes</th>
                  <th>Observação</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ fontWeight: 500 }}>{entry.category}</td>
                    <td style={{ textAlign: 'center' }}>{entry.planned_count}</td>
                    <td style={{ textAlign: 'center' }}>{entry.present_count}</td>
                    <td style={{ textAlign: 'center' }}>{entry.absent_count}</td>
                    <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>{entry.observation || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-icon" title="Editar" onClick={() => startEditWorkforce(entry)}>
                          <Edit size={15} color="var(--color-secondary-text)" />
                        </button>
                        <button className="btn btn-icon" title="Remover" onClick={() => setDeleteWorkforceId(entry.id)}>
                          <Trash2 size={15} color="var(--color-error)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ------------------------------------------------------------------
  // Render: Activities tab
  // ------------------------------------------------------------------
  const renderActivitiesTab = () => {
    if (!selectedReport) return null;
    const entries = selectedReport.activities || [];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            {editingActivity ? 'Editar atividade' : 'Adicionar atividade'}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            <div className="input-group">
              <label>Backlog</label>
              <input className="input-field" value={activityForm.backlog_name} onChange={(e) => setActivityForm((p) => ({ ...p, backlog_name: e.target.value }))} />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Descrição *</label>
              <input className="input-field" value={activityForm.description} onChange={(e) => setActivityForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Quantidade</label>
              <input type="number" className="input-field" value={activityForm.quantity} onChange={(e) => setActivityForm((p) => ({ ...p, quantity: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Unidade</label>
              <input className="input-field" value={activityForm.unit} onChange={(e) => setActivityForm((p) => ({ ...p, unit: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Equipe</label>
              <input className="input-field" value={activityForm.team} onChange={(e) => setActivityForm((p) => ({ ...p, team: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
            {editingActivity && (
              <button className="btn btn-secondary" onClick={() => { setEditingActivity(null); setActivityForm(EMPTY_ACTIVITY_FORM); }}>
                Cancelar
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={editingActivity ? handleSaveActivity : handleAddActivity}
              disabled={activityLoading || !activityForm.description.trim()}
            >
              {activityLoading ? <span className="spinner" /> : (editingActivity ? 'Salvar' : <><Plus size={16} /> Adicionar</>)}
            </button>
          </div>
        </div>

        {entries.length === 0 ? (
          <EmptyState message="Nenhuma atividade registrada." />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Backlog</th>
                  <th>Descrição</th>
                  <th>Qtd</th>
                  <th>Unidade</th>
                  <th>Equipe</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>{entry.backlog_name || '-'}</td>
                    <td style={{ fontWeight: 500 }}>{entry.description}</td>
                    <td>{entry.quantity ?? '-'}</td>
                    <td>{entry.unit || '-'}</td>
                    <td>{entry.team || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-icon" title="Editar" onClick={() => startEditActivity(entry)}>
                          <Edit size={15} color="var(--color-secondary-text)" />
                        </button>
                        <button className="btn btn-icon" title="Remover" onClick={() => setDeleteActivityId(entry.id)}>
                          <Trash2 size={15} color="var(--color-error)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ------------------------------------------------------------------
  // Render: Occurrences tab
  // ------------------------------------------------------------------
  const renderOccurrencesTab = () => {
    if (!selectedReport) return null;
    const entries = selectedReport.occurrences || [];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            {editingOccurrence ? 'Editar ocorrência' : 'Adicionar ocorrência'}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            <div className="input-group">
              <label>Tipo *</label>
              <input className="input-field" value={occurrenceForm.occurrence_type} onChange={(e) => setOccurrenceForm((p) => ({ ...p, occurrence_type: e.target.value }))} />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Descrição *</label>
              <input className="input-field" value={occurrenceForm.description} onChange={(e) => setOccurrenceForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Início</label>
              <input type="time" className="input-field" value={occurrenceForm.start_time} onChange={(e) => setOccurrenceForm((p) => ({ ...p, start_time: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Fim</label>
              <input type="time" className="input-field" value={occurrenceForm.end_time} onChange={(e) => setOccurrenceForm((p) => ({ ...p, end_time: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Impacto</label>
              <input className="input-field" value={occurrenceForm.impact} onChange={(e) => setOccurrenceForm((p) => ({ ...p, impact: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
            {editingOccurrence && (
              <button className="btn btn-secondary" onClick={() => { setEditingOccurrence(null); setOccurrenceForm(EMPTY_OCCURRENCE_FORM); }}>
                Cancelar
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={editingOccurrence ? handleSaveOccurrence : handleAddOccurrence}
              disabled={occurrenceLoading || !occurrenceForm.description.trim() || !occurrenceForm.occurrence_type.trim()}
            >
              {occurrenceLoading ? <span className="spinner" /> : (editingOccurrence ? 'Salvar' : <><Plus size={16} /> Adicionar</>)}
            </button>
          </div>
        </div>

        {entries.length === 0 ? (
          <EmptyState message="Nenhuma ocorrência registrada." />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Impacto</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className="badge">{entry.occurrence_type}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{entry.description}</td>
                    <td>{entry.start_time || '-'}</td>
                    <td>{entry.end_time || '-'}</td>
                    <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>{entry.impact || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-icon" title="Editar" onClick={() => startEditOccurrence(entry)}>
                          <Edit size={15} color="var(--color-secondary-text)" />
                        </button>
                        <button className="btn btn-icon" title="Remover" onClick={() => setDeleteOccurrenceId(entry.id)}>
                          <Trash2 size={15} color="var(--color-error)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ------------------------------------------------------------------
  // Render: Equipment tab
  // ------------------------------------------------------------------
  const renderEquipmentTab = () => {
    if (!selectedReport) return null;
    const entries = selectedReport.equipment || [];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            {editingEquipment ? 'Editar equipamento' : 'Adicionar equipamento'}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            <div className="input-group">
              <label>Tipo *</label>
              <input className="input-field" value={equipmentForm.equipment_type} onChange={(e) => setEquipmentForm((p) => ({ ...p, equipment_type: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Descrição</label>
              <input className="input-field" value={equipmentForm.description} onChange={(e) => setEquipmentForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Quantidade</label>
              <input type="number" className="input-field" value={equipmentForm.quantity} onChange={(e) => setEquipmentForm((p) => ({ ...p, quantity: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Hs operando</label>
              <input type="number" className="input-field" value={equipmentForm.operating_hours} onChange={(e) => setEquipmentForm((p) => ({ ...p, operating_hours: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Hs parado</label>
              <input type="number" className="input-field" value={equipmentForm.idle_hours} onChange={(e) => setEquipmentForm((p) => ({ ...p, idle_hours: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
            {editingEquipment && (
              <button className="btn btn-secondary" onClick={() => { setEditingEquipment(null); setEquipmentForm(EMPTY_EQUIPMENT_FORM); }}>
                Cancelar
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={editingEquipment ? handleSaveEquipment : handleAddEquipment}
              disabled={equipmentLoading || !equipmentForm.equipment_type.trim()}
            >
              {equipmentLoading ? <span className="spinner" /> : (editingEquipment ? 'Salvar' : <><Plus size={16} /> Adicionar</>)}
            </button>
          </div>
        </div>

        {entries.length === 0 ? (
          <EmptyState message="Nenhum equipamento registrado." />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th style={{ textAlign: 'center' }}>Qtd</th>
                  <th style={{ textAlign: 'center' }}>Hs Oper.</th>
                  <th style={{ textAlign: 'center' }}>Hs Parado</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ fontWeight: 500 }}>{entry.equipment_type}</td>
                    <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>{entry.description || '-'}</td>
                    <td style={{ textAlign: 'center' }}>{entry.quantity}</td>
                    <td style={{ textAlign: 'center' }}>{entry.operating_hours ?? '-'}</td>
                    <td style={{ textAlign: 'center' }}>{entry.idle_hours ?? '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-icon" title="Editar" onClick={() => startEditEquipment(entry)}>
                          <Edit size={15} color="var(--color-secondary-text)" />
                        </button>
                        <button className="btn btn-icon" title="Remover" onClick={() => setDeleteEquipmentId(entry.id)}>
                          <Trash2 size={15} color="var(--color-error)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ------------------------------------------------------------------
  // JSX
  // ------------------------------------------------------------------

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            padding: '12px 20px',
            borderRadius: '8px',
            background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {toast.message}
        </div>
      )}

      <PageHeader
        title="Relatórios Diários de Obra"
        subtitle="Registro e acompanhamento dos RDOs com mão de obra, atividades, ocorrências e equipamentos"
        actions={
          <button className="btn btn-primary" onClick={() => { setCreateForm(EMPTY_RDO_FORM); setCreateError(''); setShowCreateModal(true); }}>
            <Plus size={18} /> Novo RDO
          </button>
        }
      />
      <ProjectFilterDropdown />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="input-group" style={{ margin: 0, flex: '0 0 180px' }}>
          <label style={{ fontSize: '12px' }}>Data inicial</label>
          <input
            type="date"
            className="input-field"
            value={filterInitialDate}
            onChange={(e) => { setFilterInitialDate(e.target.value); setPage(1); }}
          />
        </div>
        <div className="input-group" style={{ margin: 0, flex: '0 0 180px' }}>
          <label style={{ fontSize: '12px' }}>Data final</label>
          <input
            type="date"
            className="input-field"
            value={filterFinalDate}
            onChange={(e) => { setFilterFinalDate(e.target.value); setPage(1); }}
          />
        </div>
        <div className="input-group" style={{ margin: 0, flex: '0 0 160px' }}>
          <label style={{ fontSize: '12px' }}>Status</label>
          <select
            className="select-field"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="">Todos</option>
            <option value="rascunho">Rascunho</option>
            <option value="finalizado">Finalizado</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
          </select>
        </div>
        {(filterInitialDate || filterFinalDate || filterStatus) && (
          <button
            className="btn btn-secondary"
            style={{ alignSelf: 'flex-end' }}
            onClick={() => { setFilterInitialDate(''); setFilterFinalDate(''); setFilterStatus(''); setPage(1); }}
          >
            <X size={16} /> Limpar
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : reports.length === 0 ? (
        <EmptyState
          message="Nenhum RDO encontrado."
          action={
            <button className="btn btn-primary" onClick={() => { setCreateForm(EMPTY_RDO_FORM); setCreateError(''); setShowCreateModal(true); }}>
              <Plus size={18} /> Criar RDO
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Turno</th>
                <th>Clima</th>
                <th>Status</th>
                <th>Criado por</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {reports.map((report) => (
                <motion.tr
                  variants={tableRowVariants}
                  key={report.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => openDetail(report)}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="var(--color-primary)" />
                      <span style={{ fontWeight: 500 }}>{report.report_date}</span>
                    </div>
                  </td>
                  <td>{report.shift || '-'}</td>
                  <td>{report.weather || '-'}</td>
                  <td>
                    <StatusBadge status={report.status} colorMap={STATUS_COLOR_MAP} />
                  </td>
                  <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                    {report.creator_name || String(report.created_by)}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-icon"
                        title="Ver detalhes"
                        onClick={(e) => { e.stopPropagation(); openDetail(report); }}
                      >
                        {selectedReport?.id === report.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        className="btn btn-icon"
                        title="Excluir"
                        onClick={(e) => { e.stopPropagation(); setDeleteReportId(report.id); }}
                      >
                        <Trash2 size={16} color="var(--color-error)" />
                      </button>
                    </div>
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
            onPageChange={setPage}
            onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }}
          />
        </div>
      )}

      {/* Detail Modal */}
      {(selectedReport || detailLoading) && (
        <div className="modal-backdrop" onClick={closeDetail}>
          <div
            className="modal-content"
            style={{ padding: '0', width: '900px', maxWidth: '96vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                  RDO — {selectedReport?.report_date || '...'}
                </h3>
                {selectedReport?.project_name && (
                  <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', margin: '2px 0 0' }}>
                    {selectedReport.project_name}
                  </p>
                )}
              </div>
              <button className="btn btn-icon" onClick={closeDetail} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div style={{ borderBottom: '2px solid var(--color-alternate)', display: 'flex', overflowX: 'auto', padding: '0 24px', flexShrink: 0 }}>
                  <button style={tabStyle(activeTab === 'header')} onClick={() => setActiveTab('header')}>
                    <FileText size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Cabeçalho
                  </button>
                  <button style={tabStyle(activeTab === 'workforce')} onClick={() => setActiveTab('workforce')}>
                    <Users size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Mão de Obra
                  </button>
                  <button style={tabStyle(activeTab === 'activities')} onClick={() => setActiveTab('activities')}>
                    <Activity size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Atividades
                  </button>
                  <button style={tabStyle(activeTab === 'occurrences')} onClick={() => setActiveTab('occurrences')}>
                    <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Ocorrências
                  </button>
                  <button style={tabStyle(activeTab === 'equipment')} onClick={() => setActiveTab('equipment')}>
                    <Wrench size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Equipamentos
                  </button>
                </div>

                {/* Tab content */}
                <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
                  {activeTab === 'header' && renderHeaderTab()}
                  {activeTab === 'workforce' && renderWorkforceTab()}
                  {activeTab === 'activities' && renderActivitiesTab()}
                  {activeTab === 'occurrences' && renderOccurrencesTab()}
                  {activeTab === 'equipment' && renderEquipmentTab()}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create RDO Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ padding: '24px', width: '520px', maxWidth: '95vw' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Novo RDO</h3>
              <button className="btn btn-icon" onClick={() => setShowCreateModal(false)} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {!projectsInfo && (
                <div className="input-group">
                  <label>Projeto *</label>
                  <select
                    className="select-field"
                    value={createForm.projects_id}
                    onChange={(e) => setCreateForm((p) => ({ ...p, projects_id: e.target.value ? Number(e.target.value) : '' }))}
                  >
                    <option value="">Selecione um projeto</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>{proj.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="input-group">
                <label>Data do relatório *</label>
                <input
                  type="date"
                  className="input-field"
                  value={createForm.report_date}
                  onChange={(e) => setCreateForm((p) => ({ ...p, report_date: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Turno</label>
                  <select
                    className="select-field"
                    value={createForm.shift}
                    onChange={(e) => setCreateForm((p) => ({ ...p, shift: e.target.value }))}
                  >
                    <option value="">Selecione</option>
                    {SHIFT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Clima</label>
                  <select
                    className="select-field"
                    value={createForm.weather}
                    onChange={(e) => setCreateForm((p) => ({ ...p, weather: e.target.value }))}
                  >
                    <option value="">Selecione</option>
                    {WEATHER_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Temp. Mín (°C)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={createForm.temperature_min}
                    onChange={(e) => setCreateForm((p) => ({ ...p, temperature_min: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label>Temp. Máx (°C)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={createForm.temperature_max}
                    onChange={(e) => setCreateForm((p) => ({ ...p, temperature_max: e.target.value }))}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Observações</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={createForm.observations}
                  onChange={(e) => setCreateForm((p) => ({ ...p, observations: e.target.value }))}
                />
              </div>

              {createError && (
                <p style={{ color: 'var(--color-error)', fontSize: '13px' }}>{createError}</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={createLoading || !createForm.report_date || (!projectsInfo && !createForm.projects_id)}
              >
                {createLoading ? <span className="spinner" /> : 'Criar RDO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-backdrop" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" style={{ padding: '24px', width: '440px', maxWidth: '95vw' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '12px' }}>Rejeitar RDO</h3>
            <div className="input-group">
              <label>Motivo da rejeição</label>
              <textarea
                className="input-field"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Descreva o motivo da rejeição..."
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={approvalLoading}
              >
                {approvalLoading ? <span className="spinner" /> : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modals */}
      {deleteReportId !== null && (
        <ConfirmModal
          title="Excluir RDO"
          message="Tem certeza que deseja excluir este RDO? Esta ação não pode ser desfeita."
          onConfirm={async () => {
            try {
              await dailyReportsApi.updateDailyReport(deleteReportId, { _delete: true });
            } catch {
              // endpoint may not have delete — ignore and refresh
            }
            setDeleteReportId(null);
            loadReports();
          }}
          onCancel={() => setDeleteReportId(null)}
        />
      )}
      {deleteWorkforceId !== null && (
        <ConfirmModal
          title="Remover registro"
          message="Remover este registro de mão de obra?"
          onConfirm={() => handleDeleteWorkforce(deleteWorkforceId)}
          onCancel={() => setDeleteWorkforceId(null)}
        />
      )}
      {deleteActivityId !== null && (
        <ConfirmModal
          title="Remover atividade"
          message="Remover esta atividade do RDO?"
          onConfirm={() => handleDeleteActivity(deleteActivityId)}
          onCancel={() => setDeleteActivityId(null)}
        />
      )}
      {deleteOccurrenceId !== null && (
        <ConfirmModal
          title="Remover ocorrência"
          message="Remover esta ocorrência do RDO?"
          onConfirm={() => handleDeleteOccurrence(deleteOccurrenceId)}
          onCancel={() => setDeleteOccurrenceId(null)}
        />
      )}
      {deleteEquipmentId !== null && (
        <ConfirmModal
          title="Remover equipamento"
          message="Remover este equipamento do RDO?"
          onConfirm={() => handleDeleteEquipment(deleteEquipmentId)}
          onCancel={() => setDeleteEquipmentId(null)}
        />
      )}
    </div>
  );
}

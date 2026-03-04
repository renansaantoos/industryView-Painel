import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { useAppState } from '../../contexts/AppStateContext';
import { sprintsApi, projectsApi } from '../../services';
import type {
  SprintTask,
  SprintPanelResponse,
  Sprint,
  Team,
  ProjectBacklog,
} from '../../types';
import type { NonExecutionReason } from '../../types/task';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Play,
  XCircle,
  Shield,
  MapPin,
  ClipboardList,
  AlertTriangle,
  Users,
  Calendar,
  Info,
  ChevronRight,
  ChevronDown,
  Search,
  Square,
  CheckSquare,
} from 'lucide-react';
import { formatPercentage } from '../../utils/formatters';
import SearchableSelect from '../../components/common/SearchableSelect';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

// ─── Status ID constants ───────────────────────────────────────────────────────
const STATUS_IN_PROGRESS = 2;
const STATUS_DONE = 3;
const STATUS_FAILED = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Access backlog from task (handles both camelCase and snake_case from API) */
function getBacklog(task: SprintTask) {
  return task.projectsBacklogs || (task as any).projects_backlogs;
}

/** Access tasks_template from backlog */
function getTemplate(backlog: any) {
  return backlog?.tasksTemplate || backlog?.tasks_template;
}

/** Access subtasks from task */
function getSubtask(task: SprintTask) {
  return task.subtasks || (task as any).subtasks;
}

function getTaskDisplayName(task: SprintTask): string {
  const bl = getBacklog(task);
  const tpl = getTemplate(bl);
  return (
    tpl?.description ||
    bl?.description ||
    task.taskName ||
    `Task #${task.id}`
  );
}

function formatDateShort(dateString?: string): string {
  if (!dateString) return '—';
  try {
    // For date-only strings (YYYY-MM-DD) or ISO with midnight UTC,
    // extract the date parts directly to avoid timezone shift
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    }
    return format(parseISO(dateString), 'dd/MM/yyyy');
  } catch {
    return dateString;
  }
}

function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
  } catch {
    return dateString;
  }
}

function getCriticalityStyle(criticality?: string): React.CSSProperties {
  switch (criticality?.toLowerCase()) {
    case 'baixa':
      return { backgroundColor: 'rgba(34,197,94,0.15)', color: '#16a34a' };
    case 'media':
      return { backgroundColor: 'rgba(234,179,8,0.15)', color: '#ca8a04' };
    case 'alta':
      return { backgroundColor: 'rgba(249,115,22,0.15)', color: '#ea580c' };
    case 'critica':
      return { backgroundColor: 'rgba(239,68,68,0.15)', color: '#dc2626' };
    default:
      return { backgroundColor: 'var(--color-alternate)', color: 'var(--color-secondary-text)' };
  }
}

function getCriticalityLabel(criticality: string | undefined, t: (key: string) => string): string {
  switch (criticality?.toLowerCase()) {
    case 'baixa': return t('sprints.criticalityLow');
    case 'media': return t('sprints.criticalityMedium');
    case 'alta': return t('sprints.criticalityHigh');
    case 'critica': return t('sprints.criticalityCritical');
    default: return criticality || '—';
  }
}

/** Compute task schedule status badge info */
function getTaskScheduleStatus(
  taskStatus: number | undefined,
  scheduledFor: string | undefined,
  t: (key: string) => string,
): { label: string; color: string; bgColor: string } | null {
  // Concluído (status 3) or Sem Sucesso (status 4) override schedule status
  if (taskStatus === STATUS_DONE) {
    return { label: t('sprints.completedStatus'), color: '#16a34a', bgColor: 'rgba(34,197,94,0.15)' };
  }
  if (taskStatus === STATUS_FAILED) {
    return { label: t('sprints.unsuccessfulStatus'), color: '#dc2626', bgColor: 'rgba(239,68,68,0.15)' };
  }
  // For pending / in-progress: show only if there's a scheduled date
  if (!scheduledFor) return null;
  try {
    const scheduled = parseISO(scheduledFor);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    scheduled.setHours(0, 0, 0, 0);
    if (scheduled >= today) {
      return { label: t('sprints.onTime'), color: '#16a34a', bgColor: 'rgba(34,197,94,0.15)' };
    }
    return { label: t('sprints.late'), color: '#dc2626', bgColor: 'rgba(239,68,68,0.15)' };
  } catch {
    return null;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubtaskRow {
  id: number;
  description?: string;
  quantity?: number;
  quantity_done?: number;
  unity?: { unity: string } | null;
  weight?: number;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CurrentSprint() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projectsInfo } = useAppState();

  const sprintId = parseInt(searchParams.get('sprintId') || '0', 10);

  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Sprint meta
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [chartData, setChartData] = useState<{ date: string; ideal: number; actual: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // 5 kanban categories
  const [pendentes, setPendentes] = useState<SprintTask[]>([]);
  const [emAndamento, setEmAndamento] = useState<SprintTask[]>([]);
  const [concluidas, setConcluidas] = useState<SprintTask[]>([]);
  const [semSucesso, setSemSucesso] = useState<SprintTask[]>([]);
  const [inspecao, setInspecao] = useState<SprintTask[]>([]);

  // Support data
  const [teams, setTeams] = useState<Team[]>([]);
  const [backlogs, setBacklogs] = useState<ProjectBacklog[]>([]);
  const [nonExecReasons, setNonExecReasons] = useState<NonExecutionReason[]>([]);

  // Modal: delete
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Modal: add task (tree + multi-select)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [addTaskSelectedBacklogId, setAddTaskSelectedBacklogId] = useState<number | null>(null);
  const [addTaskSubtasks, setAddTaskSubtasks] = useState<SubtaskRow[]>([]);
  const [addTaskSelectedSubs, setAddTaskSelectedSubs] = useState<Map<number, number>>(new Map());
  const [addTaskTeamId, setAddTaskTeamId] = useState<number | ''>('');
  const [addTaskScheduledFor, setAddTaskScheduledFor] = useState('');
  const [addTaskLoading, setAddTaskLoading] = useState(false);
  const [addTaskError, setAddTaskError] = useState('');
  const [addTaskTreeSearch, setAddTaskTreeSearch] = useState('');
  const [addTaskCollapsedIds, setAddTaskCollapsedIds] = useState<Set<number>>(new Set());
  const [addTaskSubtasksLoading, setAddTaskSubtasksLoading] = useState(false);

  // Modal: complete task with quantity
  const [completeTask, setCompleteTask] = useState<SprintTask | null>(null);
  const [completeQuantity, setCompleteQuantity] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);

  // Modal: task details
  const [detailTask, setDetailTask] = useState<SprintTask | null>(null);

  // Modal: failure reason
  const [failureTask, setFailureTask] = useState<SprintTask | null>(null);
  const [failureReasonId, setFailureReasonId] = useState<number | ''>('');
  const [failureObservation, setFailureObservation] = useState('');
  const [failureLoading, setFailureLoading] = useState(false);
  const [failureError, setFailureError] = useState('');

  // Modal: assign team before starting
  const [assignTeamTask, setAssignTeamTask] = useState<SprintTask | null>(null);
  const [assignTeamId, setAssignTeamId] = useState<number | ''>('');
  const [assignTeamLoading, setAssignTeamLoading] = useState(false);

  // Bulk selection for pending tasks
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStartLoading, setBulkStartLoading] = useState(false);
  const [showBulkTeamModal, setShowBulkTeamModal] = useState(false);
  const [bulkAssignTeamId, setBulkAssignTeamId] = useState<number | ''>('');
  const [bulkTasksNeedingTeam, setBulkTasksNeedingTeam] = useState<SprintTask[]>([]);

  // Transition loading per task
  const [transitionLoading, setTransitionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!projectsInfo || !sprintId) {
      navigate('/sprints');
      return;
    }
    loadSprintData();
    loadSupportData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprintId, projectsInfo]);

  const loadSprintData = useCallback(async () => {
    if (!sprintId || !projectsInfo) return;
    setLoading(true);
    try {
      const [sprintData, panel, burndownData] = await Promise.all([
        sprintsApi.getSprint(sprintId),
        sprintsApi.queryAllSprintTasks({
          projects_id: projectsInfo.id,
          sprints_id: sprintId,
        }),
        sprintsApi.getSprintChartData({ sprints_id: sprintId }).catch(() => []),
      ]);

      setSprint(sprintData);
      populateCategories(panel as SprintPanelResponse);
      setBulkSelectedIds(new Set());

      if (Array.isArray(burndownData)) {
        setChartData(burndownData as { date: string; ideal: number; actual: number }[]);
      }
    } catch (err) {
      console.error('Failed to load sprint data:', err);
    } finally {
      setLoading(false);
    }
  }, [sprintId, projectsInfo]);

  const populateCategories = (panel: SprintPanelResponse) => {
    setPendentes(panel.sprints_tasks_pendentes?.items ?? []);
    setEmAndamento(panel.sprints_tasks_em_andamento?.items ?? []);
    setConcluidas(panel.sprints_tasks_concluidas?.items ?? []);
    setSemSucesso(panel.sprints_tasks_sem_sucesso?.items ?? []);
    setInspecao(panel.sprints_tasks_inspecao?.items ?? []);
  };

  const loadSupportData = useCallback(async () => {
    if (!projectsInfo) return;
    try {
      const [teamsRes, backlogsRes] = await Promise.all([
        projectsApi.queryAllTeams({ projects_id: projectsInfo.id }),
        projectsApi.getAllProjectBacklogs(projectsInfo.id),
      ]);
      // Response is a plain array (controller returns result.items directly)
      setTeams(Array.isArray(teamsRes) ? teamsRes : (teamsRes as any)?.items ?? []);
      // Response may be a paginated object { items: [...] } or a plain array
      const rawBacklogs: any[] = Array.isArray(backlogsRes)
        ? backlogsRes
        : (backlogsRes as any)?.items ?? [];
      // Map snake_case fields to camelCase expected by ProjectBacklog type
      const mapped: ProjectBacklog[] = rawBacklogs.map((b: any) => ({
        id: Number(b.id),
        name: b.description || '',
        description: b.description || '',
        projectsId: Number(b.projects_id),
        taskName: b.tasks_template?.description || b.description || '',
        checked: b.checked ?? false,
        status: b.projects_backlogs_statuses?.status || 'Pendente',
        quantity: b.quantity != null ? Number(b.quantity) : undefined,
        unityName: b.unity?.unity || b.tasks_template?.unity?.unity || '',
        disciplineName: b.discipline?.discipline || b.tasks_template?.discipline?.discipline || '',
        tasksId: b.tasks_template_id ? Number(b.tasks_template_id) : undefined,
        unityId: b.unity_id ? Number(b.unity_id) : undefined,
        disciplineId: b.discipline_id ? Number(b.discipline_id) : undefined,
        weight: b.weight != null ? Number(b.weight) : undefined,
        sprintAdded: b.sprint_added ?? false,
        percentComplete: b.percent_complete != null ? Number(b.percent_complete) : undefined,
        wbsCode: b.wbs_code || undefined,
        sortOrder: b.sort_order != null ? Number(b.sort_order) : undefined,
        level: b.level != null ? Number(b.level) : undefined,
        projects_backlogs_id: b.projects_backlogs_id ? Number(b.projects_backlogs_id) : null,
      }));
      setBacklogs(mapped);
    } catch (err) {
      console.error('Failed to load support data:', err);
    }
  }, [projectsInfo]);

  // ── Add-task tree helpers ────────────────────────────────────────────────────

  const addTaskHasChildren = useMemo(() => {
    const set = new Set<number>();
    backlogs.forEach(b => {
      if (b.projects_backlogs_id) set.add(b.projects_backlogs_id);
    });
    return set;
  }, [backlogs]);

  const addTaskVisibleBacklogs = useMemo(() => {
    const idSet = new Set(backlogs.map(b => b.id));
    const getAncestors = (b: ProjectBacklog): number[] => {
      const ancestors: number[] = [];
      let parentId = b.projects_backlogs_id;
      while (parentId != null && idSet.has(parentId)) {
        ancestors.push(parentId);
        const parent = backlogs.find(p => p.id === parentId);
        parentId = parent?.projects_backlogs_id ?? null;
      }
      return ancestors;
    };

    if (addTaskTreeSearch) {
      const term = addTaskTreeSearch.toLowerCase();
      const matchingIds = new Set<number>();
      backlogs.forEach(b => {
        if (
          (b.taskName || b.name || '').toLowerCase().includes(term) ||
          (b.wbsCode || '').toLowerCase().includes(term)
        ) {
          matchingIds.add(b.id);
          getAncestors(b).forEach(aid => matchingIds.add(aid));
        }
      });
      return backlogs.filter(b => matchingIds.has(b.id));
    }

    return backlogs.filter(b => {
      const ancestors = getAncestors(b);
      return !ancestors.some(aid => addTaskCollapsedIds.has(aid));
    });
  }, [backlogs, addTaskCollapsedIds, addTaskTreeSearch]);

  const addTaskBreadcrumb = useMemo(() => {
    if (!addTaskSelectedBacklogId) return [];
    const path: ProjectBacklog[] = [];
    let current = backlogs.find(b => b.id === addTaskSelectedBacklogId);
    while (current) {
      path.unshift(current);
      if (current.projects_backlogs_id) {
        current = backlogs.find(b => b.id === current!.projects_backlogs_id);
      } else {
        break;
      }
    }
    return path;
  }, [addTaskSelectedBacklogId, backlogs]);

  // ── Bulk selection helpers ────────────────────────────────────────────────────

  const taskHasTeam = (task: SprintTask) =>
    !!(task.teamsId || (task as any).teams_id || task.teams);

  const toggleBulkSelect = (taskId: number) => {
    setBulkSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const toggleBulkSelectAll = () => {
    setBulkSelectedIds(prev => {
      if (prev.size === pendentes.length && pendentes.length > 0) return new Set();
      return new Set(pendentes.map(t => t.id));
    });
  };

  const bulkSelectedCount = bulkSelectedIds.size;

  const executeBulkStart = async (tasks: SprintTask[]) => {
    setBulkStartLoading(true);
    try {
      await Promise.all(
        tasks.map(t =>
          sprintsApi.editStatusTask(t.id, { sprints_tasks_statuses_id: STATUS_IN_PROGRESS })
        )
      );
      setBulkSelectedIds(new Set());
      await loadSprintData();
    } catch (err) {
      console.error('Failed to bulk start tasks:', err);
    } finally {
      setBulkStartLoading(false);
    }
  };

  const handleBulkStart = () => {
    const selected = pendentes.filter(t => bulkSelectedIds.has(t.id));
    if (selected.length === 0) return;
    const needTeam = selected.filter(t => !taskHasTeam(t));
    if (needTeam.length > 0) {
      setBulkTasksNeedingTeam(needTeam);
      setBulkAssignTeamId('');
      setShowBulkTeamModal(true);
    } else {
      executeBulkStart(selected);
    }
  };

  const handleBulkAssignAndStart = async () => {
    if (!bulkAssignTeamId) return;
    setBulkStartLoading(true);
    try {
      // Assign team to tasks that need it
      await Promise.all(
        bulkTasksNeedingTeam.map(t =>
          sprintsApi.editSprintTask(t.id, { teams_id: Number(bulkAssignTeamId) })
        )
      );
      // Start all selected tasks
      const allSelected = pendentes.filter(t => bulkSelectedIds.has(t.id));
      await Promise.all(
        allSelected.map(t =>
          sprintsApi.editStatusTask(t.id, { sprints_tasks_statuses_id: STATUS_IN_PROGRESS })
        )
      );
      setShowBulkTeamModal(false);
      setBulkSelectedIds(new Set());
      await loadSprintData();
    } catch (err) {
      console.error('Failed to bulk assign and start tasks:', err);
    } finally {
      setBulkStartLoading(false);
    }
  };

  // ── Task transitions ─────────────────────────────────────────────────────────

  const handleMoveToInProgress = async (task: SprintTask) => {
    // Validate: task must have a team assigned
    if (!task.teamsId && !(task as any).teams_id && !task.teams) {
      setAssignTeamTask(task);
      setAssignTeamId('');
      return;
    }
    setTransitionLoading(task.id);
    try {
      await sprintsApi.editStatusTask(task.id, { sprints_tasks_statuses_id: STATUS_IN_PROGRESS });
      await loadSprintData();
      showToast('Tarefa movida para Em Andamento.');
    } catch (err) {
      console.error('Failed to move task to in-progress:', err);
      showToast('Erro ao mover tarefa.', 'error');
    } finally {
      setTransitionLoading(null);
    }
  };

  const handleConfirmAssignTeamAndStart = async () => {
    if (!assignTeamTask || !assignTeamId) return;
    setAssignTeamLoading(true);
    try {
      await sprintsApi.editSprintTask(assignTeamTask.id, { teams_id: Number(assignTeamId) });
      await sprintsApi.editStatusTask(assignTeamTask.id, { sprints_tasks_statuses_id: STATUS_IN_PROGRESS });
      setAssignTeamTask(null);
      await loadSprintData();
    } catch (err) {
      console.error('Failed to assign team and start task:', err);
    } finally {
      setAssignTeamLoading(false);
    }
  };

  const handleMoveToDone = async (task: SprintTask) => {
    // If task has quantity assigned, show completion modal
    const qtyAssigned = (task as any).quantity_assigned ?? task.quantityAssigned;
    if (qtyAssigned) {
      setCompleteTask(task);
      setCompleteQuantity(String(qtyAssigned));
      return;
    }
    setTransitionLoading(task.id);
    try {
      await sprintsApi.editStatusTask(task.id, { sprints_tasks_statuses_id: STATUS_DONE });
      await loadSprintData();
      showToast('Tarefa concluída com sucesso.');
    } catch (err) {
      console.error('Failed to move task to done:', err);
      showToast('Erro ao concluir tarefa.', 'error');
    } finally {
      setTransitionLoading(null);
    }
  };

  const handleConfirmComplete = async () => {
    if (!completeTask) return;
    setCompleteLoading(true);
    try {
      const qty = completeQuantity ? Number(completeQuantity) : undefined;
      await sprintsApi.editStatusTask(completeTask.id, {
        sprints_tasks_statuses_id: STATUS_DONE,
        quantity_done: qty,
      });
      setCompleteTask(null);
      await loadSprintData();
    } catch (err) {
      console.error('Failed to complete task:', err);
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleOpenFailureModal = async (task: SprintTask) => {
    setFailureTask(task);
    setFailureReasonId('');
    setFailureObservation('');
    setFailureError('');
    if (nonExecReasons.length === 0) {
      try {
        const reasons = await sprintsApi.getNonExecutionReasons();
        setNonExecReasons(reasons);
      } catch (err) {
        console.error('Failed to load non-execution reasons:', err);
      }
    }
  };

  const handleConfirmFailure = async () => {
    if (!failureTask) return;
    if (!failureReasonId) {
      setFailureError(t('sprints.failureReasonRequired'));
      return;
    }
    setFailureLoading(true);
    try {
      await sprintsApi.editStatusTask(failureTask.id, {
        sprints_tasks_statuses_id: STATUS_FAILED,
      });
      await sprintsApi.editSprintTask(failureTask.id, {
        sprints_tasks_statuses_id: STATUS_FAILED,
        non_execution_reason_id: failureReasonId,
        non_execution_observations: failureObservation || null,
      });
      setFailureTask(null);
      await loadSprintData();
      showToast('Tarefa marcada como sem sucesso.');
    } catch (err) {
      console.error('Failed to mark task as failed:', err);
      showToast('Erro ao marcar tarefa como sem sucesso.', 'error');
    } finally {
      setFailureLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────

  const handleDeleteTask = async (taskId: number) => {
    try {
      await sprintsApi.deleteSprintTask(taskId);
      await loadSprintData();
      showToast('Tarefa removida do sprint com sucesso.');
    } catch (err) {
      console.error('Failed to delete sprint task:', err);
      showToast('Erro ao remover tarefa do sprint.', 'error');
    }
    setDeleteConfirm(null);
  };

  // ── Add task ─────────────────────────────────────────────────────────────────

  const handleOpenAddTask = () => {
    setAddTaskSelectedBacklogId(null);
    setAddTaskSubtasks([]);
    setAddTaskSelectedSubs(new Map());
    setAddTaskTeamId('');
    setAddTaskScheduledFor('');
    setAddTaskError('');
    setAddTaskTreeSearch('');
    setAddTaskCollapsedIds(new Set());
    setShowAddTaskModal(true);
  };

  const handleSelectBacklogForTask = async (backlogId: number) => {
    setAddTaskSelectedBacklogId(backlogId);
    setAddTaskSelectedSubs(new Map());
    setAddTaskSubtasksLoading(true);
    try {
      const result = await projectsApi.getSubtasks(backlogId);
      setAddTaskSubtasks((result.items || []) as SubtaskRow[]);
    } catch (err) {
      console.error('Failed to load subtasks:', err);
      setAddTaskSubtasks([]);
    } finally {
      setAddTaskSubtasksLoading(false);
    }
  };

  const toggleSubtaskSelection = (sub: SubtaskRow) => {
    setAddTaskSelectedSubs(prev => {
      const next = new Map(prev);
      if (next.has(sub.id)) {
        next.delete(sub.id);
      } else {
        const remaining = (sub.quantity ?? 0) - (sub.quantity_done ?? 0);
        next.set(sub.id, remaining > 0 ? remaining : 0);
      }
      return next;
    });
  };

  const updateSubtaskQty = (subtaskId: number, qty: number) => {
    setAddTaskSelectedSubs(prev => {
      const next = new Map(prev);
      next.set(subtaskId, qty);
      return next;
    });
  };

  const handleAddTask = async () => {
    if (addTaskSelectedSubs.size === 0) {
      setAddTaskError('Selecione pelo menos uma subtarefa');
      return;
    }
    setAddTaskLoading(true);
    setAddTaskError('');
    try {
      await Promise.all(
        Array.from(addTaskSelectedSubs.entries()).map(([subtaskId, qty]) =>
          sprintsApi.addSprintTask({
            sprints_id: sprintId,
            projects_backlogs_id: Number(addTaskSelectedBacklogId),
            subtasks_id: subtaskId,
            teams_id: addTaskTeamId ? Number(addTaskTeamId) : undefined,
            scheduled_for: addTaskScheduledFor || undefined,
            quantity_assigned: qty,
          })
        )
      );
      setShowAddTaskModal(false);
      await loadSprintData();
      showToast('Tarefa adicionada ao sprint com sucesso.');
    } catch (err) {
      console.error('Failed to add sprint tasks:', err);
      setAddTaskError('Erro ao adicionar tarefas');
      showToast('Erro ao adicionar tarefa ao sprint.', 'error');
    } finally {
      setAddTaskLoading(false);
    }
  };

  // ── Derived stats ────────────────────────────────────────────────────────────

  const totalTasks = pendentes.length + emAndamento.length + concluidas.length + semSucesso.length + inspecao.length;
  const doneTasks = concluidas.length + inspecao.length + semSucesso.length;
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  if (loading) return <LoadingSpinner fullPage />;

  const sprintName = sprint?.title || `Sprint #${sprintId}`;

  return (
    <div>
      <PageHeader
        title={sprintName}
        subtitle={t('sprints.currentSprintSubtitle')}
        breadcrumb={`${t('projects.title')} / ${projectsInfo?.name || ''} / ${t('sprints.title')} / ${sprintName}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/sprints" className="btn btn-secondary">
              <ArrowLeft size={18} /> {t('common.back')}
            </Link>
            <button className="btn btn-primary" onClick={handleOpenAddTask}>
              <Plus size={18} /> {t('sprints.addTask')}
            </button>
          </div>
        }
      />

      {/* Sprint Progress */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{t('sprints.progress')}</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' }}>
            {formatPercentage(completionPct)}
          </span>
        </div>
        <div
          style={{ height: '8px', backgroundColor: 'var(--color-alternate)', borderRadius: '4px' }}
        >
          <div
            style={{
              height: '100%',
              width: `${completionPct}%`,
              backgroundColor: 'var(--color-primary)',
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '13px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--color-secondary-text)' }}>
            {t('sprints.taskTodo')}: {pendentes.length}
          </span>
          <span style={{ color: 'var(--color-primary)' }}>
            {t('sprints.taskInProgress')}: {emAndamento.length}
          </span>
          <span style={{ color: 'var(--color-warning, #ca8a04)' }}>
            {t('sprints.taskInspection')}: {inspecao.length}
          </span>
          <span style={{ color: 'var(--color-success)' }}>
            {t('sprints.taskDone')}: {concluidas.length}
          </span>
          <span style={{ color: 'var(--color-error)' }}>
            {t('sprints.taskFailed')}: {semSucesso.length}
          </span>
        </div>
      </div>

      {/* Burndown Chart */}
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>
            {t('sprints.burndownChart')}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="var(--color-alternate)"
                strokeDasharray="5 5"
                name="Ideal"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="var(--color-primary)"
                strokeWidth={2}
                name="Atual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Kanban Board */}
      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px',
            minWidth: '1000px',
          }}
        >
          <KanbanColumn
            title={t('sprints.taskTodo')}
            tasks={pendentes}
            color="var(--color-secondary-text)"
            icon={<Clock size={16} />}
            emptyLabel={t('sprints.noTasks')}
            onDelete={(id) => setDeleteConfirm(id)}
            onViewDetail={(task) => setDetailTask(task)}
            transitionLoading={transitionLoading}
            selectedIds={bulkSelectedIds}
            onToggleSelect={toggleBulkSelect}
            onToggleSelectAll={toggleBulkSelectAll}
            bulkActions={
              <button
                className="btn btn-primary"
                style={{ fontSize: '12px', padding: '4px 12px', width: '100%' }}
                disabled={bulkStartLoading}
                onClick={handleBulkStart}
              >
                {bulkStartLoading ? (
                  <span className="spinner" style={{ width: '12px', height: '12px' }} />
                ) : (
                  <>
                    <Play size={12} /> Iniciar {bulkSelectedCount}
                  </>
                )}
              </button>
            }
            renderActions={(task) => (
              <button
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px' }}
                disabled={transitionLoading === task.id}
                onClick={() => handleMoveToInProgress(task)}
              >
                {transitionLoading === task.id ? (
                  <span className="spinner" style={{ width: '12px', height: '12px' }} />
                ) : (
                  <>
                    <Play size={12} /> {t('sprints.moveToInProgress')}
                  </>
                )}
              </button>
            )}
          />

          <KanbanColumn
            title={t('sprints.taskInProgress')}
            tasks={emAndamento}
            color="var(--color-primary)"
            icon={<AlertCircle size={16} />}
            emptyLabel={t('sprints.noTasks')}
            onDelete={(id) => setDeleteConfirm(id)}
            onViewDetail={(task) => setDetailTask(task)}
            transitionLoading={transitionLoading}
            renderActions={(task) => (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                  disabled={transitionLoading === task.id}
                  onClick={() => handleMoveToDone(task)}
                >
                  {transitionLoading === task.id ? (
                    <span className="spinner" style={{ width: '12px', height: '12px' }} />
                  ) : (
                    <>
                      <CheckCircle size={12} /> {t('sprints.moveToDone')}
                    </>
                  )}
                </button>
                <button
                  className="btn btn-danger"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                  disabled={transitionLoading === task.id}
                  onClick={() => handleOpenFailureModal(task)}
                >
                  <XCircle size={12} /> {t('sprints.moveToFailed')}
                </button>
              </div>
            )}
          />

          <KanbanColumn
            title={t('sprints.taskInspection')}
            tasks={inspecao}
            color="var(--color-warning, #ca8a04)"
            icon={<Shield size={16} />}
            emptyLabel={t('sprints.noTasks')}
            onViewDetail={(task) => setDetailTask(task)}
            transitionLoading={transitionLoading}
          />

          <KanbanColumn
            title={t('sprints.taskDone')}
            tasks={concluidas}
            color="var(--color-success)"
            icon={<CheckCircle size={16} />}
            emptyLabel={t('sprints.noTasks')}
            onViewDetail={(task) => setDetailTask(task)}
            transitionLoading={transitionLoading}
          />

          <KanbanColumn
            title={t('sprints.taskFailed')}
            tasks={semSucesso}
            color="var(--color-error)"
            icon={<XCircle size={16} />}
            emptyLabel={t('sprints.noTasks')}
            onViewDetail={(task) => setDetailTask(task)}
            transitionLoading={transitionLoading}
          />
        </div>
      </div>

      {/* Add Task Modal — tree + multi-select */}
      {showAddTaskModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowAddTaskModal(false)}
        >
          <div
            className="modal-content"
            style={{ width: '900px', maxWidth: '95vw', maxHeight: '80vh', minHeight: '520px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                  Adicionar Tarefas à Sprint
                </h3>
                <button
                  onClick={() => setShowAddTaskModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-secondary-text)' }}
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Two-column body */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* Left panel: Tree */}
              <div style={{ borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px 8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-secondary-text)', marginBottom: '8px', display: 'block' }}>
                    Cronograma
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-text)' }} />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Buscar..."
                      value={addTaskTreeSearch}
                      onChange={(e) => setAddTaskTreeSearch(e.target.value)}
                      style={{ paddingLeft: '32px', fontSize: '13px' }}
                    />
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
                  {addTaskVisibleBacklogs.map((b) => {
                    const isParent = addTaskHasChildren.has(b.id);
                    const isCollapsed = addTaskCollapsedIds.has(b.id);
                    const isSelected = b.id === addTaskSelectedBacklogId;
                    const level = b.level ?? (b.wbsCode ? b.wbsCode.split('.').length - 1 : 0);
                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          if (isParent) {
                            setAddTaskCollapsedIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(b.id)) next.delete(b.id);
                              else next.add(b.id);
                              return next;
                            });
                          } else {
                            handleSelectBacklogForTask(b.id);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '6px 8px',
                          paddingLeft: `${level * 20 + 8}px`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          backgroundColor: isSelected ? 'var(--color-primary-light, rgba(59,130,246,0.1))' : 'transparent',
                          color: isSelected ? 'var(--color-primary)' : 'inherit',
                          fontWeight: isSelected ? 500 : 400,
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-hover, rgba(0,0,0,0.04))';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                        }}
                      >
                        {isParent ? (
                          isCollapsed ? (
                            <ChevronRight size={14} style={{ flexShrink: 0, marginRight: '4px' }} />
                          ) : (
                            <ChevronDown size={14} style={{ flexShrink: 0, marginRight: '4px' }} />
                          )
                        ) : (
                          <span style={{ width: '14px', marginRight: '4px', flexShrink: 0 }} />
                        )}
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.wbsCode ? `${b.wbsCode} ` : ''}{b.taskName || b.name || `#${b.id}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right panel: Subtasks */}
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px 8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-secondary-text)', marginBottom: '4px', display: 'block' }}>
                    Subtarefas
                  </label>
                  {addTaskSelectedBacklogId && addTaskBreadcrumb.length > 0 && (
                    <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', margin: '4px 0 0' }}>
                      {addTaskBreadcrumb.map((b) => b.taskName || b.name).join(' > ')}
                    </p>
                  )}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 8px' }}>
                  {!addTaskSelectedBacklogId && (
                    <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', textAlign: 'center', marginTop: '40px' }}>
                      Selecione um item do cronograma à esquerda
                    </p>
                  )}
                  {addTaskSubtasksLoading && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                      <span className="spinner" style={{ width: '20px', height: '20px' }} />
                    </div>
                  )}
                  {addTaskSelectedBacklogId && !addTaskSubtasksLoading && addTaskSubtasks.length === 0 && (
                    <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', textAlign: 'center', marginTop: '40px' }}>
                      Nenhuma subtarefa encontrada
                    </p>
                  )}
                  {addTaskSubtasks.map((sub) => {
                    const qtyDone = sub.quantity_done ?? 0;
                    const qty = sub.quantity ?? 0;
                    const isCompleted = qty > 0 && qtyDone === qty;
                    const isOverDone = qty > 0 && qtyDone > qty;
                    const isChecked = addTaskSelectedSubs.has(sub.id);
                    const borderColor = isOverDone
                      ? 'var(--color-error, #ef4444)'
                      : isCompleted
                        ? 'var(--color-success, #16a34a)'
                        : isChecked
                          ? 'var(--color-primary)'
                          : 'var(--color-border)';
                    const bgColor = isOverDone
                      ? 'rgba(239,68,68,0.05)'
                      : isCompleted
                        ? 'rgba(34,197,94,0.06)'
                        : isChecked
                          ? 'var(--color-primary-light, rgba(59,130,246,0.05))'
                          : 'var(--color-secondary-bg)';
                    const textColor = isOverDone
                      ? 'var(--color-error, #ef4444)'
                      : isCompleted
                        ? 'var(--color-success, #16a34a)'
                        : 'inherit';
                    const subTextColor = isOverDone
                      ? 'var(--color-error, #ef4444)'
                      : isCompleted
                        ? 'var(--color-success, #16a34a)'
                        : 'var(--color-secondary-text)';
                    return (
                      <div
                        key={sub.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          marginBottom: '6px',
                          borderRadius: '8px',
                          border: `1px solid ${borderColor}`,
                          backgroundColor: bgColor,
                          transition: 'border-color 0.15s, background-color 0.15s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubtaskSelection(sub)}
                          style={{ flexShrink: 0, width: '16px', height: '16px', cursor: 'pointer', accentColor: isOverDone ? 'var(--color-error, #ef4444)' : isCompleted ? 'var(--color-success, #16a34a)' : 'var(--color-primary)' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', color: textColor }}>
                            {sub.description || `Subtarefa #${sub.id}`}
                            {isCompleted && <CheckCircle size={14} color="var(--color-success, #16a34a)" />}
                          </span>
                          <span style={{ fontSize: '11px', color: subTextColor, marginTop: '2px', display: 'block' }}>
                            {qtyDone}/{qty} {sub.unity?.unity || ''}
                            {isCompleted && ' — Concluída'}
                            {isOverDone && ' — Quantidade já ultrapassada'}
                          </span>
                        </div>
                        {isChecked && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, padding: '4px 8px', backgroundColor: 'var(--color-alternate, rgba(0,0,0,0.04))', borderRadius: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-secondary-text)' }}>Qtd:</span>
                            <input
                              type="number"
                              value={addTaskSelectedSubs.get(sub.id) ?? 0}
                              onChange={(e) => updateSubtaskQty(sub.id, Number(e.target.value))}
                              min={0.01}
                              step={0.01}
                              style={{ width: '65px', padding: '4px 6px', fontSize: '13px', fontWeight: 500, borderRadius: '4px', border: `1px solid ${isOverDone ? 'var(--color-error, #ef4444)' : 'var(--color-border)'}`, textAlign: 'right', backgroundColor: 'var(--color-bg, #fff)' }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ minWidth: '200px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-secondary-text)', marginBottom: '2px', display: 'block' }}>
                    {t('sprints.team')}
                  </label>
                  <SearchableSelect
                    options={teams.map((team) => ({ value: team.id, label: team.name }))}
                    value={addTaskTeamId || undefined}
                    onChange={(value) => setAddTaskTeamId(value ? Number(value) : '')}
                    placeholder={t('sprints.selectTeam')}
                    searchPlaceholder={t('common.search')}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-secondary-text)', marginBottom: '2px', display: 'block' }}>
                    {t('sprints.scheduledFor')}
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={addTaskScheduledFor}
                    onChange={(e) => setAddTaskScheduledFor(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>
              {addTaskError && (
                <p style={{ fontSize: '12px', color: 'var(--color-error)', margin: 0 }}>
                  {addTaskError}
                </p>
              )}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowAddTaskModal(false)}
                  disabled={addTaskLoading}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddTask}
                  disabled={addTaskLoading || addTaskSelectedSubs.size === 0}
                >
                  {addTaskLoading ? (
                    <span className="spinner" style={{ width: '14px', height: '14px' }} />
                  ) : (
                    `Adicionar ${addTaskSelectedSubs.size} tarefa${addTaskSelectedSubs.size !== 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Team Modal (before starting task) */}
      {assignTeamTask && (
        <div
          className="modal-backdrop"
          onClick={() => setAssignTeamTask(null)}
        >
          <div
            className="modal-content"
            style={{ width: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
              {t('sprints.assignTeamRequired')}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '16px' }}>
              {t('sprints.assignTeamDescription')}
            </p>

            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                {t('sprints.team')} *
              </label>
              <SearchableSelect
                options={teams.map((team) => ({ value: team.id, label: team.name }))}
                value={assignTeamId || undefined}
                onChange={(value) => setAssignTeamId(value ? Number(value) : '')}
                placeholder={t('sprints.selectTeam')}
                searchPlaceholder={t('common.search')}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setAssignTeamTask(null)}
                disabled={assignTeamLoading}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmAssignTeamAndStart}
                disabled={!assignTeamId || assignTeamLoading}
              >
                {assignTeamLoading ? (
                  <span className="spinner" style={{ width: '14px', height: '14px' }} />
                ) : (
                  t('sprints.assignAndStart')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign Team & Start Modal */}
      {showBulkTeamModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowBulkTeamModal(false)}
        >
          <div
            className="modal-content"
            style={{ width: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
              Atribuir Equipe e Iniciar
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '12px' }}>
              {bulkTasksNeedingTeam.length} de {bulkSelectedCount} tarefa{bulkSelectedCount !== 1 ? 's' : ''} não {bulkTasksNeedingTeam.length === 1 ? 'tem' : 'têm'} equipe:
            </p>

            <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {bulkTasksNeedingTeam.map(task => {
                const name = getTaskDisplayName(task);
                const sub = getSubtask(task);
                return (
                  <div
                    key={task.id}
                    style={{
                      fontSize: '13px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-alternate)',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{name}</span>
                    {sub?.description && (
                      <span style={{ color: 'var(--color-secondary-text)' }}> — {sub.description}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                {t('sprints.team')} *
              </label>
              <SearchableSelect
                options={teams.map((team) => ({ value: team.id, label: team.name }))}
                value={bulkAssignTeamId || undefined}
                onChange={(value) => setBulkAssignTeamId(value ? Number(value) : '')}
                placeholder={t('sprints.selectTeam')}
                searchPlaceholder={t('common.search')}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowBulkTeamModal(false)}
                disabled={bulkStartLoading}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBulkAssignAndStart}
                disabled={!bulkAssignTeamId || bulkStartLoading}
              >
                {bulkStartLoading ? (
                  <span className="spinner" style={{ width: '14px', height: '14px' }} />
                ) : (
                  <>
                    <Play size={14} /> Atribuir e Iniciar {bulkSelectedCount} tarefa{bulkSelectedCount !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {detailTask && (
        <TaskDetailsModal
          task={detailTask}
          onClose={() => setDetailTask(null)}
          t={t}
          teams={teams}
          onTaskUpdated={loadSprintData}
        />
      )}

      {/* Failure Reason Modal */}
      {failureTask && (
        <div
          className="modal-backdrop"
          onClick={() => setFailureTask(null)}
        >
          <div
            className="modal-content"
            style={{ width: '460px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
              {t('sprints.confirmFailure')}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '16px' }}>
              {getTaskDisplayName(failureTask)}
            </p>

            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                {t('sprints.failureReason')} *
              </label>
              <SearchableSelect
                options={nonExecReasons.map((r) => ({ value: r.id, label: r.name }))}
                value={failureReasonId || undefined}
                onChange={(value) => setFailureReasonId(value ? Number(value) : '')}
                placeholder={t('sprints.failureReason')}
                searchPlaceholder={t('common.search')}
              />
            </div>

            <div className="input-group" style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                {t('sprints.nonExecutionObs')}
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={failureObservation}
                onChange={(e) => setFailureObservation(e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            {failureError && (
              <p style={{ fontSize: '13px', color: 'var(--color-error)', marginTop: '8px' }}>
                {failureError}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setFailureTask(null)}
                disabled={failureLoading}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmFailure}
                disabled={failureLoading}
              >
                {failureLoading ? (
                  <span className="spinner" style={{ width: '14px', height: '14px' }} />
                ) : (
                  t('sprints.confirmFailure')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('sprints.confirmDeleteTask')}
          onConfirm={() => handleDeleteTask(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Complete Task with Quantity Modal */}
      {completeTask && (
        <div className="modal-backdrop" onClick={() => setCompleteTask(null)}>
          <div
            className="modal-content"
            style={{ width: '400px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              {t('sprints.completeTask', 'Concluir Tarefa')}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '16px' }}>
              {getTaskDisplayName(completeTask)}
            </p>

            <div className="input-group">
              {(() => {
                const assigned = (completeTask as any).quantity_assigned ?? completeTask.quantityAssigned;
                return (
                  <>
                    <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                      {t('sprints.quantityDone', 'Quantidade realizada')}
                      {assigned != null && (
                        <span style={{ fontWeight: 400, color: 'var(--color-secondary-text)', marginLeft: '6px' }}>
                          ({t('sprints.assigned', 'Designado')}: {assigned})
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={completeQuantity}
                      onChange={(e) => setCompleteQuantity(e.target.value)}
                      min={0}
                      max={assigned || undefined}
                      step={0.01}
                    />
                  </>
                );
              })()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setCompleteTask(null)}
                disabled={completeLoading}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmComplete}
                disabled={completeLoading}
              >
                {completeLoading ? (
                  <span className="spinner" style={{ width: '14px', height: '14px' }} />
                ) : (
                  <><CheckCircle size={14} /> {t('sprints.confirm', 'Confirmar')}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '24px',
              zIndex: 2000,
              padding: '12px 20px',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '14px',
              backgroundColor:
                toast.type === 'success'
                  ? 'var(--color-success, #028F58)'
                  : 'var(--color-error, #C0392B)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

interface KanbanColumnProps {
  title: string;
  tasks: SprintTask[];
  color: string;
  icon: React.ReactNode;
  emptyLabel: string;
  onDelete?: (id: number) => void;
  onViewDetail: (task: SprintTask) => void;
  transitionLoading: number | null;
  renderActions?: (task: SprintTask) => React.ReactNode;
  // Bulk selection (optional)
  selectedIds?: Set<number>;
  onToggleSelect?: (taskId: number) => void;
  onToggleSelectAll?: () => void;
  bulkActions?: React.ReactNode;
}

function KanbanColumn({
  title,
  tasks,
  color,
  icon,
  emptyLabel,
  onDelete,
  onViewDetail,
  renderActions,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  bulkActions,
}: KanbanColumnProps) {
  const allSelected = selectedIds != null && tasks.length > 0 && selectedIds.size === tasks.length;
  const someSelected = selectedIds != null && selectedIds.size > 0;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-primary-bg)',
        borderRadius: '12px',
        border: '1px solid var(--color-alternate)',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Column header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: `2px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderRadius: '12px 12px 0 0',
          flexWrap: 'wrap',
        }}
      >
        {onToggleSelectAll && tasks.length > 0 && (
          <button
            onClick={onToggleSelectAll}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0, color: allSelected ? 'var(--color-primary)' : 'var(--color-secondary-text)', display: 'flex', alignItems: 'center' }}
            title={allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
          >
            {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
          </button>
        )}
        <span style={{ color, flexShrink: 0 }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: '13px', flex: 1, lineHeight: 1.2 }}>{title}</span>
        <span
          style={{
            backgroundColor: color,
            color: '#fff',
            borderRadius: '10px',
            padding: '1px 8px',
            fontSize: '11px',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {tasks.length}
        </span>
        {someSelected && bulkActions && (
          <div style={{ flexBasis: '100%', marginTop: '6px' }}>
            {bulkActions}
          </div>
        )}
      </div>

      {/* Cards */}
      <motion.div
        variants={staggerParent}
        initial="initial"
        animate="animate"
        style={{
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
          overflowY: 'auto',
          maxHeight: '600px',
        }}
      >
        {tasks.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--color-secondary-text)',
              fontSize: '13px',
              padding: '32px 0',
            }}
          >
            {emptyLabel}
          </p>
        ) : (
          tasks.map((task) => (
            <motion.div key={task.id} variants={fadeUpChild}>
              <TaskCard
                task={task}
                onDelete={onDelete}
                onViewDetail={onViewDetail}
                renderActions={renderActions}
                selected={selectedIds?.has(task.id)}
                onToggleSelect={onToggleSelect ? () => onToggleSelect(task.id) : undefined}
              />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: SprintTask;
  onDelete?: (id: number) => void;
  onViewDetail: (task: SprintTask) => void;
  renderActions?: (task: SprintTask) => React.ReactNode;
  selected?: boolean;
  onToggleSelect?: () => void;
}

function TaskCard({ task, onDelete, onViewDetail, renderActions, selected, onToggleSelect }: TaskCardProps) {
  const { t } = useTranslation();
  const a = task as any; // shortcut for snake_case access
  const taskName = getTaskDisplayName(task);
  const backlog = getBacklog(task);
  const template = getTemplate(backlog);
  const discipline = backlog?.discipline?.name || backlog?.discipline?.discipline || template?.discipline?.discipline;
  const unityName = backlog?.unity?.abbreviation || backlog?.unity?.name || backlog?.unity?.unity || template?.unity?.unity;
  const equipType = backlog?.equipaments_types?.type || template?.equipaments_types?.type;
  const hasChecklist = !!(template?.checklist_template || template?.checklist_templates_id);
  const goldenRulesCount = template?.task_golden_rules?.length ?? 0;
  const teamName = task.teams?.name || a.teams?.name;
  const scheduledFor = task.scheduledFor || a.scheduled_for;
  const actualStart = task.actualStartTime || a.actual_start_time;
  const actualEnd = task.actualEndTime || a.actual_end_time;
  const location = [
    backlog?.fields?.name,
    backlog?.sections?.section_number != null ? `S${backlog.sections.section_number}` : null,
    backlog?.rows?.row_number != null ? `R${backlog.rows.row_number}` : null,
  ].filter(Boolean).join(' · ');
  const nonExecReason = task.nonExecutionReason || a.non_execution_reason;
  const subtask = getSubtask(task);
  const subtaskName = subtask?.description;
  const updatedAt = task.updatedAt || a.updated_at;
  const taskStatus = task.sprintsTasksStatusesId || a.sprints_tasks_statuses_id;
  const scheduleStatus = getTaskScheduleStatus(taskStatus, scheduledFor, t);

  return (
    <div
      style={{
        backgroundColor: selected ? 'var(--color-primary-light, rgba(59,130,246,0.05))' : 'var(--color-secondary-bg)',
        borderRadius: '8px',
        padding: '10px 12px',
        border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-alternate)'}`,
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
    >
      {/* Header: checkbox + name + subtask + delete */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
        {onToggleSelect && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0, marginTop: '1px', color: selected ? 'var(--color-primary)' : 'var(--color-secondary-text)', display: 'flex', alignItems: 'center' }}
          >
            {selected ? <CheckSquare size={16} /> : <Square size={16} />}
          </button>
        )}
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.3, wordBreak: 'break-word', display: 'block' }}>
            {taskName}
          </span>
          {subtaskName && (
            <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500, marginTop: '1px', display: 'block' }}>
              {subtaskName}
            </span>
          )}
        </div>
        {onDelete && (
          <button
            className="btn btn-icon"
            onClick={() => onDelete(task.id)}
            style={{ flexShrink: 0, marginTop: '-2px' }}
            title={t('common.delete')}
          >
            <Trash2 size={12} color="var(--color-error)" />
          </button>
        )}
      </div>

      {/* Schedule status badge */}
      {scheduleStatus && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px', marginTop: '5px', backgroundColor: scheduleStatus.bgColor, color: scheduleStatus.color }}>
          {scheduleStatus.label}
        </span>
      )}

      {/* Info line: discipline · unity · equipment */}
      {(discipline || unityName || equipType) && (
        <p style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '3px', lineHeight: 1.4 }}>
          {[discipline, unityName, equipType].filter(Boolean).join(' · ')}
        </p>
      )}

      {/* Location */}
      {location && (
        <p style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <MapPin size={10} style={{ flexShrink: 0 }} /> {location}
        </p>
      )}

      {/* Quantity assigned progress */}
      {(() => {
        const qtyAssigned = a.quantity_assigned ?? task.quantityAssigned;
        const qtyDone = a.quantity_done ?? task.quantityDone ?? 0;
        if (qtyAssigned == null || qtyAssigned <= 0) return null;
        const pct = Math.round((qtyDone / qtyAssigned) * 100);
        return (
          <div style={{ marginTop: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>
                {qtyDone} / {qtyAssigned} {unityName || ''}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-primary)' }}>{pct}%</span>
            </div>
            <div style={{ height: '3px', backgroundColor: 'var(--color-alternate)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, backgroundColor: 'var(--color-primary)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        );
      })()}

      {/* Badges row: team, criticality, checklist, golden rules */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
        {teamName && (
          <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '8px', fontWeight: 500, backgroundColor: 'rgba(79,70,229,0.12)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Users size={9} /> {teamName}
          </span>
        )}
        {task.criticality && (
          <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '8px', fontWeight: 500, ...getCriticalityStyle(task.criticality) }}>
            {getCriticalityLabel(task.criticality, t)}
          </span>
        )}
        {hasChecklist && (
          <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '8px', fontWeight: 500, backgroundColor: 'rgba(59,130,246,0.12)', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <ClipboardList size={9} /> Checklist
          </span>
        )}
        {goldenRulesCount > 0 && (
          <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '8px', fontWeight: 500, backgroundColor: 'rgba(234,179,8,0.12)', color: '#ca8a04', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <AlertTriangle size={9} /> {goldenRulesCount} {goldenRulesCount === 1 ? 'Regra' : 'Regras'}
          </span>
        )}
      </div>

      {/* Dates */}
      {(scheduledFor || actualStart || actualEnd || (updatedAt && taskStatus >= 3)) && (
        <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {scheduledFor && (
            <p style={{ fontSize: '11px', color: 'var(--color-secondary-text)', display: 'flex', alignItems: 'center', gap: '3px', margin: 0 }}>
              <Calendar size={10} style={{ flexShrink: 0 }} /> {t('sprints.scheduledFor')}: {formatDateShort(scheduledFor)}
            </p>
          )}
          {actualStart && (
            <p style={{ fontSize: '11px', color: 'var(--color-secondary-text)', display: 'flex', alignItems: 'center', gap: '3px', margin: 0 }}>
              <Clock size={10} style={{ flexShrink: 0 }} /> {t('sprints.actualStartTime')}: {formatDateTime(actualStart)}
            </p>
          )}
          {actualEnd && (
            <p style={{ fontSize: '11px', color: 'var(--color-secondary-text)', display: 'flex', alignItems: 'center', gap: '3px', margin: 0 }}>
              <Clock size={10} style={{ flexShrink: 0 }} /> {t('sprints.actualEndTime')}: {formatDateTime(actualEnd)}
            </p>
          )}
          {/* Timestamp de registro na coluna (Inspeção, Concluída, Sem Sucesso) */}
          {updatedAt && taskStatus >= 3 && (
            <p style={{ fontSize: '11px', color: 'var(--color-secondary-text)', display: 'flex', alignItems: 'center', gap: '3px', margin: 0 }}>
              <Info size={10} style={{ flexShrink: 0 }} /> {t('sprints.registeredAt')}: {formatDateTime(updatedAt)}
            </p>
          )}
        </div>
      )}

      {/* Failed reason */}
      {nonExecReason && (
        <p style={{ fontSize: '11px', color: 'var(--color-error)', marginTop: '4px', fontStyle: 'italic' }}>
          {nonExecReason.name}
        </p>
      )}

      {/* Footer: details + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', gap: '6px', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '3px 10px' }} onClick={() => onViewDetail(task)}>
          <Eye size={12} /> {t('sprints.taskDetails')}
        </button>
        {renderActions && renderActions(task)}
      </div>
    </div>
  );
}

// ─── Task Details Modal ───────────────────────────────────────────────────────

interface TaskDetailsModalProps {
  task: SprintTask;
  onClose: () => void;
  t: (key: string) => string;
  teams?: Team[];
  onTaskUpdated?: () => void;
}

function TaskDetailsModal({ task, onClose, t, teams = [], onTaskUpdated }: TaskDetailsModalProps) {
  const a = task as any;
  const taskName = getTaskDisplayName(task);
  const backlog = getBacklog(task);
  const template = getTemplate(backlog);
  const subtask = getSubtask(task);
  const taskStatus = task.sprintsTasksStatusesId || a.sprints_tasks_statuses_id;
  const isFailed = taskStatus === STATUS_FAILED;
  const isPending = !taskStatus || taskStatus === 1;

  const discipline = backlog?.discipline?.name || backlog?.discipline?.discipline || template?.discipline?.discipline;
  const unityName = backlog?.unity?.abbreviation || backlog?.unity?.name || backlog?.unity?.unity || template?.unity?.unity;
  const equipType = backlog?.equipaments_types?.type || template?.equipaments_types?.type;
  const location = [
    backlog?.fields?.name,
    backlog?.sections?.section_number != null ? `Seção ${backlog.sections.section_number}` : null,
    backlog?.rows?.row_number != null ? `Fileira ${backlog.rows.row_number}` : null,
  ].filter(Boolean).join(' · ');
  const tracker = backlog?.trackers;
  const teamName = task.teams?.name || a.teams?.name;
  const currentTeamId = task.teamsId || a.teams_id;
  const assignedUserName = task.assignedUser?.name || a.assigned_user?.name;
  const statusName = task.sprints_tasks_statuses?.name || a.sprints_tasks_statuses?.name;
  const scheduledFor = task.scheduledFor || a.scheduled_for;
  const actualStart = task.actualStartTime || a.actual_start_time;
  const actualEnd = task.actualEndTime || a.actual_end_time;

  const updatedAt = task.updatedAt || a.updated_at;
  const nonExecReason = task.nonExecutionReason || a.non_execution_reason;
  const nonExecObs = task.nonExecutionObservations || a.non_execution_observations;
  const checklist = template?.checklist_template;
  const goldenRules = template?.task_golden_rules ?? [];

  const qtyAssigned = a.quantity_assigned ?? task.quantityAssigned;
  const qtyDone = a.quantity_done ?? task.quantityDone ?? 0;
  const pct = qtyAssigned > 0 ? Math.round((qtyDone / qtyAssigned) * 100) : 0;

  const scheduleStatus = getTaskScheduleStatus(taskStatus, scheduledFor, t);

  const hasInfoGeral = discipline || unityName || equipType || template?.installation_method || backlog?.wbs_code;
  const hasLocation = location || tracker?.trackers_types?.type || tracker?.manufacturers?.name;
  const hasDates = scheduledFor || actualStart || actualEnd || backlog?.planned_start_date || backlog?.planned_end_date;

  // ── Editable fields (only for pending tasks) ──
  const [editSchedule, setEditSchedule] = useState<string>(scheduledFor ? scheduledFor.slice(0, 10) : '');
  const [editTeamId, setEditTeamId] = useState<string>(currentTeamId ? String(currentTeamId) : '');
  const [editQty, setEditQty] = useState<string>(qtyAssigned != null ? String(qtyAssigned) : '');
  const [saving, setSaving] = useState(false);

  const hasChanges = isPending && (
    editSchedule !== (scheduledFor ? scheduledFor.slice(0, 10) : '') ||
    editTeamId !== (currentTeamId ? String(currentTeamId) : '') ||
    editQty !== (qtyAssigned != null ? String(qtyAssigned) : '')
  );

  const handleSaveChanges = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      if (editSchedule !== (scheduledFor ? scheduledFor.slice(0, 10) : '')) {
        payload.scheduled_for = editSchedule || null;
      }
      if (editTeamId !== (currentTeamId ? String(currentTeamId) : '')) {
        payload.teams_id = editTeamId ? Number(editTeamId) : null;
      }
      if (editQty !== (qtyAssigned != null ? String(qtyAssigned) : '')) {
        payload.quantity_assigned = editQty ? Number(editQty) : null;
      }
      await sprintsApi.editSprintTask(task.id, payload);
      onTaskUpdated?.();
      onClose();
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: '640px', maxHeight: '85vh', overflowY: 'auto', padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-alternate)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{taskName}</h3>
              {subtask?.description && (
                <p style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: 500, margin: '4px 0 0' }}>{subtask.description}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '12px', alignItems: 'center' }}>
              {scheduleStatus && (
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', backgroundColor: scheduleStatus.bgColor, color: scheduleStatus.color }}>
                  {scheduleStatus.label}
                </span>
              )}
              {statusName && (
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', backgroundColor: 'var(--color-alternate)', color: 'var(--color-secondary-text)' }}>
                  {statusName}
                </span>
              )}
            </div>
          </div>

          {/* Quick info badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
            {teamName && (
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', fontWeight: 500, backgroundColor: 'rgba(79,70,229,0.1)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Users size={11} /> {teamName}
              </span>
            )}
            {task.criticality && (
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', fontWeight: 500, ...getCriticalityStyle(task.criticality) }}>
                {getCriticalityLabel(task.criticality, t)}
              </span>
            )}
            {checklist && (
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', fontWeight: 500, backgroundColor: 'rgba(59,130,246,0.1)', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ClipboardList size={11} /> {checklist.name}
              </span>
            )}
            {goldenRules.length > 0 && (
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', fontWeight: 500, backgroundColor: 'rgba(234,179,8,0.1)', color: '#ca8a04', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={11} /> {goldenRules.length} {goldenRules.length === 1 ? 'Regra de Ouro' : 'Regras de Ouro'}
              </span>
            )}
            {assignedUserName && (
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', fontWeight: 500, backgroundColor: 'var(--color-alternate)', color: 'var(--color-secondary-text)' }}>
                {assignedUserName}
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          {/* ── Progresso ── */}
          {qtyAssigned != null && qtyAssigned > 0 && (
            <div style={{ marginBottom: '20px', padding: '14px 16px', backgroundColor: 'var(--color-alternate)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('sprints.progress') || 'Progresso'}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' }}>{pct}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--color-secondary-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, backgroundColor: 'var(--color-primary)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{qtyDone} {unityName || ''}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{qtyAssigned} {unityName || ''}</span>
              </div>
            </div>
          )}

          {/* ── Editable fields (pending only) ── */}
          {isPending && (
            <div style={{ marginBottom: '20px', padding: '16px', border: '1px solid var(--color-alternate)', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-secondary-text)', margin: '0 0 12px' }}>
                Editar Tarefa
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Agendamento */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary-text)', display: 'block', marginBottom: '4px' }}>
                    <Calendar size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Agendada para
                  </label>
                  <input
                    type="date"
                    value={editSchedule}
                    onChange={(e) => setEditSchedule(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg, #fff)', boxSizing: 'border-box' }}
                  />
                </div>
                {/* Equipe */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary-text)', display: 'block', marginBottom: '4px' }}>
                    <Users size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Equipe
                  </label>
                  <select
                    value={editTeamId}
                    onChange={(e) => setEditTeamId(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg, #fff)', boxSizing: 'border-box' }}
                  >
                    <option value="">Selecione a equipe...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {hasChanges && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveChanges}
                    disabled={saving}
                    style={{ fontSize: '12px', padding: '6px 16px', borderRadius: '6px' }}
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Grid 2 colunas: Info Geral + Localização ── */}
          {(hasInfoGeral || hasLocation) && (
            <div style={{ display: 'grid', gridTemplateColumns: hasInfoGeral && hasLocation ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '4px' }}>
              {hasInfoGeral && (
                <Section title={t('sprints.generalInfo') || 'Informações Gerais'}>
                  {discipline && <DetailRow label={t('sprints.discipline') || 'Disciplina'} value={discipline} />}
                  {unityName && <DetailRow label={t('sprints.unity') || 'Unidade'} value={unityName} />}
                  {equipType && <DetailRow label={t('sprints.equipmentType') || 'Equipamento'} value={equipType} />}
                  {template?.installation_method && <DetailRow label={t('sprints.installationMethod') || 'Método'} value={template.installation_method} />}
                  {backlog?.weight != null && <DetailRow label={t('sprints.weight') || 'Peso'} value={String(backlog.weight)} />}
                  {backlog?.wbs_code && <DetailRow label="WBS" value={backlog.wbs_code} />}
                  {template?.is_inspection && <DetailRow label={t('sprints.isInspection') || 'Inspeção'} value={t('common.yes') || 'Sim'} />}
                </Section>
              )}
              {hasLocation && (
                <Section title={t('sprints.location') || 'Localização'}>
                  {location && <DetailRow label={t('sprints.fieldSectionRow') || 'Local'} value={location} />}
                  {tracker?.trackers_types?.type && <DetailRow label={t('sprints.trackerType') || 'Tracker'} value={tracker.trackers_types.type} />}
                  {tracker?.manufacturers?.name && <DetailRow label={t('sprints.manufacturer') || 'Fabricante'} value={tracker.manufacturers.name} />}
                </Section>
              )}
            </div>
          )}

          {/* ── Subtarefa ── */}
          {subtask && (
            <Section title={t('sprints.subtask') || 'Subtarefa'}>
              {subtask.description && <DetailRow label={t('sprints.description') || 'Descrição'} value={subtask.description} />}
              {subtask.quantity != null && (
                <DetailRow label={t('sprints.quantity') || 'Quantidade'} value={`${subtask.quantity_done ?? 0} / ${subtask.quantity} ${subtask.unity?.unity || subtask.unity?.name || ''}`} />
              )}
              {isPending ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--color-alternate)', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-secondary-text)', flexShrink: 0 }}>Quantidade Atribuída</span>
                  <input
                    type="number"
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    min={0}
                    step={1}
                    style={{ width: '80px', padding: '4px 8px', fontSize: '13px', fontWeight: 500, borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg, #fff)', textAlign: 'right' }}
                  />
                </div>
              ) : (
                qtyAssigned != null && <DetailRow label="Quantidade Atribuída" value={`${qtyAssigned}`} />
              )}
            </Section>
          )}

          {/* ── Datas ── */}
          {hasDates && (
            <Section title={t('sprints.dates') || 'Datas'}>
              {scheduledFor && <DetailRow label={t('sprints.scheduledFor')} value={formatDateShort(scheduledFor)} />}
              {backlog?.planned_start_date && <DetailRow label={t('sprints.plannedStart') || 'Início Planejado'} value={formatDateShort(backlog.planned_start_date)} />}
              {backlog?.planned_end_date && <DetailRow label={t('sprints.plannedEnd') || 'Fim Planejado'} value={formatDateShort(backlog.planned_end_date)} />}
              {(actualStart || backlog?.actual_start_date) && (
                <DetailRow label={t('sprints.actualStartTime')} value={formatDateTime(actualStart) !== '—' ? formatDateTime(actualStart) : formatDateShort(backlog?.actual_start_date)} />
              )}
              {(actualEnd || backlog?.actual_end_date) && (
                <DetailRow label={t('sprints.actualEndTime')} value={formatDateTime(actualEnd) !== '—' ? formatDateTime(actualEnd) : formatDateShort(backlog?.actual_end_date)} />
              )}

              {updatedAt && <DetailRow label={t('sprints.registeredAt')} value={formatDateTime(updatedAt)} />}
            </Section>
          )}

          {/* ── Checklist ── */}
          {checklist && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-secondary-text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ClipboardList size={12} color="#2563eb" /> Checklist
              </p>
              <div style={{ padding: '12px 14px', backgroundColor: 'rgba(59,130,246,0.06)', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.15)' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#2563eb' }}>{checklist.name}</span>
                {checklist.checklist_type && (
                  <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginLeft: '8px' }}>({checklist.checklist_type})</span>
                )}
              </div>
            </div>
          )}

          {/* ── Regras de Ouro ── */}
          {goldenRules.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-secondary-text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} color="#ca8a04" /> {t('sprints.goldenRules') || 'Regras de Ouro'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {goldenRules.map((gr: any) => (
                  <div key={gr.id} style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.18)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <AlertTriangle size={16} color="#ca8a04" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{gr.golden_rule.title}</span>
                      {gr.golden_rule.description && (
                        <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginTop: '3px', lineHeight: 1.5, margin: '3px 0 0' }}>
                          {gr.golden_rule.description}
                        </p>
                      )}
                      {gr.golden_rule.severity && (
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: 500, marginTop: '6px', display: 'inline-block', ...getCriticalityStyle(gr.golden_rule.severity) }}>
                          {gr.golden_rule.severity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Motivo de Não Execução ── */}
          {isFailed && (nonExecReason || nonExecObs) && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-error)', marginBottom: '8px' }}>
                {t('sprints.failureReason')}
              </p>
              <div style={{ padding: '12px 14px', backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.15)' }}>
                {nonExecReason?.name && <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-error)', margin: 0 }}>{nonExecReason.name}</p>}
                {nonExecObs && <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginTop: '4px', margin: nonExecReason ? '4px 0 0' : 0 }}>{nonExecObs}</p>}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Detail helpers ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <p
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-secondary-text)',
          marginBottom: '8px',
        }}
      >
        {title}
      </p>
      <div
        style={{
          backgroundColor: 'var(--color-secondary-bg)',
          borderRadius: '8px',
          border: '1px solid var(--color-alternate)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '8px 12px',
        borderBottom: '1px solid var(--color-alternate)',
        gap: '12px',
      }}
    >
      <span style={{ fontSize: '13px', color: 'var(--color-secondary-text)', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: '13px', fontWeight: 500, textAlign: 'right', wordBreak: 'break-word' }}>
        {value || '—'}
      </span>
    </div>
  );
}

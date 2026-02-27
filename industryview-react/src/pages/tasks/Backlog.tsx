import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { projectsApi, tasksApi, agentsApi } from '../../services';
import { useBusinessDays } from '../../hooks/useBusinessDays';
import { toDateKey } from '../../utils/businessDays';
import type { ProjectBacklog, TaskListItem, Unity, Discipline } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import SortableHeader, { useBackendSort } from '../../components/common/SortableHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchableSelect from '../../components/common/SearchableSelect';
import ProjectSelector from '../../components/common/ProjectSelector';
import {
  Plus,
  Search,
  ArrowLeft,
  Trash2,
  Edit,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  Copy,
  Sparkles,
} from 'lucide-react';
import type { WeightSuggestion } from '../../services/api/agents';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubtaskItem {
  id: number;
  description?: string;
  name?: string;
  quantity?: number;
  quantity_done?: number;
  weight?: number;
  unity?: { id: number; unity: string } | null;
  subtasks_statuses_id?: number;
  status?: boolean;
}

interface EditForm {
  description: string;
  quantity: string;
  unity_id: string;
  discipline_id: string;
  weight: string;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  planned_duration_days: string;
  planned_cost: string;
  actual_cost: string;
  percent_complete: string;
  wbs_code: string;
}

const EMPTY_EDIT_FORM: EditForm = {
  description: '',
  quantity: '',
  unity_id: '',
  discipline_id: '',
  weight: '',
  planned_start_date: '',
  planned_end_date: '',
  actual_start_date: '',
  actual_end_date: '',
  planned_duration_days: '',
  planned_cost: '',
  actual_cost: '',
  percent_complete: '',
  wbs_code: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function backlogToEditForm(backlog: ProjectBacklog): EditForm {
  return {
    description: backlog.description ?? '',
    quantity: backlog.quantity != null ? String(backlog.quantity) : '',
    unity_id: backlog.unityId != null ? String(backlog.unityId) : '',
    discipline_id: backlog.disciplineId != null ? String(backlog.disciplineId) : '',
    weight: backlog.weight != null ? String(backlog.weight) : '',
    planned_start_date: backlog.plannedStartDate ?? '',
    planned_end_date: backlog.plannedEndDate ?? '',
    actual_start_date: backlog.actualStartDate ?? '',
    actual_end_date: backlog.actualEndDate ?? '',
    planned_duration_days: backlog.plannedDurationDays != null ? String(backlog.plannedDurationDays) : '',
    planned_cost: backlog.plannedCost != null ? String(backlog.plannedCost) : '',
    actual_cost: backlog.actualCost != null ? String(backlog.actualCost) : '',
    percent_complete: backlog.percentComplete != null ? String(backlog.percentComplete) : '',
    wbs_code: backlog.wbsCode ?? '',
  };
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  // Parse YYYY-MM-DD as local date (not UTC) to avoid timezone shift
  const dateOnly = dateStr.slice(0, 10);
  const [y, m, d] = dateOnly.split('-').map(Number);
  if (y && m && d) {
    const local = new Date(y, m - 1, d);
    if (!isNaN(local.getTime())) return local.toLocaleDateString();
  }
  const fallback = new Date(dateStr);
  if (isNaN(fallback.getTime())) return dateStr;
  return fallback.toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Backlog() {
  const { t } = useTranslation();
  const { projectsInfo, filterBacklog, setFilterBacklog } = useAppState();
  const { countBusinessDays, addBusinessDays } = useBusinessDays();

  // --- Backlog list state ---
  const [backlogs, setBacklogs] = useState<ProjectBacklog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // --- Dropdown data ---
  const [, setUnities] = useState<Unity[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);

  // --- Modal loading ---
  const [modalLoading, setModalLoading] = useState(false);

  // --- Manual add modal ---
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualParentId, setManualParentId] = useState('');
  const [manualDisciplineId, setManualDisciplineId] = useState('');

  // --- Edit modal ---
  const [editTarget, setEditTarget] = useState<ProjectBacklog | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_EDIT_FORM);
  const [editLoading, setEditLoading] = useState(false);

  // --- Delete confirm ---
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // --- Bulk selection ---
  const [selectedBacklogIds, setSelectedBacklogIds] = useState<Set<number>>(new Set());
  const [bulkDeleteBacklogConfirm, setBulkDeleteBacklogConfirm] = useState(false);
  const [bulkDeletingBacklogs, setBulkDeletingBacklogs] = useState(false);

  // --- Expansion & subtasks ---
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());
  const [expandedLeafIds, setExpandedLeafIds] = useState<Set<number>>(new Set());
  const [subtasksMap, setSubtasksMap] = useState<Record<number, SubtaskItem[]>>({});
  const [subtasksLoading, setSubtasksLoading] = useState(false);
  const [newSubtaskTaskId, setNewSubtaskTaskId] = useState<Record<number, string>>({});
  const [newSubtaskQuantity, setNewSubtaskQuantity] = useState<Record<number, string>>({});
  const [allTasks, setAllTasks] = useState<TaskListItem[]>([]);
  const [subtaskSaving, setSubtaskSaving] = useState(false);

  const { sortField, sortDirection, handleSort } = useBackendSort();

  // ---------------------------------------------------------------------------
  // Load dropdown data on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!projectsInfo) return;

    const loadDropdowns = async () => {
      try {
        const [unitiesData, disciplinesData, tasksData] = await Promise.all([
          tasksApi.getUnity(),
          tasksApi.getDisciplines(),
          tasksApi.queryAllTasks({ per_page: 100 }),
        ]);
        setUnities(unitiesData);
        setDisciplines(disciplinesData);
        setAllTasks(tasksData.items || []);
      } catch (err) {
        console.error('Failed to load dropdown data:', err);
      }
    };

    loadDropdowns();
  }, [projectsInfo]);

  // ---------------------------------------------------------------------------
  // Load backlogs
  // ---------------------------------------------------------------------------

  const loadBacklogs = useCallback(async () => {
    if (!projectsInfo) return;
    setLoading(true);
    try {
      const data = await projectsApi.queryAllProjectBacklogIds({
        projects_id: projectsInfo.id,
        page,
        per_page: perPage,
        search: search || undefined,
        filter_backlog: filterBacklog,
        sort_field: sortField || undefined,
        sort_direction: sortDirection || undefined,
      });
      setBacklogs(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load backlogs:', err);
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, page, perPage, search, filterBacklog, sortField, sortDirection]);

  useEffect(() => {
    loadBacklogs();
  }, [loadBacklogs]);

  // ---------------------------------------------------------------------------
  // Parent-child hierarchy (uses projects_backlogs_id from DB)
  // ---------------------------------------------------------------------------

  const { hasChildren, visibleBacklogs, getWbsLevel } = useMemo(() => {
    // Determine which items have children via projects_backlogs_id
    const hasChildren = new Set<number>();
    for (const b of backlogs) {
      if (b.projects_backlogs_id != null) {
        hasChildren.add(b.projects_backlogs_id);
      }
    }

    // Build ancestor chain: for each item, collect all ancestor IDs
    const idSet = new Set(backlogs.map((b) => b.id));
    const getAncestors = (b: ProjectBacklog): number[] => {
      const ancestors: number[] = [];
      let parentId = b.projects_backlogs_id;
      while (parentId != null && idSet.has(parentId)) {
        ancestors.push(parentId);
        const parent = backlogs.find((p) => p.id === parentId);
        parentId = parent?.projects_backlogs_id ?? null;
      }
      return ancestors;
    };

    // Children visible by default; hidden only if an ancestor is in collapsedIds
    const visibleBacklogs = backlogs.filter((backlog) => {
      const ancestors = getAncestors(backlog);
      return !ancestors.some((aid) => collapsedIds.has(aid));
    });

    const getWbsLevel = (wbsCode?: string) => {
      if (!wbsCode) return 0;
      return wbsCode.split('.').length - 1;
    };

    return { hasChildren, visibleBacklogs, getWbsLevel };
  }, [backlogs, collapsedIds]);

  // ---------------------------------------------------------------------------
  // Row expand toggle
  // ---------------------------------------------------------------------------

  const handleToggleExpand = (backlogId: number) => {
    if (hasChildren.has(backlogId)) {
      // Parent item → toggle collapse/expand of children
      setCollapsedIds((prev) => {
        const next = new Set(prev);
        if (next.has(backlogId)) {
          next.delete(backlogId);
        } else {
          next.add(backlogId);
        }
        return next;
      });
    } else {
      // Leaf item → toggle subtask panel
      setExpandedLeafIds((prev) => {
        const next = new Set(prev);
        if (next.has(backlogId)) {
          next.delete(backlogId);
        } else {
          next.add(backlogId);
        }
        return next;
      });

      // Load subtasks on first expand
      if (!subtasksMap[backlogId]) {
        setSubtasksLoading(true);
        projectsApi
          .getSubtasks(backlogId)
          .then((result) => {
            setSubtasksMap((prev) => ({
              ...prev,
              [backlogId]: (result.items as SubtaskItem[]) || [],
            }));
          })
          .catch((err) => {
            console.error('Failed to load subtasks:', err);
            setSubtasksMap((prev) => ({ ...prev, [backlogId]: [] }));
          })
          .finally(() => {
            setSubtasksLoading(false);
          });
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  const toggleBacklogSelect = (id: number) => {
    setSelectedBacklogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleBacklogSelectAll = () => {
    if (selectedBacklogIds.size === visibleBacklogs.length) {
      setSelectedBacklogIds(new Set());
    } else {
      setSelectedBacklogIds(new Set(visibleBacklogs.map((b) => b.id)));
    }
  };

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const handleDeleteBacklog = async (id: number) => {
    try {
      await projectsApi.deleteProjectBacklog(id);
      loadBacklogs();
    } catch (err) {
      console.error('Failed to delete backlog:', err);
    }
    setDeleteConfirm(null);
  };

  const handleBulkDeleteBacklogs = async () => {
    setBulkDeletingBacklogs(true);
    try {
      for (const id of selectedBacklogIds) {
        await projectsApi.deleteProjectBacklog(id);
      }
      setSelectedBacklogIds(new Set());
      loadBacklogs();
    } catch (err) {
      console.error('Failed to bulk delete backlogs:', err);
    } finally {
      setBulkDeletingBacklogs(false);
      setBulkDeleteBacklogConfirm(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Manual add modal
  // ---------------------------------------------------------------------------

  const handleOpenManualModal = () => {
    setManualName('');
    setManualParentId('');
    setManualDisciplineId('');
    setShowManualModal(true);
  };

  const handleAddManualTask = async () => {
    if (!projectsInfo || !manualName.trim()) return;
    setModalLoading(true);
    try {
      await projectsApi.addTasksBacklogManual({
        projects_id: projectsInfo.id,
        name: manualName.trim(),
        projects_backlogs_id: manualParentId ? parseInt(manualParentId, 10) : undefined,
        discipline_id: manualDisciplineId ? parseInt(manualDisciplineId, 10) : undefined,
      });
      setShowManualModal(false);
      loadBacklogs();
    } catch (err) {
      console.error('Failed to add manual task:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Edit modal
  // ---------------------------------------------------------------------------

  const handleOpenEdit = (backlog: ProjectBacklog) => {
    setEditTarget(backlog);
    setEditForm(backlogToEditForm(backlog));
  };

  const handleEditFormChange = (field: keyof EditForm, value: string) => {
    setEditForm((prev) => {
      const next = { ...prev, [field]: value };

      // Auto-calc: start + end → duration (business days)
      if ((field === 'planned_start_date' || field === 'planned_end_date') && next.planned_start_date && next.planned_end_date) {
        const start = new Date(next.planned_start_date + 'T00:00:00');
        const end = new Date(next.planned_end_date + 'T00:00:00');
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
          const bd = countBusinessDays(start, end);
          next.planned_duration_days = String(bd);
        }
      }

      // Auto-calc: start + duration → end (business days)
      if (field === 'planned_duration_days' && next.planned_start_date && next.planned_duration_days) {
        const start = new Date(next.planned_start_date + 'T00:00:00');
        const days = parseInt(next.planned_duration_days, 10);
        if (!isNaN(start.getTime()) && days > 0) {
          const endDate = addBusinessDays(start, days);
          next.planned_end_date = toDateKey(endDate);
        }
      }

      return next;
    });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      await projectsApi.editProjectBacklog(editTarget.id, {
        description: editForm.description || undefined,
        quantity: editForm.quantity ? parseInt(editForm.quantity, 10) : undefined,
        unity_id: editForm.unity_id ? parseInt(editForm.unity_id, 10) : undefined,
        discipline_id: editForm.discipline_id ? parseInt(editForm.discipline_id, 10) : undefined,
        weight: editForm.weight ? parseFloat(editForm.weight) : undefined,
        planned_start_date: editForm.planned_start_date || undefined,
        planned_end_date: editForm.planned_end_date || undefined,
        actual_start_date: editForm.actual_start_date || undefined,
        actual_end_date: editForm.actual_end_date || undefined,
        planned_duration_days: editForm.planned_duration_days
          ? parseInt(editForm.planned_duration_days, 10)
          : undefined,
        planned_cost: editForm.planned_cost ? parseFloat(editForm.planned_cost) : undefined,
        actual_cost: editForm.actual_cost ? parseFloat(editForm.actual_cost) : undefined,
        percent_complete: editForm.percent_complete
          ? parseFloat(editForm.percent_complete)
          : undefined,
        wbs_code: editForm.wbs_code || undefined,
      });
      setEditTarget(null);
      loadBacklogs();
    } catch (err) {
      console.error('Failed to save backlog edit:', err);
    } finally {
      setEditLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Subtask add
  // ---------------------------------------------------------------------------

  const handleAddSubtask = async (backlogId: number) => {
    const taskId = newSubtaskTaskId[backlogId];
    if (!taskId) return;
    const selectedTask = allTasks.find((t) => t.id === parseInt(taskId, 10));
    if (!selectedTask) return;
    const qty = newSubtaskQuantity[backlogId];
    setSubtaskSaving(true);
    try {
      await projectsApi.addSubtask({
        backlog_id: backlogId,
        name: selectedTask.description || selectedTask.name || '',
        quantity: qty ? parseInt(qty, 10) : undefined,
        unity_id: selectedTask.unity_id ?? undefined,
      });
      setNewSubtaskTaskId((prev) => ({ ...prev, [backlogId]: '' }));
      setNewSubtaskQuantity((prev) => ({ ...prev, [backlogId]: '' }));
      // Reload subtasks and backlog (percent_complete may have changed)
      const result = await projectsApi.getSubtasks(backlogId);
      setSubtasksMap((prev) => ({
        ...prev,
        [backlogId]: (result.items as SubtaskItem[]) || [],
      }));
      loadBacklogs();
    } catch (err) {
      console.error('Failed to add subtask:', err);
    } finally {
      setSubtaskSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Subtask edit & delete
  // ---------------------------------------------------------------------------

  const reloadSubtasks = async (backlogId: number) => {
    const result = await projectsApi.getSubtasks(backlogId);
    setSubtasksMap((prev) => ({
      ...prev,
      [backlogId]: (result.items as SubtaskItem[]) || [],
    }));
  };

  const handleEditSubtask = async (backlogId: number, subtaskId: number, data: Record<string, unknown>) => {
    await projectsApi.editSubtask(subtaskId, data);
    await reloadSubtasks(backlogId);
    loadBacklogs();
  };

  const handleDeleteSubtask = async (backlogId: number, subtaskId: number) => {
    await projectsApi.deleteSubtask(subtaskId);
    await reloadSubtasks(backlogId);
    loadBacklogs();
  };

  // ---------------------------------------------------------------------------
  // Subtask copy to another backlog
  // ---------------------------------------------------------------------------

  const handleCopySubtasks = async (sourceBacklogId: number, subtaskIds: number[], targetBacklogId: number) => {
    const sourceSubtasks = subtasksMap[sourceBacklogId] ?? [];
    for (const id of subtaskIds) {
      const subtask = sourceSubtasks.find((s) => s.id === id);
      if (!subtask) continue;
      await projectsApi.addSubtask({
        backlog_id: targetBacklogId,
        name: subtask.description || subtask.name || '',
        quantity: subtask.quantity ?? undefined,
        unity_id: subtask.unity?.id ?? undefined,
      });
    }
    // Reload target subtasks if expanded
    if (expandedLeafIds.has(targetBacklogId)) {
      await reloadSubtasks(targetBacklogId);
    }
    loadBacklogs();
  };

  // ---------------------------------------------------------------------------
  // Load all backlogs for copy target selection
  // ---------------------------------------------------------------------------

  const [allBacklogs, setAllBacklogs] = useState<ProjectBacklog[]>([]);

  useEffect(() => {
    if (!projectsInfo) return;
    const loadAll = async () => {
      try {
        const data = await projectsApi.queryAllProjectBacklogIds({
          projects_id: projectsInfo.id,
          per_page: 1000,
        });
        setAllBacklogs(data.items || []);
      } catch (err) {
        console.error('Failed to load all backlogs:', err);
      }
    };
    loadAll();
  }, [projectsInfo]);

  // ---------------------------------------------------------------------------
  // Guard
  // ---------------------------------------------------------------------------

  if (!projectsInfo) return <ProjectSelector />;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div>
      <PageHeader
        title={t('backlog.title')}
        subtitle={t('backlog.subtitle')}
        breadcrumb={`${t('projects.title')} / ${projectsInfo.name} / ${t('backlog.title')}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/projeto-detalhes" className="btn btn-secondary">
              <ArrowLeft size={18} /> {t('common.back')}
            </Link>
            <Link to="/cronograma" className="btn btn-secondary">
              <CalendarDays size={18} /> {t('nav.cronograma')}
            </Link>
            <button className="btn btn-primary" onClick={handleOpenManualModal}>
              <Plus size={18} /> {t('backlog.addManual')}
            </button>
          </div>
        }
      />

      {/* Search and filter bar */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-secondary-text)',
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder={t('backlog.searchBacklog')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${filterBacklog === 1 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setFilterBacklog(1); setPage(1); }}
            style={{ fontSize: '13px' }}
          >
            {t('backlog.all')}
          </button>
          <button
            className={`btn ${filterBacklog === 2 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setFilterBacklog(2); setPage(1); }}
            style={{ fontSize: '13px' }}
          >
            {t('backlog.pending')}
          </button>
          <button
            className={`btn ${filterBacklog === 3 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setFilterBacklog(3); setPage(1); }}
            style={{ fontSize: '13px' }}
          >
            {t('backlog.completed')}
          </button>
        </div>
        {selectedBacklogIds.size > 0 && (
          <button
            className="btn btn-danger"
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setBulkDeleteBacklogConfirm(true)}
            disabled={bulkDeletingBacklogs}
          >
            {bulkDeletingBacklogs
              ? <span className="spinner" style={{ width: '14px', height: '14px' }} />
              : <><Trash2 size={14} /> {t('common.delete')} ({selectedBacklogIds.size})</>}
          </button>
        )}
      </div>

      {/* Backlog table */}
      {loading ? (
        <LoadingSpinner />
      ) : backlogs.length === 0 ? (
        <EmptyState
          message={t('common.noData')}
          action={
            <button className="btn btn-primary" onClick={handleOpenManualModal}>
              <Plus size={18} /> {t('backlog.addManual')}
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={visibleBacklogs.length > 0 && selectedBacklogIds.size === visibleBacklogs.length}
                    onChange={toggleBacklogSelectAll}
                  />
                </th>
                <SortableHeader label={t('backlog.taskName')} field="taskName" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('backlog.wbsCode')} field="wbsCode" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('backlog.discipline')} field="disciplineName" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('backlog.plannedStart')} field="plannedStartDate" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('backlog.plannedEnd')} field="plannedEndDate" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('backlog.actualStart')} field="actualStartDate" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('backlog.actualEnd')} field="actualEndDate" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('backlog.percentComplete')} field="percentComplete" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} style={{ width: '80px' }} />
                <SortableHeader label={t('backlog.status')} field="checked" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {visibleBacklogs.map((backlog) => {
                const level = getWbsLevel(backlog.wbsCode);
                const isParent = hasChildren.has(backlog.id);
                const isExpanded = isParent
                  ? !collapsedIds.has(backlog.id)
                  : expandedLeafIds.has(backlog.id);

                return (
                <Fragment key={backlog.id}>
                  <tr>
                    {/* Selection checkbox */}
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedBacklogIds.has(backlog.id)}
                        onChange={() => toggleBacklogSelect(backlog.id)}
                      />
                    </td>

                    {/* Task name + expand toggle */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: `${level * 24}px` }}>
                        <button
                          className="btn btn-icon"
                          onClick={() => handleToggleExpand(backlog.id)}
                          style={{ padding: '2px', flexShrink: 0 }}
                        >
                          {isExpanded ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </button>
                        <span
                          style={{
                            fontWeight: isParent ? 600 : 500,
                          }}
                        >
                          {backlog.taskName || backlog.name || '-'}
                        </span>
                      </div>
                    </td>

                    {/* WBS */}
                    <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                      {backlog.wbsCode || '-'}
                    </td>

                    {/* Discipline */}
                    <td>{backlog.disciplineName || '-'}</td>

                    {/* Planned start */}
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {formatDate(backlog.plannedStartDate)}
                    </td>

                    {/* Planned end */}
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {formatDate(backlog.plannedEndDate)}
                    </td>

                    {/* Actual start */}
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {formatDate(backlog.actualStartDate)}
                    </td>

                    {/* Actual end */}
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {formatDate(backlog.actualEndDate)}
                    </td>

                    {/* % complete */}
                    <td>
                      {backlog.percentComplete != null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div
                            style={{
                              flex: 1,
                              height: '6px',
                              borderRadius: '3px',
                              backgroundColor: 'var(--color-alternate)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(backlog.percentComplete, 100)}%`,
                                height: '100%',
                                backgroundColor: backlog.percentComplete >= 100
                                  ? 'var(--color-success)'
                                  : 'var(--color-primary)',
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                            {backlog.percentComplete}%
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-secondary-text)' }}>-</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: backlog.checked
                            ? 'var(--color-status-04)'
                            : 'var(--color-status-02)',
                          color: backlog.checked
                            ? 'var(--color-success)'
                            : 'var(--color-warning)',
                        }}
                      >
                        {backlog.checked ? t('backlog.completed') : t('backlog.pending')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <button
                          className="btn btn-icon"
                          title={t('backlog.editBacklog')}
                          onClick={() => handleOpenEdit(backlog)}
                        >
                          <Edit size={16} color="var(--color-primary)" />
                        </button>
                        <button
                          className="btn btn-icon"
                          title={t('common.delete')}
                          onClick={() => setDeleteConfirm(backlog.id)}
                        >
                          <Trash2 size={16} color="var(--color-error)" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Subtask expansion row — only for leaf items (no WBS children) */}
                  {isExpanded && !isParent && (
                    <tr className="no-row-hover">
                      <td colSpan={11} style={{ padding: 0, backgroundColor: 'transparent' }}>
                        <SubtaskPanel
                          backlogId={backlog.id}
                          subtasks={subtasksMap[backlog.id] ?? null}
                          loading={subtasksLoading}
                          allTasks={allTasks}
                          selectedTaskId={newSubtaskTaskId[backlog.id] ?? ''}
                          quantity={newSubtaskQuantity[backlog.id] ?? ''}
                          saving={subtaskSaving}
                          onTaskChange={(val) =>
                            setNewSubtaskTaskId((prev) => ({ ...prev, [backlog.id]: val }))
                          }
                          onQuantityChange={(val) =>
                            setNewSubtaskQuantity((prev) => ({ ...prev, [backlog.id]: val }))
                          }
                          onAddSubtask={() => handleAddSubtask(backlog.id)}
                          onEditSubtask={(subtaskId, data) => handleEditSubtask(backlog.id, subtaskId, data)}
                          onDeleteSubtask={(subtaskId) => handleDeleteSubtask(backlog.id, subtaskId)}
                          backlogs={allBacklogs}
                          currentBacklogId={backlog.id}
                          onCopySubtasks={(subtaskIds, targetBacklogId) =>
                            handleCopySubtasks(backlog.id, subtaskIds, targetBacklogId)
                          }
                          onReloadSubtasks={() => { reloadSubtasks(backlog.id); loadBacklogs(); }}
                          t={t}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
                );
              })}
            </tbody>
          </table>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            perPage={perPage}
            totalItems={totalItems}
            onPageChange={setPage}
            onPerPageChange={(pp) => {
              setPerPage(pp);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Add from task list modal */}
      {/* ------------------------------------------------------------------ */}
      {/* ------------------------------------------------------------------ */}
      {/* Manual add modal */}
      {/* ------------------------------------------------------------------ */}
      {showManualModal && (
        <div className="modal-backdrop" onClick={() => setShowManualModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>{t('backlog.addManual')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>{t('backlog.taskName')} *</label>
                <input
                  className="input-field"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>{t('backlog.parentItem')}</label>
                <SearchableSelect
                  options={backlogs.map((b) => ({ value: b.id, label: b.description || b.name || '' }))}
                  value={manualParentId || undefined}
                  onChange={(value) => setManualParentId(value ? String(value) : '')}
                  placeholder={t('backlog.selectParent')}
                  searchPlaceholder={t('common.search')}
                />
              </div>
              <div className="input-group">
                <label>{t('backlog.discipline')}</label>
                <SearchableSelect
                  options={disciplines.map((d) => ({ value: d.id, label: d.discipline || d.name || '' }))}
                  value={manualDisciplineId || undefined}
                  onChange={(value) => setManualDisciplineId(value ? String(value) : '')}
                  placeholder={t('backlog.selectDiscipline')}
                  searchPlaceholder={t('common.search')}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowManualModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddManualTask}
                disabled={modalLoading || !manualName.trim()}
              >
                {modalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Edit backlog modal */}
      {/* ------------------------------------------------------------------ */}
      {editTarget && (
        <div className="modal-backdrop" onClick={() => setEditTarget(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}
          >
            <h3 style={{ marginBottom: '16px' }}>{t('backlog.editBacklog')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Description — full width */}
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>{t('common.description')}</label>
                <input
                  className="input-field"
                  value={editForm.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                />
              </div>

              {/* WBS code */}
              <div className="input-group">
                <label>{t('backlog.wbsCode')}</label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.wbs_code}
                  onChange={(e) => handleEditFormChange('wbs_code', e.target.value)}
                />
              </div>

              {/* % Complete */}
              <div className="input-group">
                <label>{t('backlog.percentComplete')}</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input-field"
                  value={editForm.percent_complete}
                  onChange={(e) => handleEditFormChange('percent_complete', e.target.value)}
                />
              </div>

              {/* Discipline */}
              <div className="input-group">
                <label>{t('backlog.discipline')}</label>
                <SearchableSelect
                  options={disciplines.map((d) => ({ value: d.id, label: d.discipline || d.name || '' }))}
                  value={editForm.discipline_id || undefined}
                  onChange={(value) => handleEditFormChange('discipline_id', value ? String(value) : '')}
                  placeholder={t('backlog.selectDiscipline')}
                  searchPlaceholder={t('common.search')}
                />
              </div>

              {/* Section divider: Planning dates */}
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--color-alternate)', paddingTop: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('common.planning')}
                </span>
              </div>

              <div className="input-group">
                <label>{t('backlog.plannedStart')}</label>
                <input
                  type="date"
                  className="input-field"
                  value={editForm.planned_start_date}
                  onChange={(e) => handleEditFormChange('planned_start_date', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>{t('backlog.plannedEnd')}</label>
                <input
                  type="date"
                  className="input-field"
                  value={editForm.planned_end_date}
                  onChange={(e) => handleEditFormChange('planned_end_date', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>{t('backlog.actualStart')}</label>
                <input
                  type="date"
                  className="input-field"
                  value={editForm.actual_start_date}
                  onChange={(e) => handleEditFormChange('actual_start_date', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>{t('backlog.actualEnd')}</label>
                <input
                  type="date"
                  className="input-field"
                  value={editForm.actual_end_date}
                  onChange={(e) => handleEditFormChange('actual_end_date', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>{t('backlog.plannedDuration')}</label>
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  value={editForm.planned_duration_days}
                  onChange={(e) => handleEditFormChange('planned_duration_days', e.target.value)}
                />
              </div>

              {/* Section divider: Costs */}
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--color-alternate)', paddingTop: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('common.costs')}
                </span>
              </div>

              <div className="input-group">
                <label>{t('backlog.plannedCost')}</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  className="input-field"
                  value={editForm.planned_cost}
                  onChange={(e) => handleEditFormChange('planned_cost', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>{t('backlog.actualCost')}</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  className="input-field"
                  value={editForm.actual_cost}
                  onChange={(e) => handleEditFormChange('actual_cost', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setEditTarget(null)}>
                {t('common.cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleSaveEdit} disabled={editLoading}>
                {editLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Delete confirm */}
      {/* ------------------------------------------------------------------ */}
      {deleteConfirm !== null && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('backlog.confirmDelete')}
          onConfirm={() => handleDeleteBacklog(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {bulkDeleteBacklogConfirm && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('common.confirmDeleteMessage')}
          onConfirm={handleBulkDeleteBacklogs}
          onCancel={() => setBulkDeleteBacklogConfirm(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SubtaskPanel — extracted to keep the main component readable
// ---------------------------------------------------------------------------

interface SubtaskPanelProps {
  backlogId: number;
  subtasks: SubtaskItem[] | null;
  loading: boolean;
  allTasks: TaskListItem[];
  selectedTaskId: string;
  quantity: string;
  saving: boolean;
  onTaskChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onAddSubtask: () => void;
  onEditSubtask: (subtaskId: number, data: Record<string, unknown>) => Promise<void>;
  onDeleteSubtask: (subtaskId: number) => Promise<void>;
  backlogs: ProjectBacklog[];
  currentBacklogId: number;
  onCopySubtasks: (subtaskIds: number[], targetBacklogId: number) => Promise<void>;
  onReloadSubtasks: () => void;
  t: ReturnType<typeof import('react-i18next').useTranslation>['t'];
}

function SubtaskPanel({
  backlogId,
  subtasks,
  loading,
  allTasks,
  selectedTaskId,
  quantity,
  saving,
  onTaskChange,
  onQuantityChange,
  onAddSubtask,
  onEditSubtask,
  onDeleteSubtask,
  onReloadSubtasks,
  backlogs,
  currentBacklogId,
  onCopySubtasks,
  t,
}: SubtaskPanelProps) {
  const selectedTask = selectedTaskId
    ? allTasks.find((tk) => tk.id === parseInt(selectedTaskId, 10))
    : null;

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTaskId, setEditTaskId] = useState<string>('');
  const [editQuantity, setEditQuantity] = useState<string>('');
  const [editWeight, setEditWeight] = useState<string>('');
  const [editSaving, setEditSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyTargetId, setCopyTargetId] = useState<string>('');
  const [copying, setCopying] = useState(false);

  // AI weight calculation
  const [aiWeightsLoading, setAiWeightsLoading] = useState(false);
  const [aiWeightsModal, setAiWeightsModal] = useState(false);
  const [aiWeightsSuggestions, setAiWeightsSuggestions] = useState<(WeightSuggestion & { finalWeight: number })[]>([]);
  const [applyingWeights, setApplyingWeights] = useState(false);

  // Inline weight editing
  const [editingWeightId, setEditingWeightId] = useState<number | null>(null);
  const [editingWeightValue, setEditingWeightValue] = useState<string>('');
  const [savingWeight, setSavingWeight] = useState(false);

  const handleCalculateWeights = async () => {
    setAiWeightsLoading(true);
    try {
      const result = await agentsApi.calculateWeights(backlogId);
      setAiWeightsSuggestions(
        result.weights.map((w) => ({ ...w, finalWeight: w.weight }))
      );
      setAiWeightsModal(true);
    } catch (err) {
      console.error('Failed to calculate weights:', err);
    } finally {
      setAiWeightsLoading(false);
    }
  };

  const handleApplyWeights = async () => {
    setApplyingWeights(true);
    try {
      await agentsApi.applyWeights({
        weights: aiWeightsSuggestions.map((w) => ({
          subtask_id: w.subtask_id,
          weight: w.finalWeight,
        })),
      });
      setAiWeightsModal(false);
      setAiWeightsSuggestions([]);
      onReloadSubtasks();
    } catch (err) {
      console.error('Failed to apply weights:', err);
    } finally {
      setApplyingWeights(false);
    }
  };

  // Helper: sum of weights of all subtasks except the one being edited
  const getOthersWeightSum = (excludeId: number) => {
    if (!subtasks) return 0;
    return subtasks
      .filter((s) => s.id !== excludeId)
      .reduce((sum, s) => sum + (s.weight ?? 0), 0);
  };

  const handleSaveWeight = async (subtaskId: number) => {
    const val = parseFloat(editingWeightValue);
    if (isNaN(val) || val < 0) return;
    const othersSum = getOthersWeightSum(subtaskId);
    if (othersSum + val > 1) return; // block if sum > 1
    setSavingWeight(true);
    try {
      await onEditSubtask(subtaskId, { weight: val });
      setEditingWeightId(null);
      setEditingWeightValue('');
    } finally {
      setSavingWeight(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!subtasks) return;
    if (selectedIds.size === subtasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(subtasks.map((s) => s.id)));
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      for (const id of selectedIds) {
        await onDeleteSubtask(id);
      }
      setSelectedIds(new Set());
    } finally {
      setBulkDeleting(false);
      setBulkDeleteConfirm(false);
    }
  };

  const handleCopy = async () => {
    if (!copyTargetId) return;
    setCopying(true);
    try {
      await onCopySubtasks(Array.from(selectedIds), parseInt(copyTargetId, 10));
      setSelectedIds(new Set());
      setCopyModalOpen(false);
      setCopyTargetId('');
    } catch (err) {
      console.error('Failed to copy subtasks:', err);
    } finally {
      setCopying(false);
    }
  };

  const startEdit = (subtask: SubtaskItem) => {
    setEditingId(subtask.id);
    const matchedTask = allTasks.find(
      (tk) => (tk.description || tk.name || '').toLowerCase() === (subtask.description || subtask.name || '').toLowerCase()
    );
    setEditTaskId(matchedTask ? String(matchedTask.id) : '');
    setEditQuantity(subtask.quantity != null ? String(subtask.quantity) : '');
    setEditWeight(subtask.weight != null ? String(subtask.weight) : '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTaskId('');
    setEditQuantity('');
    setEditWeight('');
  };

  const saveEdit = async (subtaskId: number) => {
    const task = editTaskId ? allTasks.find((tk) => tk.id === parseInt(editTaskId, 10)) : null;
    const weightVal = editWeight ? parseFloat(editWeight) : null;
    if (weightVal != null) {
      const othersSum = getOthersWeightSum(subtaskId);
      if (othersSum + weightVal > 1) return; // block if sum > 1
    }
    setEditSaving(true);
    try {
      await onEditSubtask(subtaskId, {
        description: task ? (task.description || task.name || '') : undefined,
        quantity: editQuantity ? parseFloat(editQuantity) : null,
        unity_id: task?.unity_id ?? null,
        ...(weightVal != null ? { weight: weightVal } : {}),
      });
      cancelEdit();
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (subtaskId: number) => {
    setDeletingId(subtaskId);
    try {
      await onDeleteSubtask(subtaskId);
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const editSelectedTask = editTaskId
    ? allTasks.find((tk) => tk.id === parseInt(editTaskId, 10))
    : null;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-secondary-bg)',
        borderTop: '2px solid var(--color-alternate)',
        padding: '12px 24px 16px 56px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            {t('backlog.subtasks')}
          </p>
          {subtasks && subtasks.length > 0 && (
            <button
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={handleCalculateWeights}
              disabled={aiWeightsLoading}
            >
              {aiWeightsLoading
                ? <span className="spinner" style={{ width: '12px', height: '12px' }} />
                : <><Sparkles size={12} /> {t('backlog.calculateWeightsAI', 'Calcular Pesos com IA')}</>}
            </button>
          )}
        </div>
        {selectedIds.size > 0 && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setCopyModalOpen(true)}
              disabled={copying}
            >
              {copying
                ? <span className="spinner" style={{ width: '12px', height: '12px' }} />
                : <><Copy size={12} /> {t('backlog.copyTo')} ({selectedIds.size})</>}
            </button>
            <button
              className="btn btn-danger"
              style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setBulkDeleteConfirm(true)}
              disabled={bulkDeleting}
            >
              {bulkDeleting
                ? <span className="spinner" style={{ width: '12px', height: '12px' }} />
                : <><Trash2 size={12} /> {t('common.delete')} ({selectedIds.size})</>}
            </button>
          </div>
        )}
      </div>

      {loading || subtasks === null ? (
        <div style={{ padding: '8px 0' }}>
          <span className="spinner" style={{ width: '16px', height: '16px' }} />
        </div>
      ) : subtasks.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '10px' }}>
          {t('backlog.noSubtasks')}
        </p>
      ) : (
        <>
        <table className="no-row-hover" style={{ width: '100%', marginBottom: '10px', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '4px 8px', width: '32px' }}>
                <input
                  type="checkbox"
                  checked={subtasks !== null && subtasks.length > 0 && selectedIds.size === subtasks.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--color-secondary-text)', fontWeight: 500 }}>
                {t('backlog.subtaskName')}
              </th>
              <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--color-secondary-text)', fontWeight: 500, width: '100px' }}>
                {t('backlog.quantity')}
              </th>
              <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--color-secondary-text)', fontWeight: 500, width: '100px' }}>
                {t('backlog.unity')}
              </th>
              <th style={{ textAlign: 'center', padding: '4px 8px', color: 'var(--color-secondary-text)', fontWeight: 500, width: '70px' }}>
                {t('backlog.weight', 'Peso')}
              </th>
              <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--color-secondary-text)', fontWeight: 500, width: '140px' }}>
                {t('backlog.progress', 'Progresso')}
              </th>
              <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--color-secondary-text)', fontWeight: 500, width: '120px' }}>
                {t('backlog.status')}
              </th>
              <th style={{ textAlign: 'center', padding: '4px 8px', color: 'var(--color-secondary-text)', fontWeight: 500, width: '80px' }}>
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {subtasks.map((subtask) => {
              const isEditing = editingId === subtask.id;

              if (isEditing) {
                return (
                  <tr key={subtask.id} style={{ borderTop: '1px solid var(--color-alternate)' }}>
                    <td style={{ padding: '6px 8px', width: '32px' }}>
                      <input type="checkbox" checked={selectedIds.has(subtask.id)} onChange={() => toggleSelect(subtask.id)} />
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <SearchableSelect
                        options={allTasks.map((tk) => ({
                          value: tk.id,
                          label: tk.description || tk.name || '',
                        }))}
                        value={editTaskId || undefined}
                        onChange={(value) => setEditTaskId(value ? String(value) : '')}
                        placeholder={t('backlog.selectTask')}
                        searchPlaceholder={t('common.search')}
                      />
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <input
                        type="number"
                        className="input-field"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        style={{ fontSize: '13px', width: '80px' }}
                        min={0}
                      />
                    </td>
                    <td style={{ padding: '6px 8px', color: 'var(--color-secondary-text)' }}>
                      {editSelectedTask?.unity?.unity || '-'}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      {(() => {
                        const othersSum = getOthersWeightSum(subtask.id);
                        const maxAllowed = Math.round((1 - othersSum) * 10000) / 10000;
                        const currentVal = editWeight ? parseFloat(editWeight) : 0;
                        const isOverLimit = currentVal > maxAllowed + 0.0001;
                        return (
                          <div>
                            <input
                              type="number"
                              className="input-field"
                              value={editWeight}
                              onChange={(e) => setEditWeight(e.target.value)}
                              style={{
                                fontSize: '13px', width: '65px', textAlign: 'center', padding: '2px 4px',
                                borderColor: isOverLimit ? 'var(--color-error)' : undefined,
                              }}
                              min={0}
                              max={maxAllowed}
                              step={0.01}
                            />
                            {isOverLimit && (
                              <p style={{ fontSize: '10px', color: 'var(--color-error)', margin: '2px 0 0' }}>
                                max: {maxAllowed.toFixed(2)}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td style={{ padding: '6px 8px', color: 'var(--color-secondary-text)' }}>
                      {subtask.quantity != null ? `${subtask.quantity_done ?? 0} / ${subtask.quantity}` : '-'}
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: (subtask.subtasks_statuses_id === 3 || subtask.status) ? 'var(--color-status-04)' : 'var(--color-status-02)',
                          color: (subtask.subtasks_statuses_id === 3 || subtask.status) ? 'var(--color-success)' : 'var(--color-warning)',
                        }}
                      >
                        {(subtask.subtasks_statuses_id === 3 || subtask.status) ? t('backlog.completed') : t('backlog.pending')}
                      </span>
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button
                          className="btn btn-icon"
                          title={t('common.save')}
                          onClick={() => saveEdit(subtask.id)}
                          disabled={editSaving}
                        >
                          {editSaving ? <span className="spinner" style={{ width: '14px', height: '14px' }} /> : <Check size={14} color="var(--color-success)" />}
                        </button>
                        <button
                          className="btn btn-icon"
                          title={t('common.cancel')}
                          onClick={cancelEdit}
                          disabled={editSaving}
                        >
                          <X size={14} color="var(--color-secondary-text)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={subtask.id} style={{ borderTop: '1px solid var(--color-alternate)' }}>
                  <td style={{ padding: '6px 8px', width: '32px' }}>
                    <input type="checkbox" checked={selectedIds.has(subtask.id)} onChange={() => toggleSelect(subtask.id)} />
                  </td>
                  <td style={{ padding: '6px 8px' }}>{subtask.description || subtask.name || '-'}</td>
                  <td style={{ padding: '6px 8px' }}>
                    {subtask.quantity != null ? subtask.quantity : '-'}
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    {subtask.unity?.unity || '-'}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    {editingWeightId === subtask.id ? (
                      (() => {
                        const othersSum = getOthersWeightSum(subtask.id);
                        const maxAllowed = Math.round((1 - othersSum) * 10000) / 10000;
                        const currentVal = editingWeightValue ? parseFloat(editingWeightValue) : 0;
                        const isOverLimit = currentVal > maxAllowed + 0.0001;
                        return (
                          <div>
                            <div style={{ display: 'flex', gap: '2px', alignItems: 'center', justifyContent: 'center' }}>
                              <input
                                type="number"
                                className="input-field"
                                value={editingWeightValue}
                                onChange={(e) => setEditingWeightValue(e.target.value)}
                                style={{
                                  fontSize: '12px', width: '55px', padding: '2px 4px', textAlign: 'center',
                                  borderColor: isOverLimit ? 'var(--color-error)' : undefined,
                                }}
                                min={0}
                                max={maxAllowed}
                                step={0.01}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveWeight(subtask.id);
                                  if (e.key === 'Escape') { setEditingWeightId(null); setEditingWeightValue(''); }
                                }}
                              />
                              <button className="btn btn-icon" onClick={() => handleSaveWeight(subtask.id)} disabled={savingWeight || isOverLimit} style={{ padding: '1px' }}>
                                <Check size={12} color="var(--color-success)" />
                              </button>
                            </div>
                            {isOverLimit && (
                              <p style={{ fontSize: '10px', color: 'var(--color-error)', margin: '2px 0 0' }}>
                                max: {maxAllowed.toFixed(2)}
                              </p>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      <span
                        style={{ cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 500 }}
                        title={t('backlog.clickToEditWeight', 'Clique para editar peso')}
                        onClick={() => { setEditingWeightId(subtask.id); setEditingWeightValue(subtask.weight != null ? String(subtask.weight) : '0'); }}
                      >
                        {subtask.weight ?? 1}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    {subtask.quantity != null ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                          {subtask.quantity_done ?? 0} / {subtask.quantity}
                        </span>
                        <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--color-alternate)', borderRadius: '2px', minWidth: '30px' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${subtask.quantity > 0 ? Math.min(((subtask.quantity_done ?? 0) / subtask.quantity) * 100, 100) : 0}%`,
                              backgroundColor: 'var(--color-primary)',
                              borderRadius: '2px',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </div>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: (subtask.subtasks_statuses_id === 3 || subtask.status) ? 'var(--color-status-04)' : 'var(--color-status-02)',
                        color: (subtask.subtasks_statuses_id === 3 || subtask.status) ? 'var(--color-success)' : 'var(--color-warning)',
                      }}
                    >
                      {(subtask.subtasks_statuses_id === 3 || subtask.status) ? t('backlog.completed') : t('backlog.pending')}
                    </span>
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button
                        className="btn btn-icon"
                        title={t('common.edit')}
                        onClick={() => startEdit(subtask)}
                      >
                        <Edit size={14} color="var(--color-primary)" />
                      </button>
                      <button
                        className="btn btn-icon"
                        title={t('common.delete')}
                        onClick={() => setDeleteConfirmId(subtask.id)}
                        disabled={deletingId === subtask.id}
                      >
                        {deletingId === subtask.id
                          ? <span className="spinner" style={{ width: '14px', height: '14px' }} />
                          : <Trash2 size={14} color="var(--color-error)" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Weight sum indicator */}
        {(() => {
          const totalWeight = subtasks.reduce((sum, s) => sum + (s.weight ?? 0), 0);
          const roundedTotal = Math.round(totalWeight * 100) / 100;
          if (roundedTotal === 1) return null;
          return (
            <p style={{ fontSize: '12px', color: 'var(--color-error)', margin: '0 0 8px 8px' }}>
              A soma dos pesos e {roundedTotal.toFixed(2)} — deve ser igual a 1.
            </p>
          );
        })()}
        </>
      )}

      {/* Delete confirmation */}
      {deleteConfirmId !== null && (
        <ConfirmModal
          title={t('common.confirm')}
          message={t('common.confirmDeleteMessage')}
          onConfirm={() => handleDelete(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {/* Bulk delete confirmation */}
      {bulkDeleteConfirm && (
        <ConfirmModal
          title={t('common.confirm')}
          message={t('common.confirmDeleteMessage')}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteConfirm(false)}
        />
      )}

      {/* Copy modal */}
      {copyModalOpen && (
        <div className="modal-overlay" onClick={() => { setCopyModalOpen(false); setCopyTargetId(''); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>{t('backlog.copySubtasks')}</h3>
              <button className="btn btn-icon" onClick={() => { setCopyModalOpen(false); setCopyTargetId(''); }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-secondary-text)', marginBottom: '8px', display: 'block' }}>
                {t('backlog.selectTargetBacklog')}
              </label>
              <SearchableSelect
                options={backlogs
                  .filter((b) => b.id !== currentBacklogId)
                  .map((b) => ({
                    value: b.id,
                    label: b.description || `#${b.id}`,
                  }))}
                value={copyTargetId || undefined}
                onChange={(value) => setCopyTargetId(value ? String(value) : '')}
                placeholder={t('backlog.selectTargetBacklog')}
                searchPlaceholder={t('common.search')}
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => { setCopyModalOpen(false); setCopyTargetId(''); }}
                disabled={copying}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCopy}
                disabled={!copyTargetId || copying}
              >
                {copying
                  ? <span className="spinner" style={{ width: '14px', height: '14px' }} />
                  : t('backlog.copySubtasks')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Weights Modal */}
      {aiWeightsModal && (
        <div className="modal-overlay" onClick={() => setAiWeightsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} /> {t('backlog.aiWeightsSuggestion', 'Sugestao de Pesos - IA')}
              </h3>
              <button className="btn btn-icon" onClick={() => setAiWeightsModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '12px' }}>
                {t('backlog.aiWeightsDescription', 'Revise os pesos sugeridos pela IA e ajuste se necessario antes de aplicar.')}
              </p>
              <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-alternate)' }}>
                      {t('backlog.subtaskName')}
                    </th>
                    <th style={{ textAlign: 'center', padding: '6px 8px', borderBottom: '1px solid var(--color-alternate)', width: '90px' }}>
                      {t('backlog.suggestedWeight', 'Peso IA')}
                    </th>
                    <th style={{ textAlign: 'center', padding: '6px 8px', borderBottom: '1px solid var(--color-alternate)', width: '90px' }}>
                      {t('backlog.finalWeight', 'Peso Final')}
                    </th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-alternate)' }}>
                      {t('backlog.justification', 'Justificativa')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {aiWeightsSuggestions.map((suggestion) => {
                    const subtask = subtasks?.find((s) => s.id === suggestion.subtask_id);
                    return (
                      <tr key={suggestion.subtask_id} style={{ borderBottom: '1px solid var(--color-alternate)' }}>
                        <td style={{ padding: '6px 8px' }}>{subtask?.description || subtask?.name || `#${suggestion.subtask_id}`}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--color-secondary-text)' }}>
                          {suggestion.weight}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                          <input
                            type="number"
                            className="input-field"
                            value={suggestion.finalWeight}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setAiWeightsSuggestions((prev) =>
                                prev.map((s) =>
                                  s.subtask_id === suggestion.subtask_id ? { ...s, finalWeight: isNaN(val) ? 0 : Math.min(1, Math.max(0, val)) } : s
                                )
                              );
                            }}
                            style={{ fontSize: '13px', width: '65px', textAlign: 'center', padding: '2px 4px' }}
                            min={0}
                            max={1}
                            step={0.01}
                          />
                        </td>
                        <td style={{ padding: '6px 8px', fontSize: '12px', color: 'var(--color-secondary-text)', fontStyle: 'italic' }}>
                          {suggestion.justification}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Sum indicator */}
              {(() => {
                const totalWeight = aiWeightsSuggestions.reduce((sum, s) => sum + s.finalWeight, 0);
                const isOver = totalWeight > 1.0001;
                return (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '10px', padding: '0 8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: isOver ? 'var(--color-error)' : 'var(--color-success)' }}>
                      {t('backlog.totalWeight', 'Total')}: {totalWeight.toFixed(2)}
                    </span>
                    {isOver && (
                      <span style={{ fontSize: '12px', color: 'var(--color-error)' }}>
                        ({t('backlog.weightSumExceeds', 'A soma nao pode ultrapassar 1')})
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setAiWeightsModal(false)}
                disabled={applyingWeights}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleApplyWeights}
                disabled={applyingWeights || aiWeightsSuggestions.reduce((sum, s) => sum + s.finalWeight, 0) > 1.0001}
              >
                {applyingWeights
                  ? <span className="spinner" style={{ width: '14px', height: '14px' }} />
                  : t('backlog.applyWeights', 'Aplicar Pesos')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add subtask form */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', maxWidth: '640px' }}>
        <div style={{ flex: 2 }}>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-secondary-text)', marginBottom: '4px', display: 'block' }}>
            {t('backlog.subtaskName')}
          </label>
          <SearchableSelect
            options={allTasks.map((tk) => ({
              value: tk.id,
              label: tk.description || tk.name || '',
            }))}
            value={selectedTaskId || undefined}
            onChange={(value) => onTaskChange(value ? String(value) : '')}
            placeholder={t('backlog.selectTask')}
            searchPlaceholder={t('common.search')}
          />
        </div>
        <div style={{ width: '100px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-secondary-text)', marginBottom: '4px', display: 'block' }}>
            {t('backlog.unity')}
          </label>
          <input
            type="text"
            className="input-field"
            value={selectedTask?.unity?.unity || '-'}
            readOnly
            style={{ fontSize: '13px', backgroundColor: 'var(--color-alternate)' }}
          />
        </div>
        <div style={{ width: '100px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-secondary-text)', marginBottom: '4px', display: 'block' }}>
            {t('backlog.quantity')}
          </label>
          <input
            type="number"
            className="input-field"
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            style={{ fontSize: '13px' }}
            min={0}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={onAddSubtask}
          disabled={saving || !selectedTaskId}
          style={{ whiteSpace: 'nowrap', fontSize: '13px' }}
        >
          {saving ? <span className="spinner" /> : <><Plus size={14} /> {t('backlog.addSubtask')}</>}
        </button>
      </div>
    </div>
  );
}

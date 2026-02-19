import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { projectsApi, tasksApi } from '../../services';
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
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubtaskItem {
  id: number;
  name: string;
  quantity?: number;
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
  // Handle timestamps or ISO strings
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Backlog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectsInfo, filterBacklog, setFilterBacklog } = useAppState();

  // --- Backlog list state ---
  const [backlogs, setBacklogs] = useState<ProjectBacklog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // --- Dropdown data ---
  const [unities, setUnities] = useState<Unity[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);

  // --- Add from list modal ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<TaskListItem[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // --- Manual add modal ---
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualQuantity, setManualQuantity] = useState('');
  const [manualUnityId, setManualUnityId] = useState('');
  const [manualDisciplineId, setManualDisciplineId] = useState('');

  // --- Edit modal ---
  const [editTarget, setEditTarget] = useState<ProjectBacklog | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_EDIT_FORM);
  const [editLoading, setEditLoading] = useState(false);

  // --- Delete confirm ---
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // --- Subtask expansion ---
  const [expandedBacklog, setExpandedBacklog] = useState<number | null>(null);
  const [subtasksMap, setSubtasksMap] = useState<Record<number, SubtaskItem[]>>({});
  const [subtasksLoading, setSubtasksLoading] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [subtaskSaving, setSubtaskSaving] = useState(false);

  const { sortField, sortDirection, handleSort } = useBackendSort();

  // ---------------------------------------------------------------------------
  // Load dropdown data on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!projectsInfo) return;

    const loadDropdowns = async () => {
      try {
        const [unitiesData, disciplinesData] = await Promise.all([
          tasksApi.getUnity(),
          tasksApi.getDisciplines(),
        ]);
        setUnities(unitiesData);
        setDisciplines(disciplinesData);
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
  // Load subtasks when expanded row changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (expandedBacklog == null) return;
    if (subtasksMap[expandedBacklog]) return; // already loaded

    const fetchSubtasks = async () => {
      setSubtasksLoading(true);
      try {
        const result = await projectsApi.getSubtasks(expandedBacklog);
        setSubtasksMap((prev) => ({
          ...prev,
          [expandedBacklog]: (result.items as SubtaskItem[]) || [],
        }));
      } catch (err) {
        console.error('Failed to load subtasks:', err);
        setSubtasksMap((prev) => ({ ...prev, [expandedBacklog]: [] }));
      } finally {
        setSubtasksLoading(false);
      }
    };

    fetchSubtasks();
  }, [expandedBacklog, subtasksMap]);

  // ---------------------------------------------------------------------------
  // Row expand toggle
  // ---------------------------------------------------------------------------

  const handleToggleExpand = (backlogId: number) => {
    setExpandedBacklog((prev) => (prev === backlogId ? null : backlogId));
    setNewSubtaskName('');
  };

  // ---------------------------------------------------------------------------
  // Check/uncheck
  // ---------------------------------------------------------------------------

  const handleToggleCheck = async (backlog: ProjectBacklog) => {
    try {
      await projectsApi.checkTaskBacklog(backlog.id, { checked: !backlog.checked });
      loadBacklogs();
    } catch (err) {
      console.error('Failed to toggle check:', err);
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

  // ---------------------------------------------------------------------------
  // Add from task list modal
  // ---------------------------------------------------------------------------

  const handleOpenAddModal = async () => {
    setShowAddModal(true);
    try {
      const data = await tasksApi.queryAllTasks({ per_page: 100 });
      setAvailableTasks(data.items || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  const handleAddTasksFromList = async () => {
    if (!projectsInfo || selectedTaskIds.length === 0) return;
    setModalLoading(true);
    try {
      const backlogs = selectedTaskIds.map((taskId) => {
        const task = availableTasks.find((t) => t.id === taskId);
        return {
          name: task?.name || task?.description || '',
          tasks_types_id: taskId,
        };
      });
      await projectsApi.projectsBacklogsBulk({
        projects_id: projectsInfo.id,
        backlogs,
      });
      setSelectedTaskIds([]);
      setShowAddModal(false);
      loadBacklogs();
    } catch (err) {
      console.error('Failed to add tasks to backlog:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const toggleTaskSelection = (taskId: number) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  // ---------------------------------------------------------------------------
  // Manual add modal
  // ---------------------------------------------------------------------------

  const handleOpenManualModal = () => {
    setManualName('');
    setManualQuantity('');
    setManualUnityId('');
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
        quantity: manualQuantity ? parseInt(manualQuantity, 10) : undefined,
        unity_id: manualUnityId ? parseInt(manualUnityId, 10) : undefined,
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
    setEditForm((prev) => ({ ...prev, [field]: value }));
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

  const handleAddSubtask = async () => {
    if (!expandedBacklog || !newSubtaskName.trim()) return;
    setSubtaskSaving(true);
    try {
      await projectsApi.addSubtask({
        backlog_id: expandedBacklog,
        name: newSubtaskName.trim(),
      });
      setNewSubtaskName('');
      // Invalidate cache so subtasks reload
      setSubtasksMap((prev) => {
        const updated = { ...prev };
        delete updated[expandedBacklog];
        return updated;
      });
    } catch (err) {
      console.error('Failed to add subtask:', err);
    } finally {
      setSubtaskSaving(false);
    }
  };

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
            <button className="btn btn-secondary" onClick={() => navigate('/projeto-detalhes')}>
              <ArrowLeft size={18} /> {t('common.back')}
            </button>
            <button className="btn btn-secondary" onClick={handleOpenManualModal}>
              <Plus size={18} /> {t('backlog.addManual')}
            </button>
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <Plus size={18} /> {t('backlog.addFromList')}
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
      </div>

      {/* Backlog table */}
      {loading ? (
        <LoadingSpinner />
      ) : backlogs.length === 0 ? (
        <EmptyState
          message={t('common.noData')}
          action={
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <Plus size={18} /> {t('backlog.addFromList')}
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <SortableHeader label={t('backlog.taskName')} field="taskName" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('backlog.wbsCode')} field="wbsCode" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('backlog.quantity')} field="quantity" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('backlog.unity')} field="unityName" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('backlog.discipline')} field="disciplineName" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('backlog.plannedStart')} field="plannedStartDate" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('backlog.plannedEnd')} field="plannedEndDate" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('backlog.percentComplete')} field="percentComplete" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} style={{ width: '80px' }} />
                <SortableHeader label={t('backlog.weight')} field="weight" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} style={{ width: '70px' }} />
                <SortableHeader label={t('backlog.status')} field="checked" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {backlogs.map((backlog) => (
                <>
                  <motion.tr key={backlog.id} variants={tableRowVariants}>
                    {/* Checkbox */}
                    <td>
                      <button
                        className="btn btn-icon"
                        onClick={() => handleToggleCheck(backlog)}
                        style={{ padding: '2px' }}
                      >
                        {backlog.checked ? (
                          <CheckSquare size={18} color="var(--color-success)" />
                        ) : (
                          <Square size={18} color="var(--color-secondary-text)" />
                        )}
                      </button>
                    </td>

                    {/* Task name + expand toggle */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="btn btn-icon"
                          onClick={() => handleToggleExpand(backlog.id)}
                          style={{ padding: '2px', flexShrink: 0 }}
                        >
                          {expandedBacklog === backlog.id ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </button>
                        <span
                          style={{
                            fontWeight: 500,
                            textDecoration: backlog.checked ? 'line-through' : 'none',
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

                    {/* Quantity */}
                    <td>{backlog.quantity != null ? backlog.quantity : '-'}</td>

                    {/* Unity */}
                    <td>{backlog.unityName || '-'}</td>

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

                    {/* Weight */}
                    <td style={{ fontSize: '13px' }}>
                      {backlog.weight != null ? backlog.weight : '-'}
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
                  </motion.tr>

                  {/* Subtask expansion row */}
                  {expandedBacklog === backlog.id && (
                    <tr key={`subtasks-${backlog.id}`}>
                      <td colSpan={12} style={{ padding: 0 }}>
                        <SubtaskPanel
                          backlogId={backlog.id}
                          subtasks={subtasksMap[backlog.id] ?? null}
                          loading={subtasksLoading}
                          newSubtaskName={newSubtaskName}
                          saving={subtaskSaving}
                          onNewSubtaskNameChange={setNewSubtaskName}
                          onAddSubtask={handleAddSubtask}
                          t={t}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </motion.tbody>
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
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', maxHeight: '80vh', padding: '24px' }}
          >
            <h3 style={{ marginBottom: '16px' }}>{t('backlog.addFromList')}</h3>
            <div style={{ maxHeight: '400px', overflow: 'auto', marginBottom: '16px' }}>
              {availableTasks.length === 0 ? (
                <p style={{ color: 'var(--color-secondary-text)', textAlign: 'center', padding: '24px' }}>
                  {t('common.noData')}
                </p>
              ) : (
                availableTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskSelection(task.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: `1px solid ${selectedTaskIds.includes(task.id) ? 'var(--color-primary)' : 'var(--color-alternate)'}`,
                      backgroundColor: selectedTaskIds.includes(task.id)
                        ? 'var(--color-tertiary-bg)'
                        : 'transparent',
                      marginBottom: '8px',
                    }}
                  >
                    {selectedTaskIds.includes(task.id) ? (
                      <CheckSquare size={18} color="var(--color-primary)" />
                    ) : (
                      <Square size={18} color="var(--color-secondary-text)" />
                    )}
                    <div>
                      <span style={{ fontWeight: 500, fontSize: '13px' }}>{task.name}</span>
                      {task.description && (
                        <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', margin: 0 }}>
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                {selectedTaskIds.length} {t('backlog.selected')}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  {t('common.cancel')}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddTasksFromList}
                  disabled={modalLoading || selectedTaskIds.length === 0}
                >
                  {modalLoading ? <span className="spinner" /> : t('backlog.addSelected')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <label>{t('backlog.quantity')}</label>
                <input
                  type="number"
                  className="input-field"
                  value={manualQuantity}
                  onChange={(e) => setManualQuantity(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>{t('backlog.unity')}</label>
                <SearchableSelect
                  options={unities.map((u) => ({ value: u.id, label: u.unity || u.name || '' }))}
                  value={manualUnityId || undefined}
                  onChange={(value) => setManualUnityId(value ? String(value) : '')}
                  placeholder={t('backlog.selectUnity')}
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

              {/* Quantity */}
              <div className="input-group">
                <label>{t('backlog.quantity')}</label>
                <input
                  type="number"
                  className="input-field"
                  value={editForm.quantity}
                  onChange={(e) => handleEditFormChange('quantity', e.target.value)}
                />
              </div>

              {/* Weight */}
              <div className="input-group">
                <label>{t('backlog.weight')}</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={editForm.weight}
                  onChange={(e) => handleEditFormChange('weight', e.target.value)}
                />
              </div>

              {/* Unity */}
              <div className="input-group">
                <label>{t('backlog.unity')}</label>
                <SearchableSelect
                  options={unities.map((u) => ({ value: u.id, label: u.unity || u.name || '' }))}
                  value={editForm.unity_id || undefined}
                  onChange={(value) => handleEditFormChange('unity_id', value ? String(value) : '')}
                  placeholder={t('backlog.selectUnity')}
                  searchPlaceholder={t('common.search')}
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
                  {t('common.planning') || 'Planning'}
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
                  {t('common.costs') || 'Costs'}
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
  newSubtaskName: string;
  saving: boolean;
  onNewSubtaskNameChange: (value: string) => void;
  onAddSubtask: () => void;
  t: (key: string) => string;
}

function SubtaskPanel({
  subtasks,
  loading,
  newSubtaskName,
  saving,
  onNewSubtaskNameChange,
  onAddSubtask,
  t,
}: SubtaskPanelProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onAddSubtask();
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-tertiary-bg)',
        borderTop: '1px solid var(--color-alternate)',
        padding: '12px 24px 16px 56px',
      }}
    >
      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {t('backlog.subtasks')}
      </p>

      {loading || subtasks === null ? (
        <div style={{ padding: '8px 0' }}>
          <span className="spinner" style={{ width: '16px', height: '16px' }} />
        </div>
      ) : subtasks.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '10px' }}>
          {t('backlog.noSubtasks')}
        </p>
      ) : (
        <table style={{ width: '100%', marginBottom: '10px', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--color-secondary-text)', fontWeight: 500 }}>
                {t('backlog.taskName')}
              </th>
              <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--color-secondary-text)', fontWeight: 500, width: '100px' }}>
                {t('backlog.quantity')}
              </th>
              <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--color-secondary-text)', fontWeight: 500, width: '120px' }}>
                {t('backlog.status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {subtasks.map((subtask) => (
              <tr key={subtask.id} style={{ borderTop: '1px solid var(--color-alternate)' }}>
                <td style={{ padding: '6px 8px' }}>{subtask.name}</td>
                <td style={{ padding: '6px 8px' }}>
                  {subtask.quantity != null ? subtask.quantity : '-'}
                </td>
                <td style={{ padding: '6px 8px' }}>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: subtask.status ? 'var(--color-status-04)' : 'var(--color-status-02)',
                      color: subtask.status ? 'var(--color-success)' : 'var(--color-warning)',
                    }}
                  >
                    {subtask.status ? t('backlog.completed') : t('backlog.pending')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add subtask inline form */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', maxWidth: '480px' }}>
        <input
          type="text"
          className="input-field"
          placeholder={t('backlog.addSubtask')}
          value={newSubtaskName}
          onChange={(e) => onNewSubtaskNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, fontSize: '13px' }}
        />
        <button
          className="btn btn-primary"
          onClick={onAddSubtask}
          disabled={saving || !newSubtaskName.trim()}
          style={{ whiteSpace: 'nowrap', fontSize: '13px' }}
        >
          {saving ? <span className="spinner" /> : <><Plus size={14} /> {t('backlog.addSubtask')}</>}
        </button>
      </div>
    </div>
  );
}

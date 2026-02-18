import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

// ─── Status ID constants ───────────────────────────────────────────────────────
const STATUS_PENDING = 1;
const STATUS_IN_PROGRESS = 2;
const STATUS_DONE = 3;
const STATUS_FAILED = 4;
const STATUS_INSPECTION = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTaskDisplayName(task: SprintTask): string {
  return (
    task.projectsBacklogs?.tasksTemplate?.description ||
    task.projectsBacklogs?.description ||
    task.taskName ||
    `Task #${task.id}`
  );
}

function formatDateShort(dateString?: string): string {
  if (!dateString) return '—';
  try {
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CurrentSprint() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projectsInfo } = useAppState();

  const sprintId = parseInt(searchParams.get('sprintId') || '0', 10);

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

  // Modal: add task
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [addTaskBacklogId, setAddTaskBacklogId] = useState<number | ''>('');
  const [addTaskTeamId, setAddTaskTeamId] = useState<number | ''>('');
  const [addTaskScheduledFor, setAddTaskScheduledFor] = useState('');
  const [addTaskLoading, setAddTaskLoading] = useState(false);
  const [addTaskError, setAddTaskError] = useState('');

  // Modal: task details
  const [detailTask, setDetailTask] = useState<SprintTask | null>(null);

  // Modal: failure reason
  const [failureTask, setFailureTask] = useState<SprintTask | null>(null);
  const [failureReasonId, setFailureReasonId] = useState<number | ''>('');
  const [failureObservation, setFailureObservation] = useState('');
  const [failureLoading, setFailureLoading] = useState(false);
  const [failureError, setFailureError] = useState('');

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
      setTeams(teamsRes.items ?? []);
      setBacklogs(Array.isArray(backlogsRes) ? backlogsRes : []);
    } catch (err) {
      console.error('Failed to load support data:', err);
    }
  }, [projectsInfo]);

  // ── Task transitions ─────────────────────────────────────────────────────────

  const handleMoveToInProgress = async (task: SprintTask) => {
    setTransitionLoading(task.id);
    try {
      await sprintsApi.editStatusTask(task.id, { sprints_tasks_statuses_id: STATUS_IN_PROGRESS });
      await loadSprintData();
    } catch (err) {
      console.error('Failed to move task to in-progress:', err);
    } finally {
      setTransitionLoading(null);
    }
  };

  const handleMoveToDone = async (task: SprintTask) => {
    setTransitionLoading(task.id);
    try {
      await sprintsApi.editStatusTask(task.id, { sprints_tasks_statuses_id: STATUS_DONE });
      await loadSprintData();
    } catch (err) {
      console.error('Failed to move task to done:', err);
    } finally {
      setTransitionLoading(null);
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
      });
      setFailureTask(null);
      await loadSprintData();
    } catch (err) {
      console.error('Failed to mark task as failed:', err);
    } finally {
      setFailureLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────

  const handleDeleteTask = async (taskId: number) => {
    try {
      await sprintsApi.deleteSprintTask(taskId);
      await loadSprintData();
    } catch (err) {
      console.error('Failed to delete sprint task:', err);
    }
    setDeleteConfirm(null);
  };

  // ── Add task ─────────────────────────────────────────────────────────────────

  const handleOpenAddTask = () => {
    setAddTaskBacklogId('');
    setAddTaskTeamId('');
    setAddTaskScheduledFor('');
    setAddTaskError('');
    setShowAddTaskModal(true);
  };

  const handleAddTask = async () => {
    if (!addTaskBacklogId) {
      setAddTaskError(t('sprints.selectBacklogItem'));
      return;
    }
    setAddTaskLoading(true);
    try {
      await sprintsApi.addSprintTask({
        sprints_id: sprintId,
        projects_backlogs_id: Number(addTaskBacklogId),
        teams_id: addTaskTeamId ? Number(addTaskTeamId) : undefined,
        scheduled_for: addTaskScheduledFor || undefined,
      });
      setShowAddTaskModal(false);
      await loadSprintData();
    } catch (err) {
      console.error('Failed to add sprint task:', err);
      setAddTaskError(t('common.error'));
    } finally {
      setAddTaskLoading(false);
    }
  };

  // ── Derived stats ────────────────────────────────────────────────────────────

  const totalTasks = pendentes.length + emAndamento.length + concluidas.length + semSucesso.length + inspecao.length;
  const completionPct = totalTasks > 0 ? Math.round((concluidas.length / totalTasks) * 100) : 0;

  // Backlogs not yet added to sprint
  const availableBacklogs = backlogs.filter((b) => !b.sprintAdded);

  if (loading) return <LoadingSpinner fullPage />;

  const sprintName = sprint?.name || `Sprint #${sprintId}`;

  return (
    <div>
      <PageHeader
        title={sprintName}
        subtitle={t('sprints.currentSprintSubtitle')}
        breadcrumb={`${t('projects.title')} / ${projectsInfo?.name || ''} / ${t('sprints.title')} / ${sprintName}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/sprints')}>
              <ArrowLeft size={18} /> {t('common.back')}
            </button>
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
            onDelete={(id) => setDeleteConfirm(id)}
            onViewDetail={(task) => setDetailTask(task)}
            transitionLoading={transitionLoading}
          />

          <KanbanColumn
            title={t('sprints.taskDone')}
            tasks={concluidas}
            color="var(--color-success)"
            icon={<CheckCircle size={16} />}
            emptyLabel={t('sprints.noTasks')}
            onDelete={(id) => setDeleteConfirm(id)}
            onViewDetail={(task) => setDetailTask(task)}
            transitionLoading={transitionLoading}
          />

          <KanbanColumn
            title={t('sprints.taskFailed')}
            tasks={semSucesso}
            color="var(--color-error)"
            icon={<XCircle size={16} />}
            emptyLabel={t('sprints.noTasks')}
            onDelete={(id) => setDeleteConfirm(id)}
            onViewDetail={(task) => setDetailTask(task)}
            transitionLoading={transitionLoading}
          />
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowAddTaskModal(false)}
        >
          <div
            className="modal-content"
            style={{ width: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
              {t('sprints.addTask')}
            </h3>

            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                {t('sprints.selectBacklogItem')} *
              </label>
              <SearchableSelect
                options={availableBacklogs.map((b) => ({ value: b.id, label: b.taskName || b.name || b.description || `Backlog #${b.id}` }))}
                value={addTaskBacklogId || undefined}
                onChange={(value) => setAddTaskBacklogId(value ? Number(value) : '')}
                placeholder={t('sprints.selectBacklogItem')}
                searchPlaceholder={t('common.search')}
              />
            </div>

            <div className="input-group" style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
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

            <div className="input-group" style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                {t('sprints.scheduledFor')}
              </label>
              <input
                type="date"
                className="input-field"
                value={addTaskScheduledFor}
                onChange={(e) => setAddTaskScheduledFor(e.target.value)}
              />
            </div>

            {addTaskError && (
              <p style={{ fontSize: '13px', color: 'var(--color-error)', marginTop: '8px' }}>
                {addTaskError}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
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
                disabled={addTaskLoading}
              >
                {addTaskLoading ? (
                  <span className="spinner" style={{ width: '14px', height: '14px' }} />
                ) : (
                  t('common.save')
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
  onDelete: (id: number) => void;
  onViewDetail: (task: SprintTask) => void;
  transitionLoading: number | null;
  renderActions?: (task: SprintTask) => React.ReactNode;
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
}: KanbanColumnProps) {
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
        }}
      >
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
  onDelete: (id: number) => void;
  onViewDetail: (task: SprintTask) => void;
  renderActions?: (task: SprintTask) => React.ReactNode;
}

function TaskCard({ task, onDelete, onViewDetail, renderActions }: TaskCardProps) {
  const { t } = useTranslation();
  const taskName = getTaskDisplayName(task);
  const discipline = task.projectsBacklogs?.discipline?.name;
  const unity = task.projectsBacklogs?.unity?.name;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-secondary-bg)',
        borderRadius: '8px',
        padding: '10px 12px',
        border: '1px solid var(--color-alternate)',
      }}
    >
      {/* Task name + delete */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            lineHeight: 1.3,
            flex: 1,
            wordBreak: 'break-word',
          }}
        >
          {taskName}
        </span>
        <button
          className="btn btn-icon"
          onClick={() => onDelete(task.id)}
          style={{ flexShrink: 0, marginTop: '-2px' }}
          title={t('common.delete')}
        >
          <Trash2 size={12} color="var(--color-error)" />
        </button>
      </div>

      {/* Discipline / unity */}
      {(discipline || unity) && (
        <p style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
          {[discipline, unity].filter(Boolean).join(' · ')}
        </p>
      )}

      {/* Team badge */}
      {task.teams?.name && (
        <div style={{ marginTop: '6px' }}>
          <span
            className="badge"
            style={{
              backgroundColor: 'rgba(79,70,229,0.12)',
              color: 'var(--color-primary)',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '8px',
              fontWeight: 500,
            }}
          >
            {task.teams.name}
          </span>
        </div>
      )}

      {/* Scheduled date */}
      {task.scheduledFor && (
        <p style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
          <Clock size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
          {formatDateShort(task.scheduledFor)}
        </p>
      )}

      {/* Criticality badge */}
      {task.criticality && (
        <div style={{ marginTop: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '8px',
              fontWeight: 500,
              ...getCriticalityStyle(task.criticality),
            }}
          >
            {getCriticalityLabel(task.criticality, t)}
          </span>
        </div>
      )}

      {/* Failed reason */}
      {task.nonExecutionReason && (
        <p
          style={{
            fontSize: '11px',
            color: 'var(--color-error)',
            marginTop: '4px',
            fontStyle: 'italic',
          }}
        >
          {task.nonExecutionReason.name}
        </p>
      )}

      {/* Footer: details + actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '8px',
          gap: '6px',
          flexWrap: 'wrap',
        }}
      >
        <button
          className="btn btn-secondary"
          style={{ fontSize: '12px', padding: '3px 10px' }}
          onClick={() => onViewDetail(task)}
        >
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
}

function TaskDetailsModal({ task, onClose, t }: TaskDetailsModalProps) {
  const taskName = getTaskDisplayName(task);
  const backlog = task.projectsBacklogs;
  const isFailed = task.sprintsTasksStatusesId === STATUS_FAILED;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: '560px', maxHeight: '80vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
          {t('sprints.taskDetails')}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--color-secondary-text)', marginBottom: '20px' }}>
          {taskName}
        </p>

        {/* Backlog info section */}
        {backlog && (
          <Section title="Backlog">
            <DetailRow label={t('sprints.taskDetails')} value={taskName} />
            {backlog.discipline?.name && (
              <DetailRow label="Disciplina" value={backlog.discipline.name} />
            )}
            {backlog.unity?.name && (
              <DetailRow label="Unidade" value={backlog.unity.name} />
            )}
            {backlog.weight != null && (
              <DetailRow label="Peso" value={String(backlog.weight)} />
            )}
            {backlog.quantity != null && (
              <DetailRow label="Quantidade" value={String(backlog.quantity)} />
            )}
          </Section>
        )}

        {/* Task info section */}
        <Section title={t('sprints.status')}>
          {task.sprints_tasks_statuses?.name && (
            <DetailRow label={t('sprints.status')} value={task.sprints_tasks_statuses.name} />
          )}
          {task.teams?.name && (
            <DetailRow label={t('sprints.team')} value={task.teams.name} />
          )}
          {task.assignedUser?.name && (
            <DetailRow label={t('sprints.assignedUser')} value={task.assignedUser.name} />
          )}
          {task.criticality && (
            <DetailRow
              label={t('sprints.criticality')}
              value={getCriticalityLabel(task.criticality, t)}
            />
          )}
          {task.quantityDone != null && (
            <DetailRow label={t('sprints.quantityDone')} value={String(task.quantityDone)} />
          )}
        </Section>

        {/* Dates section */}
        <Section title="Datas">
          <DetailRow label={t('sprints.scheduledFor')} value={formatDateShort(task.scheduledFor)} />
          <DetailRow label={t('sprints.executedAt')} value={formatDateTime(task.executedAt)} />
          <DetailRow label={t('sprints.actualStartTime')} value={formatDateTime(task.actualStartTime)} />
          <DetailRow label={t('sprints.actualEndTime')} value={formatDateTime(task.actualEndTime)} />
        </Section>

        {/* Failure section */}
        {isFailed && (
          <Section title={t('sprints.failureReason')}>
            {task.nonExecutionReason?.name && (
              <DetailRow label={t('sprints.nonExecutionReason')} value={task.nonExecutionReason.name} />
            )}
            {task.nonExecutionObservations && (
              <DetailRow label={t('sprints.nonExecutionObs')} value={task.nonExecutionObservations} />
            )}
          </Section>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            {t('common.close')}
          </button>
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

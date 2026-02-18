import { useState, useEffect, useCallback, useMemo } from 'react';
import { planningApi } from '../../services';
import type { GanttItem, CriticalPathData } from '../../types';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { ChevronRight, ChevronDown, Flag } from 'lucide-react';

interface GanttChartProps {
  projectsId: number;
  sprintsId?: number;
  baselineData?: GanttItem[];
  onTaskDateChange?: (id: number, start: Date, end: Date) => void;
  onProgressChange?: (id: number, progress: number) => void;
  readOnly?: boolean;
  viewMode?: 'day' | 'week' | 'month';
}

interface GanttRow extends GanttItem {
  level: number;
  isExpanded: boolean;
  hasChildren: boolean;
  isVisible: boolean;
  isCritical: boolean;
}

const ONE_DAY_MS = 86400000;

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatDateLabel(date: Date, viewMode: 'day' | 'week' | 'month'): string {
  if (viewMode === 'month') {
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  }
  if (viewMode === 'week') {
    return `Sem ${getWeekNumber(date)}/${date.getFullYear().toString().slice(-2)}`;
  }
  return formatDateShort(date);
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  return Math.ceil(diff / (ONE_DAY_MS * 7)) + 1;
}

function buildTimeline(
  tasks: GanttItem[],
  viewMode: 'day' | 'week' | 'month',
): { label: string; start: Date; end: Date }[] {
  const validDates = tasks.flatMap((t) =>
    [t.planned_start_date, t.planned_end_date, t.actual_start_date, t.actual_end_date]
      .map((d) => parseDate(d ?? undefined))
      .filter((d): d is Date => d !== null),
  );

  if (validDates.length === 0) {
    const now = new Date();
    validDates.push(now, new Date(now.getTime() + 30 * ONE_DAY_MS));
  }

  const minDate = new Date(Math.min(...validDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...validDates.map((d) => d.getTime())));

  // Pad by a small buffer
  minDate.setDate(minDate.getDate() - 3);
  maxDate.setDate(maxDate.getDate() + 7);

  const columns: { label: string; start: Date; end: Date }[] = [];
  const cursor = new Date(minDate);

  if (viewMode === 'day') {
    while (cursor <= maxDate) {
      const start = new Date(cursor);
      cursor.setDate(cursor.getDate() + 1);
      const end = new Date(cursor);
      columns.push({ label: formatDateShort(start), start, end });
    }
  } else if (viewMode === 'week') {
    // Align to Monday
    const dayOffset = (cursor.getDay() + 6) % 7;
    cursor.setDate(cursor.getDate() - dayOffset);
    while (cursor <= maxDate) {
      const start = new Date(cursor);
      cursor.setDate(cursor.getDate() + 7);
      const end = new Date(cursor);
      columns.push({ label: formatDateLabel(start, 'week'), start, end });
    }
  } else {
    // month
    cursor.setDate(1);
    while (cursor <= maxDate) {
      const start = new Date(cursor);
      const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      const end = new Date(nextMonth);
      columns.push({ label: formatDateLabel(start, 'month'), start, end });
      cursor.setFullYear(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
    }
  }

  return columns;
}

function getBarPosition(
  start: string | undefined,
  end: string | undefined,
  timelineStart: Date,
  timelineEnd: Date,
): { left: string; width: string } | null {
  const s = parseDate(start);
  const e = parseDate(end);
  if (!s || !e) return null;

  const totalMs = timelineEnd.getTime() - timelineStart.getTime();
  if (totalMs <= 0) return null;

  const barLeft = Math.max(0, (s.getTime() - timelineStart.getTime()) / totalMs) * 100;
  const barRight = Math.min(100, (e.getTime() - timelineStart.getTime()) / totalMs) * 100;
  const barWidth = Math.max(0.5, barRight - barLeft);

  return {
    left: `${barLeft.toFixed(2)}%`,
    width: `${barWidth.toFixed(2)}%`,
  };
}

export default function GanttChart({
  projectsId,
  sprintsId,
  readOnly = false,
  viewMode = 'week',
}: GanttChartProps) {
  const [tasks, setTasks] = useState<GanttItem[]>([]);
  const [criticalPath, setCriticalPath] = useState<CriticalPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeViewMode, setActiveViewMode] = useState<'day' | 'week' | 'month'>(viewMode);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ganttData, criticalData] = await Promise.all([
        planningApi.getGanttData({ projects_id: projectsId, sprints_id: sprintsId }),
        planningApi.getCriticalPath({ projects_id: projectsId }).catch(() => null),
      ]);
      setTasks(Array.isArray(ganttData) ? ganttData : []);
      setCriticalPath(criticalData);
      // Expand top-level tasks by default
      const topIds = new Set<number>();
      if (Array.isArray(ganttData)) {
        ganttData.slice(0, 10).forEach((t) => topIds.add(t.id));
      }
      setExpandedIds(topIds);
    } catch {
      setError('Erro ao carregar dados do Gantt.');
    } finally {
      setLoading(false);
    }
  }, [projectsId, sprintsId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const criticalSet = useMemo(
    () => new Set(criticalPath?.critical_tasks ?? []),
    [criticalPath],
  );

  const timeline = useMemo(
    () => buildTimeline(tasks, activeViewMode),
    [tasks, activeViewMode],
  );

  const timelineStart = timeline[0]?.start ?? new Date();
  const timelineEnd = timeline[timeline.length - 1]?.end ?? new Date();

  const rows = useMemo<GanttRow[]>(() => {
    return tasks.map((task) => ({
      ...task,
      level: 0,
      isExpanded: expandedIds.has(task.id),
      hasChildren: false,
      isVisible: true,
      isCritical: criticalSet.has(task.id),
    }));
  }, [tasks, expandedIds, criticalSet]);

  const handleProgressChange = useCallback(
    async (taskId: number, newPercent: number) => {
      if (readOnly) return;
      try {
        await planningApi.updateBacklogPlanning(taskId, { percent_complete: newPercent });
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, percent_complete: newPercent } : t,
          ),
        );
      } catch {
        // Silently ignore — optimistic update remains visible
      }
    },
    [readOnly],
  );

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--color-error)',
          fontSize: '14px',
        }}
      >
        {error}
      </div>
    );
  }
  if (tasks.length === 0) {
    return (
      <EmptyState message="Nenhuma tarefa com datas de planejamento encontrada. Importe o cronograma para visualizar o Gantt." />
    );
  }

  const LABEL_COLUMN_WIDTH = 260;
  const COL_WIDTH_PX = activeViewMode === 'day' ? 40 : activeViewMode === 'week' ? 80 : 100;
  const totalChartWidth = timeline.length * COL_WIDTH_PX;

  const VIEW_MODE_LABELS: Record<'day' | 'week' | 'month', string> = {
    day: 'Dia',
    week: 'Semana',
    month: 'Mês',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-secondary-text)', flexWrap: 'wrap' }}>
            <LegendDot color="#3b82f6" label="Planejado" />
            <LegendDot color="#22c55e" label="Realizado" />
            <LegendDot color="#ef4444" label="Caminho crítico" />
            <LegendDot color="rgba(234,179,8,0.7)" label="Marco" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['day', 'week', 'month'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveViewMode(mode)}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 500,
                border: '1px solid var(--color-alternate)',
                borderRadius: '6px',
                cursor: 'pointer',
                background:
                  activeViewMode === mode
                    ? 'var(--color-primary)'
                    : 'transparent',
                color:
                  activeViewMode === mode
                    ? 'white'
                    : 'var(--color-secondary-text)',
              }}
            >
              {VIEW_MODE_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>

      {/* Gantt Grid */}
      <div
        style={{
          overflowX: 'auto',
          border: '1px solid var(--color-alternate)',
          borderRadius: '8px',
          maxHeight: '540px',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', minWidth: `${LABEL_COLUMN_WIDTH + totalChartWidth}px` }}>
          {/* Left: Task names column */}
          <div
            style={{
              width: `${LABEL_COLUMN_WIDTH}px`,
              minWidth: `${LABEL_COLUMN_WIDTH}px`,
              flexShrink: 0,
              borderRight: '1px solid var(--color-alternate)',
            }}
          >
            {/* Header */}
            <div
              style={{
                height: '40px',
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 600,
                fontSize: '12px',
                borderBottom: '1px solid var(--color-alternate)',
                background: 'var(--color-tertiary-bg)',
                color: 'var(--color-secondary-text)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Tarefa / WBS
            </div>
            {/* Rows */}
            {rows.map((row) => (
              <div
                key={row.id}
                style={{
                  height: '36px',
                  padding: '0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderBottom: '1px solid var(--color-alternate)',
                  fontSize: '13px',
                  paddingLeft: `${8 + row.level * 16}px`,
                  background: row.isCritical
                    ? 'rgba(239,68,68,0.04)'
                    : 'transparent',
                }}
              >
                {row.hasChildren ? (
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      color: 'var(--color-secondary-text)',
                      flexShrink: 0,
                    }}
                    onClick={() => {
                      setExpandedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(row.id)) next.delete(row.id);
                        else next.add(row.id);
                        return next;
                      });
                    }}
                  >
                    {row.isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                ) : (
                  <span style={{ width: '16px', flexShrink: 0 }} />
                )}
                {row.is_milestone && (
                  <Flag size={11} color="var(--color-warning, #eab308)" style={{ flexShrink: 0 }} />
                )}
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    color: row.isCritical ? '#ef4444' : 'var(--color-text)',
                    fontWeight: row.isCritical ? 600 : 400,
                  }}
                  title={row.description ?? ''}
                >
                  {row.wbs_code ? (
                    <span style={{ color: 'var(--color-secondary-text)', marginRight: '4px', fontSize: '11px' }}>
                      {row.wbs_code}
                    </span>
                  ) : null}
                  {row.description}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-secondary-text)',
                    flexShrink: 0,
                  }}
                >
                  {row.percent_complete ?? 0}%
                </span>
              </div>
            ))}
          </div>

          {/* Right: Chart area */}
          <div style={{ flex: 1, position: 'relative' }}>
            {/* Timeline header */}
            <div
              style={{
                display: 'flex',
                height: '40px',
                borderBottom: '1px solid var(--color-alternate)',
                background: 'var(--color-tertiary-bg)',
              }}
            >
              {timeline.map((col, i) => (
                <div
                  key={i}
                  style={{
                    width: `${COL_WIDTH_PX}px`,
                    minWidth: `${COL_WIDTH_PX}px`,
                    borderRight: '1px solid var(--color-alternate)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    color: 'var(--color-secondary-text)',
                    fontWeight: 500,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </div>
              ))}
            </div>

            {/* Gantt bars */}
            {rows.map((row) => {
              const plannedPos = getBarPosition(
                row.planned_start_date ?? undefined,
                row.planned_end_date ?? undefined,
                timelineStart,
                timelineEnd,
              );
              const actualPos = getBarPosition(
                row.actual_start_date ?? undefined,
                row.actual_end_date ?? undefined,
                timelineStart,
                timelineEnd,
              );

              return (
                <div
                  key={row.id}
                  style={{
                    height: '36px',
                    borderBottom: '1px solid var(--color-alternate)',
                    position: 'relative',
                    background: row.isCritical
                      ? 'rgba(239,68,68,0.03)'
                      : 'transparent',
                  }}
                >
                  {/* Column grid lines */}
                  {timeline.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `${i * COL_WIDTH_PX}px`,
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        background: 'var(--color-alternate)',
                        opacity: 0.4,
                      }}
                    />
                  ))}

                  {/* Planned bar */}
                  {plannedPos && !row.is_milestone && (
                    <div
                      style={{
                        position: 'absolute',
                        left: plannedPos.left,
                        width: plannedPos.width,
                        top: '10px',
                        height: '8px',
                        borderRadius: '4px',
                        background: row.isCritical
                          ? 'rgba(239,68,68,0.25)'
                          : 'rgba(59,130,246,0.2)',
                        border: `1px solid ${row.isCritical ? '#ef4444' : '#3b82f6'}`,
                        overflow: 'hidden',
                      }}
                      title={`Planejado: ${row.planned_start_date ?? ''} → ${row.planned_end_date ?? ''}`}
                    >
                      {/* Progress fill */}
                      <div
                        style={{
                          height: '100%',
                          width: `${row.percent_complete ?? 0}%`,
                          background: row.isCritical ? '#ef4444' : '#3b82f6',
                          borderRadius: '3px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  )}

                  {/* Milestone diamond */}
                  {plannedPos && row.is_milestone && (
                    <div
                      style={{
                        position: 'absolute',
                        left: plannedPos.left,
                        top: '9px',
                        width: '14px',
                        height: '14px',
                        background: '#eab308',
                        transform: 'rotate(45deg)',
                        borderRadius: '2px',
                      }}
                      title={`Marco: ${row.planned_end_date ?? ''}`}
                    />
                  )}

                  {/* Actual bar */}
                  {actualPos && !row.is_milestone && (
                    <div
                      style={{
                        position: 'absolute',
                        left: actualPos.left,
                        width: actualPos.width,
                        top: '20px',
                        height: '6px',
                        borderRadius: '3px',
                        background: '#22c55e',
                        opacity: 0.85,
                      }}
                      title={`Realizado: ${row.actual_start_date ?? ''} → ${row.actual_end_date ?? ''}`}
                    />
                  )}

                  {/* Progress edit (not readOnly) */}
                  {!readOnly && plannedPos && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={row.percent_complete ?? 0}
                        style={{ width: '60px', accentColor: '#3b82f6', cursor: 'pointer' }}
                        onChange={(e) =>
                          handleProgressChange(row.id, Number(e.target.value))
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {criticalPath && (
        <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
          Caminho crítico: {criticalPath.critical_tasks.length} tarefas | Duração total: {criticalPath.total_duration} dias
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '2px',
          background: color,
          flexShrink: 0,
        }}
      />
      <span>{label}</span>
    </div>
  );
}

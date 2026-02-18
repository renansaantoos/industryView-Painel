import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../contexts/AppStateContext';
import { planningApi } from '../../services';
import type { ScheduleHealthData, CurveSData, ScheduleBaseline, GanttItem } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import GanttChart from '../../components/common/GanttChart';
import CurveSChart from '../../components/common/CurveSChart';
import {
  GanttChartSquare,
  GitBranch,
  BarChart2,
  Activity,
  Upload,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Flag,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';

type ActiveTab = 'gantt' | 'wbs' | 'curvas' | 'indicadores';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '20px',
};

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(1)}%`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function SpiIndicator({ spi }: { spi: number | null }) {
  if (spi === null) return <span style={{ color: 'var(--color-secondary-text)' }}>N/A</span>;

  const color = spi >= 1 ? '#22c55e' : spi >= 0.9 ? '#eab308' : '#ef4444';
  const label = spi >= 1 ? 'No prazo' : spi >= 0.9 ? 'Atenção' : 'Atrasado';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
      <span style={{ fontSize: '28px', fontWeight: 700, color }}>{spi.toFixed(2)}</span>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '12px',
          background: `${color}1a`,
          border: `1px solid ${color}`,
          color,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color = 'var(--color-primary)',
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}) {
  return (
    <div style={CARD_STYLE}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: `${color}1a`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '26px', fontWeight: 700, color, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>{label}</div>
      {subtitle && (
        <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '4px', opacity: 0.7 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ planned, actual }: { planned: number; actual: number }) {
  const variance = actual - planned;
  const barColor = variance >= 0 ? '#22c55e' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Planned */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: 'var(--color-secondary-text)' }}>
          <span>Planejado</span>
          <span style={{ fontWeight: 600, color: '#3b82f6' }}>{formatPercent(planned)}</span>
        </div>
        <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, planned)}%`,
              background: '#3b82f6',
              borderRadius: '4px',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>
      {/* Actual */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: 'var(--color-secondary-text)' }}>
          <span>Realizado</span>
          <span style={{ fontWeight: 600, color: barColor }}>{formatPercent(actual)}</span>
        </div>
        <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, actual)}%`,
              background: barColor,
              borderRadius: '4px',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>
      {/* Variance */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
        {variance > 0 ? (
          <TrendingUp size={13} color="#22c55e" />
        ) : variance < 0 ? (
          <TrendingDown size={13} color="#ef4444" />
        ) : (
          <Minus size={13} color="var(--color-secondary-text)" />
        )}
        <span style={{ color: barColor, fontWeight: 600 }}>
          {variance > 0 ? '+' : ''}{formatPercent(variance)} variação
        </span>
      </div>
    </div>
  );
}

// WBS tree row component
interface WbsRowProps {
  item: GanttItem;
  isCritical: boolean;
}

function WbsRow({ item, isCritical }: WbsRowProps) {
  const percentComplete = item.percent_complete ?? 0;
  const statusColor =
    percentComplete >= 100 ? '#22c55e' : percentComplete > 0 ? '#3b82f6' : 'var(--color-secondary-text)';
  const statusLabel =
    percentComplete >= 100 ? 'Concluído' : percentComplete > 0 ? 'Em andamento' : 'Não iniciado';

  return (
    <tr
      style={{
        borderBottom: '1px solid var(--color-alternate)',
        background: isCritical ? 'rgba(239,68,68,0.04)' : 'transparent',
      }}
    >
      <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--color-secondary-text)', whiteSpace: 'nowrap' }}>
        {item.wbs_code || '-'}
      </td>
      <td style={{ padding: '10px 12px', fontSize: '13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {item.is_milestone && <Flag size={12} color="#eab308" />}
          <span style={{ color: isCritical ? '#ef4444' : 'var(--color-text)', fontWeight: isCritical ? 600 : 400 }}>
            {item.description || '-'}
          </span>
        </div>
      </td>
      <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--color-secondary-text)', whiteSpace: 'nowrap' }}>
        {formatDate(item.planned_start_date)}
      </td>
      <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--color-secondary-text)', whiteSpace: 'nowrap' }}>
        {formatDate(item.planned_end_date)}
      </td>
      <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--color-secondary-text)', whiteSpace: 'nowrap' }}>
        {formatDate(item.actual_start_date)}
      </td>
      <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--color-secondary-text)', whiteSpace: 'nowrap' }}>
        {formatDate(item.actual_end_date)}
      </td>
      <td style={{ padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', minWidth: '60px' }}>
            <div
              style={{
                height: '100%',
                width: `${percentComplete}%`,
                background: statusColor,
                borderRadius: '3px',
              }}
            />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: statusColor, minWidth: '30px' }}>
            {percentComplete}%
          </span>
        </div>
      </td>
      <td style={{ padding: '10px 12px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '12px',
            background: `${statusColor}1a`,
            color: statusColor,
            border: `1px solid ${statusColor}`,
            whiteSpace: 'nowrap',
          }}
        >
          {statusLabel}
        </span>
      </td>
    </tr>
  );
}

export default function CronogramaView() {
  const navigate = useNavigate();
  const { projectsInfo, setNavBarSelection } = useAppState();

  useEffect(() => {
    setNavBarSelection(31);
  }, []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('gantt');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [health, setHealth] = useState<ScheduleHealthData | null>(null);
  const [rollupLoading, setRollupLoading] = useState(false);

  // WBS tab
  const [wbsItems, setWbsItems] = useState<GanttItem[]>([]);
  const [wbsLoading, setWbsLoading] = useState(false);
  const [criticalIds, setCriticalIds] = useState<Set<number>>(new Set());

  // Curva S tab
  const [baselines, setBaselines] = useState<ScheduleBaseline[]>([]);
  const [baselinesLoading, setBaselinesLoading] = useState(false);
  const [selectedBaselineId, setSelectedBaselineId] = useState<number | null>(null);
  const [curveData, setCurveData] = useState<CurveSData[]>([]);
  const [curveLoading, setCurveLoading] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadHealth = useCallback(async () => {
    if (!projectsInfo) return;
    setHealthLoading(true);
    try {
      const data = await planningApi.getScheduleHealth({ projects_id: projectsInfo.id });
      setHealth(data);
    } catch {
      // Health is non-critical; fail silently
    } finally {
      setHealthLoading(false);
    }
  }, [projectsInfo]);

  const loadWbs = useCallback(async () => {
    if (!projectsInfo) return;
    setWbsLoading(true);
    try {
      const [ganttData, criticalData] = await Promise.all([
        planningApi.getGanttData({ projects_id: projectsInfo.id }),
        planningApi.getCriticalPath({ projects_id: projectsInfo.id }).catch(() => null),
      ]);
      setWbsItems(Array.isArray(ganttData) ? ganttData : []);
      if (criticalData) {
        setCriticalIds(new Set(criticalData.critical_tasks));
      }
    } catch {
      showToast('Erro ao carregar árvore WBS', 'error');
    } finally {
      setWbsLoading(false);
    }
  }, [projectsInfo, showToast]);

  const loadBaselines = useCallback(async () => {
    if (!projectsInfo) return;
    setBaselinesLoading(true);
    try {
      const data = await planningApi.listBaselines({ projects_id: projectsInfo.id });
      const list = Array.isArray(data) ? data : [];
      setBaselines(list);
      if (list.length > 0 && selectedBaselineId === null) {
        setSelectedBaselineId(list[0].id);
      }
    } catch {
      showToast('Erro ao carregar baselines', 'error');
    } finally {
      setBaselinesLoading(false);
    }
  }, [projectsInfo, selectedBaselineId, showToast]);

  const loadCurveS = useCallback(async (baselineId: number) => {
    if (!projectsInfo) return;
    setCurveLoading(true);
    setCurveData([]);
    try {
      const data = await planningApi.getCurveS(baselineId, { projects_id: projectsInfo.id });
      setCurveData(Array.isArray(data) ? data : []);
    } catch {
      showToast('Erro ao carregar dados da Curva S', 'error');
    } finally {
      setCurveLoading(false);
    }
  }, [projectsInfo, showToast]);

  // Load health on mount
  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  // Load tab-specific data
  useEffect(() => {
    if (activeTab === 'wbs') loadWbs();
    if (activeTab === 'curvas') loadBaselines();
  }, [activeTab, loadWbs, loadBaselines]);

  // Load curve data when baseline is selected
  useEffect(() => {
    if (activeTab === 'curvas' && selectedBaselineId !== null) {
      loadCurveS(selectedBaselineId);
    }
  }, [selectedBaselineId, activeTab, loadCurveS]);

  const handleRollup = async () => {
    if (!projectsInfo) return;
    setRollupLoading(true);
    try {
      await planningApi.triggerProjectRollup(projectsInfo.id);
      showToast('Progresso recalculado com sucesso!', 'success');
      loadHealth();
    } catch {
      showToast('Erro ao recalcular progresso', 'error');
    } finally {
      setRollupLoading(false);
    }
  };

  const tabStyle = (tab: ActiveTab): React.CSSProperties => ({
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-secondary-text)',
    borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
    marginBottom: '-2px',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    whiteSpace: 'nowrap',
  });

  if (!projectsInfo) {
    return (
      <div>
        <PageHeader
          title="Cronograma"
          subtitle="Gerencie e visualize o cronograma do projeto"
          breadcrumb="Cronograma"
        />
        <EmptyState message="Selecione um projeto para visualizar o cronograma." />
      </div>
    );
  }

  // ── Pie chart data for status distribution ────────────────────────────────
  const pieData = health
    ? [
        { name: 'Concluídas', value: health.completed_tasks, color: '#22c55e' },
        { name: 'Em andamento', value: health.in_progress_tasks, color: '#3b82f6' },
        { name: 'Não iniciadas', value: health.not_started_tasks, color: 'rgba(148,163,184,0.5)' },
      ].filter((d) => d.value > 0)
    : [];

  const spiGaugeData = health?.spi
    ? [{ name: 'SPI', value: Math.min(100, health.spi * 100), fill: health.spi >= 1 ? '#22c55e' : health.spi >= 0.9 ? '#eab308' : '#ef4444' }]
    : [];

  return (
    <div>
      <PageHeader
        title="Cronograma"
        subtitle={`Gerencie e visualize o cronograma — ${projectsInfo.name}`}
        breadcrumb="Cronograma"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={handleRollup}
              disabled={rollupLoading}
            >
              {rollupLoading ? <span className="spinner" /> : <RefreshCw size={16} />}
              Recalcular Progresso
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/import-cronograma')}>
              <Upload size={16} />
              Importar Cronograma
            </button>
          </div>
        }
      />

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 2000,
            padding: '12px 20px',
            borderRadius: '8px',
            background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: 'var(--shadow-lg)',
            maxWidth: '360px',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Summary cards */}
      {healthLoading ? (
        <div style={{ marginBottom: '24px' }}>
          <LoadingSpinner />
        </div>
      ) : health ? (
        <motion.div
          variants={staggerParent}
          initial="initial"
          animate="animate"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <motion.div variants={fadeUpChild}>
            <StatCard
              label="Progresso Geral"
              value={formatPercent(health.overall_actual_percent)}
              icon={<Activity size={18} />}
              color="#3b82f6"
              subtitle={`Planejado: ${formatPercent(health.overall_planned_percent)}`}
            />
          </motion.div>
          <motion.div variants={fadeUpChild}>
            <div style={CARD_STYLE}>
              <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                SPI — Índice de Desempenho
              </div>
              <SpiIndicator spi={health.spi} />
            </div>
          </motion.div>
          <motion.div variants={fadeUpChild}>
            <StatCard
              label="No prazo"
              value={health.on_time}
              icon={<CheckCircle2 size={18} />}
              color="#22c55e"
              subtitle={`${health.delayed} atrasadas · ${health.ahead} adiantadas`}
            />
          </motion.div>
          <motion.div variants={fadeUpChild}>
            <StatCard
              label="Total de Tarefas"
              value={health.total_tasks}
              icon={<GitBranch size={18} />}
              color="var(--color-primary)"
              subtitle={`${health.completed_tasks} concluídas · ${health.in_progress_tasks} em andamento`}
            />
          </motion.div>
          {health.upcoming_milestones.length > 0 && (
            <motion.div variants={fadeUpChild}>
              <div style={CARD_STYLE}>
                <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Próximo Marco
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {health.upcoming_milestones.slice(0, 2).map((m) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Flag size={13} color={m.is_overdue ? '#ef4444' : '#eab308'} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>
                          {m.description || m.wbs_code || `Marco #${m.id}`}
                        </div>
                        <div style={{ fontSize: '11px', color: m.is_overdue ? '#ef4444' : 'var(--color-secondary-text)' }}>
                          {formatDate(m.planned_date)}
                          {m.is_overdue && ' (vencido)'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : null}

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '2px solid var(--color-alternate)', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('gantt')} style={tabStyle('gantt')}>
          <GanttChartSquare size={16} />
          Gantt
        </button>
        <button onClick={() => setActiveTab('wbs')} style={tabStyle('wbs')}>
          <GitBranch size={16} />
          Árvore WBS
        </button>
        <button onClick={() => setActiveTab('curvas')} style={tabStyle('curvas')}>
          <BarChart2 size={16} />
          Curva S
        </button>
        <button onClick={() => setActiveTab('indicadores')} style={tabStyle('indicadores')}>
          <Activity size={16} />
          Indicadores
        </button>
      </div>

      {/* ── Tab: Gantt ─────────────────────────────────────────────────────────── */}
      {activeTab === 'gantt' && (
        <motion.div variants={fadeUpChild} initial="initial" animate="animate">
          <GanttChart projectsId={projectsInfo.id} />
        </motion.div>
      )}

      {/* ── Tab: WBS Tree ──────────────────────────────────────────────────────── */}
      {activeTab === 'wbs' && (
        <motion.div variants={fadeUpChild} initial="initial" animate="animate">
          {wbsLoading ? (
            <LoadingSpinner />
          ) : wbsItems.length === 0 ? (
            <EmptyState message="Nenhuma tarefa encontrada. Importe o cronograma para visualizar a árvore WBS." />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>WBS</th>
                    <th>Descrição</th>
                    <th style={{ width: '90px' }}>Início Plan.</th>
                    <th style={{ width: '90px' }}>Fim Plan.</th>
                    <th style={{ width: '90px' }}>Início Real</th>
                    <th style={{ width: '90px' }}>Fim Real</th>
                    <th style={{ width: '140px' }}>Progresso</th>
                    <th style={{ width: '100px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {wbsItems.map((item) => (
                    <WbsRow
                      key={item.id}
                      item={item}
                      isCritical={criticalIds.has(item.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Tab: Curva S ──────────────────────────────────────────────────────── */}
      {activeTab === 'curvas' && (
        <motion.div variants={fadeUpChild} initial="initial" animate="animate">
          {baselinesLoading ? (
            <LoadingSpinner />
          ) : baselines.length === 0 ? (
            <EmptyState
              message="Nenhuma baseline encontrada. Crie uma baseline no Planejamento para visualizar a Curva S."
              action={
                <button className="btn btn-secondary" onClick={() => navigate('/planejamento')}>
                  Ir para Planejamento
                </button>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Baseline selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  Baseline:
                </label>
                <select
                  className="select-field"
                  style={{ maxWidth: '320px' }}
                  value={selectedBaselineId ?? ''}
                  onChange={(e) => setSelectedBaselineId(Number(e.target.value))}
                >
                  {baselines.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {formatDate(b.snapshot_date)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chart */}
              <div style={CARD_STYLE}>
                <CurveSChart
                  data={curveData}
                  loading={curveLoading}
                  title={baselines.find((b) => b.id === selectedBaselineId)?.name}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Tab: Indicadores ──────────────────────────────────────────────────── */}
      {activeTab === 'indicadores' && (
        <motion.div
          variants={staggerParent}
          initial="initial"
          animate="animate"
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {!health ? (
            healthLoading ? <LoadingSpinner /> : <EmptyState message="Dados de saúde do cronograma não disponíveis." />
          ) : (
            <>
              {/* Top row: progress + SPI gauge */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <motion.div variants={fadeUpChild} style={CARD_STYLE}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
                    Progresso Planejado vs. Realizado
                  </h4>
                  <ProgressBar
                    planned={health.overall_planned_percent}
                    actual={health.overall_actual_percent}
                  />
                </motion.div>

                <motion.div variants={fadeUpChild} style={CARD_STYLE}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                    SPI — Schedule Performance Index
                  </h4>
                  {spiGaugeData.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <ResponsiveContainer width={120} height={120}>
                        <RadialBarChart
                          innerRadius={30}
                          outerRadius={55}
                          barSize={14}
                          data={spiGaugeData}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <RadialBar
                            background={{ fill: 'rgba(255,255,255,0.06)' }}
                            dataKey="value"
                            cornerRadius={6}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div>
                        <SpiIndicator spi={health.spi} />
                        <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginTop: '8px' }}>
                          SPI = Realizado / Planejado
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--color-secondary-text)', fontSize: '14px' }}>
                      SPI não disponível (dados insuficientes)
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Bottom row: pie + milestones */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <motion.div variants={fadeUpChild} style={CARD_STYLE}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                    Distribuição de Status
                  </h4>
                  {pieData.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <ResponsiveContainer width={140} height={140}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={65}
                            dataKey="value"
                            paddingAngle={2}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value} tarefas`, '']}
                            contentStyle={{
                              background: 'var(--color-secondary-bg)',
                              border: '1px solid var(--color-alternate)',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {pieData.map((entry) => (
                          <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: entry.color, flexShrink: 0 }} />
                            <span style={{ color: 'var(--color-secondary-text)' }}>{entry.name}</span>
                            <span style={{ fontWeight: 600, marginLeft: 'auto' }}>{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                      Nenhuma tarefa encontrada.
                    </div>
                  )}
                </motion.div>

                <motion.div variants={fadeUpChild} style={CARD_STYLE}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                    Marcos Próximos
                  </h4>
                  {health.upcoming_milestones.length === 0 ? (
                    <div style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                      Nenhum marco próximo encontrado.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {health.upcoming_milestones.slice(0, 5).map((m) => (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            background: m.is_overdue ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${m.is_overdue ? 'rgba(239,68,68,0.3)' : 'var(--color-alternate)'}`,
                          }}
                        >
                          {m.is_overdue ? (
                            <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                          ) : (
                            <Clock size={15} color="#eab308" style={{ flexShrink: 0, marginTop: '2px' }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {m.description || m.wbs_code || `Marco #${m.id}`}
                            </div>
                            <div style={{ fontSize: '11px', color: m.is_overdue ? '#ef4444' : 'var(--color-secondary-text)' }}>
                              {formatDate(m.planned_date)}{m.is_overdue ? ' — VENCIDO' : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Variance summary */}
              <motion.div variants={fadeUpChild} style={CARD_STYLE}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>
                  Resumo de Desempenho
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  {[
                    { label: 'No prazo', value: health.on_time, color: '#22c55e', icon: <CheckCircle2 size={14} /> },
                    { label: 'Atrasadas', value: health.delayed, color: '#ef4444', icon: <AlertCircle size={14} /> },
                    { label: 'Adiantadas', value: health.ahead, color: '#3b82f6', icon: <TrendingUp size={14} /> },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: `${item.color}0d`,
                        border: `1px solid ${item.color}33`,
                      }}
                    >
                      <span style={{ color: item.color }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: item.color }}>{item.value}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

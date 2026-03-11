import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../contexts/AppStateContext';
import {
  reportsApi, projectsApi, safetyApi, qualityApi,
  planningApi, inventoryApi, workforceApi, contractsApi, commissioningApi,
} from '../../services';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchableSelect from '../../components/common/SearchableSelect';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  FolderKanban, CheckCircle, Clock, Users, TrendingUp,
  ShieldAlert, FileWarning, Boxes, UserCheck,
  FileText, Wrench, Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';
import AiChat from '../../components/common/AiChat';
import type {
  SafetyIncidentStatistics, DdsStatistics,
  NonConformanceStatistics, ScheduleHealthData,
  WorkforceHistogram,
} from '../../types';

// ── Colors ────────────────────────────────────────────────────────────────────
const C = {
  primary: '#1D5CC6',
  success: '#028F58',
  warning: '#EFA953',
  error: '#E65454',
  tertiary: '#EB7039',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
  slate: '#64748B',
};

const PIE_PALETTE = [C.primary, C.success, C.warning, C.error, C.tertiary, C.info, C.purple, C.pink, C.teal, C.slate];

// ── Tab definitions ───────────────────────────────────────────────────────────
type TabKey = 'geral' | 'seguranca' | 'qualidade' | 'planejamento' | 'estoque' | 'efetivo' | 'contratos' | 'comissionamento';

const TAB_DEFS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'geral', label: 'Geral', icon: <FolderKanban size={16} /> },
  { key: 'seguranca', label: 'Segurança', icon: <ShieldAlert size={16} /> },
  { key: 'qualidade', label: 'Qualidade', icon: <FileWarning size={16} /> },
  { key: 'planejamento', label: 'Planejamento', icon: <Activity size={16} /> },
  { key: 'estoque', label: 'Estoque', icon: <Boxes size={16} /> },
  { key: 'efetivo', label: 'Efetivo', icon: <UserCheck size={16} /> },
  { key: 'contratos', label: 'Contratos', icon: <FileText size={16} /> },
  { key: 'comissionamento', label: 'Comissionamento', icon: <Wrench size={16} /> },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedTasks: number;
  pendingTasks: number;
  teamMembers: number;
  trackersTotal: number;
  trackersInstalled: number;
  modulesTotal: number;
  modulesInstalled: number;
  sprintProgress: number;
}

interface ProjectOption {
  id: number;
  name: string;
  projects_statuses_id?: number;
}

interface InventoryStats { all: number; low: number; no: number; }
interface ContractStats { totalMeasurements: number; byStatus: Record<string, number>; }
interface CommissioningStats { totalSystems: number; byStatus: Record<string, number>; }

// ── Helpers ───────────────────────────────────────────────────────────────────

function recordToChartData(record: Record<string, number> | undefined): { name: string; value: number }[] {
  if (!record) return [];
  return Object.entries(record).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
}

function arrayStatsToChartData(arr: { [key: string]: string | number }[] | undefined, labelKey: string): { name: string; value: number }[] {
  if (!arr) return [];
  return arr.filter(item => (item.count as number) > 0).map(item => ({ name: item[labelKey] as string, value: item.count as number }));
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="card" style={{ padding: '16px', textAlign: 'center', minWidth: 0 }}>
      <p style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </p>
      <p style={{ fontSize: '22px', fontWeight: 700, color, margin: 0 }}>{value}</p>
    </div>
  );
}

function PieChartCard({ title, data, height = 280 }: { title: string; data: { name: string; value: number; color?: string }[]; height?: number }) {
  if (data.length === 0) {
    return (
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>{title}</h3>
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary-text)' }}>
          <p>Sem dados</p>
        </div>
      </div>
    );
  }
  return (
    <div className="card">
      <h3 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || PIE_PALETTE[i % PIE_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function HBarChartCard({ title, data, height = 280 }: { title: string; data: { name: string; value: number }[]; height?: number }) {
  if (data.length === 0) {
    return (
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>{title}</h3>
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary-text)' }}>
          <p>Sem dados</p>
        </div>
      </div>
    );
  }
  return (
    <div className="card">
      <h3 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis type="number" fontSize={12} />
          <YAxis type="category" dataKey="name" fontSize={11} width={100} />
          <Tooltip />
          <Bar dataKey="value" fill={C.primary} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyTabState({ message }: { message: string }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', color: 'var(--color-secondary-text)' }}>
      <p style={{ fontSize: '14px', lineHeight: 1.6 }}>{message}</p>
    </div>
  );
}

// ── Tab content animation ─────────────────────────────────────────────────────
const tabContentVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { projectsInfo, setProjectsInfo, setNavBarSelection } = useAppState();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('geral');
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0, activeProjects: 0, completedTasks: 0,
    pendingTasks: 0, teamMembers: 0, trackersTotal: 0,
    trackersInstalled: 0, modulesTotal: 0, modulesInstalled: 0,
    sprintProgress: 0,
  });
  const [burndownData, setBurndownData] = useState<{ date: string; ideal: number; actual: number }[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(projectsInfo?.id);

  // Module BI state
  const [safetyStats, setSafetyStats] = useState<SafetyIncidentStatistics | null>(null);
  const [ddsStats, setDdsStats] = useState<DdsStatistics | null>(null);
  const [ncStats, setNcStats] = useState<NonConformanceStatistics | null>(null);
  const [scheduleHealth, setScheduleHealth] = useState<ScheduleHealthData | null>(null);
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(null);
  const [workforceData, setWorkforceData] = useState<WorkforceHistogram[]>([]);
  const [contractStats, setContractStats] = useState<ContractStats | null>(null);
  const [commissioningStats, setCommissioningStats] = useState<CommissioningStats | null>(null);

  useEffect(() => { setNavBarSelection(1); loadProjects(); }, []);
  useEffect(() => { loadAllData(); }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.queryAllProjects({ per_page: 100 });
      const items = (data as { items?: ProjectOption[] })?.items || (Array.isArray(data) ? data : []);
      setProjects(items);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleProjectChange = (value: string | number | undefined) => {
    const projectId = value ? Number(value) : undefined;
    setSelectedProjectId(projectId);
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) setProjectsInfo({ id: project.id, name: project.name });
    }
  };

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));

  const loadAllData = async () => {
    setLoading(true);
    const pid = selectedProjectId;

    const results = await Promise.allSettled([
      reportsApi.getDashboard({ projects_id: pid }) as Promise<Record<string, unknown>>,
      pid ? safetyApi.getIncidentStatistics({ projects_id: pid }) : Promise.resolve(null),
      pid ? safetyApi.getDdsStatistics({ projects_id: pid }) : Promise.resolve(null),
      pid ? qualityApi.getNcStatistics({ projects_id: pid }) : Promise.resolve(null),
      pid ? planningApi.getScheduleHealth({ projects_id: pid }) : Promise.resolve(null),
      pid ? inventoryApi.queryAllProducts({ projects_id: pid, per_page: 1 }) : Promise.resolve(null),
      pid ? workforceApi.getHistogram({ projects_id: pid }) : Promise.resolve([]),
      pid ? contractsApi.listMeasurements({ projects_id: pid, per_page: 1 }) : Promise.resolve(null),
      pid ? commissioningApi.listSystems({ projects_id: pid, per_page: 100 }) : Promise.resolve(null),
    ]);

    // [0] Dashboard core
    if (results[0].status === 'fulfilled' && results[0].value) {
      const d = results[0].value as Record<string, unknown>;
      const trackersTotal = (d?.trackers_total as number) || 0;
      const trackersInstalled = Array.isArray(d?.trackers_installed) ? d.trackers_installed.length : 0;
      const modulesTotal = Array.isArray(d?.modules_total) ? d.modules_total.length : ((d?.modules_total as number) || 0);
      const modulesInstalled = Array.isArray(d?.modules_installed) ? d.modules_installed.length : 0;
      setStats({
        totalProjects: (d?.totalProjects as number) || 0,
        activeProjects: (d?.activeProjects as number) || 0,
        completedTasks: (d?.completedTasks as number) || 0,
        pendingTasks: (d?.pendingTasks as number) || 0,
        teamMembers: (d?.teamMembers as number) || 0,
        trackersTotal, trackersInstalled, modulesTotal, modulesInstalled,
        sprintProgress: (d?.sprintProgress as number) || 0,
      });
      setBurndownData(Array.isArray(d?.burndown) ? d.burndown as { date: string; ideal: number; actual: number }[] : []);
    }

    setSafetyStats(results[1].status === 'fulfilled' ? results[1].value as SafetyIncidentStatistics | null : null);
    setDdsStats(results[2].status === 'fulfilled' ? results[2].value as DdsStatistics | null : null);
    setNcStats(results[3].status === 'fulfilled' ? results[3].value as NonConformanceStatistics | null : null);
    setScheduleHealth(results[4].status === 'fulfilled' ? results[4].value as ScheduleHealthData | null : null);

    if (results[5].status === 'fulfilled' && results[5].value) {
      const inv = results[5].value as { all?: number; low?: number; no?: number };
      setInventoryStats({ all: inv.all ?? 0, low: inv.low ?? 0, no: inv.no ?? 0 });
    } else { setInventoryStats(null); }

    setWorkforceData(results[6].status === 'fulfilled' && Array.isArray(results[6].value) ? results[6].value as WorkforceHistogram[] : []);

    if (results[7].status === 'fulfilled' && results[7].value) {
      const cData = results[7].value as { items?: { status?: string }[]; itemsReceived?: number };
      const items = cData.items || [];
      const byStatus: Record<string, number> = {};
      items.forEach(m => { const s = m.status || 'desconhecido'; byStatus[s] = (byStatus[s] || 0) + 1; });
      setContractStats({ totalMeasurements: cData.itemsReceived || items.length, byStatus });
    } else { setContractStats(null); }

    if (results[8].status === 'fulfilled' && results[8].value) {
      const cData = results[8].value as { items?: { status?: string }[]; itemsReceived?: number };
      const items = cData.items || [];
      const byStatus: Record<string, number> = {};
      items.forEach(s => { const st = s.status || 'desconhecido'; byStatus[st] = (byStatus[st] || 0) + 1; });
      setCommissioningStats({ totalSystems: cData.itemsReceived || items.length, byStatus });
    } else { setCommissioningStats(null); }

    setLoading(false);
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const hasProject = !!selectedProjectId;

  const statCards = [
    { key: 'totalProjects', label: t('dashboard.totalProjects'), value: stats.totalProjects, icon: <FolderKanban size={24} />, color: C.primary },
    { key: 'activeProjects', label: t('dashboard.activeProjects'), value: stats.activeProjects, icon: <TrendingUp size={24} />, color: C.success },
    { key: 'completedTasks', label: t('dashboard.completedTasks'), value: stats.completedTasks, icon: <CheckCircle size={24} />, color: C.success },
    { key: 'pendingTasks', label: t('dashboard.pendingTasks'), value: stats.pendingTasks, icon: <Clock size={24} />, color: C.warning },
    { key: 'teamMembers', label: t('dashboard.teamMembers'), value: stats.teamMembers, icon: <Users size={24} />, color: C.tertiary },
  ];

  const installationData = [
    { name: t('dashboard.completed', 'Concluídas'), value: stats.completedTasks },
    { name: t('dashboard.pending', 'Pendentes'), value: stats.pendingTasks },
  ];

  const taskDistribution = [
    { name: t('dashboard.completed', 'Concluídas'), value: stats.completedTasks, color: C.success },
    { name: t('dashboard.pending', 'Pendentes'), value: stats.pendingTasks, color: C.warning },
  ].filter(d => d.value > 0);

  const safetySeverityData = recordToChartData(safetyStats?.by_severity);
  const safetyStatusData = recordToChartData(safetyStats?.by_status);
  const ncStatusData = arrayStatsToChartData(ncStats?.by_status, 'status');
  const ncSeverityData = arrayStatsToChartData(ncStats?.by_severity, 'severity');
  const ncCategoryData = arrayStatsToChartData(ncStats?.by_category, 'category');

  const scheduleStatusData = scheduleHealth ? [
    { name: 'No prazo', value: scheduleHealth.on_time, color: C.success },
    { name: 'Atrasadas', value: scheduleHealth.delayed, color: C.error },
    { name: 'Adiantadas', value: scheduleHealth.ahead, color: C.info },
  ].filter(d => d.value > 0) : [];

  const scheduleTasksData = scheduleHealth ? [
    { name: 'Concluídas', value: scheduleHealth.completed_tasks, color: C.success },
    { name: 'Em andamento', value: scheduleHealth.in_progress_tasks, color: C.warning },
    { name: 'Não iniciadas', value: scheduleHealth.not_started_tasks, color: C.slate },
  ].filter(d => d.value > 0) : [];

  const inventoryChartData = inventoryStats ? [
    { name: 'Normal', value: Math.max(0, inventoryStats.all - inventoryStats.low - inventoryStats.no), color: C.success },
    { name: 'Estoque baixo', value: inventoryStats.low, color: C.warning },
    { name: 'Sem estoque', value: inventoryStats.no, color: C.error },
  ].filter(d => d.value > 0) : [];

  const contractChartData = recordToChartData(contractStats?.byStatus);
  const commissioningChartData = recordToChartData(commissioningStats?.byStatus);

  // ── Tab content renderers ─────────────────────────────────────────────────

  const renderGeralTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
      {/* Progresso de Tarefas */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>
          {t('dashboard.taskProgress', 'Progresso de Tarefas')}
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={installationData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="value" name="Tarefas" fill={C.primary} radius={[4, 4, 0, 0]}>
              {installationData.map((_entry, index) => (
                <Cell key={index} fill={index === 0 ? C.success : C.warning} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Task Distribution */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>
          {t('dashboard.taskDistribution', 'Distribuição de Tarefas')}
        </h3>
        {taskDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={taskDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {taskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary-text)' }}>
            <p>{t('common.noData')}</p>
          </div>
        )}
      </div>

      {/* Burndown */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>{t('dashboard.burndownChart')}</h3>
        {burndownData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={burndownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ideal" stroke={C.warning} strokeDasharray="5 5" name="Ideal" dot={false} />
              <Line type="monotone" dataKey="actual" stroke={C.primary} strokeWidth={2} name="Atual" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary-text)' }}>
            <p>{t('common.noData')}</p>
          </div>
        )}
      </div>

      {/* Sprint Progress Gauge */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>{t('dashboard.sprintProgress')}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 150, height: 150, borderRadius: '50%',
              background: `conic-gradient(${C.primary} ${(stats.sprintProgress || 0) * 3.6}deg, #e0e0e0 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <div style={{
                width: 120, height: 120, borderRadius: '50%', backgroundColor: 'var(--color-secondary-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '28px', fontWeight: 600, color: C.primary }}>{stats.sprintProgress || 0}%</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
              {projectsInfo?.name || t('dashboard.sprintProgress')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSegurancaTab = () => {
    if (!safetyStats && !ddsStats) return <EmptyTabState message="Nenhum dado de segurança disponível para este projeto." />;
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <MiniStat label="Total Incidentes" value={safetyStats?.total_incidents ?? 0} color={C.error} />
          <MiniStat label="Dias Perdidos" value={safetyStats?.total_lost_days ?? 0} color={C.warning} />
          <MiniStat label="DDS Realizados" value={ddsStats?.total ?? 0} color={C.success} />
          <MiniStat label="DDS Este Mês" value={ddsStats?.this_month ?? 0} color={C.info} />
          <MiniStat label="Média Participantes DDS" value={ddsStats?.avg_participants ?? 0} color={C.tertiary} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          <PieChartCard title="Incidentes por Severidade" data={safetySeverityData.map((d, i) => ({ ...d, color: PIE_PALETTE[i] }))} />
          <PieChartCard title="Incidentes por Status" data={safetyStatusData.map((d, i) => ({ ...d, color: PIE_PALETTE[i] }))} />
        </div>
      </>
    );
  };

  const renderQualidadeTab = () => {
    if (!ncStats) return <EmptyTabState message="Nenhum dado de não conformidades disponível para este projeto." />;
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <MiniStat label="Total NCs" value={ncStats.total ?? 0} color={C.error} />
          {(ncStats.by_status || []).map((item) => (
            <MiniStat key={item.status} label={`NC ${item.status}`} value={item.count} color={C.warning} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          <PieChartCard title="NCs por Status" data={ncStatusData.map((d, i) => ({ ...d, color: PIE_PALETTE[i] }))} />
          <PieChartCard title="NCs por Severidade" data={ncSeverityData.map((d, i) => ({ ...d, color: PIE_PALETTE[i] }))} />
          <HBarChartCard title="NCs por Categoria" data={ncCategoryData} />
        </div>
      </>
    );
  };

  const renderPlanejamentoTab = () => {
    if (!scheduleHealth) return <EmptyTabState message="Nenhum dado de planejamento disponível para este projeto." />;
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <MiniStat label="Total Tarefas" value={scheduleHealth.total_tasks} color={C.primary} />
          <MiniStat label="No Prazo" value={scheduleHealth.on_time} color={C.success} />
          <MiniStat label="Atrasadas" value={scheduleHealth.delayed} color={C.error} />
          <MiniStat label="Adiantadas" value={scheduleHealth.ahead} color={C.info} />
          <MiniStat label="% Planejado" value={`${(scheduleHealth.overall_planned_percent ?? 0).toFixed(1)}%`} color={C.primary} />
          <MiniStat label="% Realizado" value={`${(scheduleHealth.overall_actual_percent ?? 0).toFixed(1)}%`} color={C.success} />
          {scheduleHealth.spi != null && (
            <MiniStat label="SPI" value={scheduleHealth.spi.toFixed(2)} color={scheduleHealth.spi >= 1 ? C.success : C.error} />
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          <PieChartCard title="Desempenho do Cronograma" data={scheduleStatusData} />
          <PieChartCard title="Status das Tarefas" data={scheduleTasksData} />
        </div>
      </>
    );
  };

  const renderEstoqueTab = () => {
    if (!inventoryStats) return <EmptyTabState message="Nenhum dado de estoque disponível para este projeto." />;
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <MiniStat label="Total Produtos" value={inventoryStats.all} color={C.primary} />
          <MiniStat label="Estoque Baixo" value={inventoryStats.low} color={C.warning} />
          <MiniStat label="Sem Estoque" value={inventoryStats.no} color={C.error} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          <PieChartCard title="Status do Estoque" data={inventoryChartData} />
        </div>
      </>
    );
  };

  const renderEfetivoTab = () => {
    if (workforceData.length === 0) return <EmptyTabState message="Nenhum dado de efetivo disponível para este projeto." />;
    return (
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>Histograma de Efetivo</h3>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={workforceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" fontSize={11} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_planned" name="Planejado" fill={C.primary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="total_present" name="Presente" fill={C.success} radius={[4, 4, 0, 0]} />
            <Bar dataKey="total_absent" name="Ausente" fill={C.error} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderContratosTab = () => {
    if (!contractStats || contractStats.totalMeasurements === 0) return <EmptyTabState message="Nenhum dado de contratos disponível para este projeto." />;
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <MiniStat label="Total Medições" value={contractStats.totalMeasurements} color={C.primary} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          <PieChartCard title="Medições por Status" data={contractChartData.map((d, i) => ({ ...d, color: PIE_PALETTE[i] }))} />
        </div>
      </>
    );
  };

  const renderComissionamentoTab = () => {
    if (!commissioningStats || commissioningStats.totalSystems === 0) return <EmptyTabState message="Nenhum dado de comissionamento disponível para este projeto." />;
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <MiniStat label="Total Sistemas" value={commissioningStats.totalSystems} color={C.primary} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          <PieChartCard title="Sistemas por Status" data={commissioningChartData.map((d, i) => ({ ...d, color: PIE_PALETTE[i] }))} />
        </div>
      </>
    );
  };

  const tabRenderers: Record<TabKey, () => React.ReactNode> = {
    geral: renderGeralTab,
    seguranca: renderSegurancaTab,
    qualidade: renderQualidadeTab,
    planejamento: renderPlanejamentoTab,
    estoque: renderEstoqueTab,
    efetivo: renderEfetivoTab,
    contratos: renderContratosTab,
    comissionamento: renderComissionamentoTab,
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={`${t('dashboard.subtitle')} - ${user?.name || ''}`}
        actions={
          <SearchableSelect
            options={projectOptions}
            value={selectedProjectId}
            onChange={handleProjectChange}
            placeholder={t('dashboard.allProjects', 'Todos os projetos')}
            searchPlaceholder={t('common.search')}
            style={{ minWidth: '260px' }}
          />
        }
      />

      {/* ═══ Top Stat Cards ═══ */}
      <motion.div variants={staggerParent} initial="initial" animate="animate"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {statCards.map(card => (
          <motion.div key={card.key} variants={fadeUpChild} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '12px',
              backgroundColor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: card.color, flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginBottom: '2px' }}>{card.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-primary-text)' }}>{card.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {!hasProject ? (
        <motion.div variants={fadeUpChild} initial="initial" animate="animate" className="card"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', color: 'var(--color-secondary-text)' }}>
          <FolderKanban size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
          <p style={{ fontSize: '16px', maxWidth: '480px', lineHeight: 1.6 }}>
            {t('dashboard.selectProjectHint', 'Selecione um projeto no dropdown acima para visualizar gráficos detalhados de instalação, tarefas, segurança, qualidade, planejamento e mais')}
          </p>
        </motion.div>
      ) : (
        <>
          {/* ═══ Tabs Bar ═══ */}
          <div style={{
            display: 'flex', gap: '4px', marginBottom: '24px',
            overflowX: 'auto', paddingBottom: '2px',
            borderBottom: '2px solid var(--color-border, #e5e7eb)',
          }}>
            {TAB_DEFS.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '10px 16px',
                    fontSize: '13px', fontWeight: isActive ? 600 : 400,
                    color: isActive ? C.primary : 'var(--color-secondary-text)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: isActive ? `2px solid ${C.primary}` : '2px solid transparent',
                    marginBottom: '-2px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ═══ Tab Content ═══ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabContentVariants as any}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {tabRenderers[activeTab]()}
            </motion.div>
          </AnimatePresence>

          <div style={{ height: '40px' }} />
        </>
      )}

      <AiChat />
    </div>
  );
}

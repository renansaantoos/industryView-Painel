import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../contexts/AppStateContext';
import { reportsApi, projectsApi } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchableSelect from '../../components/common/SearchableSelect';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FolderKanban, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedTasks: number;
  pendingTasks: number;
  teamMembers: number;
  trackersTotal: number;
  trackersInstalled: number;
  sprintProgress: number;
}

interface ProjectOption {
  id: number;
  name: string;
  projects_statuses_id?: number;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { projectsInfo, setProjectsInfo, setNavBarSelection } = useAppState();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0, activeProjects: 0, completedTasks: 0,
    pendingTasks: 0, teamMembers: 0, trackersTotal: 0,
    trackersInstalled: 0, sprintProgress: 0,
  });
  const [burndownData, setBurndownData] = useState<{ date: string; ideal: number; actual: number }[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(projectsInfo?.id);

  useEffect(() => {
    setNavBarSelection(1);
    loadProjects();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [selectedProjectId]);

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
      if (project) {
        setProjectsInfo({ id: project.id, name: project.name });
      }
    }
  };

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const dashData = await reportsApi.getDashboard({
        projects_id: selectedProjectId,
      }) as Record<string, unknown>;

      const trackersTotal = (dashData?.trackers_total as number) || 0;
      const trackersInstalled = Array.isArray(dashData?.trackers_installed) ? dashData.trackers_installed.length : 0;

      setStats({
        totalProjects: (dashData?.totalProjects as number) || 0,
        activeProjects: (dashData?.activeProjects as number) || 0,
        completedTasks: (dashData?.completedTasks as number) || 0,
        pendingTasks: (dashData?.pendingTasks as number) || 0,
        teamMembers: (dashData?.teamMembers as number) || 0,
        trackersTotal,
        trackersInstalled,
        sprintProgress: (dashData?.sprintProgress as number) || 0,
      });

      const burndown = dashData?.burndown;
      setBurndownData(
        Array.isArray(burndown) ? burndown as { date: string; ideal: number; actual: number }[] : []
      );
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { key: 'totalProjects', label: t('dashboard.totalProjects'), value: stats.totalProjects ?? 0, icon: <FolderKanban size={24} />, color: 'var(--color-primary)' },
    { key: 'activeProjects', label: t('dashboard.activeProjects'), value: stats.activeProjects ?? 0, icon: <TrendingUp size={24} />, color: 'var(--color-success)' },
    { key: 'completedTasks', label: t('dashboard.completedTasks'), value: stats.completedTasks ?? 0, icon: <CheckCircle size={24} />, color: 'var(--color-success)' },
    { key: 'pendingTasks', label: t('dashboard.pendingTasks'), value: stats.pendingTasks ?? 0, icon: <Clock size={24} />, color: 'var(--color-warning)' },
    { key: 'teamMembers', label: t('dashboard.teamMembers'), value: stats.teamMembers ?? 0, icon: <Users size={24} />, color: 'var(--color-tertiary)' },
  ];

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

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

      {/* Stat Cards */}
      <motion.div
        variants={staggerParent}
        initial="initial"
        animate="animate"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {statCards.map(card => (
          <motion.div key={card.key} variants={fadeUpChild} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: `${card.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: card.color,
              flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginBottom: '2px' }}>
                {card.label}
              </p>
              <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-primary-text)' }}>
                {card.value}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={staggerParent} initial="initial" animate="animate" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Burndown Chart */}
        <motion.div variants={fadeUpChild} className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>
            {t('dashboard.burndownChart')}
          </h3>
          {burndownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="ideal" stroke="var(--color-alternate)" strokeDasharray="5 5" name="Ideal" />
                <Line type="monotone" dataKey="actual" stroke="var(--color-primary)" strokeWidth={2} name="Atual" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary-text)' }}>
              <p>{t('common.noData')}</p>
            </div>
          )}
        </motion.div>

        {/* Sprint Progress */}
        <motion.div variants={fadeUpChild} className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>
            {t('dashboard.sprintProgress')}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: `conic-gradient(var(--color-primary) ${(stats.sprintProgress || 0) * 3.6}deg, var(--color-alternate) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <div style={{
                  width: 130,
                  height: 130,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-secondary-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '32px', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {stats.sprintProgress || 0}%
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-secondary-text)' }}>
                {projectsInfo?.name || t('dashboard.sprintProgress')}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Activity bar chart placeholder */}
      <motion.div variants={fadeUpChild} initial="initial" animate="animate" className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>
          {t('dashboard.recentActivity')}
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={[
            { name: 'Seg', tasks: 0 },
            { name: 'Ter', tasks: 0 },
            { name: 'Qua', tasks: 0 },
            { name: 'Qui', tasks: 0 },
            { name: 'Sex', tasks: 0 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="tasks" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2,
  Users,
  CloudRain,
  AlertTriangle,
  Map,
  Zap,
  FileText,
  Loader2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PageHeader from '../../components/common/PageHeader';
import AnalysisCard from './components/AnalysisCard';
import ScheduleCharts from './components/ScheduleCharts';
import { generateRCC, type RCCResponse, type AnalysisType } from '../../services/api/agents';
import { queryAllProjects } from '../../services/api/projects';
import { useAppState } from '../../contexts/AppStateContext';
import { staggerParent, fadeUpChild } from '../../lib/motion';

interface ProjectOption {
  id: number;
  name: string;
}

const ANALYSIS_CARDS: { title: string; description: string; icon: React.ReactNode; color: string; analysisType: AnalysisType }[] = [
  { title: 'Produtividade', description: 'Analise de produtividade geral', icon: <BarChart2 size={20} />, color: '#3B82F6', analysisType: 'productivity' },
  { title: 'Força de Trabalho', description: 'Alocação e ociosidade', icon: <Users size={20} />, color: '#10B981', analysisType: 'workforce' },
  { title: 'Clima', description: 'Impacto climatico no cronograma', icon: <CloudRain size={20} />, color: '#6366F1', analysisType: 'weather' },
  { title: 'Tarefas Falhas', description: 'Tarefas atrasadas ou com problemas', icon: <AlertTriangle size={20} />, color: '#EF4444', analysisType: 'failed_tasks' },
  { title: 'Progresso por Area', description: 'Avanco por area do projeto', icon: <Map size={20} />, color: '#F59E0B', analysisType: 'area_progress' },
  { title: 'Proativo', description: 'Sugestoes proativas de melhoria', icon: <Zap size={20} />, color: '#8B5CF6', analysisType: 'proactive' },
  { title: 'Visao Geral', description: 'Resumo completo do projeto', icon: <FileText size={20} />, color: '#06B6D4', analysisType: 'overview' },
];

export default function ScheduleManagerDashboard() {
  const { setNavBarSelection } = useAppState();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [rcc, setRcc] = useState<RCCResponse | null>(null);
  const [rccLoading, setRccLoading] = useState(false);
  const [rccError, setRccError] = useState('');

  useEffect(() => {
    setNavBarSelection(51);
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await queryAllProjects({ per_page: 100 });
      const opts = data.items.map((p) => ({ id: p.id, name: p.name }));
      setProjects(opts);
      if (opts.length === 1) setSelectedProject(opts[0].id);
    } catch {
      // silently fail
    }
  };

  const handleGenerateRCC = async () => {
    if (!selectedProject) return;
    setRccLoading(true);
    setRccError('');
    setRcc(null);
    try {
      const data = await generateRCC(selectedProject);
      setRcc(data);
    } catch {
      setRccError('Erro ao gerar RCC. Tente novamente.');
    } finally {
      setRccLoading(false);
    }
  };

  const statusColor = rcc?.metadata?.status === 'verde' ? '#10B981' : rcc?.metadata?.status === 'amarelo' ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ padding: '0 24px 24px' }}>
      <PageHeader
        title="Gerente de Cronograma"
        subtitle="Analises inteligentes e RCC do seu projeto"
        breadcrumb="Gerente Cronograma"
      />

      {/* Project selector */}
      <motion.div variants={staggerParent} initial="initial" animate="animate">
        <motion.div variants={fadeUpChild} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <select
              value={selectedProject ?? ''}
              onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : null)}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-alternate)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-primary-text)',
                fontSize: 14,
                fontFamily: 'var(--font-family)',
                minWidth: 260,
              }}
            >
              <option value="">Selecione um projeto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <button
              onClick={handleGenerateRCC}
              disabled={!selectedProject || rccLoading}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: selectedProject ? 'var(--color-primary)' : 'var(--color-alternate)',
                color: selectedProject ? '#fff' : 'var(--color-secondary-text)',
                fontSize: 13,
                fontWeight: 600,
                cursor: selectedProject ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--font-family)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {rccLoading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Gerando RCC...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Gerar RCC
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* RCC Result */}
        {rccError && (
          <motion.div variants={fadeUpChild} style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 16 }}>
            {rccError}
          </motion.div>
        )}

        {rcc && (
          <motion.div
            variants={fadeUpChild}
            className="card"
            style={{ marginBottom: 24, padding: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <FileText size={20} color={statusColor} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-primary-text)' }}>
                Relatorio Critico de Cronograma (RCC)
              </h3>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: `${statusColor}15`,
                  color: statusColor,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {rcc.metadata.status}
              </span>
            </div>

            {/* Metadata summary */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              {[
                { label: 'SPI', value: rcc.metadata.spi?.toFixed(2) ?? 'N/A' },
                { label: 'Total Tarefas', value: rcc.metadata.total_tasks },
                { label: 'Concluidas', value: rcc.metadata.completed_tasks },
                { label: 'Atrasadas', value: rcc.metadata.delayed_tasks },
                { label: 'Falhas', value: rcc.metadata.failed_tasks },
                { label: 'Ociosos', value: rcc.metadata.idle_workers },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-alternate)',
                    fontSize: 12,
                  }}
                >
                  <div style={{ color: 'var(--color-secondary-text)', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-primary-text)' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            {rcc.charts && rcc.charts.length > 0 && (
              <ScheduleCharts charts={rcc.charts} />
            )}

            {/* Markdown report */}
            <div className="markdown-content" style={{ fontSize: 13, lineHeight: 1.7 }}>
              <ReactMarkdown>{rcc.report_markdown}</ReactMarkdown>
            </div>
          </motion.div>
        )}

        {/* Analysis cards grid */}
        <motion.div
          variants={staggerParent}
          initial="initial"
          animate="animate"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 16,
          }}
        >
          {ANALYSIS_CARDS.map((card) => (
            <AnalysisCard
              key={card.analysisType}
              title={card.title}
              description={card.description}
              icon={card.icon}
              color={card.color}
              analysisType={card.analysisType}
              projectId={selectedProject}
            />
          ))}
        </motion.div>
      </motion.div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

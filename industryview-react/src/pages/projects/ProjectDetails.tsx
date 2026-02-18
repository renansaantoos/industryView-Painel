import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { projectsApi } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Briefcase,
  ClipboardList,
  Users,
  Kanban,
  BarChart3,
  Info,
  Package,
  ShieldAlert,
  GraduationCap,
  MessageSquare,
  FileCheck,
  HardHat,
  HeartPulse,
  Leaf,
  ClipboardCheck,
  UserCheck,
  AlertTriangle,
  FileArchive,
  Receipt,
  Zap,
  ShoppingCart,
  GanttChartSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';

interface DetailCard {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface CardSection {
  label: string;
  cards: DetailCard[];
}

function CardGrid({
  cards,
  hoveredCard,
  setHoveredCard,
}: {
  cards: DetailCard[];
  hoveredCard: string | null;
  setHoveredCard: (key: string | null) => void;
}) {
  return (
    <motion.div
      variants={staggerParent}
      initial="initial"
      animate="animate"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}
    >
      {cards.map((card) => {
        const isHovered = hoveredCard === card.key;
        return (
          <motion.div
            key={card.key}
            variants={fadeUpChild}
            className="card"
            onClick={card.onClick}
            onMouseEnter={() => setHoveredCard(card.key)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              cursor: 'pointer',
              height: '120px',
              padding: '16px',
              transition: 'all 0.2s ease',
              backgroundColor: isHovered ? 'var(--color-primary)' : 'var(--color-primary-bg)',
              borderColor: isHovered ? 'var(--color-primary)' : 'var(--color-alternate)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: isHovered ? 'var(--color-secondary-bg)' : 'var(--color-primary)' }}>
                {card.icon}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isHovered ? 'var(--color-secondary-bg)' : 'var(--color-primary-text)',
                }}
              >
                {card.title}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: isHovered ? 'var(--color-secondary-bg)' : 'var(--color-secondary-text)',
                  lineHeight: 1.3,
                }}
              >
                {card.description}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default function ProjectDetails() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectsInfo, setTeamId } = useAppState();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    if (!projectsInfo) {
      navigate('/projetos');
    }
  }, [projectsInfo, navigate]);

  const handleTeamNavigation = useCallback(async () => {
    if (!projectsInfo) return;
    try {
      const data = await projectsApi.queryAllTeams({ projects_id: projectsInfo.id });
      const teams = data.items || [];
      if (teams.length > 0) {
        setTeamId(teams[0].id);
      } else {
        setTeamId(0);
      }
    } catch {
      setTeamId(0);
    }
    navigate('/gestao-de-equipe');
  }, [projectsInfo, setTeamId, navigate]);

  if (!projectsInfo) return <LoadingSpinner fullPage />;

  const sections: CardSection[] = [
    {
      label: t('projects.management'),
      cards: [
        {
          key: 'edit',
          title: t('projects.mainInfo'),
          description: t('projects.mainInfoDesc'),
          icon: <Briefcase size={24} />,
          onClick: () => navigate('/editar-projeto'),
        },
        {
          key: 'backlog',
          title: t('projects.taskBacklog'),
          description: t('projects.taskBacklogDesc'),
          icon: <ClipboardList size={24} />,
          onClick: () => navigate('/backlog-tarefas'),
        },
        {
          key: 'team',
          title: t('projects.teamManagement'),
          description: t('projects.teamManagementDesc'),
          icon: <Users size={24} />,
          onClick: handleTeamNavigation,
        },
        {
          key: 'sprint',
          title: t('projects.manageSprint'),
          description: t('projects.manageSprintDesc'),
          icon: <Kanban size={24} />,
          onClick: () => navigate('/sprints'),
        },
        {
          key: 'reports',
          title: t('projects.reports'),
          description: t('projects.reportsDesc'),
          icon: <BarChart3 size={24} />,
          onClick: () => navigate(`/relatorio?projectsId=${projectsInfo.id}&sprintId=0`),
        },
        {
          key: 'daily',
          title: t('projects.dailyProductionReport'),
          description: t('projects.dailyProductionReportDesc'),
          icon: <Info size={24} />,
          onClick: () => navigate('/informe-diarias-prod'),
        },
        {
          key: 'inventory',
          title: t('projects.inventory'),
          description: t('projects.inventoryDesc'),
          icon: <Package size={24} />,
          onClick: () => navigate('/estoque'),
        },
        {
          key: 'cronograma',
          title: t('projects.cronograma'),
          description: t('projects.cronogramaDesc'),
          icon: <GanttChartSquare size={24} />,
          onClick: () => navigate('/cronograma'),
        },
      ],
    },
    {
      label: t('projects.ssmaSection'),
      cards: [
        {
          key: 'ssma-incidents',
          title: t('projects.ssmaIncidents'),
          description: t('projects.ssmaIncidentsDesc'),
          icon: <ShieldAlert size={24} />,
          onClick: () => navigate('/seguranca/incidentes'),
        },
        {
          key: 'ssma-trainings',
          title: t('projects.ssmaTrainings'),
          description: t('projects.ssmaTrainingsDesc'),
          icon: <GraduationCap size={24} />,
          onClick: () => navigate('/seguranca/treinamentos'),
        },
        {
          key: 'ssma-dds',
          title: t('projects.ssmaDds'),
          description: t('projects.ssmaDdsDesc'),
          icon: <MessageSquare size={24} />,
          onClick: () => navigate('/seguranca/dds'),
        },
        {
          key: 'ssma-permits',
          title: t('projects.ssmaWorkPermits'),
          description: t('projects.ssmaWorkPermitsDesc'),
          icon: <FileCheck size={24} />,
          onClick: () => navigate('/seguranca/permissoes'),
        },
        {
          key: 'ssma-ppe',
          title: t('projects.ssmaPpe'),
          description: t('projects.ssmaPpeDesc'),
          icon: <HardHat size={24} />,
          onClick: () => navigate('/seguranca/epis'),
        },
        {
          key: 'ssma-health',
          title: t('projects.ssmaHealthRecords'),
          description: t('projects.ssmaHealthRecordsDesc'),
          icon: <HeartPulse size={24} />,
          onClick: () => navigate('/seguranca/saude'),
        },
        {
          key: 'ssma-env',
          title: t('projects.ssmaEnvironmental'),
          description: t('projects.ssmaEnvironmentalDesc'),
          icon: <Leaf size={24} />,
          onClick: () => navigate('/seguranca/ambiental'),
        },
      ],
    },
    {
      label: t('projects.operationsSection'),
      cards: [
        {
          key: 'ops-rdo',
          title: t('projects.opsDailyReports'),
          description: t('projects.opsDailyReportsDesc'),
          icon: <ClipboardCheck size={24} />,
          onClick: () => navigate('/operacoes/rdo'),
        },
        {
          key: 'ops-workforce',
          title: t('projects.opsWorkforceControl'),
          description: t('projects.opsWorkforceControlDesc'),
          icon: <UserCheck size={24} />,
          onClick: () => navigate('/operacoes/efetivo'),
        },
        {
          key: 'ops-nc',
          title: t('projects.opsNonConformances'),
          description: t('projects.opsNonConformancesDesc'),
          icon: <AlertTriangle size={24} />,
          onClick: () => navigate('/operacoes/nao-conformidades'),
        },
        {
          key: 'ops-docs',
          title: t('projects.opsDocuments'),
          description: t('projects.opsDocumentsDesc'),
          icon: <FileArchive size={24} />,
          onClick: () => navigate('/operacoes/documentos'),
        },
        {
          key: 'ops-contracts',
          title: t('projects.opsContracts'),
          description: t('projects.opsContractsDesc'),
          icon: <Receipt size={24} />,
          onClick: () => navigate('/operacoes/contratos'),
        },
        {
          key: 'ops-commissioning',
          title: t('projects.opsCommissioning'),
          description: t('projects.opsCommissioningDesc'),
          icon: <Zap size={24} />,
          onClick: () => navigate('/operacoes/comissionamento'),
        },
        {
          key: 'ops-requisitions',
          title: t('projects.opsMaterialRequisitions'),
          description: t('projects.opsMaterialRequisitionsDesc'),
          icon: <ShoppingCart size={24} />,
          onClick: () => navigate('/operacoes/requisicoes'),
        },
      ],
    },
  ];

  return (
    <div>
      <PageHeader
        title={projectsInfo.name}
        subtitle={t('projects.detailsSubtitle')}
        breadcrumb={`${t('projects.title')} / ${projectsInfo.name}`}
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/projetos')}>
            <ArrowLeft size={18} /> {t('common.back')}
          </button>
        }
      />

      {sections.map((section) => (
        <div key={section.label} style={{ marginBottom: '24px' }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--color-primary-text)',
              marginBottom: '12px',
            }}
          >
            {section.label}
          </h3>
          <CardGrid cards={section.cards} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
        </div>
      ))}
    </div>
  );
}

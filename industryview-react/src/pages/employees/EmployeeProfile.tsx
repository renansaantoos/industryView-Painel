import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, fadeUpChild, staggerParent } from '../../lib/motion';
import { useAppState } from '../../contexts/AppStateContext';
import { usersApi, employeesApi, ppeApi } from '../../services';
import type { UserFull, EmployeeHrData, VacationBalance } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  User,
  Calendar,
  ShieldCheck,
  FileText,
  HardHat,
  GraduationCap,
  Clock,
  Coffee,
  TrendingUp,
  Gift,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';

// Tab components
import HrDataTab from './tabs/HrDataTab';
import VacationsTab from './tabs/VacationsTab';
import DocumentsTab from './tabs/DocumentsTab';
import PpeTab from './tabs/PpeTab';
import TrainingsTab from './tabs/TrainingsTab';
import TimeTrackingTab from './tabs/TimeTrackingTab';
import DayOffsTab from './tabs/DayOffsTab';
import CareerHistoryTab from './tabs/CareerHistoryTab';
import BenefitsTab from './tabs/BenefitsTab';
import IncidentsTab from './tabs/IncidentsTab';
import HealthTab from './tabs/HealthTab';

type TabKey =
  | 'dados'
  | 'ferias'
  | 'documentos'
  | 'epis'
  | 'treinamentos'
  | 'ponto'
  | 'folgas'
  | 'historico'
  | 'beneficios'
  | 'incidentes'
  | 'saude';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dados', label: 'Dados Pessoais', icon: <User size={16} /> },
  { key: 'ferias', label: 'Ferias/Licencas', icon: <Calendar size={16} /> },
  { key: 'documentos', label: 'Documentos', icon: <FileText size={16} /> },
  { key: 'epis', label: 'EPIs', icon: <HardHat size={16} /> },
  { key: 'treinamentos', label: 'Treinamentos', icon: <GraduationCap size={16} /> },
  { key: 'ponto', label: 'Ponto', icon: <Clock size={16} /> },
  { key: 'folgas', label: 'Folgas', icon: <Coffee size={16} /> },
  { key: 'historico', label: 'Historico', icon: <TrendingUp size={16} /> },
  { key: 'beneficios', label: 'Beneficios', icon: <Gift size={16} /> },
  { key: 'saude', label: 'Saude', icon: <HeartPulse size={16} /> },
  { key: 'incidentes', label: 'Incidentes', icon: <AlertTriangle size={16} /> },
];

interface SummaryData {
  vacationBalance: VacationBalance | null;
  ppeStatus: { total_deliveries: number; active: number; expired: number; returned: number } | null;
  hrData: EmployeeHrData | null;
}

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setNavBarSelection } = useAppState();
  const usersId = Number(id);

  const [user, setUser] = useState<UserFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('dados');
  const [summary, setSummary] = useState<SummaryData>({
    vacationBalance: null,
    ppeStatus: null,
    hrData: null,
  });

  useEffect(() => {
    setNavBarSelection(8);
  }, []);

  useEffect(() => {
    if (!usersId || isNaN(usersId)) {
      navigate('/funcionario');
      return;
    }
    loadProfile();
  }, [usersId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [userData, hrData, vacBalance, ppeStatus] = await Promise.allSettled([
        usersApi.getUser(usersId),
        employeesApi.getHrData(usersId),
        employeesApi.getVacationBalance(usersId),
        ppeApi.getUserPpeStatus(usersId),
      ]);

      if (userData.status === 'fulfilled' && userData.value) {
        setUser(userData.value);
      }

      setSummary({
        hrData: hrData.status === 'fulfilled' ? hrData.value : null,
        vacationBalance: vacBalance.status === 'fulfilled' ? vacBalance.value : null,
        ppeStatus: ppeStatus.status === 'fulfilled' ? ppeStatus.value : null,
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  const hrData = summary.hrData;
  const displayName = user?.name || hrData?.nome_completo || hrData?.user?.name || user?.email || 'Funcionario';
  const displayCargo = hrData?.cargo || '-';
  const displayDepartamento = hrData?.departamento || '-';
  const displayMatricula = hrData?.matricula || '-';
  const ppeExpired = summary.ppeStatus?.expired ?? 0;
  const ppeTotal = summary.ppeStatus?.total_deliveries ?? 0;
  const ppeActive = summary.ppeStatus?.active ?? 0;
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n.charAt(0).toUpperCase())
    .join('');

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Back button */}
      <button
        className="btn btn-secondary"
        onClick={() => navigate('/funcionario')}
        style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* Profile Header */}
      <motion.div
        variants={fadeUpChild}
        style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={displayName}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              initials
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>{displayName}</h2>
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px', flexWrap: 'wrap', color: 'var(--color-secondary-text)', fontSize: '14px' }}>
              <span>{displayCargo}</span>
              <span>|</span>
              <span>{displayDepartamento}</span>
              <span>|</span>
              <span>Mat: {displayMatricula}</span>
            </div>
            {user?.email && (
              <div style={{ marginTop: '4px', color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                {user.email} {user.phone ? `| ${user.phone}` : ''}
              </div>
            )}
          </div>

          {/* Status badge */}
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              background: hrData?.data_demissao ? 'var(--color-error-bg, #fee)' : 'var(--color-success-bg, #efe)',
              color: hrData?.data_demissao ? 'var(--color-error, #c00)' : 'var(--color-success, #080)',
            }}
          >
            {hrData?.data_demissao ? 'Inativo' : 'Ativo'}
          </div>
        </div>

        {/* Summary cards */}
        <motion.div
          variants={staggerParent}
          initial="initial"
          animate="animate"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginTop: '20px',
          }}
        >
          <SummaryCard
            label="Ferias Disponiveis"
            value={`${summary.vacationBalance?.dias_disponiveis ?? 0} dias`}
            color="var(--color-primary)"
          />
          <SummaryCard
            label="EPIs Vencidos"
            value={`${ppeExpired}/${ppeTotal}`}
            color={ppeExpired > 0 ? 'var(--color-error, #c00)' : 'var(--color-success, #080)'}
          />
          <SummaryCard
            label="EPIs Ativos"
            value={String(ppeActive)}
            color="var(--color-primary)"
          />
          <SummaryCard
            label="Admissao"
            value={hrData?.data_admissao ? new Date(hrData.data_admissao).toLocaleDateString('pt-BR') : '-'}
            color="var(--color-secondary-text)"
          />
        </motion.div>
      </motion.div>

      {/* Tab navigation */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap',
          paddingBottom: '2px',
          marginBottom: '20px',
          borderBottom: '2px solid var(--color-border)',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              border: 'none',
              background: activeTab === tab.key ? 'var(--color-primary)' : 'transparent',
              color: activeTab === tab.key ? 'white' : 'var(--color-secondary-text)',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === tab.key ? 600 : 400,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'dados' && <HrDataTab usersId={usersId} />}
        {activeTab === 'ferias' && <VacationsTab usersId={usersId} />}
        {activeTab === 'documentos' && <DocumentsTab usersId={usersId} />}
        {activeTab === 'epis' && <PpeTab usersId={usersId} />}
        {activeTab === 'treinamentos' && <TrainingsTab usersId={usersId} />}
        {activeTab === 'ponto' && <TimeTrackingTab usersId={usersId} />}
        {activeTab === 'folgas' && <DayOffsTab usersId={usersId} />}
        {activeTab === 'historico' && <CareerHistoryTab usersId={usersId} />}
        {activeTab === 'beneficios' && <BenefitsTab usersId={usersId} />}
        {activeTab === 'saude' && <HealthTab usersId={usersId} />}
        {activeTab === 'incidentes' && <IncidentsTab usersId={usersId} />}
      </motion.div>
    </motion.div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div
      variants={fadeUpChild}
      style={{
        padding: '14px',
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '20px', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>{label}</div>
    </motion.div>
  );
}

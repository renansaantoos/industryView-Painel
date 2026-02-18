import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CalendarRange,
  ListTodo,
  ClipboardList,
  FileText,
  UserCog,
  Package,
  Settings,
  CreditCard,
  LogOut,
  Bot,
  Building2,
  ChevronDown,
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
  BarChart3,
  CheckSquare,
} from 'lucide-react';
import { staggerParent, fadeUpChild, slideDownVariants } from '../../lib/motion';
import './Sidebar.css';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  selectionIndex: number;
  requireAuth?: boolean;
}

export default function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { navBarSelection, setNavBarSelection, setProjects } = useAppState();
  const { logout, user } = useAuth();

  const [ssmaOpen, setSsmaOpen] = useState(false);
  const [opsOpen, setOpsOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);

  const mainItems: NavItem[] = [
    { key: 'dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard size={18} />, path: '/dashboard', selectionIndex: 1 },
    { key: 'projects', label: t('nav.projects'), icon: <FolderKanban size={18} />, path: '/projetos', selectionIndex: 2, requireAuth: true },
    { key: 'teams', label: t('nav.teams'), icon: <Users size={18} />, path: '/gestao-de-equipe', selectionIndex: 3, requireAuth: true },
    { key: 'sprints', label: t('nav.sprints'), icon: <CalendarRange size={18} />, path: '/sprints', selectionIndex: 4, requireAuth: true },
  ];

  const tasksSubItems: NavItem[] = [
    { key: 'tasks', label: t('nav.tasks'), icon: <ListTodo size={18} />, path: '/tarefas', selectionIndex: 5, requireAuth: true },
    { key: 'checklists', label: t('nav.checklists'), icon: <CheckSquare size={18} />, path: '/tarefas/checklists', selectionIndex: 29, requireAuth: true },
    { key: 'goldenRules', label: t('nav.goldenRules'), icon: <ShieldAlert size={18} />, path: '/regras-de-ouro', selectionIndex: 30, requireAuth: true },
    { key: 'backlog', label: t('nav.backlog'), icon: <ClipboardList size={18} />, path: '/backlog-tarefas', selectionIndex: 6 },
  ];

  const managementItems: NavItem[] = [
    { key: 'reports', label: t('nav.reports'), icon: <FileText size={18} />, path: '/relatorio', selectionIndex: 7, requireAuth: true },
    { key: 'employees', label: t('nav.employees'), icon: <UserCog size={18} />, path: '/funcionario', selectionIndex: 8, requireAuth: true },
    { key: 'inventory', label: t('nav.inventory'), icon: <Package size={18} />, path: '/estoque', selectionIndex: 9 },
    { key: 'planning', label: t('nav.planning'), icon: <BarChart3 size={18} />, path: '/planejamento', selectionIndex: 28, requireAuth: true },
  ];

  const ssmaItems: NavItem[] = [
    { key: 'incidents', label: t('nav.incidents'), icon: <ShieldAlert size={18} />, path: '/seguranca/incidentes', selectionIndex: 14 },
    { key: 'trainings', label: t('nav.trainings'), icon: <GraduationCap size={18} />, path: '/seguranca/treinamentos', selectionIndex: 15 },
    { key: 'dds', label: t('nav.dds'), icon: <MessageSquare size={18} />, path: '/seguranca/dds', selectionIndex: 16 },
    { key: 'workPermits', label: t('nav.workPermits'), icon: <FileCheck size={18} />, path: '/seguranca/permissoes', selectionIndex: 17 },
    { key: 'ppe', label: t('nav.ppe'), icon: <HardHat size={18} />, path: '/seguranca/epis', selectionIndex: 18 },
    { key: 'healthRecords', label: t('nav.healthRecords'), icon: <HeartPulse size={18} />, path: '/seguranca/saude', selectionIndex: 19 },
    { key: 'environmental', label: t('nav.environmental'), icon: <Leaf size={18} />, path: '/seguranca/ambiental', selectionIndex: 20 },
  ];

  const operationsItems: NavItem[] = [
    { key: 'dailyReports', label: t('nav.dailyReports'), icon: <ClipboardCheck size={18} />, path: '/operacoes/rdo', selectionIndex: 21 },
    { key: 'workforceControl', label: t('nav.workforceControl'), icon: <UserCheck size={18} />, path: '/operacoes/efetivo', selectionIndex: 22 },
    { key: 'nonConformances', label: t('nav.nonConformances'), icon: <AlertTriangle size={18} />, path: '/operacoes/nao-conformidades', selectionIndex: 23 },
    { key: 'documents', label: t('nav.documents'), icon: <FileArchive size={18} />, path: '/operacoes/documentos', selectionIndex: 24 },
    { key: 'contracts', label: t('nav.contracts'), icon: <Receipt size={18} />, path: '/operacoes/contratos', selectionIndex: 25 },
    { key: 'commissioning', label: t('nav.commissioning'), icon: <Zap size={18} />, path: '/operacoes/comissionamento', selectionIndex: 26 },
    { key: 'materialRequisitions', label: t('nav.materialRequisitions'), icon: <ShoppingCart size={18} />, path: '/operacoes/requisicoes', selectionIndex: 27 },
  ];

  const bottomItems: NavItem[] = [
    { key: 'company', label: t('nav.company'), icon: <Building2 size={18} />, path: '/configuracoes/empresa', selectionIndex: 13, requireAuth: true },
    { key: 'settings', label: t('nav.settings'), icon: <Settings size={18} />, path: '/configuracoes', selectionIndex: 11 },
    { key: 'account', label: t('nav.account'), icon: <CreditCard size={18} />, path: '/gerenciamentoda-conta', selectionIndex: 12, requireAuth: true },
  ];

  const handleNavClick = (item: NavItem) => {
    setNavBarSelection(item.selectionIndex);
    setProjects(false);
    navigate(item.path);
  };

  const isActive = (item: NavItem) => {
    return location.pathname === item.path || navBarSelection === item.selectionIndex;
  };

  const isSectionActive = (items: NavItem[]) => {
    return items.some((item) => isActive(item));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavItems = (items: NavItem[]) =>
    items.map((item) => (
      <motion.button
        key={item.key}
        variants={fadeUpChild}
        className={`sidebar-item ${isActive(item) ? 'active' : ''}`}
        onClick={() => handleNavClick(item)}
      >
        {item.icon}
        <span>{item.label}</span>
      </motion.button>
    ));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-brand">IndustryView</h1>
      </div>

      <div className="sidebar-divider" />

      <nav className="sidebar-nav">
        <motion.div className="sidebar-section" variants={staggerParent} initial="initial" animate="animate">
          <span className="sidebar-section-label">{t('nav.mainPages')}</span>
          {renderNavItems(mainItems)}
        </motion.div>

        {/* Tasks Section with sub-items */}
        <div className="sidebar-section">
          <button
            className={`sidebar-section-toggle ${tasksOpen || isSectionActive(tasksSubItems) ? 'open' : ''}`}
            onClick={() => setTasksOpen(!tasksOpen)}
          >
            <span>{t('nav.tasksSection')}</span>
            <ChevronDown size={14} className={`sidebar-chevron ${tasksOpen ? 'rotated' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {(tasksOpen || isSectionActive(tasksSubItems)) && (
              <motion.div
                variants={slideDownVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ overflow: 'hidden' }}
              >
                <motion.div variants={staggerParent} initial="initial" animate="animate">
                  {renderNavItems(tasksSubItems)}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div className="sidebar-section" variants={staggerParent} initial="initial" animate="animate">
          <span className="sidebar-section-label">{t('nav.management')}</span>
          {renderNavItems(managementItems)}
        </motion.div>

        {/* SSMA Section */}
        <div className="sidebar-section">
          <button
            className={`sidebar-section-toggle ${ssmaOpen || isSectionActive(ssmaItems) ? 'open' : ''}`}
            onClick={() => setSsmaOpen(!ssmaOpen)}
          >
            <span>{t('nav.ssma')}</span>
            <ChevronDown size={14} className={`sidebar-chevron ${ssmaOpen ? 'rotated' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {(ssmaOpen || isSectionActive(ssmaItems)) && (
              <motion.div
                variants={slideDownVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ overflow: 'hidden' }}
              >
                <motion.div variants={staggerParent} initial="initial" animate="animate">
                  {renderNavItems(ssmaItems)}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Operations Section */}
        <div className="sidebar-section">
          <button
            className={`sidebar-section-toggle ${opsOpen || isSectionActive(operationsItems) ? 'open' : ''}`}
            onClick={() => setOpsOpen(!opsOpen)}
          >
            <span>{t('nav.operations')}</span>
            <ChevronDown size={14} className={`sidebar-chevron ${opsOpen ? 'rotated' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {(opsOpen || isSectionActive(operationsItems)) && (
              <motion.div
                variants={slideDownVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ overflow: 'hidden' }}
              >
                <motion.div variants={staggerParent} initial="initial" animate="animate">
                  {renderNavItems(operationsItems)}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <div className="sidebar-bottom">
        {renderNavItems(bottomItems)}

        <div className="sidebar-divider" />

        <div className="sidebar-user">
          {user?.url ? (
            <img src={user.url} alt={user.name} className="sidebar-avatar" />
          ) : (
            <div className="sidebar-avatar-placeholder">
              <Bot size={18} />
            </div>
          )}
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name || 'User'}</span>
            <span className="sidebar-user-email">{user?.email || ''}</span>
          </div>
        </div>

        <button className="sidebar-item sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
}

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../contexts/AppStateContext';
import { changeLanguage, LANGUAGES, getCurrentLanguage } from '../../i18n';
import {
  Menu,
  X,
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
  LogOut,
  Globe,
  Map,
} from 'lucide-react';
import { slideDownVariants, staggerParent, fadeUpChild, dropdownVariants } from '../../lib/motion';
import './NavBar.css';

/**
 * Mobile navigation bar - visible only on small screens.
 * On desktop, the Sidebar is used instead.
 */
export default function NavBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { setNavBarSelection, setProjects } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const navItems = [
    { key: 'dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard', idx: 1 },
    { key: 'projects', label: t('nav.projects'), icon: <FolderKanban size={20} />, path: '/projetos', idx: 2 },
    { key: 'teams', label: t('nav.teams'), icon: <Users size={20} />, path: '/gestao-de-equipe', idx: 3 },
    { key: 'sprints', label: t('nav.sprints'), icon: <CalendarRange size={20} />, path: '/sprints', idx: 4 },
    { key: 'tasks', label: t('nav.tasks'), icon: <ListTodo size={20} />, path: '/tarefas', idx: 5 },
    { key: 'backlog', label: t('nav.backlog'), icon: <ClipboardList size={20} />, path: '/backlog-tarefas', idx: 6 },
    { key: 'reports', label: t('nav.reports'), icon: <FileText size={20} />, path: '/relatorio', idx: 7 },
    { key: 'employees', label: t('nav.employees'), icon: <UserCog size={20} />, path: '/funcionario', idx: 8 },
    { key: 'inventory', label: t('nav.inventory'), icon: <Package size={20} />, path: '/estoque', idx: 9 },
    { key: 'trackers', label: t('nav.trackers'), icon: <Map size={20} />, path: '/cadastrar-editar-tracker-copy2', idx: 10 },
    { key: 'settings', label: t('nav.settings'), icon: <Settings size={20} />, path: '/configuracoes', idx: 11 },
  ];

  const handleNavClick = (path: string, idx: number) => {
    setNavBarSelection(idx);
    setProjects(false);
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <header className="mobile-navbar">
      <div className="mobile-navbar-bar">
        <h1 className="mobile-navbar-brand" onClick={() => navigate('/dashboard')}>
          IndustryView
        </h1>
        <div className="mobile-navbar-actions">
          <button className="mobile-navbar-lang-btn" onClick={() => setShowLangMenu(!showLangMenu)}>
            <Globe size={20} />
          </button>
          <AnimatePresence>
            {showLangMenu && (
              <motion.div
                className="mobile-lang-dropdown"
                variants={dropdownVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    className={`mobile-lang-option ${getCurrentLanguage() === lang.code ? 'active' : ''}`}
                    onClick={() => { changeLanguage(lang.code); setShowLangMenu(false); }}
                  >
                    {lang.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <button className="mobile-navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-navbar-menu"
            variants={slideDownVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ overflow: 'hidden' }}
          >
            {user && (
              <div className="mobile-navbar-user">
                <span className="mobile-navbar-user-name">{user.name}</span>
                <span className="mobile-navbar-user-email">{user.email}</span>
              </div>
            )}
            <motion.nav className="mobile-navbar-nav" variants={staggerParent} initial="initial" animate="animate">
              {navItems.map(item => (
                <motion.button
                  key={item.key}
                  variants={fadeUpChild}
                  className={`mobile-navbar-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.path, item.idx)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </motion.nav>
            <div className="mobile-navbar-footer">
              <button className="mobile-navbar-item mobile-navbar-logout" onClick={handleLogout}>
                <LogOut size={20} />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Auth pages (no layout)
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import CompanySelect from '../pages/auth/CompanySelect';

// Main pages (with layout)
import Dashboard from '../pages/dashboard/Dashboard';
import ProjectList from '../pages/projects/ProjectList';
import CreateProject from '../pages/projects/CreateProject';
import EditProject from '../pages/projects/EditProject';
import ProjectDetails from '../pages/projects/ProjectDetails';
import TeamManagement from '../pages/team/TeamManagement';
import SprintList from '../pages/sprints/SprintList';
import CurrentSprint from '../pages/sprints/CurrentSprint';
import TaskList from '../pages/tasks/TaskList';
import ChecklistList from '../pages/tasks/ChecklistList';
import Backlog from '../pages/tasks/Backlog';
import TrackerEditor from '../pages/trackers/TrackerEditor';
import TrackerModuleMap from '../pages/trackers/TrackerModuleMap';
import Reports from '../pages/reports/Reports';
import DailyReport from '../pages/reports/DailyReport';
import DailyProductionReport from '../pages/reports/DailyProductionReport';
import Employees from '../pages/employees/Employees';
import EmployeeCreate from '../pages/employees/EmployeeCreate';
import EmployeeProfile from '../pages/employees/EmployeeProfile';
import Inventory from '../pages/inventory/Inventory';
import Settings from '../pages/settings/Settings';
import AccountManagement from '../pages/settings/AccountManagement';
import ImportTask from '../pages/import/ImportTask';
import Pricing from '../pages/pricing/Pricing';
import ExpiredPlan from '../pages/expired/ExpiredPlan';
import CompanyProfile from '../pages/company/CompanyProfile';

// Safety (SSMA) pages
import SafetyIncidents from '../pages/safety/SafetyIncidents';
import SafetyTraining from '../pages/safety/SafetyTraining';
import SafetyDDS from '../pages/safety/SafetyDDS';
import WorkPermits from '../pages/safety/WorkPermits';
import PPEManagement from '../pages/safety/PPEManagement';
import HealthRecords from '../pages/safety/HealthRecords';
import EnvironmentalLicenses from '../pages/safety/EnvironmentalLicenses';

// Operations pages
import DailyReportsEnhanced from '../pages/operations/DailyReportsEnhanced';
import WorkforceControl from '../pages/operations/WorkforceControl';
import NonConformances from '../pages/operations/NonConformances';
import DocumentManagement from '../pages/operations/DocumentManagement';
import ContractsManagement from '../pages/operations/ContractsManagement';
import CommissioningManagement from '../pages/operations/CommissioningManagement';
import MaterialRequisitions from '../pages/operations/MaterialRequisitions';

// Planning pages
import PlanningBaseline from '../pages/planning/PlanningBaseline';
import CronogramaView from '../pages/planning/CronogramaView';
import ImportSchedule from '../pages/import/ImportSchedule';

// Quality pages
import ChecklistManagement from '../pages/quality/ChecklistManagement';
import GoldenRulesManagement from '../pages/quality/GoldenRulesManagement';

// Notifications & Audit pages
import NotificationsPage from '../pages/notifications/NotificationsPage';
import AuditLogs from '../pages/audit/AuditLogs';

/**
 * Application routes.
 * Uses react-router-dom v6+ with layout routes.
 */
export const router = createBrowserRouter([
  // Auth routes (no sidebar/navbar)
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/cadastro',
    element: <Register />,
  },
  {
    path: '/esqueci-senha',
    element: <ForgotPassword />,
  },
  {
    path: '/empresa',
    element: <CompanySelect />,
  },

  // Main app routes (with sidebar/navbar layout)
  // ProtectedRoute wraps the layout so ALL children require login + company
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      {
        path: '/dashboard',
        element: <Dashboard />,
      },

      // Projects
      {
        path: '/projetos',
        element: <ProjectList />,
      },
      {
        path: '/criar-projeto',
        element: <CreateProject />,
      },
      {
        path: '/editar-projeto',
        element: <EditProject />,
      },
      {
        path: '/projeto-detalhes',
        element: <ProjectDetails />,
      },

      // Teams
      {
        path: '/gestao-de-equipe',
        element: <TeamManagement />,
      },

      // Sprints
      {
        path: '/sprints',
        element: <SprintList />,
      },
      {
        path: '/sprint-atual',
        element: <CurrentSprint />,
      },

      // Tasks
      {
        path: '/tarefas',
        element: <TaskList />,
      },
      {
        path: '/tarefas/checklists',
        element: <ChecklistList />,
      },
      {
        path: '/backlog-tarefas',
        element: <Backlog />,
      },

      // Trackers
      {
        path: '/cadastrar-editar-tracker-copy2',
        element: <TrackerEditor />,
      },
      {
        path: '/modulos-trackers-map',
        element: <TrackerModuleMap />,
      },

      // Reports
      {
        path: '/relatorio',
        element: <Reports />,
      },
      {
        path: '/relatorio-r-d-o',
        element: <DailyReport />,
      },
      {
        path: '/informe-diarias-prod',
        element: <DailyProductionReport />,
      },

      // Employees
      {
        path: '/funcionario',
        element: <Employees />,
      },
      {
        path: '/funcionario/novo',
        element: <EmployeeCreate />,
      },
      {
        path: '/funcionario/:id',
        element: <EmployeeProfile />,
      },

      // Inventory
      {
        path: '/estoque',
        element: <Inventory />,
      },

      // Safety (SSMA)
      {
        path: '/seguranca/incidentes',
        element: <SafetyIncidents />,
      },
      {
        path: '/seguranca/treinamentos',
        element: <SafetyTraining />,
      },
      {
        path: '/seguranca/dds',
        element: <SafetyDDS />,
      },
      {
        path: '/seguranca/permissoes',
        element: <WorkPermits />,
      },
      {
        path: '/seguranca/epis',
        element: <PPEManagement />,
      },
      {
        path: '/seguranca/saude',
        element: <HealthRecords />,
      },
      {
        path: '/seguranca/ambiental',
        element: <EnvironmentalLicenses />,
      },

      // Operations
      {
        path: '/operacoes/rdo',
        element: <DailyReportsEnhanced />,
      },
      {
        path: '/operacoes/efetivo',
        element: <WorkforceControl />,
      },
      {
        path: '/operacoes/nao-conformidades',
        element: <NonConformances />,
      },
      {
        path: '/operacoes/documentos',
        element: <DocumentManagement />,
      },
      {
        path: '/operacoes/contratos',
        element: <ContractsManagement />,
      },
      {
        path: '/operacoes/comissionamento',
        element: <CommissioningManagement />,
      },
      {
        path: '/operacoes/requisicoes',
        element: <MaterialRequisitions />,
      },

      // Planning
      {
        path: '/planejamento',
        element: <PlanningBaseline />,
      },

      // Cronograma
      {
        path: '/cronograma',
        element: <CronogramaView />,
      },
      {
        path: '/import-cronograma',
        element: <ImportSchedule />,
      },

      // Quality
      {
        path: '/checklists',
        element: <ChecklistManagement />,
      },
      {
        path: '/regras-de-ouro',
        element: <GoldenRulesManagement />,
      },

      // Notifications
      {
        path: '/notificacoes',
        element: <NotificationsPage />,
      },

      // Audit
      {
        path: '/auditoria',
        element: <AuditLogs />,
      },

      // Settings
      {
        path: '/configuracoes',
        element: <Settings />,
      },
      {
        path: '/configuracoes/empresa',
        element: <CompanyProfile />,
      },
      {
        path: '/gerenciamentoda-conta',
        element: <AccountManagement />,
      },

      // Import
      {
        path: '/import-task',
        element: <ImportTask />,
      },

      // Pricing
      {
        path: '/page-price',
        element: <Pricing />,
      },

      // Expired Plan
      {
        path: '/expiredplan',
        element: <ExpiredPlan />,
      },
    ],
  },

  // Root redirect: if logged in go to dashboard, otherwise login
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // Catch-all: redirect to dashboard
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;

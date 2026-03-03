// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { toolsApi } from '../../services';
import type { Department, ToolCategory, Tool, ToolMovement, ToolKit, ToolKitItem } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchableSelect from '../../components/common/SearchableSelect';
import {
  Plus,
  Edit,
  Trash2,
  Wrench,
  ArrowRightLeft,
  UserPlus,
  Users,
  FolderKanban,
  RotateCcw,
  PackagePlus,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Building2,
  Tag,
  History,
} from 'lucide-react';

/* =========================================
   Types
   ========================================= */

type ActiveTab = 'cadastro' | 'movimentacoes' | 'kits' | 'departamentos';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

interface ToolForm {
  name: string;
  description: string;
  control_type: 'patrimonio' | 'quantidade';
  patrimonio_code: string;
  quantity_total: string;
  category_id: string;
  brand: string;
  model: string;
  serial_number: string;
  condition: string;
  branch_id: string;
  department_id: string;
  notes: string;
}

const EMPTY_TOOL_FORM: ToolForm = {
  name: '',
  description: '',
  control_type: 'patrimonio',
  patrimonio_code: '',
  quantity_total: '1',
  category_id: '',
  brand: '',
  model: '',
  serial_number: '',
  condition: 'novo',
  branch_id: '',
  department_id: '',
  notes: '',
};

const PER_PAGE = 10;

const CONDITION_LABELS: Record<string, string> = {
  novo: 'Novo',
  bom: 'Bom',
  regular: 'Regular',
  danificado: 'Danificado',
  descartado: 'Descartado',
};

const CONDITION_COLORS: Record<string, string> = {
  novo: 'bg-green-100 text-green-800',
  bom: 'bg-blue-100 text-blue-800',
  regular: 'bg-yellow-100 text-yellow-800',
  danificado: 'bg-red-100 text-red-800',
  descartado: 'bg-gray-100 text-gray-800',
};

const MOVEMENT_LABELS: Record<string, string> = {
  entrada: 'Entrada',
  saida: 'Saida',
  transferencia: 'Transferencia',
  atribuicao_funcionario: 'Atribuicao Funcionario',
  atribuicao_equipe: 'Atribuicao Equipe',
  atribuicao_projeto: 'Atribuicao Projeto',
  devolucao: 'Devolucao',
  atribuicao_kit: 'Atribuicao Kit',
};

/* =========================================
   Helpers
   ========================================= */

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('pt-BR');
}

/* =========================================
   Main Component
   ========================================= */

export default function ToolsManagement() {
  const { setNavBarSelection } = useAppState();
  const { user } = useAuthContext();

  useEffect(() => {
    setNavBarSelection(28);
  }, []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('cadastro');
  const [toast, setToast] = useState<ToastState | null>(null);

  // ---- Common data ----
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [branches, setBranches] = useState<{ id: number; brand_name: string }[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: number; name: string }[]>([]);
  const [allTeams, setAllTeams] = useState<{ id: number; name: string }[]>([]);
  const [allProjects, setAllProjects] = useState<{ id: number; name: string }[]>([]);

  // ---- Tools state ----
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);
  const [toolPage, setToolPage] = useState(1);
  const [toolTotalPages, setToolTotalPages] = useState(1);
  const [toolTotalItems, setToolTotalItems] = useState(0);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterControlType, setFilterControlType] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [showToolModal, setShowToolModal] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [toolForm, setToolForm] = useState<ToolForm>(EMPTY_TOOL_FORM);
  const [toolFormLoading, setToolFormLoading] = useState(false);
  const [deleteToolConfirm, setDeleteToolConfirm] = useState<Tool | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolMovements, setToolMovements] = useState<ToolMovement[]>([]);
  const [toolMovementsLoading, setToolMovementsLoading] = useState(false);

  // ---- Movements state ----
  const [movements, setMovements] = useState<ToolMovement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(true);
  const [movPage, setMovPage] = useState(1);
  const [movTotalPages, setMovTotalPages] = useState(1);
  const [movTotalItems, setMovTotalItems] = useState(0);
  const [showMovModal, setShowMovModal] = useState<string | null>(null);
  const [movForm, setMovForm] = useState<Record<string, string>>({});
  const [movFormLoading, setMovFormLoading] = useState(false);

  // ---- Kits state ----
  const [kits, setKits] = useState<ToolKit[]>([]);
  const [kitsLoading, setKitsLoading] = useState(true);
  const [selectedKit, setSelectedKit] = useState<ToolKit | null>(null);
  const [showKitModal, setShowKitModal] = useState(false);
  const [editingKit, setEditingKit] = useState<ToolKit | null>(null);
  const [kitForm, setKitForm] = useState({ name: '', cargo: '', description: '' });
  const [kitFormLoading, setKitFormLoading] = useState(false);
  const [deleteKitConfirm, setDeleteKitConfirm] = useState<ToolKit | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [addItemForm, setAddItemForm] = useState({ category_id: '', quantity: '1' });
  const [deleteKitItemConfirm, setDeleteKitItemConfirm] = useState<ToolKitItem | null>(null);

  // ---- Departments state ----
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });
  const [deptFormLoading, setDeptFormLoading] = useState(false);
  const [deleteDeptConfirm, setDeleteDeptConfirm] = useState<Department | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<ToolCategory | null>(null);
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [catFormLoading, setCatFormLoading] = useState(false);
  const [deleteCatConfirm, setDeleteCatConfirm] = useState<ToolCategory | null>(null);

  /* =========================================
     Toast
     ========================================= */

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  /* =========================================
     Load Data
     ========================================= */

  const loadCommonData = useCallback(async () => {
    try {
      const [depts, cats] = await Promise.all([
        toolsApi.listDepartments(),
        toolsApi.listCategories(),
      ]);
      setDepartments(Array.isArray(depts) ? depts : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch {
      // silent
    }

    try {
      const { usersApi } = await import('../../services');
      const usersResp = await usersApi.getAllUsersDropdown();
      setAllUsers(Array.isArray(usersResp) ? usersResp.map((u: any) => ({ id: Number(u.id), name: u.name || '' })) : []);
    } catch { /* silent */ }

    try {
      const { companyApi } = await import('../../services');
      const branchResp = await companyApi.getBranches(user?.companyId || 0);
      setBranches(Array.isArray(branchResp) ? branchResp.map((b: any) => ({ id: Number(b.id), brand_name: b.brand_name || b.name || '' })) : []);
    } catch { /* silent */ }

    try {
      const { teamsApi } = await import('../../services');
      const teamsResp = await teamsApi.queryAllTeams({ per_page: 100 });
      const teamItems = (teamsResp as any)?.items ?? teamsResp;
      setAllTeams(Array.isArray(teamItems) ? teamItems.map((t: any) => ({ id: Number(t.id), name: t.name || '' })) : []);
    } catch { /* silent */ }

    try {
      const { projectsApi } = await import('../../services');
      const projectsResp = await projectsApi.queryAllProjects({ per_page: 100 });
      const projItems = (projectsResp as any)?.items ?? projectsResp;
      setAllProjects(Array.isArray(projItems) ? projItems.map((p: any) => ({ id: Number(p.id), name: p.name || '' })) : []);
    } catch { /* silent */ }
  }, [user]);

  const loadTools = useCallback(async () => {
    setToolsLoading(true);
    try {
      const params: Parameters<typeof toolsApi.listTools>[0] = {
        page: toolPage,
        per_page: PER_PAGE,
      };
      if (filterSearch.trim()) params.search = filterSearch.trim();
      if (filterCategory) params.category_id = parseInt(filterCategory, 10);
      if (filterControlType) params.control_type = filterControlType;
      if (filterCondition) params.condition = filterCondition;
      const data = await toolsApi.listTools(params);
      setTools(data.items ?? []);
      setToolTotalPages(data.pageTotal ?? 1);
      setToolTotalItems(data.itemsTotal ?? 0);
    } catch {
      showToast('Erro ao carregar ferramentas', 'error');
    } finally {
      setToolsLoading(false);
    }
  }, [toolPage, filterSearch, filterCategory, filterControlType, filterCondition, showToast]);

  const loadMovements = useCallback(async () => {
    setMovementsLoading(true);
    try {
      const data = await toolsApi.listMovements({ page: movPage, per_page: PER_PAGE });
      setMovements(data.items ?? []);
      setMovTotalPages(data.pageTotal ?? 1);
      setMovTotalItems(data.itemsTotal ?? 0);
    } catch {
      showToast('Erro ao carregar movimentacoes', 'error');
    } finally {
      setMovementsLoading(false);
    }
  }, [movPage, showToast]);

  const loadKits = useCallback(async () => {
    setKitsLoading(true);
    try {
      const data = await toolsApi.listKits();
      setKits(Array.isArray(data) ? data : []);
    } catch {
      showToast('Erro ao carregar kits', 'error');
    } finally {
      setKitsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCommonData();
  }, [loadCommonData]);

  useEffect(() => {
    if (activeTab === 'cadastro') loadTools();
  }, [activeTab, loadTools]);

  useEffect(() => {
    if (activeTab === 'movimentacoes') loadMovements();
  }, [activeTab, loadMovements]);

  useEffect(() => {
    if (activeTab === 'kits') loadKits();
  }, [activeTab, loadKits]);

  /* =========================================
     Tool CRUD
     ========================================= */

  const openToolModal = (tool?: Tool) => {
    if (tool) {
      setEditingTool(tool);
      setToolForm({
        name: tool.name,
        description: tool.description || '',
        control_type: tool.control_type,
        patrimonio_code: tool.patrimonio_code || '',
        quantity_total: String(tool.quantity_total),
        category_id: tool.category_id ? String(tool.category_id) : '',
        brand: tool.brand || '',
        model: tool.model || '',
        serial_number: tool.serial_number || '',
        condition: tool.condition,
        branch_id: tool.branch_id ? String(tool.branch_id) : '',
        department_id: tool.department_id ? String(tool.department_id) : '',
        notes: tool.notes || '',
      });
    } else {
      setEditingTool(null);
      setToolForm(EMPTY_TOOL_FORM);
    }
    setShowToolModal(true);
  };

  const handleToolSubmit = async () => {
    if (!toolForm.name.trim()) {
      showToast('Nome e obrigatorio', 'error');
      return;
    }
    if (toolForm.control_type === 'patrimonio' && !toolForm.patrimonio_code.trim()) {
      showToast('Codigo de patrimonio e obrigatorio para tipo patrimonio', 'error');
      return;
    }

    setToolFormLoading(true);
    try {
      if (editingTool) {
        await toolsApi.updateTool(editingTool.id, {
          name: toolForm.name,
          description: toolForm.description || undefined,
          patrimonio_code: toolForm.patrimonio_code || undefined,
          quantity_total: toolForm.control_type === 'quantidade' ? parseInt(toolForm.quantity_total, 10) : undefined,
          category_id: toolForm.category_id ? parseInt(toolForm.category_id, 10) : undefined,
          brand: toolForm.brand || undefined,
          model: toolForm.model || undefined,
          serial_number: toolForm.serial_number || undefined,
          condition: toolForm.condition,
          branch_id: toolForm.branch_id ? parseInt(toolForm.branch_id, 10) : null,
          department_id: toolForm.department_id ? parseInt(toolForm.department_id, 10) : null,
          notes: toolForm.notes || undefined,
        });
        showToast('Ferramenta atualizada com sucesso', 'success');
      } else {
        await toolsApi.createTool({
          name: toolForm.name,
          control_type: toolForm.control_type,
          description: toolForm.description || undefined,
          patrimonio_code: toolForm.patrimonio_code || undefined,
          quantity_total: parseInt(toolForm.quantity_total, 10),
          category_id: toolForm.category_id ? parseInt(toolForm.category_id, 10) : undefined,
          brand: toolForm.brand || undefined,
          model: toolForm.model || undefined,
          serial_number: toolForm.serial_number || undefined,
          condition: toolForm.condition,
          branch_id: toolForm.branch_id ? parseInt(toolForm.branch_id, 10) : undefined,
          department_id: toolForm.department_id ? parseInt(toolForm.department_id, 10) : undefined,
          notes: toolForm.notes || undefined,
        });
        showToast('Ferramenta cadastrada com sucesso', 'success');
      }
      setShowToolModal(false);
      loadTools();
    } catch {
      showToast('Erro ao salvar ferramenta', 'error');
    } finally {
      setToolFormLoading(false);
    }
  };

  const handleDeleteTool = async () => {
    if (!deleteToolConfirm) return;
    try {
      await toolsApi.deleteTool(deleteToolConfirm.id);
      showToast('Ferramenta excluida com sucesso', 'success');
      setDeleteToolConfirm(null);
      loadTools();
    } catch {
      showToast('Erro ao excluir ferramenta', 'error');
    }
  };

  const loadToolDetail = async (tool: Tool) => {
    setSelectedTool(tool);
    setToolMovementsLoading(true);
    try {
      const mvts = await toolsApi.getToolMovements(tool.id);
      setToolMovements(Array.isArray(mvts) ? mvts : []);
    } catch {
      setToolMovements([]);
    } finally {
      setToolMovementsLoading(false);
    }
  };

  /* =========================================
     Movement Actions
     ========================================= */

  const handleMovAction = async () => {
    if (!showMovModal) return;
    setMovFormLoading(true);
    try {
      const toolId = parseInt(movForm.tool_id || '0', 10);
      const qty = parseInt(movForm.quantity || '1', 10);

      if (showMovModal === 'transfer') {
        await toolsApi.transferTool({
          tool_id: toolId,
          to_branch_id: movForm.to_branch_id ? parseInt(movForm.to_branch_id, 10) : undefined,
          to_department_id: movForm.to_department_id ? parseInt(movForm.to_department_id, 10) : undefined,
          quantity: qty,
          notes: movForm.notes || undefined,
        });
        showToast('Transferencia realizada com sucesso', 'success');
      } else if (showMovModal === 'assign-employee') {
        await toolsApi.assignEmployee({
          tool_id: toolId,
          user_id: parseInt(movForm.user_id || '0', 10),
          quantity: qty,
          notes: movForm.notes || undefined,
        });
        showToast('Ferramenta atribuida ao funcionario', 'success');
      } else if (showMovModal === 'assign-team') {
        await toolsApi.assignTeam({
          tool_id: toolId,
          team_id: parseInt(movForm.team_id || '0', 10),
          quantity: qty,
          notes: movForm.notes || undefined,
        });
        showToast('Ferramenta atribuida a equipe', 'success');
      } else if (showMovModal === 'assign-project') {
        await toolsApi.assignProject({
          tool_id: toolId,
          project_id: parseInt(movForm.project_id || '0', 10),
          quantity: qty,
          notes: movForm.notes || undefined,
        });
        showToast('Ferramenta atribuida ao projeto', 'success');
      } else if (showMovModal === 'return') {
        await toolsApi.returnTool({
          tool_id: toolId,
          condition: movForm.condition || 'bom',
          to_branch_id: movForm.to_branch_id ? parseInt(movForm.to_branch_id, 10) : undefined,
          to_department_id: movForm.to_department_id ? parseInt(movForm.to_department_id, 10) : undefined,
          quantity: qty,
          notes: movForm.notes || undefined,
        });
        showToast('Devolucao registrada com sucesso', 'success');
      } else if (showMovModal === 'assign-kit') {
        await toolsApi.assignKit({
          user_id: parseInt(movForm.user_id || '0', 10),
          kit_id: parseInt(movForm.kit_id || '0', 10),
          notes: movForm.notes || undefined,
        });
        showToast('Kit atribuido com sucesso', 'success');
      }
      setShowMovModal(null);
      setMovForm({});
      loadMovements();
      loadTools();
    } catch {
      showToast('Erro na movimentacao', 'error');
    } finally {
      setMovFormLoading(false);
    }
  };

  /* =========================================
     Kit CRUD
     ========================================= */

  const openKitModal = (kit?: ToolKit) => {
    if (kit) {
      setEditingKit(kit);
      setKitForm({ name: kit.name, cargo: kit.cargo, description: kit.description || '' });
    } else {
      setEditingKit(null);
      setKitForm({ name: '', cargo: '', description: '' });
    }
    setShowKitModal(true);
  };

  const handleKitSubmit = async () => {
    if (!kitForm.name.trim() || !kitForm.cargo.trim()) {
      showToast('Nome e cargo sao obrigatorios', 'error');
      return;
    }
    setKitFormLoading(true);
    try {
      if (editingKit) {
        await toolsApi.updateKit(editingKit.id, kitForm);
        showToast('Kit atualizado com sucesso', 'success');
      } else {
        await toolsApi.createKit(kitForm);
        showToast('Kit criado com sucesso', 'success');
      }
      setShowKitModal(false);
      loadKits();
    } catch {
      showToast('Erro ao salvar kit', 'error');
    } finally {
      setKitFormLoading(false);
    }
  };

  const handleDeleteKit = async () => {
    if (!deleteKitConfirm) return;
    try {
      await toolsApi.deleteKit(deleteKitConfirm.id);
      showToast('Kit excluido com sucesso', 'success');
      setDeleteKitConfirm(null);
      if (selectedKit?.id === deleteKitConfirm.id) setSelectedKit(null);
      loadKits();
    } catch {
      showToast('Erro ao excluir kit', 'error');
    }
  };

  const handleAddKitItem = async () => {
    if (!selectedKit || !addItemForm.category_id) return;
    try {
      await toolsApi.addKitItem(selectedKit.id, {
        category_id: parseInt(addItemForm.category_id, 10),
        quantity: parseInt(addItemForm.quantity || '1', 10),
      });
      showToast('Item adicionado ao kit', 'success');
      setShowAddItemModal(false);
      setAddItemForm({ category_id: '', quantity: '1' });
      loadKits();
      const updated = await toolsApi.getKitById(selectedKit.id);
      setSelectedKit(updated);
    } catch {
      showToast('Erro ao adicionar item ao kit', 'error');
    }
  };

  const handleDeleteKitItem = async () => {
    if (!deleteKitItemConfirm || !selectedKit) return;
    try {
      await toolsApi.deleteKitItem(selectedKit.id, deleteKitItemConfirm.id);
      showToast('Item removido do kit', 'success');
      setDeleteKitItemConfirm(null);
      loadKits();
      const updated = await toolsApi.getKitById(selectedKit.id);
      setSelectedKit(updated);
    } catch {
      showToast('Erro ao remover item do kit', 'error');
    }
  };

  /* =========================================
     Department CRUD
     ========================================= */

  const openDeptModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setDeptForm({ name: dept.name, description: dept.description || '' });
    } else {
      setEditingDept(null);
      setDeptForm({ name: '', description: '' });
    }
    setShowDeptModal(true);
  };

  const handleDeptSubmit = async () => {
    if (!deptForm.name.trim()) { showToast('Nome e obrigatorio', 'error'); return; }
    setDeptFormLoading(true);
    try {
      if (editingDept) {
        await toolsApi.updateDepartment(editingDept.id, deptForm);
        showToast('Departamento atualizado', 'success');
      } else {
        await toolsApi.createDepartment(deptForm);
        showToast('Departamento criado', 'success');
      }
      setShowDeptModal(false);
      loadCommonData();
    } catch {
      showToast('Erro ao salvar departamento', 'error');
    } finally {
      setDeptFormLoading(false);
    }
  };

  const handleDeleteDept = async () => {
    if (!deleteDeptConfirm) return;
    try {
      await toolsApi.deleteDepartment(deleteDeptConfirm.id);
      showToast('Departamento excluido', 'success');
      setDeleteDeptConfirm(null);
      loadCommonData();
    } catch {
      showToast('Erro ao excluir departamento', 'error');
    }
  };

  /* =========================================
     Category CRUD
     ========================================= */

  const openCatModal = (cat?: ToolCategory) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ name: cat.name, description: cat.description || '' });
    } else {
      setEditingCat(null);
      setCatForm({ name: '', description: '' });
    }
    setShowCatModal(true);
  };

  const handleCatSubmit = async () => {
    if (!catForm.name.trim()) { showToast('Nome e obrigatorio', 'error'); return; }
    setCatFormLoading(true);
    try {
      if (editingCat) {
        await toolsApi.updateCategory(editingCat.id, catForm);
        showToast('Categoria atualizada', 'success');
      } else {
        await toolsApi.createCategory(catForm);
        showToast('Categoria criada', 'success');
      }
      setShowCatModal(false);
      loadCommonData();
    } catch {
      showToast('Erro ao salvar categoria', 'error');
    } finally {
      setCatFormLoading(false);
    }
  };

  const handleDeleteCat = async () => {
    if (!deleteCatConfirm) return;
    try {
      await toolsApi.deleteCategory(deleteCatConfirm.id);
      showToast('Categoria excluida', 'success');
      setDeleteCatConfirm(null);
      loadCommonData();
    } catch {
      showToast('Erro ao excluir categoria', 'error');
    }
  };

  /* =========================================
     Tab Definitions
     ========================================= */

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'cadastro', label: 'Cadastro', icon: <Wrench className="w-5 h-5" /> },
    { key: 'movimentacoes', label: 'Movimentacoes', icon: <ArrowRightLeft className="w-5 h-5" /> },
    { key: 'kits', label: 'Kits', icon: <PackagePlus className="w-5 h-5" /> },
    { key: 'departamentos', label: 'Departamentos', icon: <Building2 className="w-5 h-5" /> },
  ];

  /* =========================================
     Tool Select Options
     ========================================= */

  const toolOptions = tools.map(t => ({
    value: t.id,
    label: `${t.name}${t.patrimonio_code ? ` (${t.patrimonio_code})` : ''}`,
  }));

  const userOptions = allUsers.map(u => ({ value: u.id, label: u.name || `User ${u.id}` }));
  const teamOptions = allTeams.map(t => ({ value: t.id, label: t.name || `Team ${t.id}` }));
  const projectOptions = allProjects.map(p => ({ value: p.id, label: p.name || `Projeto ${p.id}` }));
  const branchOptions = branches.map(b => ({ value: b.id, label: b.brand_name }));
  const deptOptions = departments.map(d => ({ value: d.id, label: d.name }));
  const catOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const kitOptions = kits.map(k => ({ value: k.id, label: `${k.name} (${k.cargo})` }));

  /* =========================================
     Render
     ========================================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Ferramentas" subtitle="Gerenciamento de ferramentas, movimentacoes e kits" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 p-4 rounded-lg ${
              toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {toast.message}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ============= CADASTRO TAB ============= */}
        {activeTab === 'cadastro' && (
          <motion.div key="cadastro-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {selectedTool ? (
              <div className="bg-white rounded-lg shadow p-6">
                <button onClick={() => setSelectedTool(null)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
                  <ChevronRight size={14} className="rotate-180" /> Voltar para lista
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedTool.name}</h3>
                    <p className="text-sm text-gray-500">{selectedTool.description || '-'}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${CONDITION_COLORS[selectedTool.condition] || 'bg-gray-100'}`}>
                        {CONDITION_LABELS[selectedTool.condition] || selectedTool.condition}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                        {selectedTool.control_type === 'patrimonio' ? 'Patrimonio' : 'Quantidade'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {selectedTool.patrimonio_code && <p><strong>Patrimonio:</strong> {selectedTool.patrimonio_code}</p>}
                    {selectedTool.control_type === 'quantidade' && <p><strong>Disponivel:</strong> {selectedTool.quantity_available} / {selectedTool.quantity_total}</p>}
                    {selectedTool.category && <p><strong>Categoria:</strong> {selectedTool.category.name}</p>}
                    {selectedTool.branch && <p><strong>Filial:</strong> {selectedTool.branch.brand_name}</p>}
                    {selectedTool.department && <p><strong>Departamento:</strong> {selectedTool.department.name}</p>}
                    {selectedTool.assigned_user && <p><strong>Funcionario:</strong> {selectedTool.assigned_user.name}</p>}
                    {selectedTool.assigned_team && <p><strong>Equipe:</strong> {selectedTool.assigned_team.name}</p>}
                    {selectedTool.brand && <p><strong>Marca:</strong> {selectedTool.brand}</p>}
                    {selectedTool.model && <p><strong>Modelo:</strong> {selectedTool.model}</p>}
                  </div>
                </div>

                <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <History size={16} /> Historico de Movimentacoes
                </h4>
                {toolMovementsLoading ? <LoadingSpinner /> : toolMovements.length === 0 ? (
                  <EmptyState message="Nenhuma movimentacao encontrada" />
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-300">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Qtd</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Condicao</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Por</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Obs</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {toolMovements.map(m => (
                          <tr key={m.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900">{MOVEMENT_LABELS[m.movement_type] || m.movement_type}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{m.quantity}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{m.condition ? (CONDITION_LABELS[m.condition] || m.condition) : '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{m.performed_by?.name || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{m.notes || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{formatDate(m.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Filters */}
                <div className="mb-6 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar por nome, patrimonio, serial..."
                        value={filterSearch}
                        onChange={(e) => { setFilterSearch(e.target.value); setToolPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setToolPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Todas categorias</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select value={filterControlType} onChange={(e) => { setFilterControlType(e.target.value); setToolPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Todos tipos</option>
                    <option value="patrimonio">Patrimonio</option>
                    <option value="quantidade">Quantidade</option>
                  </select>
                  <select value={filterCondition} onChange={(e) => { setFilterCondition(e.target.value); setToolPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Todas condicoes</option>
                    {Object.entries(CONDITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <button onClick={() => openToolModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" /> Nova Ferramenta
                  </button>
                </div>

                {/* Table */}
                {toolsLoading ? <LoadingSpinner /> : tools.length === 0 ? (
                  <EmptyState icon={<Wrench className="w-12 h-12" />} title="Nenhuma ferramenta encontrada" description="Comece cadastrando uma nova ferramenta" />
                ) : (
                  <>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100 border-b border-gray-300">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Categoria</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patrimonio/Qtd</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Condicao</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Atribuido</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Acoes</th>
                          </tr>
                        </thead>
                        <tbody>
                          <motion.div variants={staggerParent} initial="initial" animate="animate">
                            {tools.map(tool => (
                              <motion.tr key={tool.id} variants={tableRowVariants} className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => loadToolDetail(tool)}>
                                <td className="px-6 py-4 text-sm text-gray-900">{tool.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{tool.category?.name || '-'}</td>
                                <td className="px-6 py-4 text-sm">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                    {tool.control_type === 'patrimonio' ? 'Patrimonio' : 'Quantidade'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {tool.control_type === 'patrimonio' ? (tool.patrimonio_code || '-') : `${tool.quantity_available}/${tool.quantity_total}`}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${CONDITION_COLORS[tool.condition] || 'bg-gray-100'}`}>
                                    {CONDITION_LABELS[tool.condition] || tool.condition}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {tool.assigned_user?.name || tool.assigned_team?.name || '-'}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => openToolModal(tool)} className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                                    <Edit className="w-4 h-4" /> Editar
                                  </button>
                                  <button onClick={() => setDeleteToolConfirm(tool)} className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                                    <Trash2 className="w-4 h-4" /> Deletar
                                  </button>
                                </td>
                              </motion.tr>
                            ))}
                          </motion.div>
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4">
                      <Pagination currentPage={toolPage} totalPages={toolTotalPages} onPageChange={setToolPage} totalItems={toolTotalItems} itemsPerPage={PER_PAGE} />
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ============= MOVIMENTACOES TAB ============= */}
        {activeTab === 'movimentacoes' && (
          <motion.div key="movimentacoes-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="mb-6 flex flex-wrap gap-3">
              {([
                { key: 'transfer', label: 'Transferir', icon: <ArrowRightLeft className="w-4 h-4" /> },
                { key: 'assign-employee', label: 'Atribuir Func.', icon: <UserPlus className="w-4 h-4" /> },
                { key: 'assign-team', label: 'Atribuir Equipe', icon: <Users className="w-4 h-4" /> },
                { key: 'assign-project', label: 'Atribuir Projeto', icon: <FolderKanban className="w-4 h-4" /> },
                { key: 'return', label: 'Devolver', icon: <RotateCcw className="w-4 h-4" /> },
                { key: 'assign-kit', label: 'Atribuir Kit', icon: <PackagePlus className="w-4 h-4" /> },
              ] as const).map(action => (
                <button
                  key={action.key}
                  onClick={() => { setShowMovModal(action.key); setMovForm({ quantity: '1' }); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {action.icon} {action.label}
                </button>
              ))}
            </div>

            {movementsLoading ? <LoadingSpinner /> : movements.length === 0 ? (
              <EmptyState icon={<ArrowRightLeft className="w-12 h-12" />} title="Nenhuma movimentacao encontrada" description="Utilize os botoes acima para registrar movimentacoes" />
            ) : (
              <>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-300">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ferramenta</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Qtd</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Condicao</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Realizado por</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Obs</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map(m => (
                        <tr key={m.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900">{m.tool?.name || '-'}{m.tool?.patrimonio_code ? ` (${m.tool.patrimonio_code})` : ''}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{MOVEMENT_LABELS[m.movement_type] || m.movement_type}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{m.quantity}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{m.condition ? (CONDITION_LABELS[m.condition] || m.condition) : '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{m.performed_by?.name || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{m.notes || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{formatDate(m.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <Pagination currentPage={movPage} totalPages={movTotalPages} onPageChange={setMovPage} totalItems={movTotalItems} itemsPerPage={PER_PAGE} />
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ============= KITS TAB ============= */}
        {activeTab === 'kits' && (
          <motion.div key="kits-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Kits</h3>
                  <button onClick={() => openKitModal()} className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" /> Novo Kit
                  </button>
                </div>
                {kitsLoading ? <LoadingSpinner /> : kits.length === 0 ? (
                  <EmptyState icon={<PackagePlus className="w-12 h-12" />} title="Nenhum kit cadastrado" description="Crie um kit para agrupar ferramentas por cargo" />
                ) : (
                  <div className="space-y-2">
                    {kits.map(kit => (
                      <div key={kit.id} onClick={() => setSelectedKit(kit)} className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedKit?.id === kit.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{kit.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{kit.cargo}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={(e) => { e.stopPropagation(); openKitModal(kit); }} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"><Edit className="w-3 h-3" /></button>
                            <button onClick={(e) => { e.stopPropagation(); setDeleteKitConfirm(kit); }} className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{kit.items?.length || 0} itens</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                {selectedKit ? (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedKit.name}</h3>
                        <p className="text-sm text-gray-500">Cargo: {selectedKit.cargo}</p>
                        {selectedKit.description && <p className="text-sm text-gray-400 mt-1">{selectedKit.description}</p>}
                      </div>
                      <button onClick={() => setShowAddItemModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-4 h-4" /> Adicionar Item
                      </button>
                    </div>
                    {(selectedKit.items?.length || 0) === 0 ? (
                      <EmptyState message="Nenhum item neste kit" />
                    ) : (
                      <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b border-gray-300">
                            <tr>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Categoria</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quantidade</th>
                              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Acoes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedKit.items?.map(item => (
                              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-900">{item.category?.name || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{item.quantity}</td>
                                <td className="px-6 py-4 text-right">
                                  <button onClick={() => setDeleteKitItemConfirm(item)} className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                                    <Trash2 className="w-4 h-4" /> Remover
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow flex items-center justify-center h-48 text-gray-400 text-sm">
                    Selecione um kit para ver detalhes
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ============= DEPARTAMENTOS TAB ============= */}
        {activeTab === 'departamentos' && (
          <motion.div key="departamentos-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><Building2 className="w-5 h-5" /> Departamentos</h3>
                  <button onClick={() => openDeptModal()} className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" /> Novo
                  </button>
                </div>
                {departments.length === 0 ? (
                  <EmptyState icon={<Building2 className="w-12 h-12" />} title="Nenhum departamento" description="Crie departamentos para organizar ferramentas" />
                ) : (
                  <div className="space-y-2">
                    {departments.map(d => (
                      <div key={d.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{d.name}</p>
                          {d.description && <p className="text-xs text-gray-500 mt-1">{d.description}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openDeptModal(d)} className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteDeptConfirm(d)} className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><Tag className="w-5 h-5" /> Categorias de Ferramentas</h3>
                  <button onClick={() => openCatModal()} className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" /> Nova
                  </button>
                </div>
                {categories.length === 0 ? (
                  <EmptyState icon={<Tag className="w-12 h-12" />} title="Nenhuma categoria" description="Crie categorias para classificar ferramentas" />
                ) : (
                  <div className="space-y-2">
                    {categories.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                          {c.description && <p className="text-xs text-gray-500 mt-1">{c.description}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openCatModal(c)} className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteCatConfirm(c)} className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ============= MODALS ============= */}

        {/* Tool Modal */}
        {showToolModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{editingTool ? 'Editar Ferramenta' : 'Nova Ferramenta'}</h2>
                <button onClick={() => setShowToolModal(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input type="text" value={toolForm.name} onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                {!editingTool && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Controle *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm"><input type="radio" name="control_type" value="patrimonio" checked={toolForm.control_type === 'patrimonio'} onChange={() => setToolForm({ ...toolForm, control_type: 'patrimonio' })} /> Patrimonio (codigo unico)</label>
                      <label className="flex items-center gap-2 text-sm"><input type="radio" name="control_type" value="quantidade" checked={toolForm.control_type === 'quantidade'} onChange={() => setToolForm({ ...toolForm, control_type: 'quantidade' })} /> Quantidade (volume)</label>
                    </div>
                  </div>
                )}
                {toolForm.control_type === 'patrimonio' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Codigo Patrimonio *</label>
                    <input type="text" value={toolForm.patrimonio_code} onChange={(e) => setToolForm({ ...toolForm, patrimonio_code: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                )}
                {toolForm.control_type === 'quantidade' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Total</label>
                    <input type="number" min="1" value={toolForm.quantity_total} onChange={(e) => setToolForm({ ...toolForm, quantity_total: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <SearchableSelect options={catOptions} value={toolForm.category_id ? parseInt(toolForm.category_id, 10) : undefined} onChange={(v) => setToolForm({ ...toolForm, category_id: v ? String(v) : '' })} placeholder="Selecione categoria..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                    <input type="text" value={toolForm.brand} onChange={(e) => setToolForm({ ...toolForm, brand: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                    <input type="text" value={toolForm.model} onChange={(e) => setToolForm({ ...toolForm, model: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numero de Serie</label>
                  <input type="text" value={toolForm.serial_number} onChange={(e) => setToolForm({ ...toolForm, serial_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condicao</label>
                  <select value={toolForm.condition} onChange={(e) => setToolForm({ ...toolForm, condition: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {Object.entries(CONDITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filial</label>
                    <SearchableSelect options={branchOptions} value={toolForm.branch_id ? parseInt(toolForm.branch_id, 10) : undefined} onChange={(v) => setToolForm({ ...toolForm, branch_id: v ? String(v) : '' })} placeholder="Selecione filial..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                    <SearchableSelect options={deptOptions} value={toolForm.department_id ? parseInt(toolForm.department_id, 10) : undefined} onChange={(v) => setToolForm({ ...toolForm, department_id: v ? String(v) : '' })} placeholder="Selecione depto..." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                  <textarea rows={3} value={toolForm.description} onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                  <textarea rows={3} value={toolForm.notes} onChange={(e) => setToolForm({ ...toolForm, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowToolModal(false)} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                  <button onClick={handleToolSubmit} disabled={toolFormLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {toolFormLoading ? 'Salvando...' : editingTool ? 'Atualizar' : 'Cadastrar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Movement Modal */}
        {showMovModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {showMovModal === 'transfer' && 'Transferir Ferramenta'}
                  {showMovModal === 'assign-employee' && 'Atribuir a Funcionario'}
                  {showMovModal === 'assign-team' && 'Atribuir a Equipe'}
                  {showMovModal === 'assign-project' && 'Atribuir a Projeto'}
                  {showMovModal === 'return' && 'Devolver Ferramenta'}
                  {showMovModal === 'assign-kit' && 'Atribuir Kit'}
                </h2>
                <button onClick={() => { setShowMovModal(null); setMovForm({}); }} className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                {showMovModal !== 'assign-kit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ferramenta *</label>
                    <SearchableSelect options={toolOptions} value={movForm.tool_id ? parseInt(movForm.tool_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, tool_id: v ? String(v) : '' })} placeholder="Selecione ferramenta..." />
                  </div>
                )}
                {showMovModal === 'transfer' && (<>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Filial destino</label><SearchableSelect options={branchOptions} value={movForm.to_branch_id ? parseInt(movForm.to_branch_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, to_branch_id: v ? String(v) : '' })} placeholder="Selecione filial..." /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Departamento destino</label><SearchableSelect options={deptOptions} value={movForm.to_department_id ? parseInt(movForm.to_department_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, to_department_id: v ? String(v) : '' })} placeholder="Selecione depto..." /></div>
                </>)}
                {showMovModal === 'assign-employee' && (
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Funcionario *</label><SearchableSelect options={userOptions} value={movForm.user_id ? parseInt(movForm.user_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, user_id: v ? String(v) : '' })} placeholder="Selecione funcionario..." /></div>
                )}
                {showMovModal === 'assign-team' && (
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Equipe *</label><SearchableSelect options={teamOptions} value={movForm.team_id ? parseInt(movForm.team_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, team_id: v ? String(v) : '' })} placeholder="Selecione equipe..." /></div>
                )}
                {showMovModal === 'assign-project' && (
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Projeto *</label><SearchableSelect options={projectOptions} value={movForm.project_id ? parseInt(movForm.project_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, project_id: v ? String(v) : '' })} placeholder="Selecione projeto..." /></div>
                )}
                {showMovModal === 'return' && (<>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Condicao</label><select value={movForm.condition || 'bom'} onChange={(e) => setMovForm({ ...movForm, condition: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">{Object.entries(CONDITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Filial destino</label><SearchableSelect options={branchOptions} value={movForm.to_branch_id ? parseInt(movForm.to_branch_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, to_branch_id: v ? String(v) : '' })} placeholder="Selecione filial..." /></div>
                </>)}
                {showMovModal === 'assign-kit' && (<>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Funcionario *</label><SearchableSelect options={userOptions} value={movForm.user_id ? parseInt(movForm.user_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, user_id: v ? String(v) : '' })} placeholder="Selecione funcionario..." /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Kit *</label><SearchableSelect options={kitOptions} value={movForm.kit_id ? parseInt(movForm.kit_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, kit_id: v ? String(v) : '' })} placeholder="Selecione kit..." /></div>
                </>)}
                {showMovModal !== 'assign-kit' && (
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label><input type="number" min="1" value={movForm.quantity || '1'} onChange={(e) => setMovForm({ ...movForm, quantity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                )}
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label><textarea rows={3} value={movForm.notes || ''} onChange={(e) => setMovForm({ ...movForm, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowMovModal(null); setMovForm({}); }} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                  <button onClick={handleMovAction} disabled={movFormLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {movFormLoading ? 'Processando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Kit Modal */}
        {showKitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{editingKit ? 'Editar Kit' : 'Novo Kit'}</h2>
                <button onClick={() => setShowKitModal(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label><input type="text" value={kitForm.name} onChange={(e) => setKitForm({ ...kitForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label><input type="text" value={kitForm.cargo} onChange={(e) => setKitForm({ ...kitForm, cargo: e.target.value })} placeholder="Ex: Eletricista, Encanador..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label><textarea rows={3} value={kitForm.description} onChange={(e) => setKitForm({ ...kitForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowKitModal(false)} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                  <button onClick={handleKitSubmit} disabled={kitFormLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {kitFormLoading ? 'Salvando...' : editingKit ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Kit Item Modal */}
        {showAddItemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl w-full max-w-sm">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Adicionar Item ao Kit</h2>
                <button onClick={() => setShowAddItemModal(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label><SearchableSelect options={catOptions} value={addItemForm.category_id ? parseInt(addItemForm.category_id, 10) : undefined} onChange={(v) => setAddItemForm({ ...addItemForm, category_id: v ? String(v) : '' })} placeholder="Selecione categoria..." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label><input type="number" min="1" value={addItemForm.quantity} onChange={(e) => setAddItemForm({ ...addItemForm, quantity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddItemModal(false)} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                  <button onClick={handleAddKitItem} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Adicionar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Department Modal */}
        {showDeptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl w-full max-w-sm">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{editingDept ? 'Editar Departamento' : 'Novo Departamento'}</h2>
                <button onClick={() => setShowDeptModal(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label><input type="text" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label><textarea rows={3} value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowDeptModal(false)} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                  <button onClick={handleDeptSubmit} disabled={deptFormLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {deptFormLoading ? 'Salvando...' : editingDept ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Category Modal */}
        {showCatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl w-full max-w-sm">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{editingCat ? 'Editar Categoria' : 'Nova Categoria'}</h2>
                <button onClick={() => setShowCatModal(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label><input type="text" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label><textarea rows={3} value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowCatModal(false)} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                  <button onClick={handleCatSubmit} disabled={catFormLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {catFormLoading ? 'Salvando...' : editingCat ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Confirm Modals */}
        <ConfirmModal isOpen={!!deleteToolConfirm} title="Excluir Ferramenta" message={`Deseja excluir a ferramenta "${deleteToolConfirm?.name}"?`} onConfirm={handleDeleteTool} onCancel={() => setDeleteToolConfirm(null)} />
        <ConfirmModal isOpen={!!deleteKitConfirm} title="Excluir Kit" message={`Deseja excluir o kit "${deleteKitConfirm?.name}"?`} onConfirm={handleDeleteKit} onCancel={() => setDeleteKitConfirm(null)} />
        <ConfirmModal isOpen={!!deleteKitItemConfirm} title="Remover Item" message={`Deseja remover "${deleteKitItemConfirm?.category?.name}" do kit?`} onConfirm={handleDeleteKitItem} onCancel={() => setDeleteKitItemConfirm(null)} />
        <ConfirmModal isOpen={!!deleteDeptConfirm} title="Excluir Departamento" message={`Deseja excluir o departamento "${deleteDeptConfirm?.name}"?`} onConfirm={handleDeleteDept} onCancel={() => setDeleteDeptConfirm(null)} />
        <ConfirmModal isOpen={!!deleteCatConfirm} title="Excluir Categoria" message={`Deseja excluir a categoria "${deleteCatConfirm?.name}"?`} onConfirm={handleDeleteCat} onCancel={() => setDeleteCatConfirm(null)} />
      </div>
    </div>
  );
}

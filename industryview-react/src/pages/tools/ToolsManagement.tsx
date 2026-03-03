// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { toolsApi } from '../../services';
import type { Department, ToolCategory, ToolModel, Tool, ToolMovement, ToolKit, ToolKitItem } from '../../types';
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
  Tag,
  History,
} from 'lucide-react';

/* =========================================
   Types
   ========================================= */

type ActiveTab = 'cadastro' | 'modelos' | 'movimentacoes' | 'kits' | 'categorias';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

interface ToolForm {
  model_id: string;
  patrimonio_code: string;
  quantity_total: string;
  serial_number: string;
  condition: string;
  branch_id: string;
  department_id: string;
  notes: string;
}

const EMPTY_TOOL_FORM: ToolForm = {
  model_id: '',
  patrimonio_code: '',
  quantity_total: '1',
  serial_number: '',
  condition: 'novo',
  branch_id: '',
  department_id: '',
  notes: '',
};

interface ModelForm {
  name: string;
  control_type: string;
  category_id: string;
  brand: string;
  model: string;
  description: string;
}

const EMPTY_MODEL_FORM: ModelForm = {
  name: '',
  control_type: 'patrimonio',
  category_id: '',
  brand: '',
  model: '',
  description: '',
};

const PER_PAGE = 10;

const CONDITION_LABELS: Record<string, string> = {
  novo: 'Novo',
  bom: 'Bom',
  regular: 'Regular',
  danificado: 'Danificado',
  descartado: 'Descartado',
};

const CONDITION_STYLES: Record<string, React.CSSProperties> = {
  novo:       { background: 'var(--color-status-04)', color: 'var(--color-success)' },
  bom:        { background: 'var(--color-tertiary-bg)', color: 'var(--color-primary)' },
  regular:    { background: 'var(--color-status-06)', color: 'var(--color-warning)' },
  danificado: { background: 'var(--color-status-05)', color: 'var(--color-error)' },
  descartado: { background: 'var(--color-alternate)', color: 'var(--color-secondary-text)' },
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

  const [activeTab, setActiveTab] = useState<ActiveTab>('modelos');
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
  const [addItemForm, setAddItemForm] = useState({ model_id: '', quantity: '1' });
  const [deleteKitItemConfirm, setDeleteKitItemConfirm] = useState<ToolKitItem | null>(null);

  // ---- Categories state (tab Categorias) ----
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<ToolCategory | null>(null);
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [catFormLoading, setCatFormLoading] = useState(false);
  const [deleteCatConfirm, setDeleteCatConfirm] = useState<ToolCategory | null>(null);

  // ---- Tool Models state (tab Modelos) ----
  const [toolModels, setToolModels] = useState<ToolModel[]>([]);
  const [toolModelsPagination, setToolModelsPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loadingModels, setLoadingModels] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ToolModel | null>(null);
  const [showModelModal, setShowModelModal] = useState(false);
  const [modelForm, setModelForm] = useState<ModelForm>(EMPTY_MODEL_FORM);
  const [modelFormLoading, setModelFormLoading] = useState(false);
  const [deleteModelConfirm, setDeleteModelConfirm] = useState<ToolModel | null>(null);

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
      if (filterCondition) params.condition = filterCondition;
      const data = await toolsApi.listTools(params);
      setTools(data.items ?? []);
      setToolTotalPages(Number(data.pageTotal) || 1);
      setToolTotalItems(Number(data.itemsTotal) || 0);
    } catch {
      showToast('Erro ao carregar ferramentas', 'error');
    } finally {
      setToolsLoading(false);
    }
  }, [toolPage, filterSearch, filterCondition, showToast]);

  const loadToolModels = useCallback(async (page = 1) => {
    setLoadingModels(true);
    try {
      const data = await toolsApi.listToolModels({ page, per_page: PER_PAGE });
      setToolModels(data.items ?? []);
      setToolModelsPagination({
        page: Number(data.curPage) || page,
        totalPages: Number(data.pageTotal) || 1,
        totalItems: Number(data.itemsTotal) || 0,
      });
    } catch {
      showToast('Erro ao carregar modelos de ferramentas', 'error');
    } finally {
      setLoadingModels(false);
    }
  }, [showToast]);

  const loadMovements = useCallback(async () => {
    setMovementsLoading(true);
    try {
      const data = await toolsApi.listMovements({ page: movPage, per_page: PER_PAGE });
      setMovements(data.items ?? []);
      setMovTotalPages(Number(data.pageTotal) || 1);
      setMovTotalItems(Number(data.itemsTotal) || 0);
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
    loadToolModels(1);
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

  useEffect(() => {
    if (activeTab === 'modelos') loadToolModels(toolModelsPagination.page);
  }, [activeTab, loadToolModels]);

  /* =========================================
     Tool CRUD
     ========================================= */

  const openToolModal = (tool?: Tool, preselectedModelId?: number) => {
    if (tool) {
      setEditingTool(tool);
      setToolForm({
        model_id: tool.model_id ? String(tool.model_id) : '',
        patrimonio_code: tool.patrimonio_code || '',
        quantity_total: String(tool.quantity_total),
        serial_number: tool.serial_number || '',
        condition: tool.condition,
        branch_id: tool.branch_id ? String(tool.branch_id) : '',
        department_id: tool.department_id ? String(tool.department_id) : '',
        notes: tool.notes || '',
      });
    } else {
      setEditingTool(null);
      setToolForm({
        ...EMPTY_TOOL_FORM,
        model_id: preselectedModelId ? String(preselectedModelId) : '',
      });
    }
    setShowToolModal(true);
  };

  const handleToolSubmit = async () => {
    if (!toolForm.model_id) {
      showToast('Modelo e obrigatorio', 'error');
      return;
    }

    const selectedToolModel = toolModels.find(m => m.id === parseInt(toolForm.model_id, 10));
    const isPatrimonio = selectedToolModel?.control_type === 'patrimonio';

    if (isPatrimonio && !editingTool && !toolForm.patrimonio_code.trim()) {
      showToast('Codigo de patrimonio e obrigatorio para modelos do tipo patrimonio', 'error');
      return;
    }

    setToolFormLoading(true);
    try {
      if (editingTool) {
        await toolsApi.updateTool(editingTool.id, {
          model_id: parseInt(toolForm.model_id, 10),
          patrimonio_code: toolForm.patrimonio_code || undefined,
          quantity_total: !isPatrimonio ? parseInt(toolForm.quantity_total, 10) : undefined,
          serial_number: toolForm.serial_number || undefined,
          condition: toolForm.condition,
          branch_id: toolForm.branch_id ? parseInt(toolForm.branch_id, 10) : null,
          department_id: toolForm.department_id ? parseInt(toolForm.department_id, 10) : null,
          notes: toolForm.notes || undefined,
        });
        showToast('Ferramenta atualizada com sucesso', 'success');
      } else {
        await toolsApi.createTool({
          model_id: parseInt(toolForm.model_id, 10),
          patrimonio_code: toolForm.patrimonio_code || undefined,
          quantity_total: parseInt(toolForm.quantity_total, 10),
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
    if (!selectedKit || !addItemForm.model_id) return;
    try {
      await toolsApi.addKitItem(selectedKit.id, {
        model_id: parseInt(addItemForm.model_id, 10),
        quantity: parseInt(addItemForm.quantity || '1', 10),
      });
      showToast('Modelo adicionado ao kit', 'success');
      setShowAddItemModal(false);
      setAddItemForm({ model_id: '', quantity: '1' });
      loadKits();
      const updated = await toolsApi.getKitById(selectedKit.id);
      setSelectedKit(updated);
    } catch {
      showToast('Erro ao adicionar modelo ao kit', 'error');
    }
  };

  const handleDeleteKitItem = async () => {
    if (!deleteKitItemConfirm || !selectedKit) return;
    try {
      await toolsApi.deleteKitItem(selectedKit.id, deleteKitItemConfirm.id);
      showToast('Ferramenta removida do kit', 'success');
      setDeleteKitItemConfirm(null);
      loadKits();
      const updated = await toolsApi.getKitById(selectedKit.id);
      setSelectedKit(updated);
    } catch {
      showToast('Erro ao remover item do kit', 'error');
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
     Tool Model CRUD
     ========================================= */

  const openModelModal = (toolModel?: ToolModel) => {
    if (toolModel) {
      setSelectedModel(toolModel);
      setModelForm({
        name: toolModel.name,
        control_type: toolModel.control_type,
        category_id: toolModel.category_id ? String(toolModel.category_id) : '',
        brand: toolModel.brand || '',
        model: toolModel.model || '',
        description: toolModel.description || '',
      });
    } else {
      setSelectedModel(null);
      setModelForm(EMPTY_MODEL_FORM);
    }
    setShowModelModal(true);
  };

  const handleModelSubmit = async () => {
    if (!modelForm.name.trim()) {
      showToast('Nome e obrigatorio', 'error');
      return;
    }
    if (!modelForm.control_type) {
      showToast('Tipo de controle e obrigatorio', 'error');
      return;
    }
    setModelFormLoading(true);
    try {
      const payload = {
        name: modelForm.name.trim(),
        control_type: modelForm.control_type as 'patrimonio' | 'quantidade',
        category_id: modelForm.category_id ? parseInt(modelForm.category_id, 10) : undefined,
        brand: modelForm.brand.trim() || undefined,
        model: modelForm.model.trim() || undefined,
        description: modelForm.description.trim() || undefined,
      };
      if (selectedModel) {
        await toolsApi.updateToolModel(selectedModel.id, payload);
        showToast('Modelo atualizado com sucesso', 'success');
      } else {
        await toolsApi.createToolModel(payload);
        showToast('Modelo criado com sucesso', 'success');
      }
      setShowModelModal(false);
      loadToolModels(toolModelsPagination.page);
    } catch {
      showToast('Erro ao salvar modelo', 'error');
    } finally {
      setModelFormLoading(false);
    }
  };

  const handleDeleteModel = async () => {
    if (!deleteModelConfirm) return;
    try {
      await toolsApi.deleteToolModel(deleteModelConfirm.id);
      showToast('Modelo excluido com sucesso', 'success');
      setDeleteModelConfirm(null);
      loadToolModels(toolModelsPagination.page);
    } catch {
      showToast('Erro ao excluir modelo', 'error');
    }
  };

  /* =========================================
     Tab Definitions
     ========================================= */

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'modelos', label: 'Modelos', icon: <Tag size={18} /> },
    { key: 'cadastro', label: 'Instancias', icon: <Wrench size={18} /> },
    { key: 'movimentacoes', label: 'Movimentacoes', icon: <ArrowRightLeft size={18} /> },
    { key: 'kits', label: 'Kits', icon: <PackagePlus size={18} /> },
    { key: 'categorias', label: 'Categorias', icon: <Tag size={18} /> },
  ];

  /* =========================================
     Tool Select Options
     ========================================= */

  const toolOptions = tools.map(t => ({
    value: t.id,
    label: `${t.model?.name || `Ferramenta ${t.id}`}${t.patrimonio_code ? ` (${t.patrimonio_code})` : ''}`,
  }));

  const toolModelOptions = toolModels.map(m => ({
    value: m.id,
    label: `${m.name}${m.brand ? ` — ${m.brand}` : ''}`,
  }));

  const userOptions = allUsers.map(u => ({ value: u.id, label: u.name || `User ${u.id}` }));
  const teamOptions = allTeams.map(t => ({ value: t.id, label: t.name || `Team ${t.id}` }));
  const projectOptions = allProjects.map(p => ({ value: p.id, label: p.name || `Projeto ${p.id}` }));
  const branchOptions = branches.map(b => ({ value: b.id, label: b.brand_name }));
  const deptOptions = departments.map(d => ({ value: d.id, label: d.name }));
  const catOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const kitOptions = kits.map(k => ({ value: k.id, label: `${k.name} (${k.cargo})` }));

  /* =========================================
     Tab style helper
     ========================================= */

  const tabStyle = (tab: ActiveTab) => ({
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500 as const,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-secondary-text)',
    borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
    marginBottom: '-2px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  });

  /* =========================================
     Render
     ========================================= */

  return (
    <div>
      <PageHeader title="Ferramentas" subtitle="Gerenciamento de ferramentas, movimentacoes e kits" />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed', top: '20px', right: '24px', zIndex: 2000,
              padding: '12px 20px', borderRadius: '8px', fontWeight: 500, fontSize: '14px',
              backgroundColor: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
              color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            }}
          >{toast.message}</motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid var(--color-alternate)', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={tabStyle(tab.key)}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============= MODELOS TAB ============= */}
      {activeTab === 'modelos' && (
        <motion.div key="modelos-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', margin: 0 }}>
              {toolModelsPagination.totalItems} {toolModelsPagination.totalItems === 1 ? 'modelo' : 'modelos'}
            </p>
            <button onClick={() => openModelModal()} className="btn btn-primary">
              <Plus size={16} /> Novo Modelo
            </button>
          </div>
          {loadingModels ? <LoadingSpinner /> : toolModels.length === 0 ? (
            <EmptyState icon={<Tag size={48} />} title="Nenhum modelo cadastrado" description="Crie modelos de ferramentas para depois registrar instancias fisicas" />
          ) : (
            <>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Categoria</th>
                      <th>Tipo Controle</th>
                      <th style={{ textAlign: 'right' }}>Acoes</th>
                    </tr>
                  </thead>
                  <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                    {toolModels.map(tm => (
                      <motion.tr key={tm.id} variants={tableRowVariants}>
                        <td style={{ fontWeight: 500 }}>{tm.name}</td>
                        <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>{tm.brand || '-'}</td>
                        <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>{tm.model || '-'}</td>
                        <td style={{ fontSize: '13px' }}>{tm.category?.name || '-'}</td>
                        <td>
                          <span className="badge" style={{ background: 'var(--color-tertiary-bg)', color: 'var(--color-primary)' }}>
                            {tm.control_type === 'patrimonio' ? 'Patrimonio' : 'Quantidade'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => { setActiveTab('cadastro'); openToolModal(undefined, tm.id); }}
                              className="btn btn-secondary"
                              style={{ fontSize: '12px', padding: '4px 10px' }}
                              title="Criar instancia fisica deste modelo"
                            >
                              <Plus size={14} /> Instancia
                            </button>
                            <button onClick={() => openModelModal(tm)} className="btn btn-icon">
                              <Edit size={16} color="var(--color-secondary-text)" />
                            </button>
                            <button onClick={() => setDeleteModelConfirm(tm)} className="btn btn-icon">
                              <Trash2 size={16} color="var(--color-error)" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
              <div style={{ marginTop: '16px' }}>
                <Pagination
                  currentPage={toolModelsPagination.page}
                  totalPages={toolModelsPagination.totalPages}
                  onPageChange={(p) => loadToolModels(p)}
                  totalItems={toolModelsPagination.totalItems}
                  itemsPerPage={PER_PAGE}
                />
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ============= CADASTRO TAB ============= */}
      {activeTab === 'cadastro' && (
        <motion.div key="cadastro-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {selectedTool ? (
            <div className="card">
              <button
                onClick={() => setSelectedTool(null)}
                className="btn btn-secondary"
                style={{ marginBottom: '16px', fontSize: '13px' }}
              >
                <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Voltar para lista
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h3>{selectedTool.model?.name || `Instancia #${selectedTool.id}`}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--color-secondary-text)' }}>{selectedTool.model?.description || '-'}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span className="badge" style={CONDITION_STYLES[selectedTool.condition] || { background: 'var(--color-alternate)', color: 'var(--color-secondary-text)' }}>
                      {CONDITION_LABELS[selectedTool.condition] || selectedTool.condition}
                    </span>
                    <span className="badge" style={{ background: 'var(--color-tertiary-bg)', color: 'var(--color-primary)' }}>
                      {selectedTool.model?.control_type === 'patrimonio' ? 'Patrimonio' : 'Quantidade'}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--color-secondary-text)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedTool.patrimonio_code && <p><strong>Patrimonio:</strong> {selectedTool.patrimonio_code}</p>}
                  {selectedTool.model?.control_type === 'quantidade' && <p><strong>Disponivel:</strong> {selectedTool.quantity_available} / {selectedTool.quantity_total}</p>}
                  {selectedTool.model?.category && <p><strong>Categoria:</strong> {selectedTool.model.category.name}</p>}
                  {selectedTool.branch && <p><strong>Filial:</strong> {selectedTool.branch.brand_name}</p>}
                  {selectedTool.department && <p><strong>Departamento:</strong> {selectedTool.department.name}</p>}
                  {selectedTool.assigned_user && <p><strong>Funcionario:</strong> {selectedTool.assigned_user.name}</p>}
                  {selectedTool.assigned_team && <p><strong>Equipe:</strong> {selectedTool.assigned_team.name}</p>}
                  {selectedTool.model?.brand && <p><strong>Marca:</strong> {selectedTool.model.brand}</p>}
                  {selectedTool.model?.model && <p><strong>Modelo:</strong> {selectedTool.model.model}</p>}
                </div>
              </div>

              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '15px', fontWeight: 600 }}>
                <History size={16} /> Historico de Movimentacoes
              </h4>
              {toolMovementsLoading ? <LoadingSpinner /> : toolMovements.length === 0 ? (
                <EmptyState message="Nenhuma movimentacao encontrada" />
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Qtd</th>
                        <th>Condicao</th>
                        <th>Por</th>
                        <th>Obs</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                      {toolMovements.map(m => (
                        <motion.tr key={m.id} variants={tableRowVariants}>
                          <td>{MOVEMENT_LABELS[m.movement_type] || m.movement_type}</td>
                          <td>{m.quantity}</td>
                          <td>{m.condition ? (CONDITION_LABELS[m.condition] || m.condition) : '-'}</td>
                          <td>{m.performed_by?.name || '-'}</td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.notes || '-'}</td>
                          <td>{formatDate(m.created_at)}</td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Filters */}
              <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-text)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Buscar por patrimonio, serial..."
                    value={filterSearch}
                    onChange={(e) => { setFilterSearch(e.target.value); setToolPage(1); }}
                    className="input-field"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
                <select value={filterCondition} onChange={(e) => { setFilterCondition(e.target.value); setToolPage(1); }} className="input-field" style={{ width: 'auto' }}>
                  <option value="">Todas condicoes</option>
                  {Object.entries(CONDITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button onClick={() => openToolModal()} className="btn btn-primary">
                  <Plus size={16} /> Nova Instancia
                </button>
              </div>

              {/* Table */}
              {toolsLoading ? <LoadingSpinner /> : tools.length === 0 ? (
                <EmptyState icon={<Wrench size={48} />} title="Nenhuma ferramenta encontrada" description="Comece cadastrando uma nova ferramenta" />
              ) : (
                <>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Modelo</th>
                          <th>Tipo</th>
                          <th>Patrimonio/Qtd</th>
                          <th>Condicao</th>
                          <th>Atribuido</th>
                          <th style={{ textAlign: 'right' }}>Acoes</th>
                        </tr>
                      </thead>
                      <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                        {tools.map(tool => (
                          <motion.tr key={tool.id} variants={tableRowVariants} style={{ cursor: 'pointer' }} onClick={() => loadToolDetail(tool)}>
                            <td>
                              <div style={{ fontWeight: 500 }}>{tool.model?.name || `Instancia #${tool.id}`}</div>
                              {tool.model?.brand && <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{tool.model.brand}</div>}
                            </td>
                            <td>
                              <span className="badge" style={{ background: 'var(--color-tertiary-bg)', color: 'var(--color-primary)' }}>
                                {tool.model?.control_type === 'patrimonio' ? 'Patrimonio' : 'Quantidade'}
                              </span>
                            </td>
                            <td>
                              {tool.model?.control_type === 'patrimonio' ? (tool.patrimonio_code || '-') : `${tool.quantity_available}/${tool.quantity_total}`}
                            </td>
                            <td>
                              <span className="badge" style={CONDITION_STYLES[tool.condition] || { background: 'var(--color-alternate)', color: 'var(--color-secondary-text)' }}>
                                {CONDITION_LABELS[tool.condition] || tool.condition}
                              </span>
                            </td>
                            <td>{tool.assigned_user?.name || tool.assigned_team?.name || '-'}</td>
                            <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button onClick={() => openToolModal(tool)} className="btn btn-icon">
                                  <Edit size={16} color="var(--color-secondary-text)" />
                                </button>
                                <button onClick={() => setDeleteToolConfirm(tool)} className="btn btn-icon">
                                  <Trash2 size={16} color="var(--color-error)" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </motion.tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: '16px' }}>
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
          <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {([
              { key: 'transfer', label: 'Transferir', icon: <ArrowRightLeft size={16} /> },
              { key: 'assign-employee', label: 'Atribuir Func.', icon: <UserPlus size={16} /> },
              { key: 'assign-team', label: 'Atribuir Equipe', icon: <Users size={16} /> },
              { key: 'assign-project', label: 'Atribuir Projeto', icon: <FolderKanban size={16} /> },
              { key: 'return', label: 'Devolver', icon: <RotateCcw size={16} /> },
              { key: 'assign-kit', label: 'Atribuir Kit', icon: <PackagePlus size={16} /> },
            ] as const).map(action => (
              <button
                key={action.key}
                onClick={() => { setShowMovModal(action.key); setMovForm({ quantity: '1' }); }}
                className="btn btn-secondary"
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>

          {movementsLoading ? <LoadingSpinner /> : movements.length === 0 ? (
            <EmptyState icon={<ArrowRightLeft size={48} />} title="Nenhuma movimentacao encontrada" description="Utilize os botoes acima para registrar movimentacoes" />
          ) : (
            <>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Ferramenta</th>
                      <th>Tipo</th>
                      <th>Qtd</th>
                      <th>Condicao</th>
                      <th>Realizado por</th>
                      <th>Obs</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                    {movements.map(m => (
                      <motion.tr key={m.id} variants={tableRowVariants}>
                        <td>{m.tool?.model?.name || '-'}{m.tool?.patrimonio_code ? ` (${m.tool.patrimonio_code})` : ''}</td>
                        <td>{MOVEMENT_LABELS[m.movement_type] || m.movement_type}</td>
                        <td>{m.quantity}</td>
                        <td>{m.condition ? (CONDITION_LABELS[m.condition] || m.condition) : '-'}</td>
                        <td>{m.performed_by?.name || '-'}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.notes || '-'}</td>
                        <td>{formatDate(m.created_at)}</td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
              <div style={{ marginTop: '16px' }}>
                <Pagination currentPage={movPage} totalPages={movTotalPages} onPageChange={setMovPage} totalItems={movTotalItems} itemsPerPage={PER_PAGE} />
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ============= KITS TAB ============= */}
      {activeTab === 'kits' && (
        <motion.div key="kits-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3>Kits</h3>
                <button onClick={() => openKitModal()} className="btn btn-primary">
                  <Plus size={16} /> Novo Kit
                </button>
              </div>
              {kitsLoading ? <LoadingSpinner /> : kits.length === 0 ? (
                <EmptyState icon={<PackagePlus size={48} />} title="Nenhum kit cadastrado" description="Crie um kit para agrupar ferramentas por cargo" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {kits.map(kit => (
                    <div
                      key={kit.id}
                      onClick={() => setSelectedKit(kit)}
                      className="card"
                      style={{
                        cursor: 'pointer',
                        borderColor: selectedKit?.id === kit.id ? 'var(--color-primary)' : undefined,
                        background: selectedKit?.id === kit.id ? 'var(--color-tertiary-bg)' : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 500 }}>{kit.name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>{kit.cargo}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={(e) => { e.stopPropagation(); openKitModal(kit); }} className="btn btn-icon">
                            <Edit size={16} color="var(--color-secondary-text)" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteKitConfirm(kit); }} className="btn btn-icon">
                            <Trash2 size={16} color="var(--color-error)" />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginTop: '8px' }}>{kit.items?.length || 0} {(kit.items?.length || 0) === 1 ? 'ferramenta' : 'ferramentas'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              {selectedKit ? (
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ marginBottom: '4px' }}>{selectedKit.name}</h3>
                      <p style={{ fontSize: '14px', color: 'var(--color-secondary-text)' }}>Cargo: {selectedKit.cargo}</p>
                      {selectedKit.description && <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>{selectedKit.description}</p>}
                    </div>
                    <button onClick={() => setShowAddItemModal(true)} className="btn btn-primary">
                      <Plus size={16} /> Adicionar Item
                    </button>
                  </div>
                  {(selectedKit.items?.length || 0) === 0 ? (
                    <EmptyState message="Nenhum item neste kit" />
                  ) : (
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Ferramenta</th>
                            <th>Patrimônio / Tipo</th>
                            <th>Qtd</th>
                            <th style={{ textAlign: 'right' }}>Acoes</th>
                          </tr>
                        </thead>
                        <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                          {selectedKit.items?.map(item => (
                            <motion.tr key={item.id} variants={tableRowVariants}>
                              <td style={{ fontWeight: 500 }}>
                                {item.model?.name || '-'}
                                {item.model?.brand && <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginLeft: '6px' }}>{item.model.brand}</span>}
                              </td>
                              <td style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                                {item.model?.control_type === 'patrimonio' ? 'Patrimonio' : 'Quantidade'}
                              </td>
                              <td>{item.quantity}</td>
                              <td style={{ textAlign: 'right' }}>
                                <button onClick={() => setDeleteKitItemConfirm(item)} className="btn btn-icon">
                                  <Trash2 size={16} color="var(--color-error)" />
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </motion.tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                  Selecione um kit para ver detalhes
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ============= CATEGORIAS TAB ============= */}
      {activeTab === 'categorias' && (
        <motion.div key="categorias-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', margin: 0 }}>
              {categories.length} {categories.length === 1 ? 'categoria' : 'categorias'}
            </p>
            <button onClick={() => openCatModal()} className="btn btn-primary">
              <Plus size={16} /> Nova Categoria
            </button>
          </div>
          {categories.length === 0 ? (
            <EmptyState icon={<Tag size={48} />} title="Nenhuma categoria" description="Crie categorias para classificar ferramentas" />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Descricao</th>
                    <th style={{ textAlign: 'right' }}>Acoes</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {categories.map(c => (
                    <motion.tr key={c.id} variants={tableRowVariants}>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>{c.description || '-'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => openCatModal(c)} className="btn btn-icon">
                            <Edit size={16} color="var(--color-secondary-text)" />
                          </button>
                          <button onClick={() => setDeleteCatConfirm(c)} className="btn btn-icon">
                            <Trash2 size={16} color="var(--color-error)" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* ============= MODALS ============= */}

      {/* Tool Modal */}
      {showToolModal && (
        <div className="modal-backdrop" onClick={() => setShowToolModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', width: '95%', padding: '24px' }}>
            <h3>{editingTool ? 'Editar Instancia' : 'Nova Instancia'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className="input-group">
                <label>Modelo *</label>
                <SearchableSelect
                  options={toolModelOptions}
                  value={toolForm.model_id ? parseInt(toolForm.model_id, 10) : undefined}
                  onChange={(v) => setToolForm({ ...toolForm, model_id: v ? String(v) : '' })}
                  placeholder="Selecione o modelo..."
                />
                {toolForm.model_id && (() => {
                  const m = toolModels.find(x => x.id === parseInt(toolForm.model_id, 10));
                  if (!m) return null;
                  return (
                    <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--color-secondary-text)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {m.category && <span>{m.category.name}</span>}
                      <span className="badge" style={{ background: 'var(--color-tertiary-bg)', color: 'var(--color-primary)', fontSize: '11px' }}>
                        {m.control_type === 'patrimonio' ? 'Patrimonio' : 'Quantidade'}
                      </span>
                    </div>
                  );
                })()}
              </div>
              {(() => {
                const m = toolModels.find(x => x.id === parseInt(toolForm.model_id || '0', 10));
                const isPatrimonio = m?.control_type === 'patrimonio';
                return (
                  <>
                    {isPatrimonio ? (
                      <div className="input-group">
                        <label>Codigo Patrimonio *</label>
                        <input type="text" value={toolForm.patrimonio_code} onChange={(e) => setToolForm({ ...toolForm, patrimonio_code: e.target.value })} className="input-field" />
                      </div>
                    ) : (
                      <div className="input-group">
                        <label>Quantidade Total</label>
                        <input type="number" min="1" value={toolForm.quantity_total} onChange={(e) => setToolForm({ ...toolForm, quantity_total: e.target.value })} className="input-field" />
                      </div>
                    )}
                  </>
                );
              })()}
              <div className="input-group">
                <label>Numero de Serie</label>
                <input type="text" value={toolForm.serial_number} onChange={(e) => setToolForm({ ...toolForm, serial_number: e.target.value })} className="input-field" />
              </div>
              <div className="input-group">
                <label>Condicao</label>
                <select value={toolForm.condition} onChange={(e) => setToolForm({ ...toolForm, condition: e.target.value })} className="input-field">
                  {Object.entries(CONDITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Filial</label>
                  <SearchableSelect options={branchOptions} value={toolForm.branch_id ? parseInt(toolForm.branch_id, 10) : undefined} onChange={(v) => setToolForm({ ...toolForm, branch_id: v ? String(v) : '' })} placeholder="Selecione filial..." />
                </div>
                <div className="input-group">
                  <label>Departamento</label>
                  <SearchableSelect options={deptOptions} value={toolForm.department_id ? parseInt(toolForm.department_id, 10) : undefined} onChange={(v) => setToolForm({ ...toolForm, department_id: v ? String(v) : '' })} placeholder="Selecione depto..." />
                </div>
              </div>
              <div className="input-group">
                <label>Observacoes</label>
                <textarea rows={3} value={toolForm.notes} onChange={(e) => setToolForm({ ...toolForm, notes: e.target.value })} className="input-field" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowToolModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleToolSubmit} disabled={toolFormLoading}>
                {toolFormLoading ? <span className="spinner" /> : editingTool ? 'Atualizar' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovModal && (
        <div className="modal-backdrop" onClick={() => { setShowMovModal(null); setMovForm({}); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '95%', padding: '24px' }}>
            <h3>
              {showMovModal === 'transfer' && 'Transferir Ferramenta'}
              {showMovModal === 'assign-employee' && 'Atribuir a Funcionario'}
              {showMovModal === 'assign-team' && 'Atribuir a Equipe'}
              {showMovModal === 'assign-project' && 'Atribuir a Projeto'}
              {showMovModal === 'return' && 'Devolver Ferramenta'}
              {showMovModal === 'assign-kit' && 'Atribuir Kit'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {showMovModal !== 'assign-kit' && (
                <div className="input-group">
                  <label>Ferramenta *</label>
                  <SearchableSelect options={toolOptions} value={movForm.tool_id ? parseInt(movForm.tool_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, tool_id: v ? String(v) : '' })} placeholder="Selecione ferramenta..." />
                </div>
              )}
              {showMovModal === 'transfer' && (<>
                <div className="input-group"><label>Filial destino</label><SearchableSelect options={branchOptions} value={movForm.to_branch_id ? parseInt(movForm.to_branch_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, to_branch_id: v ? String(v) : '' })} placeholder="Selecione filial..." /></div>
                <div className="input-group"><label>Departamento destino</label><SearchableSelect options={deptOptions} value={movForm.to_department_id ? parseInt(movForm.to_department_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, to_department_id: v ? String(v) : '' })} placeholder="Selecione depto..." /></div>
              </>)}
              {showMovModal === 'assign-employee' && (
                <div className="input-group"><label>Funcionario *</label><SearchableSelect options={userOptions} value={movForm.user_id ? parseInt(movForm.user_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, user_id: v ? String(v) : '' })} placeholder="Selecione funcionario..." /></div>
              )}
              {showMovModal === 'assign-team' && (
                <div className="input-group"><label>Equipe *</label><SearchableSelect options={teamOptions} value={movForm.team_id ? parseInt(movForm.team_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, team_id: v ? String(v) : '' })} placeholder="Selecione equipe..." /></div>
              )}
              {showMovModal === 'assign-project' && (
                <div className="input-group"><label>Projeto *</label><SearchableSelect options={projectOptions} value={movForm.project_id ? parseInt(movForm.project_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, project_id: v ? String(v) : '' })} placeholder="Selecione projeto..." /></div>
              )}
              {showMovModal === 'return' && (<>
                <div className="input-group"><label>Condicao</label><select value={movForm.condition || 'bom'} onChange={(e) => setMovForm({ ...movForm, condition: e.target.value })} className="input-field">{Object.entries(CONDITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                <div className="input-group"><label>Filial destino</label><SearchableSelect options={branchOptions} value={movForm.to_branch_id ? parseInt(movForm.to_branch_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, to_branch_id: v ? String(v) : '' })} placeholder="Selecione filial..." /></div>
              </>)}
              {showMovModal === 'assign-kit' && (<>
                <div className="input-group"><label>Funcionario *</label><SearchableSelect options={userOptions} value={movForm.user_id ? parseInt(movForm.user_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, user_id: v ? String(v) : '' })} placeholder="Selecione funcionario..." /></div>
                <div className="input-group"><label>Kit *</label><SearchableSelect options={kitOptions} value={movForm.kit_id ? parseInt(movForm.kit_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, kit_id: v ? String(v) : '' })} placeholder="Selecione kit..." /></div>
              </>)}
              {showMovModal !== 'assign-kit' && (
                <div className="input-group"><label>Quantidade</label><input type="number" min="1" value={movForm.quantity || '1'} onChange={(e) => setMovForm({ ...movForm, quantity: e.target.value })} className="input-field" /></div>
              )}
              <div className="input-group"><label>Observacoes</label><textarea rows={3} value={movForm.notes || ''} onChange={(e) => setMovForm({ ...movForm, notes: e.target.value })} className="input-field" /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => { setShowMovModal(null); setMovForm({}); }}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleMovAction} disabled={movFormLoading}>
                {movFormLoading ? <span className="spinner" /> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kit Modal */}
      {showKitModal && (
        <div className="modal-backdrop" onClick={() => setShowKitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '95%', padding: '24px' }}>
            <h3>{editingKit ? 'Editar Kit' : 'Novo Kit'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className="input-group"><label>Nome *</label><input type="text" value={kitForm.name} onChange={(e) => setKitForm({ ...kitForm, name: e.target.value })} className="input-field" /></div>
              <div className="input-group"><label>Cargo *</label><input type="text" value={kitForm.cargo} onChange={(e) => setKitForm({ ...kitForm, cargo: e.target.value })} placeholder="Ex: Eletricista, Encanador..." className="input-field" /></div>
              <div className="input-group"><label>Descricao</label><textarea rows={3} value={kitForm.description} onChange={(e) => setKitForm({ ...kitForm, description: e.target.value })} className="input-field" /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowKitModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleKitSubmit} disabled={kitFormLoading}>
                {kitFormLoading ? <span className="spinner" /> : editingKit ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Kit Item Modal */}
      {showAddItemModal && (
        <div className="modal-backdrop" onClick={() => setShowAddItemModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '95%', padding: '24px' }}>
            <h3>Adicionar Modelo ao Kit</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className="input-group">
                <label>Modelo de Ferramenta *</label>
                <SearchableSelect
                  options={toolModelOptions}
                  value={addItemForm.model_id ? parseInt(addItemForm.model_id, 10) : undefined}
                  onChange={(v) => setAddItemForm({ ...addItemForm, model_id: v ? String(v) : '' })}
                  placeholder="Selecione modelo..."
                />
              </div>
              <div className="input-group">
                <label>Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={addItemForm.quantity}
                  onChange={(e) => setAddItemForm({ ...addItemForm, quantity: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowAddItemModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAddKitItem} disabled={!addItemForm.model_id}>Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCatModal && (
        <div className="modal-backdrop" onClick={() => setShowCatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', width: '95%', padding: '24px' }}>
            <h3>{editingCat ? 'Editar Categoria' : 'Nova Categoria'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className="input-group"><label>Nome *</label><input type="text" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="input-field" /></div>
              <div className="input-group"><label>Descricao</label><textarea rows={3} value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className="input-field" /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCatModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCatSubmit} disabled={catFormLoading}>
                {catFormLoading ? <span className="spinner" /> : editingCat ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tool Model Modal */}
      {showModelModal && (
        <div className="modal-backdrop" onClick={() => setShowModelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '95%', padding: '24px' }}>
            <h3>{selectedModel ? 'Editar Modelo' : 'Novo Modelo'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className="input-group">
                <label>Nome *</label>
                <input type="text" value={modelForm.name} onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })} className="input-field" placeholder="Ex: Chave de Fenda, Furadeira..." />
              </div>
              <div className="input-group">
                <label>Tipo de Controle *</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <input type="radio" name="model_control_type" value="patrimonio" checked={modelForm.control_type === 'patrimonio'} onChange={() => setModelForm({ ...modelForm, control_type: 'patrimonio' })} />
                    Patrimonio (codigo unico)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <input type="radio" name="model_control_type" value="quantidade" checked={modelForm.control_type === 'quantidade'} onChange={() => setModelForm({ ...modelForm, control_type: 'quantidade' })} />
                    Quantidade (volume)
                  </label>
                </div>
              </div>
              <div className="input-group">
                <label>Categoria</label>
                <SearchableSelect
                  options={catOptions}
                  value={modelForm.category_id ? parseInt(modelForm.category_id, 10) : undefined}
                  onChange={(v) => setModelForm({ ...modelForm, category_id: v ? String(v) : '' })}
                  placeholder="Selecione categoria..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Marca</label>
                  <input type="text" value={modelForm.brand} onChange={(e) => setModelForm({ ...modelForm, brand: e.target.value })} className="input-field" placeholder="Ex: Bosch, Makita..." />
                </div>
                <div className="input-group">
                  <label>Modelo</label>
                  <input type="text" value={modelForm.model} onChange={(e) => setModelForm({ ...modelForm, model: e.target.value })} className="input-field" placeholder="Ex: GSB 13 RE..." />
                </div>
              </div>
              <div className="input-group">
                <label>Descricao</label>
                <textarea rows={3} value={modelForm.description} onChange={(e) => setModelForm({ ...modelForm, description: e.target.value })} className="input-field" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowModelModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleModelSubmit} disabled={modelFormLoading}>
                {modelFormLoading ? <span className="spinner" /> : selectedModel ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modals */}
      <ConfirmModal isOpen={!!deleteToolConfirm} title="Excluir Instancia" message={`Deseja excluir a instancia "${deleteToolConfirm?.model?.name || `#${deleteToolConfirm?.id}`}"?`} onConfirm={handleDeleteTool} onCancel={() => setDeleteToolConfirm(null)} />
      <ConfirmModal isOpen={!!deleteKitConfirm} title="Excluir Kit" message={`Deseja excluir o kit "${deleteKitConfirm?.name}"?`} onConfirm={handleDeleteKit} onCancel={() => setDeleteKitConfirm(null)} />
      <ConfirmModal isOpen={!!deleteKitItemConfirm} title="Remover Modelo do Kit" message={`Deseja remover "${deleteKitItemConfirm?.model?.name}" do kit?`} onConfirm={handleDeleteKitItem} onCancel={() => setDeleteKitItemConfirm(null)} />
      <ConfirmModal isOpen={!!deleteCatConfirm} title="Excluir Categoria" message={`Deseja excluir a categoria "${deleteCatConfirm?.name}"?`} onConfirm={handleDeleteCat} onCancel={() => setDeleteCatConfirm(null)} />
      <ConfirmModal isOpen={!!deleteModelConfirm} title="Excluir Modelo" message={`Deseja excluir o modelo "${deleteModelConfirm?.name}"? Todas as instancias vinculadas serao afetadas.`} onConfirm={handleDeleteModel} onCancel={() => setDeleteModelConfirm(null)} />
    </div>
  );
}

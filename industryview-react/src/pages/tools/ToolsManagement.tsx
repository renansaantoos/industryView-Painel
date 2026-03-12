// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
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
  control_type: string;
  patrimonio_code: string;
  quantity_total: string;
  serial_number: string;
  condition: string;
  branch_id: string;
  department_id: string;
  notes: string;
  instance_count: string;
}

const EMPTY_TOOL_FORM: ToolForm = {
  model_id: '',
  control_type: '',
  patrimonio_code: '',
  quantity_total: '1',
  serial_number: '',
  condition: 'novo',
  branch_id: '',
  department_id: '',
  notes: '',
  instance_count: '1',
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
  saida: 'Saída',
  transferencia: 'Transferência',
  atribuicao_funcionario: 'Atribuição Funcionário',
  atribuicao_equipe: 'Atribuição Equipe',
  atribuicao_projeto: 'Atribuição Projeto',
  devolucao: 'Devolução',
  atribuicao_kit: 'Atribuição Kit',
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

  // ---- Return modal: employee tools ----
  const [returnUserTools, setReturnUserTools] = useState<Tool[]>([]);
  const [returnUserToolsLoading, setReturnUserToolsLoading] = useState(false);

  // ---- Transfer state ----
  const [transferProjectId, setTransferProjectId] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  // Carrinho: lista de modelos com instâncias selecionadas
  const [transferCart, setTransferCart] = useState<{ model: ToolModel; tools: Tool[] }[]>([]);
  // Dropdown de modelos
  const [transferModels, setTransferModels] = useState<ToolModel[]>([]);
  const [transferLoadingModels, setTransferLoadingModels] = useState(false);
  // Painel seletor de instâncias
  const [transferSelectorModel, setTransferSelectorModel] = useState<ToolModel | null>(null);
  const [transferSelectorInstances, setTransferSelectorInstances] = useState<Tool[]>([]);
  const [transferSelectorLoading, setTransferSelectorLoading] = useState(false);
  const [transferSelectorSelected, setTransferSelectorSelected] = useState<number[]>([]);
  const [transferSelectorSearch, setTransferSelectorSearch] = useState('');
  // Expansão do carrinho
  const [transferExpandedModelId, setTransferExpandedModelId] = useState<number | null>(null);

  // ---- Assign Kit (dedicated) state ----
  const [showKitAssignModal, setShowKitAssignModal] = useState(false);
  const [kitAssignUserId, setKitAssignUserId] = useState('');
  const [kitAssignKitId, setKitAssignKitId] = useState('');
  const [kitAssignKitData, setKitAssignKitData] = useState<ToolKit | null>(null);
  const [kitAssignKitLoading, setKitAssignKitLoading] = useState(false);
  // selections: model_id → Tool instance selected
  const [kitAssignSelections, setKitAssignSelections] = useState<Record<number, Tool>>({});
  // sub-painel seletor
  const [kitAssignSelectorModelId, setKitAssignSelectorModelId] = useState<number | null>(null);
  const [kitAssignSelectorModelName, setKitAssignSelectorModelName] = useState('');
  const [kitAssignSelectorInstances, setKitAssignSelectorInstances] = useState<Tool[]>([]);
  const [kitAssignSelectorLoading, setKitAssignSelectorLoading] = useState(false);
  const [kitAssignSelectorSearch, setKitAssignSelectorSearch] = useState('');
  const [kitAssignSelectorValue, setKitAssignSelectorValue] = useState<number | null>(null);
  const [kitAssignNotes, setKitAssignNotes] = useState('');
  const [kitAssignLoading, setKitAssignLoading] = useState(false);

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

  // ---- Accordion instance state (cadastro tab) ----
  const [expandedModels, setExpandedModels] = useState<Set<number>>(new Set());
  const [modelInstances, setModelInstances] = useState<Record<number, Tool[]>>({});
  const [loadingModelInstances, setLoadingModelInstances] = useState<Record<number, boolean>>({});

  // ---- Search state ----
  const [modelSearch, setModelSearch] = useState('');
  const modelSearchRef = useRef('');

  // ---- Bulk instance creation state ----
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInstances, setBulkInstances] = useState<{ serial_number: string; patrimonio_code: string; quantity_total: string; condition: string }[]>([]);
  const [bulkBaseData, setBulkBaseData] = useState<Record<string, unknown> | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkModelId, setBulkModelId] = useState<number>(0);
  const [bulkIsPatrimonio, setBulkIsPatrimonio] = useState(true);

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
      const params: Parameters<typeof toolsApi.listToolModels>[0] = { page, per_page: PER_PAGE };
      if (modelSearchRef.current.trim()) params.search = modelSearchRef.current.trim();
      const data = await toolsApi.listToolModels(params);
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
      showToast('Erro ao carregar movimentações', 'error');
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
  }, []);

  useEffect(() => {
    if (activeTab === 'cadastro') loadTools();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'movimentacoes') loadMovements();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'kits') loadKits();
  }, [activeTab]);

  // Debounce: recarrega modelos 350ms após o usuário parar de digitar
  useEffect(() => {
    const timer = setTimeout(() => loadToolModels(1), 350);
    return () => clearTimeout(timer);
  }, [modelSearch]);

  useEffect(() => {
    if (showMovModal === 'transfer') {
      setTransferCart([]);
      setTransferProjectId('');
      setTransferNotes('');
      setTransferSelectorModel(null);
      setTransferExpandedModelId(null);
      setTransferLoadingModels(true);
      toolsApi.listToolModels({ per_page: 200 })
        .then(data => setTransferModels(data.items ?? []))
        .catch(() => setTransferModels([]))
        .finally(() => setTransferLoadingModels(false));
    }
  }, [showMovModal]);

  // Carrega lista de kits ao abrir o modal de atribuição
  useEffect(() => {
    if (showKitAssignModal) loadKits();
  }, [showKitAssignModal]);

  // Carrega ferramentas do funcionário selecionado no modal de devolução
  useEffect(() => {
    const userId = movForm.return_user_id ? parseInt(movForm.return_user_id, 10) : null;
    if (showMovModal !== 'return' || !userId) {
      setReturnUserTools([]);
      return;
    }
    setReturnUserToolsLoading(true);
    toolsApi.listTools({ assigned_user_id: userId, per_page: 200 })
      .then(data => setReturnUserTools(data.items ?? []))
      .catch(() => setReturnUserTools([]))
      .finally(() => setReturnUserToolsLoading(false));
  }, [movForm.return_user_id, showMovModal]);

  // Carrega dados do kit ao selecionar no modal de atribuição dedicado
  useEffect(() => {
    if (!kitAssignKitId) {
      setKitAssignKitData(null);
      setKitAssignSelections({});
      return;
    }
    setKitAssignKitLoading(true);
    toolsApi.getKitById(parseInt(kitAssignKitId, 10))
      .then(kit => {
        setKitAssignKitData(kit);
        setKitAssignSelections({});
      })
      .catch(() => setKitAssignKitData(null))
      .finally(() => setKitAssignKitLoading(false));
  }, [kitAssignKitId]);

  const handleModelSearchChange = (value: string) => {
    modelSearchRef.current = value;
    setModelSearch(value);
  };

  /* =========================================
     Tool CRUD
     ========================================= */

  const openToolModal = (tool?: Tool, preselectedModel?: ToolModel) => {
    if (tool) {
      setEditingTool(tool);
      setToolForm({
        model_id: tool.model_id ? String(tool.model_id) : '',
        control_type: tool.model?.control_type || '',
        patrimonio_code: tool.patrimonio_code || '',
        quantity_total: String(tool.quantity_total),
        serial_number: tool.serial_number || '',
        condition: tool.condition,
        branch_id: tool.branch_id ? String(tool.branch_id) : '',
        department_id: tool.department_id ? String(tool.department_id) : '',
        notes: tool.notes || '',
        instance_count: '1',
      });
    } else {
      setEditingTool(null);
      setToolForm({
        ...EMPTY_TOOL_FORM,
        model_id: preselectedModel?.id ? String(preselectedModel.id) : '',
        control_type: preselectedModel?.control_type || '',
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
    const isPatrimonio = selectedToolModel ? selectedToolModel.control_type === 'patrimonio' : toolForm.control_type === 'patrimonio';
    const count = Math.max(1, parseInt(toolForm.instance_count || '1', 10));

    // Novo cadastro: sempre abre o bulk modal para preencher patrimônio/quantidade por instância
    if (!editingTool) {
      const modelId = parseInt(toolForm.model_id, 10);
      setBulkBaseData({
        model_id: modelId,
        branch_id: toolForm.branch_id ? parseInt(toolForm.branch_id, 10) : undefined,
        department_id: toolForm.department_id ? parseInt(toolForm.department_id, 10) : undefined,
        notes: toolForm.notes || undefined,
      });
      setBulkModelId(modelId);
      setBulkIsPatrimonio(isPatrimonio);
      setBulkInstances(Array.from({ length: count }, () => ({ serial_number: '', patrimonio_code: '', quantity_total: '1', condition: 'novo' })));
      setShowToolModal(false);
      setShowBulkModal(true);
      return;
    }

    // Edição: atualiza diretamente
    setToolFormLoading(true);
    try {
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
      setShowToolModal(false);
      const modelId = parseInt(toolForm.model_id, 10);
      if (!isNaN(modelId)) {
        refreshModelInstances(modelId);
      }
    } catch {
      showToast('Erro ao salvar ferramenta', 'error');
    } finally {
      setToolFormLoading(false);
    }
  };

  const handleDeleteTool = async () => {
    if (!deleteToolConfirm) return;
    const modelId = deleteToolConfirm.model_id;
    try {
      await toolsApi.deleteTool(deleteToolConfirm.id);
      showToast('Ferramenta excluida com sucesso', 'success');
      setDeleteToolConfirm(null);
      if (modelId) {
        refreshModelInstances(modelId);
      }
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

  const refreshModelInstances = async (modelId: number) => {
    try {
      const data = await toolsApi.listTools({ model_id: modelId, per_page: 100 });
      setModelInstances(prev => ({ ...prev, [modelId]: data.items ?? [] }));
    } catch { /* silent */ }
  };

  const toggleModelExpand = async (modelId: number) => {
    const next = new Set(expandedModels);
    if (next.has(modelId)) {
      next.delete(modelId);
      setExpandedModels(next);
      return;
    }
    next.add(modelId);
    setExpandedModels(next);
    if (!modelInstances[modelId]) {
      setLoadingModelInstances(prev => ({ ...prev, [modelId]: true }));
      try {
        const data = await toolsApi.listTools({ model_id: modelId, per_page: 100 });
        setModelInstances(prev => ({ ...prev, [modelId]: data.items ?? [] }));
      } catch {
        setModelInstances(prev => ({ ...prev, [modelId]: [] }));
      } finally {
        setLoadingModelInstances(prev => ({ ...prev, [modelId]: false }));
      }
    }
  };

  const handleBulkCreate = async () => {
    if (!bulkBaseData) return;
    setBulkLoading(true);
    let successCount = 0;
    let errorCount = 0;
    for (const inst of bulkInstances) {
      try {
        await toolsApi.createTool({
          ...bulkBaseData,
          condition: inst.condition || 'novo',
          serial_number: inst.serial_number.trim() || undefined,
          patrimonio_code: bulkIsPatrimonio ? (inst.patrimonio_code.trim() || undefined) : undefined,
          quantity_total: !bulkIsPatrimonio ? (parseInt(inst.quantity_total, 10) || 1) : undefined,
        } as Parameters<typeof toolsApi.createTool>[0]);
        successCount++;
      } catch {
        errorCount++;
      }
    }
    setBulkLoading(false);
    setShowBulkModal(false);
    if (errorCount === 0) {
      showToast(`${successCount} ferramentas cadastradas com sucesso`, 'success');
    } else {
      showToast(`${successCount} criadas, ${errorCount} com erro`, 'error');
    }
    if (!isNaN(bulkModelId)) {
      refreshModelInstances(bulkModelId);
    }
  };

  /* =========================================
     Movement Actions
     ========================================= */

  const handleTransfer = async () => {
    const allIds = transferCart.flatMap(item => item.tools.map(t => t.id));
    if (allIds.length === 0) {
      showToast('Selecione ao menos uma ferramenta', 'error');
      return;
    }
    setMovFormLoading(true);
    try {
      await toolsApi.transferTool({
        tool_ids: allIds,
        to_project_id: transferProjectId ? parseInt(transferProjectId, 10) : undefined,
        notes: transferNotes || undefined,
      });
      showToast(`${allIds.length} ferramenta(s) transferida(s) com sucesso`, 'success');
      setShowMovModal(null);
      loadMovements();
      transferCart.forEach(item => refreshModelInstances(item.model.id));
    } catch {
      showToast('Erro na transferencia', 'error');
    } finally {
      setMovFormLoading(false);
    }
  };

  const openTransferSelector = (modelId: number) => {
    const model = transferModels.find(m => m.id === modelId);
    if (!model) return;
    const cartItem = transferCart.find(c => c.model.id === modelId);
    const preSelected = cartItem ? cartItem.tools.map(t => t.id) : [];
    setTransferSelectorModel(model);
    setTransferSelectorSelected(preSelected);
    setTransferSelectorSearch('');
    setTransferSelectorLoading(true);
    setTransferSelectorInstances([]);
    toolsApi.listTools({ model_id: modelId, per_page: 200 })
      .then(data => setTransferSelectorInstances(data.items ?? []))
      .catch(() => setTransferSelectorInstances([]))
      .finally(() => setTransferSelectorLoading(false));
  };

  const confirmTransferSelector = () => {
    if (!transferSelectorModel) return;
    const selectedTools = transferSelectorInstances.filter(t => transferSelectorSelected.includes(t.id));
    setTransferCart(prev => {
      const existing = prev.find(c => c.model.id === transferSelectorModel.id);
      if (selectedTools.length === 0) {
        return prev.filter(c => c.model.id !== transferSelectorModel.id);
      }
      if (existing) {
        return prev.map(c => c.model.id === transferSelectorModel.id ? { ...c, tools: selectedTools } : c);
      }
      return [...prev, { model: transferSelectorModel, tools: selectedTools }];
    });
    setTransferSelectorModel(null);
  };

  // Abre o seletor de instâncias (radio) para um modelo do kit
  const openKitAssignSelector = (modelId: number, modelName: string) => {
    setKitAssignSelectorModelId(modelId);
    setKitAssignSelectorModelName(modelName);
    setKitAssignSelectorSearch('');
    const existing = kitAssignSelections[modelId];
    setKitAssignSelectorValue(existing ? existing.id : null);
    setKitAssignSelectorLoading(true);
    setKitAssignSelectorInstances([]);
    toolsApi.listTools({ model_id: modelId, per_page: 200 })
      .then(data => setKitAssignSelectorInstances(data.items ?? []))
      .catch(() => setKitAssignSelectorInstances([]))
      .finally(() => setKitAssignSelectorLoading(false));
  };

  // Confirma a seleção de instância para o modelo atual
  const confirmKitAssignSelector = () => {
    if (kitAssignSelectorModelId === null || kitAssignSelectorValue === null) return;
    const tool = kitAssignSelectorInstances.find(t => t.id === kitAssignSelectorValue);
    if (!tool) return;
    setKitAssignSelections(prev => ({ ...prev, [kitAssignSelectorModelId]: tool }));
    setKitAssignSelectorModelId(null);
  };

  // Submete a atribuição do kit
  const handleKitAssign = async () => {
    if (!kitAssignUserId || !kitAssignKitId || !kitAssignKitData) return;
    const allSelected = kitAssignKitData.items?.every(item => kitAssignSelections[item.model_id]);
    if (!allSelected) {
      showToast('Selecione uma unidade para cada item do kit', 'error');
      return;
    }
    setKitAssignLoading(true);
    try {
      const tool_selections = kitAssignKitData.items!.map(item => ({
        model_id: item.model_id,
        tool_id: kitAssignSelections[item.model_id].id,
      }));
      await toolsApi.assignKit({
        user_id: parseInt(kitAssignUserId, 10),
        kit_id: parseInt(kitAssignKitId, 10),
        tool_selections,
        notes: kitAssignNotes || undefined,
      });
      showToast('Kit atribuido com sucesso', 'success');
      setShowKitAssignModal(false);
      loadMovements();
      loadTools();
    } catch {
      showToast('Erro ao atribuir kit', 'error');
    } finally {
      setKitAssignLoading(false);
    }
  };

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
        showToast('Ferramenta atribuída ao funcionário', 'success');
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
      showToast('Erro na movimentação', 'error');
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
    { key: 'cadastro', label: 'Ferramentas', icon: <Wrench size={18} /> },
    { key: 'movimentacoes', label: 'Movimentações', icon: <ArrowRightLeft size={18} /> },
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
      <PageHeader title="Ferramentas" subtitle="Gerenciamento de ferramentas, movimentações e kits" />

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '140px', maxWidth: '800px', position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-text)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => handleModelSearchChange(e.target.value)}
                placeholder="Buscar por nome, marca ou modelo..."
                className="input-field"
                style={{ paddingLeft: '32px', paddingRight: modelSearch ? '32px' : undefined }}
              />
              {modelSearch && (
                <button onClick={() => handleModelSearchChange('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <X size={14} color="var(--color-secondary-text)" />
                </button>
              )}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', whiteSpace: 'nowrap', margin: 0 }}>
              {toolModelsPagination.totalItems} {toolModelsPagination.totalItems === 1 ? 'modelo' : 'modelos'}
            </p>
            <button onClick={() => openModelModal()} className="btn btn-primary" style={{ whiteSpace: 'nowrap', marginLeft: 'auto' }}>
              <Plus size={16} /> Novo Modelo
            </button>
          </div>
          {loadingModels ? <LoadingSpinner /> : toolModels.length === 0 ? (
            <EmptyState icon={<Tag size={48} />} title="Nenhum modelo cadastrado" description="Crie modelos de ferramentas para depois registrar ferramentas" />
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
                              onClick={() => { setActiveTab('cadastro'); openToolModal(undefined, tm); }}
                              className="btn btn-secondary"
                              style={{ fontSize: '12px', padding: '4px 10px' }}
                              title="Criar ferramenta deste modelo"
                            >
                              <Plus size={14} /> Ferramenta
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
                  perPage={PER_PAGE}
                />
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ============= CADASTRO TAB ============= */}
      {activeTab === 'cadastro' && (
        <motion.div key="cadastro-tab" initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
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
                  <h3>{selectedTool.model?.name || `Ferramenta #${selectedTool.id}`}</h3>
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
                <History size={16} /> Histórico de Movimentações
              </h4>
              {toolMovementsLoading ? <LoadingSpinner /> : toolMovements.length === 0 ? (
                <EmptyState message="Nenhuma movimentação encontrada" />
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Qtd</th>
                        <th>Condição</th>
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
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px', maxWidth: '800px', position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-text)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={modelSearch}
                    onChange={(e) => handleModelSearchChange(e.target.value)}
                    placeholder="Buscar por nome, marca ou modelo..."
                    className="input-field"
                    style={{ paddingLeft: '32px', paddingRight: modelSearch ? '32px' : undefined }}
                  />
                  {modelSearch && (
                    <button onClick={() => handleModelSearchChange('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      <X size={14} color="var(--color-secondary-text)" />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', whiteSpace: 'nowrap', margin: 0 }}>
                  {toolModelsPagination.totalItems} {toolModelsPagination.totalItems === 1 ? 'modelo' : 'modelos'}
                </p>
                <button onClick={() => openToolModal()} className="btn btn-primary" style={{ whiteSpace: 'nowrap', marginLeft: 'auto' }}>
                  <Plus size={16} /> Nova Ferramenta
                </button>
              </div>

              {loadingModels ? <LoadingSpinner /> : (toolModels?.length || 0) === 0 ? (
                <EmptyState icon={<Wrench size={48} />} title="Nenhum modelo cadastrado" description="Cadastre modelos na aba Modelos antes de registrar ferramentas" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {toolModels?.map(tm => {
                    const isExpanded = expandedModels.has(tm.id);
                    const instances = modelInstances[tm.id] ?? [];
                    const isLoadingInstances = loadingModelInstances[tm.id];

                    return (
                      <div key={tm.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        {/* Model header row - clickable to expand */}
                        <div
                          onClick={() => toggleModelExpand(tm.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '14px 16px', cursor: 'pointer',
                            background: isExpanded ? 'var(--color-tertiary-bg)' : 'transparent',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <ChevronDown
                            size={18}
                            color="var(--color-secondary-text)"
                            style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 600, fontSize: '14px' }}>{tm.name}</span>
                              {tm.brand && <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{tm.brand}</span>}
                              {tm.model && <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>— {tm.model}</span>}
                              <span className="badge" style={{ background: 'var(--color-tertiary-bg)', color: 'var(--color-primary)', fontSize: '11px' }}>
                                {tm.control_type === 'patrimonio' ? 'Patrimonio' : 'Quantidade'}
                              </span>
                              {tm.category && <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{tm.category.name}</span>}
                            </div>
                          </div>
                          {/* Instance count badge (shown when collapsed and cached) */}
                          {!isExpanded && modelInstances[tm.id] !== undefined && (
                            <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)', flexShrink: 0 }}>
                              {instances.length} {instances.length === 1 ? 'ferramenta' : 'ferramentas'}
                            </span>
                          )}
                          {/* Quick add button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); openToolModal(undefined, tm); }}
                            className="btn btn-secondary"
                            style={{ fontSize: '12px', padding: '4px 10px', flexShrink: 0 }}
                            title="Adicionar ferramenta deste modelo"
                          >
                            <Plus size={13} /> Ferramenta
                          </button>
                        </div>

                        {/* Expanded instances */}
                        {isExpanded && (
                          <div style={{ borderTop: '1px solid var(--color-alternate)' }}>
                            {isLoadingInstances ? (
                              <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                                <LoadingSpinner />
                              </div>
                            ) : (instances?.length || 0) === 0 ? (
                              <div style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--color-secondary-text)', textAlign: 'center' }}>
                                Nenhuma ferramenta cadastrada para este modelo.{' '}
                                <button
                                  onClick={() => openToolModal(undefined, tm)}
                                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', padding: 0 }}
                                >
                                  Cadastrar primeira ferramenta
                                </button>
                              </div>
                            ) : (
                              <div className="table-container" style={{ margin: 0, borderRadius: 0 }}>
                                <table>
                                  <thead>
                                    <tr>
                                      <th style={{ paddingLeft: '20px' }}>Patrimonio / Serial</th>
                                      <th>Condição</th>
                                      <th>Qtd Disp.</th>
                                      <th>Localizacao</th>
                                      <th>Atribuido a</th>
                                      <th style={{ textAlign: 'right' }}>Acoes</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {instances?.map(tool => (
                                      <tr
                                        key={tool.id}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => loadToolDetail(tool)}
                                      >
                                        <td style={{ paddingLeft: '20px' }}>
                                          <div style={{ fontWeight: 500, fontSize: '13px' }}>
                                            {tool.patrimonio_code || `#${tool.id}`}
                                          </div>
                                          {tool.serial_number && (
                                            <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>S/N: {tool.serial_number}</div>
                                          )}
                                        </td>
                                        <td>
                                          <span className="badge" style={CONDITION_STYLES[tool.condition] || { background: 'var(--color-alternate)', color: 'var(--color-secondary-text)' }}>
                                            {CONDITION_LABELS[tool.condition] || tool.condition}
                                          </span>
                                        </td>
                                        <td style={{ fontSize: '13px' }}>
                                          {tm.control_type === 'quantidade'
                                            ? `${tool.quantity_available} / ${tool.quantity_total}`
                                            : tool.assigned_user_id ? '—' : 'Disponivel'}
                                        </td>
                                        <td style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                                          {tool.branch?.brand_name || tool.department?.name || '-'}
                                        </td>
                                        <td style={{ fontSize: '12px' }}>
                                          {tool.assigned_user?.name || tool.assigned_team?.name || (
                                            <span style={{ color: 'var(--color-secondary-text)' }}>Não atribuído</span>
                                          )}
                                        </td>
                                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => openToolModal(tool)} className="btn btn-icon" title="Editar">
                                              <Edit size={15} color="var(--color-secondary-text)" />
                                            </button>
                                            <button onClick={() => setDeleteToolConfirm(tool)} className="btn btn-icon" title="Excluir">
                                              <Trash2 size={15} color="var(--color-error)" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination for models */}
              {toolModelsPagination.totalPages > 1 && (
                <div style={{ marginTop: '16px' }}>
                  <Pagination
                    currentPage={toolModelsPagination.page}
                    totalPages={toolModelsPagination.totalPages}
                    onPageChange={(p) => loadToolModels(p)}
                    totalItems={toolModelsPagination.totalItems}
                    perPage={PER_PAGE}
                  />
                </div>
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
              { key: 'transfer', label: 'Transferir', icon: <ArrowRightLeft size={16} />, onClick: () => { setShowMovModal('transfer'); setMovForm({ quantity: '1' }); } },
              { key: 'assign-employee', label: 'Atribuir Func.', icon: <UserPlus size={16} />, onClick: () => { setShowMovModal('assign-employee'); setMovForm({ quantity: '1' }); } },
              { key: 'assign-team', label: 'Atribuir Equipe', icon: <Users size={16} />, onClick: () => { setShowMovModal('assign-team'); setMovForm({ quantity: '1' }); } },
              { key: 'assign-project', label: 'Atribuir Projeto', icon: <FolderKanban size={16} />, onClick: () => { setShowMovModal('assign-project'); setMovForm({ quantity: '1' }); } },
              { key: 'return', label: 'Devolver', icon: <RotateCcw size={16} />, onClick: () => { setShowMovModal('return'); setMovForm({ quantity: '1' }); } },
              { key: 'assign-kit', label: 'Atribuir Kit', icon: <PackagePlus size={16} />, onClick: () => {
                setKitAssignUserId('');
                setKitAssignKitId('');
                setKitAssignKitData(null);
                setKitAssignSelections({});
                setKitAssignSelectorModelId(null);
                setKitAssignNotes('');
                setTimeout(() => setShowKitAssignModal(true), 0);
              }},
            ] as const).map(action => (
              <button key={action.key} onClick={action.onClick} className="btn btn-secondary">
                {action.icon} {action.label}
              </button>
            ))}
          </div>

          {movementsLoading ? <LoadingSpinner /> : movements.length === 0 ? (
            <EmptyState icon={<ArrowRightLeft size={48} />} title="Nenhuma movimentação encontrada" description="Utilize os botoes acima para registrar movimentações" />
          ) : (
            <>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Ferramenta</th>
                      <th>Tipo</th>
                      <th>Qtd</th>
                      <th>Condição</th>
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
                <Pagination currentPage={movPage} totalPages={movTotalPages} onPageChange={setMovPage} totalItems={movTotalItems} perPage={PER_PAGE} />
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
              {kitsLoading ? <LoadingSpinner /> : (kits?.length || 0) === 0 ? (
                <EmptyState icon={<PackagePlus size={48} />} title="Nenhum kit cadastrado" description="Crie um kit para agrupar ferramentas por cargo" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {kits?.map(kit => (
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
              {categories?.length || 0} {(categories?.length || 0) === 1 ? 'categoria' : 'categorias'}
            </p>
            <button onClick={() => openCatModal()} className="btn btn-primary">
              <Plus size={16} /> Nova Categoria
            </button>
          </div>
          {(categories?.length || 0) === 0 ? (
            <EmptyState icon={<Tag size={48} />} title="Nenhuma categoria" description="Crie categorias para classificar ferramentas" />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th style={{ textAlign: 'right' }}>Acoes</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {categories?.map(c => (
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
            <h3>{editingTool ? 'Editar Ferramenta' : 'Nova Ferramenta'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className="input-group">
                <label>Modelo *</label>
                <SearchableSelect
                  options={toolModelOptions}
                  value={toolForm.model_id ? parseInt(toolForm.model_id, 10) : undefined}
                  onChange={(v) => {
                    const selected = v ? toolModels.find(m => m.id === v) : null;
                    setToolForm({
                      ...toolForm,
                      model_id: v ? String(v) : '',
                      control_type: selected?.control_type || toolForm.control_type
                    });
                  }}
                  placeholder="Selecione o modelo..."
                />
              </div>

              {editingTool && (
                <>
                  <div className="input-group">
                    <label>Tipo de Controle</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="instance_control_type"
                          value="patrimonio"
                          checked={toolForm.control_type === 'patrimonio'}
                          onChange={() => setToolForm({ ...toolForm, control_type: 'patrimonio' })}
                        />
                        Patrimonio (codigo unico)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="instance_control_type"
                          value="quantidade"
                          checked={toolForm.control_type === 'quantidade'}
                          onChange={() => setToolForm({ ...toolForm, control_type: 'quantidade' })}
                        />
                        Quantidade (volume)
                      </label>
                    </div>
                  </div>
                  {(() => {
                    const isPatrimonio = toolForm.control_type === 'patrimonio';
                    return isPatrimonio ? (
                      <div className="input-group">
                        <label>Codigo Patrimonio</label>
                        <input type="text" value={toolForm.patrimonio_code} onChange={(e) => setToolForm({ ...toolForm, patrimonio_code: e.target.value })} className="input-field" />
                      </div>
                    ) : (
                      <div className="input-group">
                        <label>Quantidade Total</label>
                        <input type="number" min="1" value={toolForm.quantity_total} onChange={(e) => setToolForm({ ...toolForm, quantity_total: e.target.value })} className="input-field" />
                      </div>
                    );
                  })()}
                  <div className="input-group">
                    <label>Numero de Serie</label>
                    <input type="text" value={toolForm.serial_number} onChange={(e) => setToolForm({ ...toolForm, serial_number: e.target.value })} className="input-field" />
                  </div>
                  <div className="input-group">
                    <label>Condição</label>
                    <select value={toolForm.condition} onChange={(e) => setToolForm({ ...toolForm, condition: e.target.value })} className="input-field">
                      {Object.entries(CONDITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </>
              )}
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
                <label>Observações</label>
                <textarea rows={3} value={toolForm.notes} onChange={(e) => setToolForm({ ...toolForm, notes: e.target.value })} className="input-field" />
              </div>
              {!editingTool && (
                <div className="input-group">
                  <label>Quantidade de Ferramentas</label>
                  <input
                    type="number"
                    min="1"
                    value={toolForm.instance_count}
                    onChange={(e) => setToolForm({ ...toolForm, instance_count: e.target.value })}
                    className="input-field"
                  />
                  {parseInt(toolForm.instance_count || '1', 10) > 1 && (
                    <small style={{ color: 'var(--color-secondary-text)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      Um modal adicional sera aberto para preencher patrimonio e serie de cada ferramenta.
                    </small>
                  )}
                </div>
              )}
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

      {/* Bulk Instance Modal */}
      {showBulkModal && (
        <div className="modal-backdrop" onClick={() => setShowBulkModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', width: '95%', padding: '24px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          >
            <h3>Preencher dados das ferramentas</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '8px', marginBottom: '16px' }}>
              Preencha os campos individuais de cada ferramenta. Campos não preenchidos serão cadastrados sem esse dado.
            </p>
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
              {bulkInstances.map((inst, idx) => (
                <div
                  key={idx}
                  style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--color-alternate)', background: 'var(--color-tertiary-bg)' }}
                >
                  <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Ferramenta {idx + 1}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {bulkIsPatrimonio ? (
                      <div className="input-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '12px' }}>Codigo Patrimonio</label>
                        <input
                          type="text"
                          value={inst.patrimonio_code}
                          onChange={(e) => {
                            const next = [...bulkInstances];
                            next[idx] = { ...next[idx], patrimonio_code: e.target.value };
                            setBulkInstances(next);
                          }}
                          className="input-field"
                          style={{ fontSize: '13px' }}
                          placeholder={`PAT-${String(idx + 1).padStart(3, '0')}`}
                        />
                      </div>
                    ) : (
                      <div className="input-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '12px' }}>Quantidade Total</label>
                        <input
                          type="number"
                          min="1"
                          value={inst.quantity_total}
                          onChange={(e) => {
                            const next = [...bulkInstances];
                            next[idx] = { ...next[idx], quantity_total: e.target.value };
                            setBulkInstances(next);
                          }}
                          className="input-field"
                          style={{ fontSize: '13px' }}
                        />
                      </div>
                    )}
                    <div className="input-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '12px' }}>Numero de Serie</label>
                      <input
                        type="text"
                        value={inst.serial_number}
                        onChange={(e) => {
                          const next = [...bulkInstances];
                          next[idx] = { ...next[idx], serial_number: e.target.value };
                          setBulkInstances(next);
                        }}
                        className="input-field"
                        style={{ fontSize: '13px' }}
                        placeholder={`SN-${String(idx + 1).padStart(3, '0')}`}
                      />
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '12px' }}>Condição</label>
                      <select
                        value={inst.condition}
                        onChange={(e) => {
                          const next = [...bulkInstances];
                          next[idx] = { ...next[idx], condition: e.target.value };
                          setBulkInstances(next);
                        }}
                        className="input-field"
                        style={{ fontSize: '13px' }}
                      >
                        {Object.entries(CONDITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleBulkCreate} disabled={bulkLoading}>
                {bulkLoading ? <span className="spinner" /> : `Cadastrar ${bulkInstances.length} ferramentas`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovModal && showMovModal !== 'transfer' && showMovModal !== 'assign-kit' && (
        <div className="modal-backdrop" onClick={() => { setShowMovModal(null); setMovForm({}); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '95%', padding: '24px' }}>
            <h3>
              {showMovModal === 'assign-employee' && 'Atribuir a Funcionário'}
              {showMovModal === 'assign-team' && 'Atribuir a Equipe'}
              {showMovModal === 'assign-project' && 'Atribuir a Projeto'}
              {showMovModal === 'return' && 'Devolver Ferramenta'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {/* Devolução: selecionar funcionário primeiro */}
              {showMovModal === 'return' && (
                <div className="input-group">
                  <label>Funcionário *</label>
                  <SearchableSelect
                    options={userOptions}
                    value={movForm.return_user_id ? parseInt(movForm.return_user_id, 10) : undefined}
                    onChange={(v) => setMovForm({ ...movForm, return_user_id: v ? String(v) : '', tool_id: '' })}
                    placeholder="Selecione o funcionário..."
                  />
                </div>
              )}
              <div className="input-group">
                <label>Ferramenta *</label>
                {showMovModal === 'return' ? (
                  returnUserToolsLoading ? (
                    <div style={{ fontSize: '13px', color: 'var(--color-secondary-text)', padding: '8px 0' }}>Carregando ferramentas...</div>
                  ) : !movForm.return_user_id ? (
                    <div style={{ fontSize: '13px', color: 'var(--color-secondary-text)', padding: '8px 0' }}>Selecione um funcionário primeiro</div>
                  ) : returnUserTools.length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--color-secondary-text)', padding: '8px 0' }}>Nenhuma ferramenta encontrada para este funcionário</div>
                  ) : (
                    <SearchableSelect
                      options={returnUserTools.map(t => ({
                        value: t.id,
                        label: `${t.model?.name || `Ferramenta #${t.id}`}${t.patrimonio_code ? ` — PAT: ${t.patrimonio_code}` : ''}`,
                      }))}
                      value={movForm.tool_id ? parseInt(movForm.tool_id, 10) : undefined}
                      onChange={(v) => setMovForm({ ...movForm, tool_id: v ? String(v) : '' })}
                      placeholder="Selecione a ferramenta..."
                    />
                  )
                ) : (
                  <SearchableSelect options={toolOptions} value={movForm.tool_id ? parseInt(movForm.tool_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, tool_id: v ? String(v) : '' })} placeholder="Selecione ferramenta..." />
                )}
              </div>
              {showMovModal === 'assign-employee' && (
                <div className="input-group"><label>Funcionário *</label><SearchableSelect options={userOptions} value={movForm.user_id ? parseInt(movForm.user_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, user_id: v ? String(v) : '' })} placeholder="Selecione funcionário..." /></div>
              )}
              {showMovModal === 'assign-team' && (
                <div className="input-group"><label>Equipe *</label><SearchableSelect options={teamOptions} value={movForm.team_id ? parseInt(movForm.team_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, team_id: v ? String(v) : '' })} placeholder="Selecione equipe..." /></div>
              )}
              {showMovModal === 'assign-project' && (
                <div className="input-group"><label>Projeto *</label><SearchableSelect options={projectOptions} value={movForm.project_id ? parseInt(movForm.project_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, project_id: v ? String(v) : '' })} placeholder="Selecione projeto..." /></div>
              )}
              {showMovModal === 'return' && (<>
                <div className="input-group"><label>Condição</label><select value={movForm.condition || 'bom'} onChange={(e) => setMovForm({ ...movForm, condition: e.target.value })} className="input-field">{Object.entries(CONDITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                <div className="input-group"><label>Filial destino</label><SearchableSelect options={branchOptions} value={movForm.to_branch_id ? parseInt(movForm.to_branch_id, 10) : undefined} onChange={(v) => setMovForm({ ...movForm, to_branch_id: v ? String(v) : '' })} placeholder="Selecione filial..." /></div>
              </>)}
              <div className="input-group"><label>Quantidade</label><input type="number" min="1" value={movForm.quantity || '1'} onChange={(e) => setMovForm({ ...movForm, quantity: e.target.value })} className="input-field" /></div>
              <div className="input-group"><label>Observações</label><textarea rows={3} value={movForm.notes || ''} onChange={(e) => setMovForm({ ...movForm, notes: e.target.value })} className="input-field" /></div>
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

      {/* Transfer Modal */}
      {showMovModal === 'transfer' && (
        <div className="modal-backdrop" onClick={() => !transferSelectorModel && setShowMovModal(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '640px', width: '95%', padding: '24px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* ======== PAINEL SELETOR DE INSTÂNCIAS ======== */}
            {transferSelectorModel ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '12px', flexShrink: 0 }}
                    onClick={() => setTransferSelectorModel(null)}
                  >
                    ← Voltar
                  </button>
                  <h3 style={{ margin: 0, flex: 1, fontSize: '16px' }}>
                    {transferSelectorModel.name}
                    <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--color-secondary-text)', marginLeft: '8px' }}>
                      — Selecionar unidades
                    </span>
                  </h3>
                  {transferSelectorSelected.length > 0 && (
                    <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 500, flexShrink: 0 }}>
                      {transferSelectorSelected.length} selecionada(s)
                    </span>
                  )}
                </div>

                {/* Busca */}
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-text)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={transferSelectorSearch}
                    onChange={e => setTransferSelectorSearch(e.target.value)}
                    placeholder="Buscar por patrimônio, série..."
                    className="input-field"
                    style={{ paddingLeft: '30px' }}
                    autoFocus
                  />
                </div>

                {/* Selecionar todos */}
                {!transferSelectorLoading && transferSelectorInstances.length > 0 && (() => {
                  const filtered = transferSelectorInstances.filter(t => {
                    if (!transferSelectorSearch.trim()) return true;
                    const q = transferSelectorSearch.toLowerCase();
                    return (t.patrimonio_code || '').toLowerCase().includes(q) || (t.serial_number || '').toLowerCase().includes(q);
                  });
                  const allSel = filtered.length > 0 && filtered.every(t => transferSelectorSelected.includes(t.id));
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '6px 10px', background: 'var(--color-tertiary-bg)', borderRadius: '6px' }}>
                      <input
                        type="checkbox"
                        checked={allSel}
                        onChange={() => {
                          if (allSel) {
                            setTransferSelectorSelected(prev => prev.filter(id => !filtered.map(t => t.id).includes(id)));
                          } else {
                            const toAdd = filtered.map(t => t.id).filter(id => !transferSelectorSelected.includes(id));
                            setTransferSelectorSelected(prev => [...prev, ...toAdd]);
                          }
                        }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                        {allSel ? 'Desmarcar todos' : `Selecionar todos (${filtered.length})`}
                      </span>
                    </div>
                  );
                })()}

                {/* Lista de instâncias */}
                <div style={{ overflowY: 'auto', flex: 1, border: '1px solid var(--color-alternate)', borderRadius: '8px' }}>
                  {transferSelectorLoading ? (
                    <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}><LoadingSpinner /></div>
                  ) : (() => {
                    const filtered = transferSelectorInstances.filter(t => {
                      if (!transferSelectorSearch.trim()) return true;
                      const q = transferSelectorSearch.toLowerCase();
                      return (t.patrimonio_code || '').toLowerCase().includes(q) || (t.serial_number || '').toLowerCase().includes(q);
                    });
                    if (filtered.length === 0) return (
                      <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                        Nenhuma ferramenta encontrada
                      </div>
                    );
                    return filtered.map(tool => {
                      const checked = transferSelectorSelected.includes(tool.id);
                      return (
                        <label
                          key={tool.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                            cursor: 'pointer', borderBottom: '1px solid var(--color-alternate)',
                            background: checked ? 'var(--color-tertiary-bg)' : 'transparent',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setTransferSelectorSelected(prev =>
                              checked ? prev.filter(id => id !== tool.id) : [...prev, tool.id]
                            )}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: '13px' }}>
                              {tool.patrimonio_code ? `PAT: ${tool.patrimonio_code}` : `#${tool.id}`}
                              {tool.serial_number && (
                                <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--color-secondary-text)' }}>
                                  SN: {tool.serial_number}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '2px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <span className="badge" style={{ ...CONDITION_STYLES[tool.condition], fontSize: '10px', padding: '1px 6px' }}>
                                {CONDITION_LABELS[tool.condition] || tool.condition}
                              </span>
                              {tool.branch && <span>{tool.branch.brand_name}</span>}
                              {tool.department && <span>{tool.department.name}</span>}
                              {tool.project && <span>Projeto: {tool.project.name}</span>}
                              {tool.assigned_user && <span>↳ {tool.assigned_user.name}</span>}
                            </div>
                          </div>
                        </label>
                      );
                    });
                  })()}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button className="btn btn-secondary" onClick={() => setTransferSelectorModel(null)}>
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={confirmTransferSelector}
                    disabled={transferSelectorSelected.length === 0}
                  >
                    Confirmar {transferSelectorSelected.length > 0 ? transferSelectorSelected.length : ''} selecionada(s) ✓
                  </button>
                </div>
              </>
            ) : (
              /* ======== TELA PRINCIPAL DO CARRINHO ======== */
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h3 style={{ margin: 0 }}>Transferência em Massa</h3>
                  {transferCart.flatMap(c => c.tools).length > 0 && (
                    <span style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                      {transferCart.flatMap(c => c.tools).length} selecionada(s)
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '16px' }}>
                  Selecione ferramentas e o destino para a transferência.
                </p>

                {/* Projeto destino */}
                <div className="input-group" style={{ marginBottom: '12px' }}>
                  <label>Projeto / Cliente de destino</label>
                  <SearchableSelect
                    options={projectOptions}
                    value={transferProjectId ? parseInt(transferProjectId, 10) : undefined}
                    onChange={v => setTransferProjectId(v ? String(v) : '')}
                    placeholder="Selecione o projeto ou cliente..."
                  />
                </div>

                {/* Dropdown de modelo */}
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label>Adicionar ferramenta</label>
                  <SearchableSelect
                    options={transferModels.map(m => ({ value: m.id, label: m.brand ? `${m.name} — ${m.brand}` : m.name }))}
                    value={undefined}
                    onChange={v => { if (v) openTransferSelector(Number(v)); }}
                    placeholder={transferLoadingModels ? 'Carregando...' : 'Buscar modelo...'}
                  />
                </div>

                {/* Lista do carrinho */}
                {transferCart.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Itens selecionados
                    </div>
                    <div style={{ border: '1px solid var(--color-alternate)', borderRadius: '8px', overflow: 'hidden' }}>
                      {transferCart.map((cartItem, idx) => {
                        const isExpanded = transferExpandedModelId === cartItem.model.id;
                        return (
                          <div key={cartItem.model.id} style={{ borderBottom: idx < transferCart.length - 1 ? '1px solid var(--color-alternate)' : 'none' }}>
                            {/* Linha do modelo */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px' }}>
                              <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-secondary-text)', padding: '0', display: 'flex', alignItems: 'center' }}
                                onClick={() => setTransferExpandedModelId(isExpanded ? null : cartItem.model.id)}
                                title={isExpanded ? 'Recolher' : 'Expandir'}
                              >
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </button>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontWeight: 500, fontSize: '13px' }}>{cartItem.model.name}</span>
                                {cartItem.model.brand && (
                                  <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginLeft: '6px' }}>{cartItem.model.brand}</span>
                                )}
                              </div>
                              <span
                                style={{ fontSize: '12px', color: 'var(--color-secondary-text)', cursor: 'pointer', marginRight: '4px' }}
                                onClick={() => openTransferSelector(cartItem.model.id)}
                                title="Editar seleção"
                              >
                                {cartItem.tools.length} unidade{cartItem.tools.length !== 1 ? 's' : ''}
                              </span>
                              <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-secondary-text)', padding: '2px', display: 'flex', alignItems: 'center' }}
                                onClick={() => setTransferCart(prev => prev.filter(c => c.model.id !== cartItem.model.id))}
                                title="Remover"
                              >
                                <X size={14} />
                              </button>
                            </div>

                            {/* Instâncias expandidas */}
                            {isExpanded && (
                              <div style={{ background: 'var(--color-tertiary-bg)', borderTop: '1px solid var(--color-alternate)', padding: '4px 0' }}>
                                {cartItem.tools.map(tool => (
                                  <div key={tool.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px 6px 36px' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <span style={{ fontSize: '12px', fontWeight: 500 }}>
                                        {tool.patrimonio_code ? `PAT: ${tool.patrimonio_code}` : `#${tool.id}`}
                                      </span>
                                      {tool.serial_number && (
                                        <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginLeft: '6px' }}>SN: {tool.serial_number}</span>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                      <span className="badge" style={{ ...CONDITION_STYLES[tool.condition], fontSize: '10px', padding: '1px 5px' }}>
                                        {CONDITION_LABELS[tool.condition] || tool.condition}
                                      </span>
                                      {tool.branch && <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>{tool.branch.brand_name}</span>}
                                      {tool.project && <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>Proj: {tool.project.name}</span>}
                                    </div>
                                    <button
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-secondary-text)', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                                      onClick={() => {
                                        setTransferCart(prev => prev.map(c =>
                                          c.model.id === cartItem.model.id
                                            ? { ...c, tools: c.tools.filter(t => t.id !== tool.id) }
                                            : c
                                        ).filter(c => c.tools.length > 0));
                                      }}
                                      title="Remover esta unidade"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Observações */}
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Observações</label>
                  <textarea rows={2} value={transferNotes} onChange={e => setTransferNotes(e.target.value)} className="input-field" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button className="btn btn-secondary" onClick={() => setShowMovModal(null)}>Cancelar</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleTransfer}
                    disabled={movFormLoading || transferCart.flatMap(c => c.tools).length === 0}
                  >
                    {movFormLoading
                      ? <span className="spinner" />
                      : `Transferir ${transferCart.flatMap(c => c.tools).length > 0 ? transferCart.flatMap(c => c.tools).length : ''} ferramenta(s)`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Assign Kit Modal */}
      {showKitAssignModal && (
        <div className="modal-backdrop" onClick={() => !kitAssignSelectorModelId && setShowKitAssignModal(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '580px', width: '95%', padding: '24px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Sub-painel seletor de instância (radio) */}
            {kitAssignSelectorModelId !== null ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '12px', flexShrink: 0 }}
                    onClick={() => setKitAssignSelectorModelId(null)}
                  >
                    ← Voltar
                  </button>
                  <h3 style={{ margin: 0, flex: 1, fontSize: '16px' }}>
                    {kitAssignSelectorModelName}
                    <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--color-secondary-text)', marginLeft: '8px' }}>
                      — Selecionar unidade
                    </span>
                  </h3>
                </div>

                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-text)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={kitAssignSelectorSearch}
                    onChange={e => setKitAssignSelectorSearch(e.target.value)}
                    placeholder="Buscar por patrimônio, série..."
                    className="input-field"
                    style={{ paddingLeft: '30px' }}
                    autoFocus
                  />
                </div>

                <div style={{ overflowY: 'auto', flex: 1, border: '1px solid var(--color-alternate)', borderRadius: '8px' }}>
                  {kitAssignSelectorLoading ? (
                    <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}><LoadingSpinner /></div>
                  ) : (() => {
                    const filtered = kitAssignSelectorInstances.filter(t => {
                      if (!kitAssignSelectorSearch.trim()) return true;
                      const q = kitAssignSelectorSearch.toLowerCase();
                      return (t.patrimonio_code || '').toLowerCase().includes(q) || (t.serial_number || '').toLowerCase().includes(q);
                    });
                    if (filtered.length === 0) return (
                      <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                        Nenhuma ferramenta encontrada
                      </div>
                    );
                    return filtered.map(tool => {
                      const selected = kitAssignSelectorValue === tool.id;
                      return (
                        <label
                          key={tool.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                            cursor: 'pointer', borderBottom: '1px solid var(--color-alternate)',
                            background: selected ? 'var(--color-tertiary-bg)' : 'transparent',
                          }}
                        >
                          <input
                            type="radio"
                            name="kit-assign-tool"
                            checked={selected}
                            onChange={() => setKitAssignSelectorValue(tool.id)}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: '13px' }}>
                              {tool.patrimonio_code ? `PAT: ${tool.patrimonio_code}` : `#${tool.id}`}
                              {tool.serial_number && (
                                <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--color-secondary-text)' }}>
                                  SN: {tool.serial_number}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '2px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <span className="badge" style={{ ...CONDITION_STYLES[tool.condition], fontSize: '10px', padding: '1px 6px' }}>
                                {CONDITION_LABELS[tool.condition] || tool.condition}
                              </span>
                              {tool.branch && <span>{tool.branch.brand_name}</span>}
                              {tool.department && <span>{tool.department.name}</span>}
                              {tool.project && <span>Proj: {tool.project.name}</span>}
                              {tool.assigned_user && <span>↳ {tool.assigned_user.name}</span>}
                            </div>
                          </div>
                        </label>
                      );
                    });
                  })()}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button className="btn btn-secondary" onClick={() => setKitAssignSelectorModelId(null)}>Cancelar</button>
                  <button
                    className="btn btn-primary"
                    onClick={confirmKitAssignSelector}
                    disabled={kitAssignSelectorValue === null}
                  >
                    Confirmar
                  </button>
                </div>
              </>
            ) : (
              /* Tela principal do Atribuir Kit */
              <>
                <h3 style={{ margin: '0 0 4px 0' }}>Atribuir Kit</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '16px' }}>
                  Selecione o funcionário, o kit e as unidades para cada item.
                </p>

                <div className="input-group" style={{ marginBottom: '12px' }}>
                  <label>Funcionário *</label>
                  <SearchableSelect
                    options={userOptions}
                    value={kitAssignUserId ? parseInt(kitAssignUserId, 10) : undefined}
                    onChange={v => setKitAssignUserId(v ? String(v) : '')}
                    placeholder="Selecione o funcionário..."
                  />
                </div>

                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label>Kit *</label>
                  <SearchableSelect
                    options={kitOptions}
                    value={kitAssignKitId ? parseInt(kitAssignKitId, 10) : undefined}
                    onChange={v => setKitAssignKitId(v ? String(v) : '')}
                    placeholder="Selecione o kit..."
                  />
                </div>

                {/* Itens do kit */}
                {kitAssignKitLoading && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}><LoadingSpinner /></div>
                )}
                {kitAssignKitData && kitAssignKitData.items && kitAssignKitData.items.length > 0 && (
                  <div style={{ marginBottom: '12px', overflowY: 'auto', flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Itens do kit
                    </div>
                    <div style={{ border: '1px solid var(--color-alternate)', borderRadius: '8px', overflow: 'hidden' }}>
                      {kitAssignKitData.items.map((item, idx) => {
                        const sel = kitAssignSelections[item.model_id];
                        const modelName = item.model?.name || `Modelo #${item.model_id}`;
                        return (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                              borderBottom: idx < kitAssignKitData.items!.length - 1 ? '1px solid var(--color-alternate)' : 'none',
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 500, fontSize: '13px' }}>{modelName}</div>
                              {item.model?.brand && (
                                <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>{item.model.brand}</div>
                              )}
                            </div>
                            {sel ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-success, #16a34a)' }}>
                                    ✓ {sel.patrimonio_code ? `PAT: ${sel.patrimonio_code}` : `#${sel.id}`}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>
                                    <span className="badge" style={{ ...CONDITION_STYLES[sel.condition], fontSize: '10px', padding: '1px 5px' }}>
                                      {CONDITION_LABELS[sel.condition] || sel.condition}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '12px', flexShrink: 0 }}
                                  onClick={() => openKitAssignSelector(item.model_id, modelName)}
                                >
                                  Trocar
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '4px 10px', fontSize: '12px', flexShrink: 0 }}
                                onClick={() => openKitAssignSelector(item.model_id, modelName)}
                              >
                                Selecionar →
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Observações</label>
                  <textarea rows={2} value={kitAssignNotes} onChange={e => setKitAssignNotes(e.target.value)} className="input-field" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button className="btn btn-secondary" onClick={() => setShowKitAssignModal(false)}>Cancelar</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleKitAssign}
                    disabled={
                      kitAssignLoading ||
                      !kitAssignUserId ||
                      !kitAssignKitId ||
                      !kitAssignKitData ||
                      !(kitAssignKitData.items?.every(item => kitAssignSelections[item.model_id]))
                    }
                  >
                    {kitAssignLoading ? <span className="spinner" /> : 'Confirmar atribuição'}
                  </button>
                </div>
              </>
            )}
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
              <div className="input-group"><label>Descrição</label><textarea rows={3} value={kitForm.description} onChange={(e) => setKitForm({ ...kitForm, description: e.target.value })} className="input-field" /></div>
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
              <div className="input-group"><label>Descrição</label><textarea rows={3} value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className="input-field" /></div>
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
                <label>Descrição</label>
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
      <ConfirmModal isOpen={!!deleteToolConfirm} title="Excluir Ferramenta" message={`Deseja excluir a ferramenta "${deleteToolConfirm?.model?.name || `#${deleteToolConfirm?.id}`}"?`} onConfirm={handleDeleteTool} onCancel={() => setDeleteToolConfirm(null)} />
      <ConfirmModal isOpen={!!deleteKitConfirm} title="Excluir Kit" message={`Deseja excluir o kit "${deleteKitConfirm?.name}"?`} onConfirm={handleDeleteKit} onCancel={() => setDeleteKitConfirm(null)} />
      <ConfirmModal isOpen={!!deleteKitItemConfirm} title="Remover Modelo do Kit" message={`Deseja remover "${deleteKitItemConfirm?.model?.name}" do kit?`} onConfirm={handleDeleteKitItem} onCancel={() => setDeleteKitItemConfirm(null)} />
      <ConfirmModal isOpen={!!deleteCatConfirm} title="Excluir Categoria" message={`Deseja excluir a categoria "${deleteCatConfirm?.name}"?`} onConfirm={handleDeleteCat} onCancel={() => setDeleteCatConfirm(null)} />
      <ConfirmModal isOpen={!!deleteModelConfirm} title="Excluir Modelo" message={`Deseja excluir o modelo "${deleteModelConfirm?.name}"? Todas as ferramentas vinculadas serão afetadas.`} onConfirm={handleDeleteModel} onCancel={() => setDeleteModelConfirm(null)} />
    </div>
  );
}

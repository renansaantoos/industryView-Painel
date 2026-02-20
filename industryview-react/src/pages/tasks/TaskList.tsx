import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { tasksApi, projectsApi, qualityApi } from '../../services';
import type { TaskListItem, TaskPriority, Unity, Discipline, EquipmentType, GoldenRule, TaskGoldenRule, ChecklistTemplate, TaskChecklist } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import SortableHeader, { useBackendSort } from '../../components/common/SortableHeader';
import SearchableSelect from '../../components/common/SearchableSelect';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Plus, Search, Edit, Trash2, ClipboardList, Check, X, Layers, Shield, Info, Wrench, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaskFormState {
  description: string;
  weight: number;
  disciplineId: number | '';
  unityId: number | '';
  equipmentTypeId: number | '';
  fixed: boolean;
  isInspection: boolean;
  installationMethod: string;
  checklistTemplatesId: number | '';
  selectedChecklistIds: number[];
  selectedGoldenRuleIds: number[];
}

const EMPTY_FORM: TaskFormState = {
  description: '',
  weight: 1,
  disciplineId: '',
  unityId: '',
  equipmentTypeId: '',
  fixed: false,
  isInspection: false,
  installationMethod: '',
  checklistTemplatesId: '',
  selectedChecklistIds: [],
  selectedGoldenRuleIds: [],
};

// ---------------------------------------------------------------------------
// Section styles (matches CreateProject pattern)
// ---------------------------------------------------------------------------

const sectionStyle: React.CSSProperties = {
  marginBottom: '20px',
  background: 'var(--color-surface)',
  borderRadius: '12px',
  border: '1px solid var(--color-alternate)',
  overflow: 'hidden',
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 20px',
  borderBottom: '1px solid var(--color-alternate)',
  background: 'var(--color-bg)',
};

const sectionIconStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const sectionBodyStyle: React.CSSProperties = {
  padding: '20px',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: '16px',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TaskList() {
  const { t } = useTranslation();
  const { setNavBarSelection } = useAppState();
  const { user } = useAuthContext();

  // ------------------------------------------------------------------
  // List state
  // ------------------------------------------------------------------
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ------------------------------------------------------------------
  // Dropdown options
  // ------------------------------------------------------------------
  const [priorities, setPriorities] = useState<TaskPriority[]>([]);
  const [unities, setUnities] = useState<Unity[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);

  // ------------------------------------------------------------------
  // Create modal state
  // ------------------------------------------------------------------
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<TaskFormState>(EMPTY_FORM);

  // ------------------------------------------------------------------
  // Edit modal state
  // ------------------------------------------------------------------
  const [editingTask, setEditingTask] = useState<TaskListItem | null>(null);
  const [editForm, setEditForm] = useState<TaskFormState>(EMPTY_FORM);

  // ------------------------------------------------------------------
  // Golden Rules state
  // ------------------------------------------------------------------
  const [allGoldenRules, setAllGoldenRules] = useState<GoldenRule[]>([]);
  const [linkedGoldenRules, setLinkedGoldenRules] = useState<TaskGoldenRule[]>([]);
  const [goldenRulesLoading, setGoldenRulesLoading] = useState(false);
  const [selectedGoldenRuleId, setSelectedGoldenRuleId] = useState<number | undefined>();
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');
  const [newRuleSeverity, setNewRuleSeverity] = useState('media');
  const [newRuleSaving, setNewRuleSaving] = useState(false);

  // Linked checklists state (pivot)
  const [linkedChecklists, setLinkedChecklists] = useState<TaskChecklist[]>([]);
  const [checklistsLoading, setChecklistsLoading] = useState(false);
  const [selectedChecklistId, setSelectedChecklistId] = useState<number | undefined>();
  const [expandedChecklistId, setExpandedChecklistId] = useState<number | undefined>();

  // Inline checklist create
  const [showNewChecklistForm, setShowNewChecklistForm] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistDescription, setNewChecklistDescription] = useState('');
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>(['']);
  const [newChecklistSaving, setNewChecklistSaving] = useState(false);

  // ------------------------------------------------------------------
  // Shared modal loading / delete confirm
  // ------------------------------------------------------------------
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { sortField, sortDirection, handleSort } = useBackendSort();

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  const resolvePriorityName = (priorityId: number | undefined): string => {
    if (!priorityId) return '-';
    const found = priorities.find((p) => p.id === priorityId);
    return found ? found.name : String(priorityId);
  };

  // ------------------------------------------------------------------
  // Bootstrap
  // ------------------------------------------------------------------

  useEffect(() => {
    setNavBarSelection(5);
  }, []);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [priorityList, unityList, disciplineList, equipmentTypeList, goldenRulesResult, checklistResult] = await Promise.all([
          tasksApi.queryAllTaskPriorities(),
          tasksApi.getUnity(),
          tasksApi.getDisciplines(),
          projectsApi.getEquipmentTypes(),
          qualityApi.listGoldenRules().catch(() => [] as GoldenRule[]),
          qualityApi.listChecklistTemplates().catch(() => [] as ChecklistTemplate[]),
        ]);
        setPriorities(priorityList);
        setUnities(unityList);
        setDisciplines(disciplineList);
        setEquipmentTypes(equipmentTypeList);
        // API may return array or paginated object
        const grList = Array.isArray(goldenRulesResult)
          ? goldenRulesResult
          : (goldenRulesResult as any)?.items ?? [];
        setAllGoldenRules(grList);
        const clList = Array.isArray(checklistResult)
          ? checklistResult
          : (checklistResult as any)?.items ?? [];
        setChecklists(clList);
      } catch (err) {
        console.error('Failed to load dropdown options:', err);
      }
    };

    loadDropdowns();
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tasksApi.queryAllTasks({
        page,
        per_page: perPage,
        search: search || undefined,
        discipline_id: disciplineFilter || undefined,
        sort_field: sortField || undefined,
        sort_direction: sortDirection || undefined,
      });
      setTasks(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, disciplineFilter, sortField, sortDirection]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // ------------------------------------------------------------------
  // Golden Rules helpers
  // ------------------------------------------------------------------

  const loadLinkedGoldenRules = async (taskId: number) => {
    setGoldenRulesLoading(true);
    try {
      const result = await qualityApi.listTaskGoldenRules({ task_templates_id: taskId });
      const rulesList = Array.isArray(result) ? result : (result as any)?.items ?? [];
      setLinkedGoldenRules(rulesList);
    } catch (err) {
      console.error('Failed to load task golden rules:', err);
      setLinkedGoldenRules([]);
    } finally {
      setGoldenRulesLoading(false);
    }
  };

  const handleAddGoldenRule = async () => {
    if (!editingTask || !selectedGoldenRuleId) return;
    setGoldenRulesLoading(true);
    try {
      await qualityApi.createTaskGoldenRule({
        tasks_id: editingTask.id,
        golden_rules_id: selectedGoldenRuleId,
      });
      setSelectedGoldenRuleId(undefined);
      await loadLinkedGoldenRules(editingTask.id);
    } catch (err) {
      console.error('Failed to add golden rule:', err);
    } finally {
      setGoldenRulesLoading(false);
    }
  };

  const handleRemoveGoldenRule = async (linkId: number) => {
    if (!editingTask) return;
    setGoldenRulesLoading(true);
    try {
      await qualityApi.deleteTaskGoldenRule(linkId);
      await loadLinkedGoldenRules(editingTask.id);
    } catch (err) {
      console.error('Failed to remove golden rule:', err);
    } finally {
      setGoldenRulesLoading(false);
    }
  };

  const handleCreateGoldenRule = async () => {
    if (!newRuleTitle.trim()) return;
    setNewRuleSaving(true);
    try {
      const created = await qualityApi.createGoldenRule({
        title: newRuleTitle.trim(),
        description: newRuleDescription.trim() || undefined,
        severity: newRuleSeverity,
        company_id: user?.companyId || 1,
      });
      // Add to local list
      setAllGoldenRules((prev) => [...prev, created]);
      // If editing a task, auto-link immediately
      if (editingTask && created.id) {
        await qualityApi.createTaskGoldenRule({
          tasks_id: editingTask.id,
          golden_rules_id: created.id,
        });
        await loadLinkedGoldenRules(editingTask.id);
      } else if (created.id) {
        // Create mode: store the ID so it gets linked after the task is saved
        setCreateForm((prev) => ({
          ...prev,
          selectedGoldenRuleIds: [...prev.selectedGoldenRuleIds, created.id],
        }));
      }
      setNewRuleTitle('');
      setNewRuleDescription('');
      setNewRuleSeverity('media');
      setShowNewRuleForm(false);
    } catch (err) {
      console.error('Failed to create golden rule:', err);
    } finally {
      setNewRuleSaving(false);
    }
  };

  const handleCreateChecklist = async () => {
    if (!newChecklistName.trim()) return;
    setNewChecklistSaving(true);
    try {
      const items = newChecklistItems
        .map((desc) => desc.trim())
        .filter((desc) => desc.length > 0)
        .map((desc, idx) => ({ description: desc, item_order: idx, response_type: 'sim_nao' as const, is_critical: false }));
      const created = await qualityApi.createChecklistTemplate({
        name: newChecklistName.trim(),
        description: newChecklistDescription.trim() || undefined,
        company_id: user?.companyId || 1,
        checklist_type: 'geral',
        items,
      });
      setChecklists((prev) => [...prev, created]);
      setNewChecklistName('');
      setNewChecklistDescription('');
      setNewChecklistItems(['']);
      setShowNewChecklistForm(false);
    } catch (err) {
      console.error('Failed to create checklist template:', err);
    } finally {
      setNewChecklistSaving(false);
    }
  };

  // Linked checklists handlers
  const loadLinkedChecklists = async (taskId: number) => {
    setChecklistsLoading(true);
    try {
      const result = await qualityApi.listTaskChecklists({ tasks_id: taskId });
      const list = Array.isArray(result) ? result : (result as any)?.items ?? [];
      setLinkedChecklists(list);
    } catch (err) {
      console.error('Failed to load task checklists:', err);
      setLinkedChecklists([]);
    } finally {
      setChecklistsLoading(false);
    }
  };

  const handleAddChecklist = async () => {
    if (!editingTask || !selectedChecklistId) return;
    setChecklistsLoading(true);
    try {
      await qualityApi.createTaskChecklist({
        tasks_template_id: editingTask.id,
        checklist_templates_id: selectedChecklistId,
      });
      setSelectedChecklistId(undefined);
      await loadLinkedChecklists(editingTask.id);
    } catch (err) {
      console.error('Failed to add checklist:', err);
    } finally {
      setChecklistsLoading(false);
    }
  };

  const handleRemoveChecklist = async (linkId: number) => {
    if (!editingTask) return;
    setChecklistsLoading(true);
    try {
      await qualityApi.deleteTaskChecklist(linkId);
      await loadLinkedChecklists(editingTask.id);
    } catch (err) {
      console.error('Failed to remove checklist:', err);
    } finally {
      setChecklistsLoading(false);
    }
  };

  // Available checklists (not yet linked)
  const availableChecklists = checklists.filter(
    (cl) => !linkedChecklists.some((lcl) => lcl.checklist_templates_id === cl.id),
  );


  // ------------------------------------------------------------------
  // Create
  // ------------------------------------------------------------------

  const openCreateModal = () => {
    setCreateForm(EMPTY_FORM);
    setShowCreateModal(true);
  };

  const handleCreateTask = async () => {
    if (!createForm.description.trim()) return;
    setModalLoading(true);
    try {
      const created = await tasksApi.addTask({
        description: createForm.description.trim(),
        weight: createForm.weight,
        discipline_id: createForm.disciplineId || undefined,
        unity_id: createForm.unityId || undefined,
        equipaments_types_id: createForm.equipmentTypeId || undefined,
        fixed: createForm.fixed,
        is_inspection: createForm.isInspection,
        installation_method: createForm.installationMethod.trim() || undefined,
        checklist_templates_id: createForm.checklistTemplatesId || undefined,
      });
      // Link selected checklists to the newly created task
      if (created?.id && createForm.selectedChecklistIds.length > 0) {
        await Promise.all(
          createForm.selectedChecklistIds.map((clId) =>
            qualityApi.createTaskChecklist({ tasks_template_id: created.id, checklist_templates_id: clId })
          ),
        );
      }
      // Link selected golden rules to the newly created task
      if (created?.id && createForm.selectedGoldenRuleIds.length > 0) {
        await Promise.all(
          createForm.selectedGoldenRuleIds.map((grId) =>
            qualityApi.createTaskGoldenRule({ tasks_id: created.id, golden_rules_id: grId })
          ),
        );
      }
      setShowCreateModal(false);
      setCreateForm(EMPTY_FORM);
      loadTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Edit
  // ------------------------------------------------------------------

  const openEditModal = (task: TaskListItem) => {
    setEditingTask(task);
    setEditForm({
      description: task.description || task.name || '',
      weight: task.weight ?? 1,
      disciplineId: task.discipline_id ?? '',
      unityId: task.unity_id ?? '',
      equipmentTypeId: task.equipaments_types_id ?? '',
      fixed: task.fixed ?? false,
      isInspection: task.is_inspection ?? false,
      installationMethod: task.installation_method ?? '',
      checklistTemplatesId: task.checklist_templates_id ?? '',
    });
    setLinkedGoldenRules([]);
    setSelectedGoldenRuleId(undefined);
    loadLinkedGoldenRules(task.id);
    loadLinkedChecklists(task.id);
  };

  const handleEditTask = async () => {
    if (!editingTask || !editForm.description.trim()) return;
    setModalLoading(true);
    try {
      await tasksApi.editTask(editingTask.id, {
        description: editForm.description.trim(),
        weight: editForm.weight,
        discipline_id: editForm.disciplineId || undefined,
        unity_id: editForm.unityId || undefined,
        equipaments_types_id: editForm.equipmentTypeId || undefined,
        fixed: editForm.fixed,
        is_inspection: editForm.isInspection,
        installation_method: editForm.installationMethod.trim() || undefined,
        checklist_templates_id: editForm.checklistTemplatesId || undefined,
      });
      setEditingTask(null);
      loadTasks();
    } catch (err) {
      console.error('Failed to edit task:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Delete
  // ------------------------------------------------------------------

  const handleDeleteTask = async (id: number) => {
    try {
      await tasksApi.deleteTask(id);
      loadTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
    setDeleteConfirm(null);
  };

  // ------------------------------------------------------------------
  // Render helpers
  // ------------------------------------------------------------------

  const renderBoolIcon = (value: boolean | undefined) =>
    value ? (
      <Check size={16} color="var(--color-success)" />
    ) : (
      <X size={16} color="var(--color-secondary-text)" />
    );

  // ------------------------------------------------------------------
  // Sectioned modal content
  // ------------------------------------------------------------------

  const renderModalSections = (
    form: TaskFormState,
    onChange: (patch: Partial<TaskFormState>) => void,
    isEditMode: boolean,
  ) => (
    <motion.div variants={staggerParent} initial="initial" animate="animate">
      {/* Section 1 - Dados da Tarefa */}
      <motion.div variants={fadeUpChild} style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={{ ...sectionIconStyle, background: 'var(--color-status-01)' }}>
            <ClipboardList size={18} color="var(--color-primary)" />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{t('tasks.taskData')}</h4>
            <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{t('tasks.taskDataDesc')}</span>
          </div>
        </div>
        <div style={sectionBodyStyle}>
          <div style={gridStyle}>
            <div className="input-group">
              <label>{t('tasks.taskName')} *</label>
              <input
                className="input-field"
                value={form.description}
                onChange={(e) => onChange({ description: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>{t('tasks.weight')}</label>
              <input
                type="number"
                className="input-field"
                min={0}
                step={0.01}
                value={form.weight}
                onChange={(e) => onChange({ weight: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id={`fixed-checkbox-${isEditMode ? 'edit' : 'create'}`}
                type="checkbox"
                checked={form.fixed}
                onChange={(e) => onChange({ fixed: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor={`fixed-checkbox-${isEditMode ? 'edit' : 'create'}`} style={{ marginBottom: 0, cursor: 'pointer' }}>
                {t('tasks.fixed')}
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id={`inspection-checkbox-${isEditMode ? 'edit' : 'create'}`}
                type="checkbox"
                checked={form.isInspection}
                onChange={(e) => onChange({ isInspection: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor={`inspection-checkbox-${isEditMode ? 'edit' : 'create'}`} style={{ marginBottom: 0, cursor: 'pointer' }}>
                {t('tasks.isInspection')}
              </label>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 2 - Classificacao */}
      <motion.div variants={fadeUpChild} style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={{ ...sectionIconStyle, background: '#FFF3E0' }}>
            <Layers size={18} color="#E65100" />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{t('tasks.classification')}</h4>
            <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{t('tasks.classificationDesc')}</span>
          </div>
        </div>
        <div style={sectionBodyStyle}>
          <div style={gridStyle}>
            <div className="input-group">
              <label>{t('tasks.discipline')}</label>
              <SearchableSelect
                options={disciplines.map((d) => ({ value: d.id, label: d.discipline || d.name || '' }))}
                value={form.disciplineId || undefined}
                onChange={(value) => onChange({ disciplineId: value ? Number(value) : '' })}
                placeholder={t('tasks.selectDiscipline')}
                searchPlaceholder={t('common.search')}
              />
            </div>
            <div className="input-group">
              <label>{t('tasks.unity')}</label>
              <SearchableSelect
                options={unities.map((u) => { const uName = u.unity || u.name || ''; return { value: u.id, label: u.abbreviation ? `${uName} (${u.abbreviation})` : uName }; })}
                value={form.unityId || undefined}
                onChange={(value) => onChange({ unityId: value ? Number(value) : '' })}
                placeholder={t('tasks.selectUnity')}
                searchPlaceholder={t('common.search')}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 3 - Execução (Método + Checklist) */}
      <motion.div variants={fadeUpChild} style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={{ ...sectionIconStyle, background: '#E8F5E9' }}>
            <Wrench size={18} color="#2E7D32" />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{t('tasks.execution')}</h4>
            <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{t('tasks.executionDesc')}</span>
          </div>
        </div>
        <div style={sectionBodyStyle}>
          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label>{t('tasks.installationMethod')}</label>
            <textarea
              className="input-field"
              rows={3}
              value={form.installationMethod}
              onChange={(e) => onChange({ installationMethod: e.target.value })}
              placeholder={t('tasks.installationMethodPlaceholder')}
              style={{ resize: 'vertical', minHeight: '72px' }}
            />
          </div>
          {/* Checklist multi-select (both modes) */}
          <div className="input-group">
            <label><CheckSquare size={14} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />{t('tasks.checklist')}</label>

            {/* Add checklist dropdown + button */}
            {(() => {
              const currentIds = isEditMode
                ? linkedChecklists.map((lcl) => lcl.checklist_templates_id)
                : form.selectedChecklistIds;
              const available = checklists.filter((cl) => !currentIds.includes(cl.id));
              return (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <SearchableSelect
                      options={available.map((cl) => ({ value: cl.id, label: cl.name }))}
                      value={selectedChecklistId}
                      onChange={(value) => setSelectedChecklistId(value ? Number(value) : undefined)}
                      placeholder={t('tasks.selectChecklist')}
                      searchPlaceholder={t('common.search')}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      if (!selectedChecklistId) return;
                      if (isEditMode) {
                        handleAddChecklist();
                      } else {
                        onChange({ selectedChecklistIds: [...form.selectedChecklistIds, selectedChecklistId] });
                        setSelectedChecklistId(undefined);
                      }
                    }}
                    disabled={!selectedChecklistId || (isEditMode && checklistsLoading)}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Plus size={16} /> {t('common.add')}
                  </button>
                </div>
              );
            })()}

            {/* Linked checklists list (edit mode) */}
            {isEditMode && (
              <>
                {checklistsLoading ? (
                  <div style={{ textAlign: 'center', padding: '12px', color: 'var(--color-secondary-text)' }}>
                    <span className="spinner" />
                  </div>
                ) : linkedChecklists.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '16px', color: 'var(--color-secondary-text)', fontSize: '13px',
                    background: 'var(--color-bg)', borderRadius: '8px', border: '1px dashed var(--color-alternate)',
                  }}>
                    {t('tasks.noChecklistLinked')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {linkedChecklists.map((lcl) => {
                      const cl = lcl.checklist_template || checklists.find((c) => c.id === lcl.checklist_templates_id);
                      const isExpanded = expandedChecklistId === lcl.id;
                      return (
                        <div key={lcl.id} style={{ border: '1px solid var(--color-alternate)', borderRadius: '8px', overflow: 'hidden' }}>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                            background: '#E8F5E9', cursor: 'pointer',
                          }} onClick={() => setExpandedChecklistId(isExpanded ? undefined : lcl.id)}>
                            <CheckSquare size={14} color="#2E7D32" />
                            <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: '#2E7D32' }}>
                              {cl?.name || `Checklist #${lcl.checklist_templates_id}`}
                            </span>
                            {cl?.items && cl.items.length > 0 && (
                              <span style={{ fontSize: '11px', color: '#666', marginRight: '4px' }}>
                                {cl.items.length} {cl.items.length === 1 ? 'item' : 'itens'}
                              </span>
                            )}
                            {isExpanded ? <ChevronUp size={14} color="#2E7D32" /> : <ChevronDown size={14} color="#2E7D32" />}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleRemoveChecklist(lcl.id); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
                              title={t('common.remove')}
                            >
                              <X size={14} color="#C62828" />
                            </button>
                          </div>
                          {isExpanded && cl?.items && cl.items.length > 0 && (
                            <div style={{ padding: '8px 12px', background: 'var(--color-bg)' }}>
                              {cl.items.map((item, idx) => (
                                <div key={item.id || idx} style={{
                                  display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0',
                                  borderBottom: idx < cl.items!.length - 1 ? '1px solid var(--color-alternate)' : 'none',
                                  fontSize: '13px', color: 'var(--color-primary-text)',
                                }}>
                                  <span style={{ color: 'var(--color-secondary-text)', minWidth: '20px' }}>{idx + 1}.</span>
                                  <span>{item.description}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Selected checklists list (create mode - local state) */}
            {!isEditMode && form.selectedChecklistIds.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {form.selectedChecklistIds.map((clId) => {
                  const cl = checklists.find((c) => c.id === clId);
                  const isExpanded = expandedChecklistId === clId;
                  return (
                    <div key={clId} style={{ border: '1px solid var(--color-alternate)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                        background: '#E8F5E9', cursor: 'pointer',
                      }} onClick={() => setExpandedChecklistId(isExpanded ? undefined : clId)}>
                        <CheckSquare size={14} color="#2E7D32" />
                        <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: '#2E7D32' }}>
                          {cl?.name || `Checklist #${clId}`}
                        </span>
                        {cl?.items && cl.items.length > 0 && (
                          <span style={{ fontSize: '11px', color: '#666', marginRight: '4px' }}>
                            {cl.items.length} {cl.items.length === 1 ? 'item' : 'itens'}
                          </span>
                        )}
                        {isExpanded ? <ChevronUp size={14} color="#2E7D32" /> : <ChevronDown size={14} color="#2E7D32" />}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onChange({ selectedChecklistIds: form.selectedChecklistIds.filter((id) => id !== clId) }); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
                          title={t('common.remove')}
                        >
                          <X size={14} color="#C62828" />
                        </button>
                      </div>
                      {isExpanded && cl?.items && cl.items.length > 0 && (
                        <div style={{ padding: '8px 12px', background: 'var(--color-bg)' }}>
                          {cl.items.map((item, idx) => (
                            <div key={item.id || idx} style={{
                              display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0',
                              borderBottom: idx < cl.items!.length - 1 ? '1px solid var(--color-alternate)' : 'none',
                              fontSize: '13px', color: 'var(--color-primary-text)',
                            }}>
                              <span style={{ color: 'var(--color-secondary-text)', minWidth: '20px' }}>{idx + 1}.</span>
                              <span>{item.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inline create checklist */}
          <div style={{ marginTop: '12px' }}>
            {!showNewChecklistForm ? (
              <button
                type="button"
                onClick={() => setShowNewChecklistForm(true)}
                style={{
                  background: 'none', border: 'none', color: 'var(--color-primary)',
                  cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0,
                }}
              >
                <Plus size={14} /> {t('tasks.newChecklist')}
              </button>
            ) : (
              <div style={{ padding: '12px', border: '1px solid var(--color-alternate)', borderRadius: 'var(--radius-md)', background: 'var(--color-tertiary-bg)' }}>
                <div className="input-group" style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px' }}>{t('tasks.checklistName')}</label>
                  <input className="input-field" value={newChecklistName} onChange={(e) => setNewChecklistName(e.target.value)} placeholder={t('tasks.checklistNamePlaceholder')} />
                </div>
                <div className="input-group" style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px' }}>{t('tasks.checklistDescription')}</label>
                  <input className="input-field" value={newChecklistDescription} onChange={(e) => setNewChecklistDescription(e.target.value)} placeholder={t('tasks.checklistDescriptionPlaceholder')} />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>{t('tasks.checklistItems')}</label>
                  {newChecklistItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)', minWidth: '18px' }}>{idx + 1}.</span>
                      <input
                        className="input-field"
                        value={item}
                        onChange={(e) => { const u = [...newChecklistItems]; u[idx] = e.target.value; setNewChecklistItems(u); }}
                        placeholder={t('tasks.checklistItemPlaceholder')}
                        style={{ flex: 1 }}
                      />
                      {newChecklistItems.length > 1 && (
                        <button type="button" onClick={() => setNewChecklistItems(newChecklistItems.filter((_, i) => i !== idx))}
                          style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setNewChecklistItems([...newChecklistItems, ''])}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 0' }}>
                    <Plus size={12} /> {t('tasks.addChecklistItem')}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowNewChecklistForm(false); setNewChecklistName(''); setNewChecklistDescription(''); setNewChecklistItems(['']); }}
                    style={{ fontSize: '13px', padding: '6px 12px' }}>{t('common.cancel')}</button>
                  <button type="button" className="btn btn-primary" onClick={handleCreateChecklist} disabled={!newChecklistName.trim() || newChecklistSaving}
                    style={{ fontSize: '13px', padding: '6px 12px' }}>
                    {newChecklistSaving ? <span className="spinner" /> : <>{t('common.save')}</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Section 4 - Regras de Ouro */}
      <motion.div variants={fadeUpChild} style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={{ ...sectionIconStyle, background: '#FFEBEE' }}>
            <Shield size={18} color="#C62828" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{t('tasks.goldenRules')}</h4>
            <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{t('tasks.goldenRulesDesc')}</span>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => { setShowNewRuleForm((v) => !v); setNewRuleTitle(''); setNewRuleDescription(''); }}
            style={{ fontSize: '13px', padding: '6px 12px' }}
          >
            <Plus size={14} /> {t('tasks.newGoldenRule')}
          </button>
        </div>
        <div style={sectionBodyStyle}>
          {/* Inline create golden rule form */}
          {showNewRuleForm && (
            <div style={{
              padding: '16px',
              marginBottom: '12px',
              background: 'var(--color-bg)',
              borderRadius: '8px',
              border: '1px solid var(--color-alternate)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>{t('tasks.goldenRuleTitle')} *</label>
                  <input
                    className="input-field"
                    value={newRuleTitle}
                    onChange={(e) => setNewRuleTitle(e.target.value)}
                    placeholder={t('tasks.goldenRuleTitlePlaceholder')}
                  />
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label>{t('tasks.goldenRuleDescription')}</label>
                  <input
                    className="input-field"
                    value={newRuleDescription}
                    onChange={(e) => setNewRuleDescription(e.target.value)}
                    placeholder={t('tasks.goldenRuleDescPlaceholder')}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div className="input-group" style={{ margin: 0, maxWidth: '200px' }}>
                  <label>Severidade</label>
                  <SearchableSelect
                    options={[
                      { value: 'baixa', label: 'Baixa' },
                      { value: 'media', label: 'Média' },
                      { value: 'alta', label: 'Alta' },
                      { value: 'critica', label: 'Crítica' },
                    ]}
                    value={newRuleSeverity}
                    onChange={(val) => setNewRuleSeverity(String(val ?? 'baixa'))}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setShowNewRuleForm(false); setNewRuleTitle(''); setNewRuleDescription(''); setNewRuleSeverity('media'); }}
                  style={{ fontSize: '13px', padding: '6px 12px' }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCreateGoldenRule}
                  disabled={!newRuleTitle.trim() || newRuleSaving}
                  style={{ fontSize: '13px', padding: '6px 12px' }}
                >
                  {newRuleSaving ? <span className="spinner" /> : <>{t('common.save')}</>}
                </button>
              </div>
            </div>
          )}

          {/* Select existing golden rule (both modes) */}
          {(() => {
            // In create mode, use form state; in edit mode, use linked rules from API
            const currentIds = isEditMode
              ? linkedGoldenRules.map((lgr) => lgr.golden_rules_id)
              : form.selectedGoldenRuleIds;
            const filteredRules = allGoldenRules.filter((gr) => !currentIds.includes(gr.id));

            const handleSelect = () => {
              if (!selectedGoldenRuleId) return;
              if (isEditMode) {
                handleAddGoldenRule();
              } else {
                onChange({ selectedGoldenRuleIds: [...form.selectedGoldenRuleIds, selectedGoldenRuleId] });
                setSelectedGoldenRuleId(undefined);
              }
            };

            const sevColors: Record<string, { bg: string; text: string }> = {
              baixa: { bg: '#E8F5E9', text: '#2E7D32' },
              media: { bg: '#FFF3E0', text: '#E65100' },
              alta: { bg: '#FFEBEE', text: '#C62828' },
              critica: { bg: '#F3E5F5', text: '#6A1B9A' },
            };

            const rulesToShow = isEditMode
              ? linkedGoldenRules.map((lgr) => {
                  const rule = allGoldenRules.find((gr) => gr.id === lgr.golden_rules_id);
                  return { id: lgr.id, ruleId: lgr.golden_rules_id, title: lgr.golden_rule_title || rule?.title || `#${lgr.golden_rules_id}`, severity: rule?.severity || 'media', isLinked: true };
                })
              : form.selectedGoldenRuleIds.map((grId) => {
                  const rule = allGoldenRules.find((gr) => gr.id === grId);
                  return { id: grId, ruleId: grId, title: rule?.title || `#${grId}`, severity: rule?.severity || 'media', isLinked: false };
                });

            return (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <SearchableSelect
                      options={filteredRules.map((gr) => ({ value: gr.id, label: gr.title }))}
                      value={selectedGoldenRuleId}
                      onChange={(value) => setSelectedGoldenRuleId(value ? Number(value) : undefined)}
                      placeholder={t('tasks.addGoldenRule')}
                      searchPlaceholder={t('common.search')}
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleSelect}
                    disabled={!selectedGoldenRuleId || (isEditMode && goldenRulesLoading)}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Plus size={16} /> {t('common.add')}
                  </button>
                </div>

                {/* Selected / linked golden rules list */}
                {isEditMode && goldenRulesLoading ? (
                  <div style={{ textAlign: 'center', padding: '12px', color: 'var(--color-secondary-text)' }}>
                    <span className="spinner" />
                  </div>
                ) : rulesToShow.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    color: 'var(--color-secondary-text)',
                    fontSize: '13px',
                    background: 'var(--color-bg)',
                    borderRadius: '8px',
                    border: '1px dashed var(--color-alternate)',
                  }}>
                    {t('tasks.noGoldenRulesLinked')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {rulesToShow.map((item) => {
                      const colors = sevColors[item.severity] || sevColors.media;
                      return (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 10px',
                            background: colors.bg,
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: colors.text,
                          }}
                        >
                          <Shield size={14} />
                          <span>{item.title}</span>
                          <button
                            onClick={() => {
                              if (item.isLinked) {
                                handleRemoveGoldenRule(item.id);
                              } else {
                                onChange({ selectedGoldenRuleIds: form.selectedGoldenRuleIds.filter((id) => id !== item.ruleId) });
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              borderRadius: '4px',
                            }}
                            title={t('tasks.removeGoldenRule')}
                          >
                            <X size={14} color={colors.text} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </motion.div>
    </motion.div>
  );

  // ------------------------------------------------------------------
  // JSX
  // ------------------------------------------------------------------

  return (
    <div>
      <PageHeader
        title={t('tasks.title')}
        subtitle={t('tasks.subtitle')}
        actions={
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> {t('tasks.createTask')}
          </button>
        }
      />

      {/* Search + Discipline filter */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-secondary-text)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder={t('tasks.searchTasks')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <SearchableSelect
          options={disciplines.map((d) => ({ value: d.id, label: d.discipline || d.name || '' }))}
          value={disciplineFilter || undefined}
          onChange={(value) => {
            setDisciplineFilter(value ? Number(value) : '');
            setPage(1);
          }}
          placeholder={t('tasks.allDisciplines')}
          searchPlaceholder={t('common.search')}
          style={{ flex: '0 0 220px' }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <EmptyState
          message={t('common.noData')}
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> {t('tasks.createTask')}
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <SortableHeader label={t('tasks.taskName')} field="description" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('tasks.discipline')} field="discipline_id" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('tasks.unity')} field="unity_id" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('tasks.weight')} field="weight" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('tasks.priority')} field="priority" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('tasks.fixed')} field="fixed" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} style={{ textAlign: 'center' }} />
                <SortableHeader label={t('tasks.isInspection')} field="is_inspection" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} style={{ textAlign: 'center' }} />
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {tasks.map((task) => (
                <motion.tr key={task.id} variants={tableRowVariants}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ClipboardList size={16} color="var(--color-primary)" />
                      <span style={{ fontWeight: 500 }}>
                        {task.description || task.name || '-'}
                      </span>
                    </div>
                  </td>
                  <td>{task.discipline?.discipline || '-'}</td>
                  <td>{task.unity?.unity || '-'}</td>
                  <td>{task.weight ?? '-'}</td>
                  <td>
                    {task.priority ? (
                      <span className="badge">{resolvePriorityName(task.priority)}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>{renderBoolIcon(task.fixed)}</td>
                  <td style={{ textAlign: 'center' }}>{renderBoolIcon(task.is_inspection)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-icon"
                        title={t('common.edit')}
                        onClick={() => openEditModal(task)}
                      >
                        <Edit size={16} color="var(--color-secondary-text)" />
                      </button>
                      <button
                        className="btn btn-icon"
                        title={t('common.delete')}
                        onClick={() => setDeleteConfirm(task.id)}
                      >
                        <Trash2 size={16} color="var(--color-error)" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            perPage={perPage}
            totalItems={totalItems}
            onPageChange={setPage}
            onPerPageChange={(pp) => {
              setPerPage(pp);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', width: '95%', padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>{t('tasks.createTask')}</h3>

            {renderModalSections(createForm, (patch) =>
              setCreateForm((prev) => ({ ...prev, ...patch })),
              false,
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateTask}
                disabled={modalLoading || !createForm.description.trim()}
              >
                {modalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-backdrop" onClick={() => setEditingTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', width: '95%', padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>{t('tasks.editTask')}</h3>

            {renderModalSections(editForm, (patch) =>
              setEditForm((prev) => ({ ...prev, ...patch })),
              true,
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setEditingTask(null)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleEditTask}
                disabled={modalLoading || !editForm.description.trim()}
              >
                {modalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('tasks.confirmDelete')}
          onConfirm={() => handleDeleteTask(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

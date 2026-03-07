import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuth } from '../../hooks/useAuth';
import { qualityApi, projectsApi } from '../../services';
import type {
  NonConformance,
  NonConformanceStatistics,
  NonConformanceAttachment,
} from '../../types';
import SearchableSelect from '../../components/common/SearchableSelect';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Plus,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Paperclip,
  CheckCircle,
  Filter,
} from 'lucide-react';

// ── Toast ─────────────────────────────────────────────────────────────────────

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

// ── Constants ─────────────────────────────────────────────────────────────────

const NC_STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  aberta:        { bg: 'var(--color-status-01)', color: 'var(--color-error)',          label: 'Aberta' },
  em_analise:    { bg: 'var(--color-status-02)', color: 'var(--color-warning)',         label: 'Em Análise' },
  em_tratamento: { bg: 'var(--color-status-03)', color: 'var(--color-info)',            label: 'Em Tratamento' },
  verificacao:   { bg: '#ede9fe',                color: '#7c3aed',                      label: 'Verificação' },
  encerrada:     { bg: 'var(--color-status-04)', color: 'var(--color-success)',         label: 'Encerrada' },
};

const NC_SEVERITY_MAP: Record<string, { bg: string; color: string; label: string }> = {
  menor:   { bg: 'var(--color-status-02)', color: 'var(--color-warning)',         label: 'Menor' },
  maior:   { bg: '#fff3e0',               color: '#e65100',                      label: 'Maior' },
  critica: { bg: 'var(--color-status-01)', color: 'var(--color-error)',           label: 'Crítica' },
};

const SEVERITY_OPTIONS = ['menor', 'maior', 'critica'] as const;
const STATUS_OPTIONS   = ['aberta', 'em_analise', 'em_tratamento', 'verificacao', 'encerrada'] as const;
const ORIGIN_OPTIONS   = ['auditoria', 'inspecao', 'cliente', 'fornecedor', 'interno', 'outro'] as const;
const CATEGORY_OPTIONS = ['processo', 'material', 'mao_de_obra', 'equipamento', 'meio_ambiente', 'metodo', 'outro'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  processo: 'Processo',
  material: 'Material',
  mao_de_obra: 'Mão de Obra',
  equipamento: 'Equipamento',
  meio_ambiente: 'Meio Ambiente',
  metodo: 'Método',
  outro: 'Outro',
};

// ── Styles ────────────────────────────────────────────────────────────────────

const errorBorder: React.CSSProperties = { border: '1.5px solid var(--color-error)' };
const errorText: React.CSSProperties = { color: 'var(--color-error)', fontSize: '11px', marginTop: '2px' };
const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' };

// ── Types ─────────────────────────────────────────────────────────────────────

interface CreateNcForm {
  projects_id: string;
  title: string;
  description: string;
  origin: string;
  severity: string;
  category: string;
}

interface TreatNcForm {
  root_cause_analysis: string;
  corrective_action_plan: string;
  preventive_action: string;
  deadline: string;
}

interface CloseNcForm {
  root_cause_analysis: string;
  corrective_action_plan: string;
  preventive_action: string;
}

const EMPTY_CREATE_FORM: CreateNcForm = {
  projects_id: '',
  title: '',
  description: '',
  origin: '',
  severity: '',
  category: '',
};

const EMPTY_TREAT_FORM: TreatNcForm = {
  root_cause_analysis: '',
  corrective_action_plan: '',
  preventive_action: '',
  deadline: '',
};

const EMPTY_CLOSE_FORM: CloseNcForm = {
  root_cause_analysis: '',
  corrective_action_plan: '',
  preventive_action: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStatCount(arr: { status?: string; severity?: string; count: number }[], key: string, field: 'status' | 'severity'): number {
  const found = arr.find((item) => (item as any)[field] === key);
  return found ? found.count : 0;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="card" style={{ flex: '1 1 160px', padding: '16px 20px', minWidth: '140px' }}>
      <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginBottom: '6px' }}>{label}</p>
      <p style={{ fontSize: '28px', fontWeight: 700, color: color || 'var(--color-primary)' }}>{value}</p>
    </div>
  );
}

function AttachmentsRow({
  ncId,
  attachments,
  onAttached,
  showToast,
  userId,
}: {
  ncId: number;
  attachments: NonConformanceAttachment[];
  onAttached: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  userId: number;
}) {
  const [form, setForm] = useState({ file_url: '', description: '' });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.file_url.trim()) return;
    setSaving(true);
    try {
      await qualityApi.addNcAttachment(ncId, {
        file_url: form.file_url.trim(),
        description: form.description.trim() || undefined,
        uploaded_by_user_id: userId,
      });
      setForm({ file_url: '', description: '' });
      onAttached();
      showToast('Anexo adicionado com sucesso.');
    } catch (err) {
      console.error('Failed to add attachment:', err);
      showToast('Erro ao adicionar anexo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <td colSpan={8} style={{ padding: '12px 20px', background: 'var(--color-alternate)', borderTop: 'none' }}>
      <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-secondary-text)' }}>
        Anexos ({attachments.length})
      </p>
      {attachments.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          {attachments.map((att) => (
            <a
              key={att.id}
              href={att.file_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '4px',
                background: 'var(--color-surface)',
                color: 'var(--color-primary)',
                textDecoration: 'none',
                border: '1px solid var(--color-border)',
              }}
            >
              <Paperclip size={12} />
              {att.description || att.file_url}
            </a>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          className="input-field"
          placeholder="URL do arquivo"
          value={form.file_url}
          onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))}
          style={{ flex: 2, fontSize: '12px', padding: '6px 10px' }}
        />
        <input
          className="input-field"
          placeholder="Descrição (opcional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          style={{ flex: 2, fontSize: '12px', padding: '6px 10px' }}
        />
        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={saving || !form.file_url.trim()}
          style={{ fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}
        >
          {saving ? 'Salvando...' : 'Adicionar'}
        </button>
      </div>
    </td>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function NonConformances() {
  const { t: _t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();
  const { user } = useAuth();

  // Projects list (for create dropdown)
  const [projectsList, setProjectsList] = useState<{ id: number; name: string }[]>([]);

  // List state
  const [items, setItems]           = useState<NonConformance[]>([]);
  const [stats, setStats]           = useState<NonConformanceStatistics | null>(null);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [perPage, setPerPage]       = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Expanded row for attachments
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Create NC modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm]           = useState<CreateNcForm>(EMPTY_CREATE_FORM);
  const [createLoading, setCreateLoading]     = useState(false);
  const [createErrors, setCreateErrors]       = useState<Record<string, string>>({});

  // Treat NC modal
  const [treatNc, setTreatNc]             = useState<NonConformance | null>(null);
  const [treatForm, setTreatForm]         = useState<TreatNcForm>(EMPTY_TREAT_FORM);
  const [treatLoading, setTreatLoading]   = useState(false);
  const [treatErrors, setTreatErrors]     = useState<Record<string, string>>({});

  // Close NC modal
  const [closeNc, setCloseNc]           = useState<NonConformance | null>(null);
  const [closeForm, setCloseForm]       = useState<CloseNcForm>(EMPTY_CLOSE_FORM);
  const [closeLoading, setCloseLoading] = useState(false);
  const [closeErrors, setCloseErrors]   = useState<Record<string, string>>({});

  // Toast
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    setNavBarSelection(23);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await projectsApi.queryAllProjects({ per_page: 100 });
        const list = (data.items || []).map((p: any) => ({ id: Number(p.id), name: p.name }));
        setProjectsList(list);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    })();
  }, []);

  const clearFieldError = (setter: React.Dispatch<React.SetStateAction<Record<string, string>>>, field: string) => {
    setter((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // ── Data fetching ────────────────────────────────────────────────────────────

  const loadStats = useCallback(async () => {
    try {
      const params: Record<string, unknown> = {};
      if (projectsInfo) params.projects_id = projectsInfo.id;
      const data = await qualityApi.getNcStatistics(params);
      setStats(data);
    } catch (err) {
      console.error('Failed to load NC statistics:', err);
    }
  }, [projectsInfo]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, per_page: perPage };
      if (projectsInfo)    params.projects_id = projectsInfo.id;
      if (filterStatus)    params.status       = filterStatus;
      if (filterSeverity)  params.severity     = filterSeverity;

      const data = await qualityApi.listNonConformances(params);
      setItems(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load non-conformances:', err);
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, page, perPage, filterStatus, filterSeverity]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterSeverity, filterCategory]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!user?.id) return;
    const errs: Record<string, string> = {};
    if (!createForm.projects_id) errs.projects_id = 'Projeto é obrigatório';
    if (!createForm.title.trim()) errs.title = 'Título é obrigatório';
    if (!createForm.description.trim()) errs.description = 'Descrição é obrigatória';
    if (!createForm.origin) errs.origin = 'Origem é obrigatória';
    if (!createForm.severity) errs.severity = 'Severidade é obrigatória';
    if (!createForm.category) errs.category = 'Categoria é obrigatória';
    if (Object.keys(errs).length > 0) {
      setCreateErrors(errs);
      return;
    }
    setCreateLoading(true);
    setCreateErrors({});
    try {
      await qualityApi.createNonConformance({
        title:              createForm.title.trim(),
        description:        createForm.description.trim(),
        origin:             createForm.origin,
        severity:           createForm.severity,
        category:           createForm.category,
        projects_id:        Number(createForm.projects_id),
        opened_by_user_id:  user.id,
      });
      setCreateForm(EMPTY_CREATE_FORM);
      setShowCreateModal(false);
      loadItems();
      loadStats();
      showToast('Não conformidade registrada com sucesso.');
    } catch (err) {
      console.error('Failed to create NC:', err);
      showToast('Erro ao registrar não conformidade.', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenTreat = (nc: NonConformance) => {
    setTreatNc(nc);
    setTreatForm({
      root_cause_analysis:    nc.root_cause_analysis    || '',
      corrective_action_plan: nc.corrective_action_plan || '',
      preventive_action:      nc.preventive_action      || '',
      deadline:               nc.deadline               || '',
    });
    setTreatErrors({});
  };

  const handleTreat = async () => {
    if (!treatNc) return;
    const errs: Record<string, string> = {};
    if (!treatForm.root_cause_analysis.trim()) errs.root_cause_analysis = 'Causa raiz é obrigatória';
    if (!treatForm.corrective_action_plan.trim()) errs.corrective_action_plan = 'Ação corretiva é obrigatória';
    if (Object.keys(errs).length > 0) {
      setTreatErrors(errs);
      return;
    }
    setTreatLoading(true);
    setTreatErrors({});
    try {
      const payload: Record<string, unknown> = {
        root_cause_analysis:    treatForm.root_cause_analysis.trim(),
        corrective_action_plan: treatForm.corrective_action_plan.trim(),
        status:                 'em_tratamento',
      };
      if (treatForm.preventive_action.trim()) payload.preventive_action = treatForm.preventive_action.trim();
      if (treatForm.deadline) payload.deadline = treatForm.deadline;

      await qualityApi.updateNonConformance(treatNc.id, payload);
      setTreatNc(null);
      loadItems();
      showToast('Tratamento salvo com sucesso.');
    } catch (err) {
      console.error('Failed to update NC:', err);
      showToast('Erro ao salvar tratamento.', 'error');
    } finally {
      setTreatLoading(false);
    }
  };

  const handleOpenClose = (nc: NonConformance) => {
    setCloseNc(nc);
    setCloseForm({
      root_cause_analysis:    nc.root_cause_analysis    || '',
      corrective_action_plan: nc.corrective_action_plan || '',
      preventive_action:      nc.preventive_action      || '',
    });
    setCloseErrors({});
  };

  const handleClose = async () => {
    if (!closeNc) return;
    const errs: Record<string, string> = {};
    if (!closeForm.root_cause_analysis.trim()) errs.root_cause_analysis = 'Causa raiz é obrigatória para encerramento';
    if (!closeForm.corrective_action_plan.trim()) errs.corrective_action_plan = 'Ação corretiva é obrigatória para encerramento';
    if (Object.keys(errs).length > 0) {
      setCloseErrors(errs);
      return;
    }
    setCloseLoading(true);
    setCloseErrors({});
    try {
      await qualityApi.closeNonConformance(closeNc.id, {
        root_cause_analysis:    closeForm.root_cause_analysis.trim(),
        corrective_action_plan: closeForm.corrective_action_plan.trim(),
        preventive_action:      closeForm.preventive_action.trim() || undefined,
        closed_by_user_id:      user?.id,
      });
      setCloseNc(null);
      loadItems();
      loadStats();
      showToast('Não conformidade encerrada com sucesso.');
    } catch (err) {
      console.error('Failed to close NC:', err);
      showToast('Erro ao encerrar não conformidade.', 'error');
    } finally {
      setCloseLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterSeverity('');
    setFilterCategory('');
  };

  const hasActiveFilters = filterStatus || filterSeverity || filterCategory;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Não Conformidades"
        subtitle="Gerencie e acompanhe não conformidades identificadas no projeto."
        breadcrumb="Operações"
        actions={
          <button className="btn btn-primary" onClick={() => { setCreateForm({ ...EMPTY_CREATE_FORM, projects_id: projectsInfo ? String(projectsInfo.id) : '' }); setCreateErrors({}); setShowCreateModal(true); }}>
            <Plus size={16} />
            Nova NC
          </button>
        }
      />
      <ProjectFilterDropdown />

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Críticas" value={getStatCount(stats.by_severity, 'critica', 'severity')} color="var(--color-error)" />
          <StatCard label="Maiores" value={getStatCount(stats.by_severity, 'maior', 'severity')} color="#e65100" />
          <StatCard label="Menores" value={getStatCount(stats.by_severity, 'menor', 'severity')} color="var(--color-warning)" />
          <StatCard label="Abertas" value={getStatCount(stats.by_status, 'aberta', 'status')} color="var(--color-error)" />
          <StatCard label="Encerradas" value={getStatCount(stats.by_status, 'encerrada', 'status')} color="var(--color-success)" />
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-secondary-text)', fontSize: '13px', fontWeight: 500 }}>
            <Filter size={14} />
            Filtros
          </div>

          <div className="input-group" style={{ flex: '1 1 160px', minWidth: '140px' }}>
            <SearchableSelect
              options={STATUS_OPTIONS.map((s) => ({ value: s, label: NC_STATUS_MAP[s]?.label || s }))}
              value={filterStatus || undefined}
              onChange={(val) => setFilterStatus(String(val ?? ''))}
              placeholder="Todos os status"
              allowClear
              style={{ minWidth: '140px' }}
            />
          </div>

          <div className="input-group" style={{ flex: '1 1 140px', minWidth: '120px' }}>
            <SearchableSelect
              options={SEVERITY_OPTIONS.map((s) => ({ value: s, label: NC_SEVERITY_MAP[s]?.label || s }))}
              value={filterSeverity || undefined}
              onChange={(val) => setFilterSeverity(String(val ?? ''))}
              placeholder="Todas as severidades"
              allowClear
              style={{ minWidth: '120px' }}
            />
          </div>

          {hasActiveFilters && (
            <button
              className="btn btn-secondary"
              onClick={clearFilters}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
            >
              <X size={14} />
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle size={48} />}
            message="Nenhuma não conformidade encontrada."
            action={
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                <Plus size={16} />
                Registrar NC
              </button>
            }
          />
        ) : (
          <>
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {['Título', 'Projeto', 'Origem', 'Severidade', 'Categoria', 'Status', 'Responsável', 'Ações'].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--color-secondary-text)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {items.map((nc) => (
                    <>
                      <motion.tr
                        key={nc.id}
                        variants={tableRowVariants}
                        style={{
                          borderBottom: expandedId === nc.id ? 'none' : '1px solid var(--color-border)',
                          background: expandedId === nc.id ? 'var(--color-surface)' : undefined,
                          transition: 'background 0.15s',
                        }}
                      >
                        {/* Title */}
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, maxWidth: '260px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={nc.title}>
                            {nc.title}
                          </div>
                          {nc.description && (
                            <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {nc.description}
                            </div>
                          )}
                        </td>

                        {/* Project */}
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                          {nc.projects?.name || '—'}
                        </td>

                        {/* Origin */}
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                          {nc.origin || '—'}
                        </td>

                        {/* Severity */}
                        <td style={{ padding: '12px 16px' }}>
                          <StatusBadge status={nc.severity} colorMap={NC_SEVERITY_MAP} />
                        </td>

                        {/* Category */}
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                          {nc.category || '—'}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 16px' }}>
                          <StatusBadge status={nc.status} colorMap={NC_STATUS_MAP} />
                        </td>

                        {/* Responsible */}
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                          {nc.responsible_user?.name || '—'}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              className="btn btn-icon"
                              title="Anexos"
                              onClick={() => toggleExpand(nc.id)}
                              style={{ color: 'var(--color-secondary-text)' }}
                            >
                              {expandedId === nc.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              <Paperclip size={14} />
                            </button>

                            {nc.status !== 'encerrada' && (
                              <button
                                className="btn btn-secondary"
                                style={{ fontSize: '12px', padding: '4px 10px', whiteSpace: 'nowrap' }}
                                onClick={() => handleOpenTreat(nc)}
                              >
                                Tratar
                              </button>
                            )}

                            {nc.status !== 'encerrada' && (
                              <button
                                className="btn btn-icon"
                                title="Encerrar NC"
                                onClick={() => handleOpenClose(nc)}
                                style={{ color: 'var(--color-success)' }}
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>

                      {/* Expandable attachments row */}
                      {expandedId === nc.id && (
                        <tr key={`${nc.id}-attachments`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <AttachmentsRow
                            ncId={nc.id}
                            attachments={nc.attachments || []}
                            onAttached={loadItems}
                            showToast={showToast}
                            userId={user?.id || 0}
                          />
                        </tr>
                      )}
                    </>
                  ))}
                </motion.tbody>
              </table>
            </div>

            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)' }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                perPage={perPage}
                totalItems={totalItems}
                onPageChange={setPage}
                onPerPageChange={(v) => { setPerPage(v); setPage(1); }}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Create NC Modal ─────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', width: '600px', maxWidth: '96vw' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Nova Não Conformidade</h3>
              <button className="btn btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label style={labelStyle}>Projeto *</label>
                <SearchableSelect
                  options={projectsList.map((p) => ({ value: String(p.id), label: p.name }))}
                  value={createForm.projects_id || undefined}
                  onChange={(val) => { setCreateForm((f) => ({ ...f, projects_id: String(val ?? '') })); clearFieldError(setCreateErrors, 'projects_id'); }}
                  placeholder="Selecionar projeto"
                  style={createErrors.projects_id ? errorBorder : undefined}
                />
                {createErrors.projects_id && <p style={errorText}>{createErrors.projects_id}</p>}
              </div>

              <div className="input-group">
                <label style={labelStyle}>Título *</label>
                <input
                  className="input-field"
                  placeholder="Título da não conformidade"
                  value={createForm.title}
                  onChange={(e) => { setCreateForm((f) => ({ ...f, title: e.target.value })); clearFieldError(setCreateErrors, 'title'); }}
                  style={createErrors.title ? errorBorder : undefined}
                />
                {createErrors.title && <p style={errorText}>{createErrors.title}</p>}
              </div>

              <div className="input-group">
                <label style={labelStyle}>Descrição *</label>
                <textarea
                  className="input-field"
                  placeholder="Descreva a não conformidade em detalhes"
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => { setCreateForm((f) => ({ ...f, description: e.target.value })); clearFieldError(setCreateErrors, 'description'); }}
                  style={{ resize: 'vertical', minHeight: '72px', ...(createErrors.description ? errorBorder : {}) }}
                />
                {createErrors.description && <p style={errorText}>{createErrors.description}</p>}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label style={labelStyle}>Origem *</label>
                  <SearchableSelect
                    options={ORIGIN_OPTIONS.map((o) => ({ value: o, label: o.charAt(0).toUpperCase() + o.slice(1) }))}
                    value={createForm.origin || undefined}
                    onChange={(val) => { setCreateForm((f) => ({ ...f, origin: String(val ?? '') })); clearFieldError(setCreateErrors, 'origin'); }}
                    placeholder="Selecionar origem"
                    style={createErrors.origin ? errorBorder : undefined}
                  />
                  {createErrors.origin && <p style={errorText}>{createErrors.origin}</p>}
                </div>

                <div className="input-group" style={{ flex: 1 }}>
                  <label style={labelStyle}>Severidade *</label>
                  <SearchableSelect
                    options={SEVERITY_OPTIONS.map((s) => ({ value: s, label: NC_SEVERITY_MAP[s]?.label || s }))}
                    value={createForm.severity || undefined}
                    onChange={(val) => { setCreateForm((f) => ({ ...f, severity: String(val ?? '') })); clearFieldError(setCreateErrors, 'severity'); }}
                    placeholder="Selecionar severidade"
                    style={createErrors.severity ? errorBorder : undefined}
                  />
                  {createErrors.severity && <p style={errorText}>{createErrors.severity}</p>}
                </div>
              </div>

              <div className="input-group">
                <label style={labelStyle}>Categoria *</label>
                <SearchableSelect
                  options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: CATEGORY_LABELS[c] || c }))}
                  value={createForm.category || undefined}
                  onChange={(val) => { setCreateForm((f) => ({ ...f, category: String(val ?? '') })); clearFieldError(setCreateErrors, 'category'); }}
                  placeholder="Selecionar categoria"
                  style={createErrors.category ? errorBorder : undefined}
                />
                {createErrors.category && <p style={errorText}>{createErrors.category}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={createLoading}
              >
                {createLoading ? 'Registrando...' : 'Registrar NC'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Treat NC Modal ──────────────────────────────────────────────────── */}
      {treatNc && (
        <div className="modal-backdrop" onClick={() => setTreatNc(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', width: '600px', maxWidth: '96vw' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Tratar Não Conformidade</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>{treatNc.title}</p>
              </div>
              <button className="btn btn-icon" onClick={() => setTreatNc(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label style={labelStyle}>Causa Raiz *</label>
                <textarea
                  className="input-field"
                  placeholder="Descreva a causa raiz identificada"
                  rows={3}
                  value={treatForm.root_cause_analysis}
                  onChange={(e) => { setTreatForm((f) => ({ ...f, root_cause_analysis: e.target.value })); clearFieldError(setTreatErrors, 'root_cause_analysis'); }}
                  style={{ resize: 'vertical', minHeight: '72px', ...(treatErrors.root_cause_analysis ? errorBorder : {}) }}
                />
                {treatErrors.root_cause_analysis && <p style={errorText}>{treatErrors.root_cause_analysis}</p>}
              </div>

              <div className="input-group">
                <label style={labelStyle}>Ação Corretiva *</label>
                <textarea
                  className="input-field"
                  placeholder="Descreva a ação corretiva a ser implementada"
                  rows={3}
                  value={treatForm.corrective_action_plan}
                  onChange={(e) => { setTreatForm((f) => ({ ...f, corrective_action_plan: e.target.value })); clearFieldError(setTreatErrors, 'corrective_action_plan'); }}
                  style={{ resize: 'vertical', minHeight: '72px', ...(treatErrors.corrective_action_plan ? errorBorder : {}) }}
                />
                {treatErrors.corrective_action_plan && <p style={errorText}>{treatErrors.corrective_action_plan}</p>}
              </div>

              <div className="input-group">
                <label style={labelStyle}>Ação Preventiva</label>
                <textarea
                  className="input-field"
                  placeholder="Descreva ações para evitar reincidência (opcional)"
                  rows={2}
                  value={treatForm.preventive_action}
                  onChange={(e) => setTreatForm((f) => ({ ...f, preventive_action: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: '56px' }}
                />
              </div>

              <div className="input-group">
                <label style={labelStyle}>Prazo</label>
                <input
                  className="input-field"
                  type="date"
                  value={treatForm.deadline}
                  onChange={(e) => setTreatForm((f) => ({ ...f, deadline: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setTreatNc(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleTreat}
                disabled={treatLoading}
              >
                {treatLoading ? 'Salvando...' : 'Salvar Tratamento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Close NC Modal ──────────────────────────────────────────────────── */}
      {closeNc && (
        <div className="modal-backdrop" onClick={() => setCloseNc(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', width: '600px', maxWidth: '96vw' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Encerrar Não Conformidade</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '4px' }}>{closeNc.title}</p>
              </div>
              <button className="btn btn-icon" onClick={() => setCloseNc(null)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '16px' }}>
              Para encerrar a NC, preencha a causa raiz e a ação corretiva. Esta ação não pode ser desfeita.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label style={labelStyle}>Causa Raiz *</label>
                <textarea
                  className="input-field"
                  placeholder="Análise de causa raiz"
                  rows={3}
                  value={closeForm.root_cause_analysis}
                  onChange={(e) => { setCloseForm((f) => ({ ...f, root_cause_analysis: e.target.value })); clearFieldError(setCloseErrors, 'root_cause_analysis'); }}
                  style={{ resize: 'vertical', minHeight: '72px', ...(closeErrors.root_cause_analysis ? errorBorder : {}) }}
                />
                {closeErrors.root_cause_analysis && <p style={errorText}>{closeErrors.root_cause_analysis}</p>}
              </div>

              <div className="input-group">
                <label style={labelStyle}>Ação Corretiva *</label>
                <textarea
                  className="input-field"
                  placeholder="Plano de ação corretiva"
                  rows={3}
                  value={closeForm.corrective_action_plan}
                  onChange={(e) => { setCloseForm((f) => ({ ...f, corrective_action_plan: e.target.value })); clearFieldError(setCloseErrors, 'corrective_action_plan'); }}
                  style={{ resize: 'vertical', minHeight: '72px', ...(closeErrors.corrective_action_plan ? errorBorder : {}) }}
                />
                {closeErrors.corrective_action_plan && <p style={errorText}>{closeErrors.corrective_action_plan}</p>}
              </div>

              <div className="input-group">
                <label style={labelStyle}>Ação Preventiva</label>
                <textarea
                  className="input-field"
                  placeholder="Ação preventiva (opcional)"
                  rows={2}
                  value={closeForm.preventive_action}
                  onChange={(e) => setCloseForm((f) => ({ ...f, preventive_action: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: '56px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setCloseNc(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleClose}
                disabled={closeLoading}
                style={{ background: 'var(--color-success)' }}
              >
                {closeLoading ? 'Encerrando...' : 'Encerrar NC'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '24px',
              zIndex: 2000,
              padding: '12px 20px',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '14px',
              backgroundColor:
                toast.type === 'success'
                  ? 'var(--color-success, #028F58)'
                  : 'var(--color-error, #C0392B)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

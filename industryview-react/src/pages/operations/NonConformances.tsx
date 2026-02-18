import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { qualityApi } from '../../services';
import type {
  NonConformance,
  NonConformanceStatistics,
  NonConformanceAttachment,
} from '../../types';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
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
  BarChart3,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const NC_STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  aberta:        { bg: 'var(--color-status-01)', color: 'var(--color-error)',          label: 'Aberta' },
  em_analise:    { bg: 'var(--color-status-02)', color: 'var(--color-warning)',         label: 'Em Análise' },
  em_tratamento: { bg: 'var(--color-status-03)', color: 'var(--color-info)',            label: 'Em Tratamento' },
  verificacao:   { bg: '#ede9fe',                color: '#7c3aed',                      label: 'Verificação' },
  encerrada:     { bg: 'var(--color-status-04)', color: 'var(--color-success)',         label: 'Encerrada' },
};

const NC_SEVERITY_MAP: Record<string, { bg: string; color: string; label: string }> = {
  baixa:   { bg: 'var(--color-alternate)',   color: 'var(--color-secondary-text)', label: 'Baixa' },
  media:   { bg: 'var(--color-status-02)',   color: 'var(--color-warning)',         label: 'Média' },
  alta:    { bg: '#fff3e0',                  color: '#e65100',                      label: 'Alta' },
  critica: { bg: 'var(--color-status-01)',   color: 'var(--color-error)',           label: 'Crítica' },
};

const SEVERITY_OPTIONS = ['baixa', 'media', 'alta', 'critica'] as const;
const STATUS_OPTIONS   = ['aberta', 'em_analise', 'em_tratamento', 'verificacao', 'encerrada'] as const;
const ORIGIN_OPTIONS   = ['auditoria', 'inspecao', 'cliente', 'fornecedor', 'interno', 'outro'] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface CreateNcForm {
  title: string;
  description: string;
  origin: string;
  severity: string;
  category: string;
}

interface TreatNcForm {
  root_cause: string;
  corrective_action: string;
  preventive_action: string;
  deadline: string;
}

interface AttachmentForm {
  file_url: string;
  file_name: string;
}

const EMPTY_CREATE_FORM: CreateNcForm = {
  title: '',
  description: '',
  origin: '',
  severity: 'media',
  category: '',
};

const EMPTY_TREAT_FORM: TreatNcForm = {
  root_cause: '',
  corrective_action: '',
  preventive_action: '',
  deadline: '',
};

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
}: {
  ncId: number;
  attachments: NonConformanceAttachment[];
  onAttached: () => void;
}) {
  const [form, setForm] = useState<AttachmentForm>({ file_url: '', file_name: '' });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.file_url.trim()) return;
    setSaving(true);
    try {
      await qualityApi.addNcAttachment(ncId, {
        file_url: form.file_url.trim(),
        file_name: form.file_name.trim() || undefined,
      });
      setForm({ file_url: '', file_name: '' });
      onAttached();
    } catch (err) {
      console.error('Failed to add attachment:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <td colSpan={7} style={{ padding: '12px 20px', background: 'var(--color-alternate)', borderTop: 'none' }}>
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
              {att.file_name || att.file_url}
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
          placeholder="Nome do arquivo (opcional)"
          value={form.file_name}
          onChange={(e) => setForm((f) => ({ ...f, file_name: e.target.value }))}
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
  const { t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();

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
  const [createError, setCreateError]         = useState('');

  // Treat NC modal
  const [treatNc, setTreatNc]             = useState<NonConformance | null>(null);
  const [treatForm, setTreatForm]         = useState<TreatNcForm>(EMPTY_TREAT_FORM);
  const [treatLoading, setTreatLoading]   = useState(false);
  const [treatError, setTreatError]       = useState('');

  // Close NC confirm
  const [closeNcId, setCloseNcId] = useState<number | null>(null);
  const [closeLoading, setCloseLoading] = useState(false);

  useEffect(() => {
    setNavBarSelection(23);
  }, []);

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
      if (filterCategory)  params.category     = filterCategory || undefined;

      const data = await qualityApi.listNonConformances(params);
      setItems(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load non-conformances:', err);
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, page, perPage, filterStatus, filterSeverity, filterCategory]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterSeverity, filterCategory]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!createForm.title.trim()) {
      setCreateError('O título é obrigatório.');
      return;
    }
    setCreateLoading(true);
    setCreateError('');
    try {
      const payload: Record<string, unknown> = {
        title:       createForm.title.trim(),
        description: createForm.description.trim(),
        severity:    createForm.severity,
      };
      if (projectsInfo)             payload.projects_id = projectsInfo.id;
      if (createForm.origin)        payload.origin       = createForm.origin;
      if (createForm.category)      payload.category     = createForm.category.trim();

      await qualityApi.createNonConformance(payload);
      setCreateForm(EMPTY_CREATE_FORM);
      setShowCreateModal(false);
      loadItems();
      loadStats();
    } catch (err) {
      console.error('Failed to create NC:', err);
      setCreateError('Erro ao criar não conformidade. Tente novamente.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenTreat = (nc: NonConformance) => {
    setTreatNc(nc);
    setTreatForm({
      root_cause:         nc.root_cause         || '',
      corrective_action:  nc.corrective_action  || '',
      preventive_action:  nc.preventive_action  || '',
      deadline:           nc.deadline           || '',
    });
    setTreatError('');
  };

  const handleTreat = async () => {
    if (!treatNc) return;
    if (!treatForm.root_cause.trim() || !treatForm.corrective_action.trim()) {
      setTreatError('Causa raiz e ação corretiva são obrigatórias.');
      return;
    }
    setTreatLoading(true);
    setTreatError('');
    try {
      const payload: Record<string, unknown> = {
        root_cause:        treatForm.root_cause.trim(),
        corrective_action: treatForm.corrective_action.trim(),
        status:            'em_tratamento',
      };
      if (treatForm.preventive_action.trim()) payload.preventive_action = treatForm.preventive_action.trim();
      if (treatForm.deadline)                 payload.deadline          = treatForm.deadline;

      await qualityApi.updateNonConformance(treatNc.id, payload);
      setTreatNc(null);
      loadItems();
    } catch (err) {
      console.error('Failed to update NC:', err);
      setTreatError('Erro ao salvar tratamento. Tente novamente.');
    } finally {
      setTreatLoading(false);
    }
  };

  const handleClose = async () => {
    if (closeNcId === null) return;
    setCloseLoading(true);
    try {
      await qualityApi.closeNonConformance(closeNcId, { status: 'encerrada' });
      setCloseNcId(null);
      loadItems();
      loadStats();
    } catch (err) {
      console.error('Failed to close NC:', err);
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
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <PageHeader
        title="Não Conformidades"
        subtitle="Gerencie e acompanhe não conformidades identificadas no projeto."
        breadcrumb="Operações"
        actions={
          <button className="btn btn-primary" onClick={() => { setCreateForm(EMPTY_CREATE_FORM); setCreateError(''); setShowCreateModal(true); }}>
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
          <StatCard label="Críticas" value={stats.by_severity?.critica  || 0} color="var(--color-error)" />
          <StatCard label="Altas"    value={stats.by_severity?.alta     || 0} color="#e65100" />
          <StatCard label="Médias"   value={stats.by_severity?.media    || 0} color="var(--color-warning)" />
          <StatCard label="Abertas"  value={stats.by_status?.aberta     || 0} color="var(--color-error)" />
          <StatCard label="Encerradas" value={stats.by_status?.encerrada || 0} color="var(--color-success)" />
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
            <select
              className="select-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{NC_STATUS_MAP[s]?.label || s}</option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ flex: '1 1 140px', minWidth: '120px' }}>
            <select
              className="select-field"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="">Todas as severidades</option>
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s} value={s}>{NC_SEVERITY_MAP[s]?.label || s}</option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ flex: '1 1 180px', minWidth: '160px' }}>
            <input
              className="input-field"
              placeholder="Filtrar por categoria"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
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
                    {['Título', 'Origem', 'Severidade', 'Categoria', 'Status', 'Responsável', 'Ações'].map((col) => (
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
                          {nc.responsible_name || '—'}
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
                                onClick={() => setCloseNcId(nc.id)}
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
            style={{ padding: '28px', width: '520px', maxWidth: '96vw' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Nova Não Conformidade</h2>
              <button className="btn btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                  Título *
                </label>
                <input
                  className="input-field"
                  placeholder="Título da não conformidade"
                  value={createForm.title}
                  onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                  Descrição
                </label>
                <textarea
                  className="input-field"
                  placeholder="Descreva a não conformidade em detalhes"
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: '72px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                    Origem
                  </label>
                  <select
                    className="select-field"
                    value={createForm.origin}
                    onChange={(e) => setCreateForm((f) => ({ ...f, origin: e.target.value }))}
                  >
                    <option value="">Selecionar origem</option>
                    {ORIGIN_OPTIONS.map((o) => (
                      <option key={o} value={o} style={{ textTransform: 'capitalize' }}>
                        {o.charAt(0).toUpperCase() + o.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                    Severidade *
                  </label>
                  <select
                    className="select-field"
                    value={createForm.severity}
                    onChange={(e) => setCreateForm((f) => ({ ...f, severity: e.target.value }))}
                  >
                    {SEVERITY_OPTIONS.map((s) => (
                      <option key={s} value={s}>{NC_SEVERITY_MAP[s]?.label || s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                  Categoria
                </label>
                <input
                  className="input-field"
                  placeholder="Ex: Processo, Material, Mão de obra..."
                  value={createForm.category}
                  onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
            </div>

            {createError && (
              <p style={{ color: 'var(--color-error)', fontSize: '13px', marginTop: '12px' }}>{createError}</p>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={createLoading || !createForm.title.trim()}
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
            style={{ padding: '28px', width: '560px', maxWidth: '96vw' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '2px' }}>Tratar Não Conformidade</h2>
                <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>{treatNc.title}</p>
              </div>
              <button className="btn btn-icon" onClick={() => setTreatNc(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                  Causa Raiz *
                </label>
                <textarea
                  className="input-field"
                  placeholder="Descreva a causa raiz identificada"
                  rows={3}
                  value={treatForm.root_cause}
                  onChange={(e) => setTreatForm((f) => ({ ...f, root_cause: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: '72px' }}
                />
              </div>

              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                  Ação Corretiva *
                </label>
                <textarea
                  className="input-field"
                  placeholder="Descreva a ação corretiva a ser implementada"
                  rows={3}
                  value={treatForm.corrective_action}
                  onChange={(e) => setTreatForm((f) => ({ ...f, corrective_action: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: '72px' }}
                />
              </div>

              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                  Ação Preventiva
                </label>
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
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                  Prazo
                </label>
                <input
                  className="input-field"
                  type="date"
                  value={treatForm.deadline}
                  onChange={(e) => setTreatForm((f) => ({ ...f, deadline: e.target.value }))}
                />
              </div>
            </div>

            {treatError && (
              <p style={{ color: 'var(--color-error)', fontSize: '13px', marginTop: '12px' }}>{treatError}</p>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setTreatNc(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleTreat}
                disabled={treatLoading || !treatForm.root_cause.trim() || !treatForm.corrective_action.trim()}
              >
                {treatLoading ? 'Salvando...' : 'Salvar Tratamento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Close NC Confirm ────────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={closeNcId !== null}
        title="Encerrar Não Conformidade"
        message="Tem certeza que deseja encerrar esta não conformidade? Esta ação não pode ser desfeita."
        confirmLabel={closeLoading ? 'Encerrando...' : 'Encerrar'}
        variant="primary"
        onConfirm={handleClose}
        onCancel={() => setCloseNcId(null)}
      />
    </div>
  );
}

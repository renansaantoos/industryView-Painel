import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { materialRequisitionsApi, projectsApi } from '../../services';
import type { MaterialRequisition, MaterialRequisitionItem, ProjectInfo } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import ApprovalActions from '../../components/common/ApprovalActions';
import SearchableSelect from '../../components/common/SearchableSelect';
import { Plus, ChevronDown, ChevronUp, ShoppingCart, Trash2, X } from 'lucide-react';

// ---------------------------------------------------------------------------
// Status / priority color maps
// ---------------------------------------------------------------------------

const REQUISITION_STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  rascunho:  { bg: 'var(--color-alternate)', color: 'var(--color-secondary-text)', label: 'Rascunho' },
  submetida: { bg: '#fef9c3', color: '#a16207', label: 'Submetida' },
  aprovada:  { bg: '#dcfce7', color: '#16a34a', label: 'Aprovada' },
  rejeitada: { bg: '#fee2e2', color: '#dc2626', label: 'Rejeitada' },
};

const REQUISITION_PRIORITY_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  baixa:   { bg: 'var(--color-alternate)', color: 'var(--color-secondary-text)', label: 'Baixa' },
  normal:  { bg: '#fef9c3', color: '#a16207', label: 'Normal' },
  urgente: { bg: '#fee2e2', color: '#dc2626', label: 'Urgente' },
};

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

// ---------------------------------------------------------------------------
// Types for the inline item editor
// ---------------------------------------------------------------------------

interface ItemDraft {
  description: string;
  unit: string;
  quantity: string;
  estimated_cost: string;
}

const EMPTY_ITEM_DRAFT: ItemDraft = {
  description: '',
  unit: '',
  quantity: '',
  estimated_cost: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value?: number): string {
  if (value == null) return '-';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const cents = parseInt(digits, 10);
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function _parseCurrencyInput(formatted: string): string {
  const digits = formatted.replace(/\D/g, '');
  if (!digits) return '';
  return (parseInt(digits, 10) / 100).toString();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MaterialRequisitions() {
  const { t: _t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();

  useEffect(() => {
    setNavBarSelection(27);
  }, []);

  // ------------------------------------------------------------------
  // List state
  // ------------------------------------------------------------------
  const [requisitions, setRequisitions] = useState<MaterialRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ------------------------------------------------------------------
  // Expanded requisition
  // ------------------------------------------------------------------
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedRequisition, setExpandedRequisition] = useState<MaterialRequisition | null>(null);
  const [expandLoading, setExpandLoading] = useState(false);

  // ------------------------------------------------------------------
  // Create modal
  // ------------------------------------------------------------------
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDescription, setCreateDescription] = useState('');
  const [createPriority, setCreatePriority] = useState('');
  const [createProjectId, setCreateProjectId] = useState<number | null>(null);
  const [modalProjects, setModalProjects] = useState<ProjectInfo[]>([]);
  const [itemDrafts, setItemDrafts] = useState<ItemDraft[]>([{ ...EMPTY_ITEM_DRAFT }]);
  const [createModalLoading, setCreateModalLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // ------------------------------------------------------------------
  // Approve modal
  // ------------------------------------------------------------------
  const [approvingRequisition, setApprovingRequisition] = useState<MaterialRequisition | null>(null);
  const [approveItems, setApproveItems] = useState<{ id: number; product_description: string; quantity_requested: number; quantity_approved: string }[]>([]);
  const [_approveLoading, setApproveLoading] = useState(false);

  // ------------------------------------------------------------------
  // Reject modal
  // ------------------------------------------------------------------
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // ------------------------------------------------------------------
  // Shared action loading
  // ------------------------------------------------------------------
  const [actionLoading, setActionLoading] = useState(false);

  // ------------------------------------------------------------------
  // Toast
  // ------------------------------------------------------------------
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ------------------------------------------------------------------
  // Load requisitions
  // ------------------------------------------------------------------
  const loadRequisitions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await materialRequisitionsApi.listRequisitions({
        ...(projectsInfo ? { projects_id: projectsInfo.id } : {}),
        page,
        per_page: perPage,
      });
      setRequisitions(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load requisitions:', err);
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, page, perPage]);

  useEffect(() => {
    loadRequisitions();
  }, [loadRequisitions]);

  // ------------------------------------------------------------------
  // Expand / collapse
  // ------------------------------------------------------------------
  const handleToggleExpand = async (requisition: MaterialRequisition) => {
    if (expandedId === requisition.id) {
      setExpandedId(null);
      setExpandedRequisition(null);
      return;
    }
    setExpandedId(requisition.id);
    setExpandLoading(true);
    try {
      const detail = await materialRequisitionsApi.getRequisition(requisition.id);
      setExpandedRequisition(detail);
    } catch (err) {
      console.error('Failed to load requisition detail:', err);
    } finally {
      setExpandLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Item drafts management
  // ------------------------------------------------------------------
  const addItemDraft = () => {
    setItemDrafts((prev) => [...prev, { ...EMPTY_ITEM_DRAFT }]);
  };

  const removeItemDraft = (index: number) => {
    setItemDrafts((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemDraft = (index: number, patch: Partial<ItemDraft>) => {
    setItemDrafts((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const openCreateModal = () => {
    setCreateDescription('');
    setCreatePriority('');
    setCreateProjectId(projectsInfo?.id ?? null);
    setValidationErrors({});
    setItemDrafts([{ ...EMPTY_ITEM_DRAFT }]);
    setShowCreateModal(true);
    projectsApi.queryAllProjects({ per_page: 100 }).then((data) => {
      setModalProjects(data.items ?? []);
    }).catch(() => {});
  };

  // ------------------------------------------------------------------
  // Create requisition
  // ------------------------------------------------------------------
  const handleCreateRequisition = async () => {
    const errors: Record<string, string> = {};
    if (!createProjectId) errors.project = 'Selecione um projeto.';
    if (!createDescription.trim()) errors.description = 'Informe o título.';
    if (!createPriority) errors.priority = 'Selecione a prioridade.';
    const hasValidItem = itemDrafts.some((d) => d.description.trim());
    if (!hasValidItem) errors.items = 'Adicione pelo menos um item com descrição.';
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    setCreateModalLoading(true);
    try {
      const validItems = itemDrafts
        .filter((d) => d.description.trim())
        .map((d) => ({
          description: d.description.trim(),
          unit: d.unit.trim() || undefined,
          quantity_requested: parseFloat(d.quantity) || 1,
          unit_price_estimate: d.estimated_cost ? parseInt(d.estimated_cost, 10) / 100 : undefined,
        }));

      await materialRequisitionsApi.createRequisition({
        projects_id: createProjectId!,
        title: createDescription.trim(),
        priority: createPriority || undefined,
        items: validItems,
      });
      setShowCreateModal(false);
      await loadRequisitions();
      showToast('Requisição criada com sucesso.');
    } catch (err) {
      console.error('Failed to create requisition:', err);
      showToast('Erro ao criar requisição.', 'error');
    } finally {
      setCreateModalLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Approval flow
  // ------------------------------------------------------------------
  const handleSubmit = async (id: number) => {
    setActionLoading(true);
    try {
      await materialRequisitionsApi.submitRequisition(id);
      setExpandedId(null);
      setExpandedRequisition(null);
      await loadRequisitions();
      showToast('Requisição submetida com sucesso.');
    } catch (err) {
      console.error('Failed to submit requisition:', err);
      showToast('Erro ao submeter requisição.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openApproveModal = async (req: MaterialRequisition) => {
    setApproveLoading(true);
    try {
      const detail = await materialRequisitionsApi.getRequisition(req.id);
      setApprovingRequisition(detail);
      setApproveItems(
        (detail.items || []).map((item) => ({
          id: item.id,
          product_description: item.product_description,
          quantity_requested: Number(item.quantity_requested),
          quantity_approved: String(Number(item.quantity_requested)),
        }))
      );
    } catch (err) {
      console.error('Failed to load requisition for approval:', err);
      showToast('Erro ao carregar requisição.', 'error');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approvingRequisition) return;
    setActionLoading(true);
    try {
      await materialRequisitionsApi.approveRequisition(approvingRequisition.id, {
        items: approveItems.map((i) => ({
          id: i.id,
          quantity_approved: parseFloat(i.quantity_approved) || 0,
        })),
      });
      setApprovingRequisition(null);
      setExpandedId(null);
      setExpandedRequisition(null);
      await loadRequisitions();
      showToast('Requisição aprovada com sucesso.');
    } catch (err) {
      console.error('Failed to approve requisition:', err);
      showToast('Erro ao aprovar requisição.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    setActionLoading(true);
    try {
      await materialRequisitionsApi.rejectRequisition(rejectingId, {
        reason: rejectionReason.trim() || undefined,
      });
      setRejectingId(null);
      setRejectionReason('');
      setExpandedId(null);
      setExpandedRequisition(null);
      await loadRequisitions();
      showToast('Requisição rejeitada.');
    } catch (err) {
      console.error('Failed to reject requisition:', err);
      showToast('Erro ao rejeitar requisição.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Render items sub-table
  // ------------------------------------------------------------------
  const renderItems = (items: MaterialRequisitionItem[]) => (
    <table style={{ width: '100%', fontSize: '13px' }}>
      <thead>
        <tr style={{ backgroundColor: 'var(--color-alternate)' }}>
          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Descrição</th>
          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Unidade</th>
          <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Qtd. Solicitada</th>
          <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Custo Unit.</th>
          <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Qtd. Aprovada</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} style={{ borderBottom: '1px solid var(--color-alternate)' }}>
            <td style={{ padding: '8px 12px' }}>{item.product_description}</td>
            <td style={{ padding: '8px 12px' }}>{item.unity || '-'}</td>
            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{Number(item.quantity_requested)}</td>
            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{formatCurrency(item.unit_price_estimate != null ? Number(item.unit_price_estimate) : undefined)}</td>
            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{item.quantity_approved != null ? Number(item.quantity_approved) : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // ------------------------------------------------------------------
  // JSX
  // ------------------------------------------------------------------
  return (
    <div>
      <PageHeader
        title="Requisições de Material"
        subtitle="Gestão de solicitações de materiais e suprimentos"
        breadcrumb={projectsInfo ? `${projectsInfo.name} / Requisições de Material` : 'Requisições de Material'}
        actions={
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> Nova Requisição
          </button>
        }
      />
      <ProjectFilterDropdown />

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : requisitions.length === 0 ? (
        <EmptyState
          message="Nenhuma requisição de material encontrada."
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> Nova Requisição
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nº Requisição</th>
                <th>Projeto</th>
                <th>Descrição</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Solicitante</th>
                <th>Ações</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {requisitions.map((req) => (
                <>
                  <motion.tr key={req.id} variants={tableRowVariants}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShoppingCart size={16} color="var(--color-primary)" />
                        <span style={{ fontWeight: 500 }}>
                          {req.requisition_number || `REQ-${req.id}`}
                        </span>
                      </div>
                    </td>
                    <td>{req.projects?.name || '-'}</td>
                    <td>{req.description || '-'}</td>
                    <td>
                      {req.priority ? (
                        <StatusBadge status={req.priority} colorMap={REQUISITION_PRIORITY_COLORS} />
                      ) : '-'}
                    </td>
                    <td>
                      <StatusBadge status={req.status} colorMap={REQUISITION_STATUS_COLORS} />
                    </td>
                    <td>{req.created_by?.name || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <ApprovalActions
                          status={req.status}
                          onSubmit={req.status === 'rascunho' ? () => handleSubmit(req.id) : undefined}
                          onApprove={req.status === 'submetida' ? () => openApproveModal(req) : undefined}
                          onReject={req.status === 'submetida' ? () => { setRejectingId(req.id); setRejectionReason(''); } : undefined}
                          loading={actionLoading}
                        />
                        <button
                          className="btn btn-icon"
                          title="Ver itens"
                          onClick={() => handleToggleExpand(req)}
                        >
                          {expandedId === req.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                  {expandedId === req.id && (
                    <tr key={`${req.id}-detail`}>
                      <td colSpan={7} style={{ padding: '0', backgroundColor: 'var(--color-primary-bg)' }}>
                        <div style={{ padding: '16px 24px', borderTop: '2px solid var(--color-primary)' }}>
                          {expandedRequisition?.rejection_reason && (
                            <div style={{
                              marginBottom: '12px',
                              padding: '10px 14px',
                              backgroundColor: '#fee2e2',
                              borderRadius: '6px',
                              fontSize: '13px',
                              color: '#dc2626',
                            }}>
                              <strong>Motivo da rejeição:</strong> {expandedRequisition.rejection_reason}
                            </div>
                          )}
                          <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: '13px', color: 'var(--color-primary-text)' }}>
                            Itens da Requisição
                          </p>
                          {expandLoading ? (
                            <LoadingSpinner />
                          ) : expandedRequisition?.items && expandedRequisition.items.length > 0 ? (
                            renderItems(expandedRequisition.items)
                          ) : (
                            <p style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                              Nenhum item cadastrado.
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </motion.tbody>
          </table>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            perPage={perPage}
            totalItems={totalItems}
            onPageChange={setPage}
            onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }}
          />
        </div>
      )}

      {/* ----------------------------------------------------------------
          Modal: Create Requisition
      ---------------------------------------------------------------- */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div
            className="modal-content"
            style={{ padding: '24px', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '20px' }}>Nova Requisição de Material</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Projeto <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <SearchableSelect
                  options={modalProjects.map((p) => ({ value: p.id, label: p.name }))}
                  value={createProjectId ?? undefined}
                  onChange={(val) => { setCreateProjectId(val ? Number(val) : null); setValidationErrors((e) => { const { project, ...rest } = e; return rest; }); }}
                  placeholder="Selecione o projeto"
                />
                {validationErrors.project && <span style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>{validationErrors.project}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Título <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input
                    className="input-field"
                    value={createDescription}
                    onChange={(e) => { setCreateDescription(e.target.value); setValidationErrors((err) => { const { description, ...rest } = err; return rest; }); }}
                    placeholder="Título da requisição"
                    style={validationErrors.description ? { borderColor: 'var(--color-error)' } : undefined}
                  />
                  {validationErrors.description && <span style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>{validationErrors.description}</span>}
                </div>
                <div className="input-group" style={{ marginBottom: 0, minWidth: '140px' }}>
                  <label>Prioridade <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <SearchableSelect
                    options={[
                      { value: 'baixa', label: 'Baixa' },
                      { value: 'normal', label: 'Normal' },
                      { value: 'urgente', label: 'Urgente' },
                    ]}
                    value={createPriority || undefined}
                    onChange={(val) => { setCreatePriority(String(val ?? '')); setValidationErrors((err) => { const { priority, ...rest } = err; return rest; }); }}
                    placeholder="Selecione"
                    allowClear
                  />
                  {validationErrors.priority && <span style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>{validationErrors.priority}</span>}
                </div>
              </div>
            </div>

            {/* Items inline editor */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary-text)' }}>
                  Itens
                </p>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                  onClick={addItemDraft}
                >
                  <Plus size={14} /> Adicionar Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Header row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 80px 80px 110px 32px',
                  gap: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-secondary-text)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  padding: '0 4px',
                }}>
                  <span>Descrição</span>
                  <span>Unidade</span>
                  <span>Qtd.</span>
                  <span>Custo Est.</span>
                  <span></span>
                </div>

                {itemDrafts.map((draft, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 80px 80px 110px 32px',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      className="input-field"
                      value={draft.description}
                      onChange={(e) => updateItemDraft(index, { description: e.target.value })}
                      placeholder="Descrição do item"
                      style={{ fontSize: '13px' }}
                    />
                    <input
                      className="input-field"
                      value={draft.unit}
                      onChange={(e) => updateItemDraft(index, { unit: e.target.value })}
                      placeholder="Un."
                      style={{ fontSize: '13px' }}
                    />
                    <input
                      type="number"
                      className="input-field"
                      value={draft.quantity}
                      onChange={(e) => updateItemDraft(index, { quantity: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      style={{ fontSize: '13px' }}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      className="input-field"
                      value={draft.estimated_cost ? formatCurrencyInput(draft.estimated_cost) : ''}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        updateItemDraft(index, { estimated_cost: digits });
                      }}
                      placeholder="0,00"
                      style={{ fontSize: '13px' }}
                    />
                    <button
                      className="btn btn-icon"
                      onClick={() => removeItemDraft(index)}
                      disabled={itemDrafts.length === 1}
                      style={{ opacity: itemDrafts.length === 1 ? 0.4 : 1 }}
                    >
                      <Trash2 size={14} color="var(--color-error)" />
                    </button>
                  </div>
                ))}
              </div>
              {validationErrors.items && <span style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>{validationErrors.items}</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--color-alternate)' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateRequisition}
                disabled={createModalLoading}
              >
                {createModalLoading ? <span className="spinner" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------
          Modal: Approve Requisition
      ---------------------------------------------------------------- */}
      {approvingRequisition && (
        <div className="modal-backdrop" onClick={() => setApprovingRequisition(null)}>
          <div
            className="modal-content"
            style={{ padding: '24px', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Aprovar Requisição</h3>
              <button className="btn btn-icon" onClick={() => setApprovingRequisition(null)}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '16px' }}>
              Revise as quantidades solicitadas e ajuste as quantidades aprovadas se necessário.
            </p>
            <table style={{ width: '100%', fontSize: '13px', marginBottom: '16px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-alternate)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Item</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Qtd. Solicitada</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Qtd. Aprovada</th>
                </tr>
              </thead>
              <tbody>
                {approveItems.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-alternate)' }}>
                    <td style={{ padding: '8px 12px' }}>{item.product_description}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>{item.quantity_requested}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <input
                        type="number"
                        className="input-field"
                        value={item.quantity_approved}
                        onChange={(e) => {
                          setApproveItems((prev) =>
                            prev.map((it, i) => i === idx ? { ...it, quantity_approved: e.target.value } : it)
                          );
                        }}
                        min="0"
                        step="0.01"
                        style={{ fontSize: '13px', width: '100px', textAlign: 'right' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--color-alternate)' }}>
              <button className="btn btn-secondary" onClick={() => setApprovingRequisition(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? <span className="spinner" /> : 'Confirmar Aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------
          Modal: Reject Requisition
      ---------------------------------------------------------------- */}
      {rejectingId !== null && (
        <div className="modal-backdrop" onClick={() => setRejectingId(null)}>
          <div className="modal-content" style={{ padding: '24px', width: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Rejeitar Requisição</h3>
              <button className="btn btn-icon" onClick={() => setRejectingId(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="input-group">
              <label>Motivo da Rejeição</label>
              <textarea
                className="input-field"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Descreva o motivo da rejeição..."
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setRejectingId(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? <span className="spinner" /> : 'Rejeitar'}
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

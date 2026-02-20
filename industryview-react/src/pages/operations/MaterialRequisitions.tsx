import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { materialRequisitionsApi } from '../../services';
import type { MaterialRequisition, MaterialRequisitionItem } from '../../types';
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
  media:   { bg: '#fef9c3', color: '#a16207', label: 'Média' },
  alta:    { bg: '#ffedd5', color: '#c2410c', label: 'Alta' },
  urgente: { bg: '#fee2e2', color: '#dc2626', label: 'Urgente' },
};

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MaterialRequisitions() {
  const { t } = useTranslation();
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
  const [itemDrafts, setItemDrafts] = useState<ItemDraft[]>([{ ...EMPTY_ITEM_DRAFT }]);
  const [createModalLoading, setCreateModalLoading] = useState(false);

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
  // Load requisitions
  // ------------------------------------------------------------------
  const loadRequisitions = useCallback(async () => {
    if (!projectsInfo) return;
    setLoading(true);
    try {
      const data = await materialRequisitionsApi.listRequisitions({
        projects_id: projectsInfo.id,
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
    setItemDrafts([{ ...EMPTY_ITEM_DRAFT }]);
    setShowCreateModal(true);
  };

  // ------------------------------------------------------------------
  // Create requisition
  // ------------------------------------------------------------------
  const handleCreateRequisition = async () => {
    if (!projectsInfo) return;
    setCreateModalLoading(true);
    try {
      const validItems = itemDrafts
        .filter((d) => d.description.trim() && d.quantity)
        .map((d) => ({
          description: d.description.trim(),
          unit: d.unit.trim() || undefined,
          quantity: parseFloat(d.quantity) || 1,
          estimated_cost: d.estimated_cost ? parseFloat(d.estimated_cost) : undefined,
        }));

      await materialRequisitionsApi.createRequisition({
        projects_id: projectsInfo.id,
        description: createDescription.trim() || undefined,
        priority: createPriority || undefined,
        items: validItems.length > 0 ? validItems : undefined,
      });
      setShowCreateModal(false);
      loadRequisitions();
    } catch (err) {
      console.error('Failed to create requisition:', err);
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
      loadRequisitions();
    } catch (err) {
      console.error('Failed to submit requisition:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(true);
    try {
      await materialRequisitionsApi.approveRequisition(id);
      loadRequisitions();
    } catch (err) {
      console.error('Failed to approve requisition:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    setActionLoading(true);
    try {
      await materialRequisitionsApi.rejectRequisition(rejectingId, {
        rejection_reason: rejectionReason.trim() || undefined,
      });
      setRejectingId(null);
      setRejectionReason('');
      loadRequisitions();
    } catch (err) {
      console.error('Failed to reject requisition:', err);
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
          <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Quantidade</th>
          <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Custo Estimado</th>
          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Observação</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} style={{ borderBottom: '1px solid var(--color-alternate)' }}>
            <td style={{ padding: '8px 12px' }}>{item.description}</td>
            <td style={{ padding: '8px 12px' }}>{item.unit || '-'}</td>
            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{item.quantity}</td>
            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{formatCurrency(item.estimated_cost)}</td>
            <td style={{ padding: '8px 12px' }}>{item.observation || '-'}</td>
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
                    <td>{req.description || '-'}</td>
                    <td>
                      {req.priority ? (
                        <StatusBadge status={req.priority} colorMap={REQUISITION_PRIORITY_COLORS} />
                      ) : '-'}
                    </td>
                    <td>
                      <StatusBadge status={req.status} colorMap={REQUISITION_STATUS_COLORS} />
                    </td>
                    <td>{req.requester_name || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <ApprovalActions
                          status={req.status}
                          onSubmit={req.status === 'rascunho' ? () => handleSubmit(req.id) : undefined}
                          onApprove={req.status === 'submetida' ? () => handleApprove(req.id) : undefined}
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
                      <td colSpan={6} style={{ padding: '0', backgroundColor: 'var(--color-primary-bg)' }}>
                        <div style={{ padding: '16px 24px', borderTop: '2px solid var(--color-primary)' }}>
                          {req.rejection_reason && (
                            <div style={{
                              marginBottom: '12px',
                              padding: '10px 14px',
                              backgroundColor: '#fee2e2',
                              borderRadius: '6px',
                              fontSize: '13px',
                              color: '#dc2626',
                            }}>
                              <strong>Motivo da rejeição:</strong> {req.rejection_reason}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Descrição</label>
                  <input
                    className="input-field"
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    placeholder="Descrição geral da requisição"
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0, minWidth: '140px' }}>
                  <label>Prioridade</label>
                  <SearchableSelect
                    options={[
                      { value: 'baixa', label: 'Baixa' },
                      { value: 'media', label: 'Média' },
                      { value: 'alta', label: 'Alta' },
                      { value: 'urgente', label: 'Urgente' },
                    ]}
                    value={createPriority || undefined}
                    onChange={(val) => setCreatePriority(String(val ?? ''))}
                    placeholder="Selecione"
                    allowClear
                  />
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
                      type="number"
                      className="input-field"
                      value={draft.estimated_cost}
                      onChange={(e) => updateItemDraft(index, { estimated_cost: e.target.value })}
                      placeholder="R$ 0,00"
                      min="0"
                      step="0.01"
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
    </div>
  );
}

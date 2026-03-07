import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { contractsApi, projectsApi } from '../../services';
import type { ContractMeasurement, ContractClaim, MeasurementItem } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import ApprovalActions from '../../components/common/ApprovalActions';
import { Plus, ChevronDown, ChevronUp, FileText, AlertTriangle, Trash2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Status color maps
// ---------------------------------------------------------------------------

const MEASUREMENT_STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  rascunho:  { bg: 'var(--color-alternate)', color: 'var(--color-secondary-text)', label: 'Rascunho' },
  submetida: { bg: '#fef9c3', color: '#a16207', label: 'Submetida' },
  aprovada:  { bg: '#dcfce7', color: '#16a34a', label: 'Aprovada' },
  rejeitada: { bg: '#fee2e2', color: '#dc2626', label: 'Rejeitada' },
};

const CLAIM_STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  aberta:     { bg: '#fee2e2', color: '#dc2626', label: 'Aberta' },
  em_analise: { bg: '#fef9c3', color: '#a16207', label: 'Em Analise' },
  aceita:     { bg: '#dcfce7', color: '#16a34a', label: 'Aceita' },
  rejeitada:  { bg: 'transparent', color: '#dc2626', label: 'Rejeitada' },
  encerrada:  { bg: 'var(--color-alternate)', color: 'var(--color-secondary-text)', label: 'Encerrada' },
};

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value?: number | null): string {
  if (value == null) return '-';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
}

const errorBorder: React.CSSProperties = { border: '1px solid #dc2626' };
const errorText: React.CSSProperties = { color: '#dc2626', fontSize: '12px', marginTop: '2px' };

function parseDecimalBR(value: string): number {
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function currencyMask(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  return (num / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function quantityMask(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  return (num / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ---------------------------------------------------------------------------
// Item row type for measurement creation
// ---------------------------------------------------------------------------
interface ItemRow {
  description: string;
  unit: string;
  quantity: string;
  unit_price: string;
}

const emptyItem = (): ItemRow => ({ description: '', unit: '', quantity: '', unit_price: '' });

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContractsManagement() {
  const { t: _t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();

  useEffect(() => {
    setNavBarSelection(25);
  }, []);

  const [activeTab, setActiveTab] = useState<'measurements' | 'claims'>('measurements');

  // Modal projects dropdown
  const [modalProjects, setModalProjects] = useState<{ id: number; name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const loadModalProjects = async () => {
    try {
      const data = await projectsApi.queryAllProjects({ per_page: 100 });
      setModalProjects((data.items || []).map((p: any) => ({ id: p.id, name: p.name })));
    } catch { /* ignore */ }
  };

  // ------------------------------------------------------------------
  // Measurements state
  // ------------------------------------------------------------------
  const [measurements, setMeasurements] = useState<ContractMeasurement[]>([]);
  const [measurementsLoading, setMeasurementsLoading] = useState(true);
  const [measurementsPage, setMeasurementsPage] = useState(1);
  const [measurementsPerPage, setMeasurementsPerPage] = useState(10);
  const [measurementsTotalPages, setMeasurementsTotalPages] = useState(1);
  const [measurementsTotalItems, setMeasurementsTotalItems] = useState(0);
  const [expandedMeasurementId, setExpandedMeasurementId] = useState<number | null>(null);
  const [expandedMeasurement, setExpandedMeasurement] = useState<ContractMeasurement | null>(null);
  const [expandLoading, setExpandLoading] = useState(false);

  // Create measurement modal
  const [showCreateMeasurement, setShowCreateMeasurement] = useState(false);
  const [measurementTitle, setMeasurementTitle] = useState('');
  const [measurementDate, setMeasurementDate] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [measurementNotes, setMeasurementNotes] = useState('');
  const [measurementItems, setMeasurementItems] = useState<ItemRow[]>([emptyItem()]);
  const [measurementModalLoading, setMeasurementModalLoading] = useState(false);
  const [measurementErrors, setMeasurementErrors] = useState<Record<string, string>>({});

  // Reject measurement modal
  const [rejectingMeasurementId, setRejectingMeasurementId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // ------------------------------------------------------------------
  // Claims state
  // ------------------------------------------------------------------
  const [claims, setClaims] = useState<ContractClaim[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [claimsPage, setClaimsPage] = useState(1);
  const [claimsPerPage, setClaimsPerPage] = useState(10);
  const [claimsTotalPages, setClaimsTotalPages] = useState(1);
  const [claimsTotalItems, setClaimsTotalItems] = useState(0);
  const [expandedClaimId, setExpandedClaimId] = useState<number | null>(null);
  const [expandedClaim, setExpandedClaim] = useState<ContractClaim | null>(null);
  const [claimExpandLoading, setClaimExpandLoading] = useState(false);

  // Create claim modal
  const [showCreateClaim, setShowCreateClaim] = useState(false);
  const [claimTitle, setClaimTitle] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [claimType, setClaimType] = useState('');
  const [claimValueRequested, setClaimValueRequested] = useState('');
  const [claimModalLoading, setClaimModalLoading] = useState(false);
  const [claimErrors, setClaimErrors] = useState<Record<string, string>>({});

  // Close claim modal
  const [closingClaimId, setClosingClaimId] = useState<number | null>(null);
  const [closeResolution, setCloseResolution] = useState('');
  const [closeValueApproved, setCloseValueApproved] = useState('');
  const [closeOutcome, setCloseOutcome] = useState<'aprovada' | 'negada' | 'parcialmente_aprovada'>('aprovada');
  const [closeErrors, setCloseErrors] = useState<Record<string, string>>({});

  // Shared action loading
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
  // Load measurements
  // ------------------------------------------------------------------
  const loadMeasurements = useCallback(async () => {
    setMeasurementsLoading(true);
    try {
      const data = await contractsApi.listMeasurements({
        projects_id: projectsInfo?.id,
        page: measurementsPage,
        per_page: measurementsPerPage,
      });
      setMeasurements(data.items || []);
      setMeasurementsTotalPages(data.pageTotal || 1);
      setMeasurementsTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load measurements:', err);
    } finally {
      setMeasurementsLoading(false);
    }
  }, [projectsInfo, measurementsPage, measurementsPerPage]);

  useEffect(() => {
    loadMeasurements();
  }, [loadMeasurements]);

  // ------------------------------------------------------------------
  // Load claims
  // ------------------------------------------------------------------
  const loadClaims = useCallback(async () => {
    setClaimsLoading(true);
    try {
      const data = await contractsApi.listClaims({
        projects_id: projectsInfo?.id,
        page: claimsPage,
        per_page: claimsPerPage,
      });
      setClaims(data.items || []);
      setClaimsTotalPages(data.pageTotal || 1);
      setClaimsTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setClaimsLoading(false);
    }
  }, [projectsInfo, claimsPage, claimsPerPage]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  // ------------------------------------------------------------------
  // Measurement expand
  // ------------------------------------------------------------------
  const handleToggleMeasurement = async (measurement: ContractMeasurement) => {
    if (expandedMeasurementId === measurement.id) {
      setExpandedMeasurementId(null);
      setExpandedMeasurement(null);
      return;
    }
    setExpandedMeasurementId(measurement.id);
    setExpandLoading(true);
    try {
      const detail = await contractsApi.getMeasurement(measurement.id);
      setExpandedMeasurement(detail);
    } catch (err) {
      console.error('Failed to load measurement detail:', err);
    } finally {
      setExpandLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Create measurement
  // ------------------------------------------------------------------
  const openCreateMeasurement = () => {
    setMeasurementTitle('');
    setMeasurementDate('');
    setPeriodStart('');
    setPeriodEnd('');
    setMeasurementNotes('');
    setMeasurementItems([emptyItem()]);
    setMeasurementErrors({});
    setSelectedProjectId(projectsInfo?.id ?? null);
    loadModalProjects();
    setShowCreateMeasurement(true);
  };

  const resetMeasurementModal = () => {
    setShowCreateMeasurement(false);
  };

  const handleCreateMeasurement = async () => {
    const errors: Record<string, string> = {};
    if (!selectedProjectId) errors.project = 'Selecione um projeto';
    if (!measurementTitle.trim()) errors.title = 'Titulo e obrigatorio';
    if (!measurementDate) errors.measurement_date = 'Data da medicao e obrigatoria';
    const validItems = measurementItems.filter(i => i.description.trim());
    if (validItems.length === 0) errors.items = 'Pelo menos um item e obrigatorio';
    validItems.forEach((item, idx) => {
      if (!item.quantity || parseDecimalBR(item.quantity) <= 0) errors[`item_qty_${idx}`] = 'Qtd invalida';
      if (!item.unit_price || parseDecimalBR(item.unit_price) <= 0) errors[`item_price_${idx}`] = 'Preco invalido';
    });

    if (Object.keys(errors).length > 0) {
      setMeasurementErrors(errors);
      return;
    }

    setMeasurementModalLoading(true);
    try {
      await contractsApi.createMeasurement({
        projects_id: selectedProjectId!,
        title: measurementTitle.trim(),
        measurement_date: measurementDate,
        period_start: periodStart || undefined,
        period_end: periodEnd || undefined,
        notes: measurementNotes.trim() || undefined,
        items: validItems.map(i => ({
          description: i.description.trim(),
          unit: i.unit.trim() || undefined,
          quantity: parseDecimalBR(i.quantity),
          unit_price: parseDecimalBR(i.unit_price),
        })),
      });
      resetMeasurementModal();
      loadMeasurements();
      showToast('Medicao criada com sucesso.');
    } catch (err) {
      console.error('Failed to create measurement:', err);
      showToast('Erro ao criar medicao.', 'error');
    } finally {
      setMeasurementModalLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Measurement items management
  // ------------------------------------------------------------------
  const updateItem = (index: number, field: keyof ItemRow, value: string) => {
    setMeasurementItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setMeasurementErrors(prev => {
      const next = { ...prev };
      delete next.items;
      delete next[`item_qty_${index}`];
      delete next[`item_price_${index}`];
      return next;
    });
  };

  const addItemRow = () => setMeasurementItems(prev => [...prev, emptyItem()]);

  const removeItemRow = (index: number) => {
    if (measurementItems.length <= 1) return;
    setMeasurementItems(prev => prev.filter((_, i) => i !== index));
  };

  const itemsTotal = measurementItems.reduce((acc, i) => {
    const q = parseDecimalBR(i.quantity);
    const p = parseDecimalBR(i.unit_price);
    return acc + q * p;
  }, 0);

  // ------------------------------------------------------------------
  // Measurement approval flow
  // ------------------------------------------------------------------
  const handleSubmitMeasurement = async (id: number) => {
    setActionLoading(true);
    try {
      await contractsApi.submitMeasurement(id);
      loadMeasurements();
      showToast('Medicao submetida com sucesso.');
    } catch (err) {
      console.error('Failed to submit measurement:', err);
      showToast('Erro ao submeter medicao.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveMeasurement = async (id: number) => {
    setActionLoading(true);
    try {
      await contractsApi.approveMeasurement(id);
      loadMeasurements();
      showToast('Medicao aprovada com sucesso.');
    } catch (err) {
      console.error('Failed to approve measurement:', err);
      showToast('Erro ao aprovar medicao.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectMeasurement = async () => {
    if (!rejectingMeasurementId) return;
    setActionLoading(true);
    try {
      await contractsApi.rejectMeasurement(rejectingMeasurementId, {
        rejection_reason: rejectionReason.trim() || undefined,
      });
      setRejectingMeasurementId(null);
      setRejectionReason('');
      loadMeasurements();
      showToast('Medicao rejeitada.');
    } catch (err) {
      console.error('Failed to reject measurement:', err);
      showToast('Erro ao rejeitar medicao.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Claim expand
  // ------------------------------------------------------------------
  const handleToggleClaim = async (claim: ContractClaim) => {
    if (expandedClaimId === claim.id) {
      setExpandedClaimId(null);
      setExpandedClaim(null);
      return;
    }
    setExpandedClaimId(claim.id);
    setClaimExpandLoading(true);
    try {
      const detail = await contractsApi.getClaim(claim.id);
      setExpandedClaim(detail);
    } catch (err) {
      console.error('Failed to load claim detail:', err);
    } finally {
      setClaimExpandLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Create claim
  // ------------------------------------------------------------------
  const openCreateClaim = () => {
    setClaimTitle('');
    setClaimDescription('');
    setClaimType('');
    setClaimValueRequested('');
    setClaimErrors({});
    setSelectedProjectId(projectsInfo?.id ?? null);
    loadModalProjects();
    setShowCreateClaim(true);
  };

  const resetClaimModal = () => {
    setShowCreateClaim(false);
  };

  const handleCreateClaim = async () => {
    const errors: Record<string, string> = {};
    if (!selectedProjectId) errors.project = 'Selecione um projeto';
    if (!claimTitle.trim()) errors.title = 'Titulo e obrigatorio';
    if (!claimDescription.trim()) errors.description = 'Descricao e obrigatoria';

    if (Object.keys(errors).length > 0) {
      setClaimErrors(errors);
      return;
    }

    setClaimModalLoading(true);
    try {
      await contractsApi.createClaim({
        projects_id: selectedProjectId!,
        title: claimTitle.trim(),
        description: claimDescription.trim(),
        claim_type: claimType.trim() || undefined,
        value_requested: claimValueRequested ? parseDecimalBR(claimValueRequested) : undefined,
      });
      resetClaimModal();
      loadClaims();
      showToast('Reivindicacao criada com sucesso.');
    } catch (err) {
      console.error('Failed to create claim:', err);
      showToast('Erro ao criar reivindicacao.', 'error');
    } finally {
      setClaimModalLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Close claim
  // ------------------------------------------------------------------
  const openCloseClaimModal = (id: number) => {
    setClosingClaimId(id);
    setCloseResolution('');
    setCloseValueApproved('');
    setCloseOutcome('aprovada');
    setCloseErrors({});
  };

  const handleCloseClaim = async () => {
    if (!closingClaimId) return;
    const errors: Record<string, string> = {};
    if (!closeResolution.trim()) errors.resolution = 'Resolucao e obrigatoria';
    if (Object.keys(errors).length > 0) {
      setCloseErrors(errors);
      return;
    }

    setActionLoading(true);
    try {
      await contractsApi.closeClaim(closingClaimId, {
        resolution: closeResolution.trim(),
        value_approved: closeValueApproved ? parseDecimalBR(closeValueApproved) : undefined,
        outcome: closeOutcome,
      });
      setClosingClaimId(null);
      loadClaims();
      showToast('Reivindicacao encerrada com sucesso.');
    } catch (err) {
      console.error('Failed to close claim:', err);
      showToast('Erro ao encerrar reivindicacao.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Render measurement items sub-table
  // ------------------------------------------------------------------
  const renderMeasurementItems = (items: MeasurementItem[]) => (
    <table style={{ width: '100%', fontSize: '13px' }}>
      <thead>
        <tr style={{ backgroundColor: 'var(--color-alternate)' }}>
          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Descricao</th>
          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Unidade</th>
          <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Quantidade</th>
          <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Preco Unit.</th>
          <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} style={{ borderBottom: '1px solid var(--color-alternate)' }}>
            <td style={{ padding: '8px 12px' }}>{item.description}</td>
            <td style={{ padding: '8px 12px' }}>{item.unity || '-'}</td>
            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{item.quantity_measured}</td>
            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total_price)}</td>
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
        title="Contratos"
        subtitle="Gestao de medicoes e reivindicacoes contratuais"
        breadcrumb={projectsInfo ? `${projectsInfo.name} / Contratos` : 'Contratos'}
        actions={
          activeTab === 'measurements' ? (
            <button className="btn btn-primary" onClick={() => openCreateMeasurement()}>
              <Plus size={18} /> Nova Medicao
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => openCreateClaim()}>
              <Plus size={18} /> Nova Reivindicacao
            </button>
          )
        }
      />
      <ProjectFilterDropdown />

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid var(--color-alternate)', display: 'flex', gap: '0', marginBottom: '24px' }}>
        <button
          className="btn"
          style={{
            borderRadius: 0,
            borderBottom: activeTab === 'measurements' ? '2px solid var(--color-primary)' : '2px solid transparent',
            marginBottom: '-2px',
            fontWeight: activeTab === 'measurements' ? 600 : 400,
            color: activeTab === 'measurements' ? 'var(--color-primary)' : 'var(--color-secondary-text)',
            padding: '10px 20px',
            backgroundColor: 'transparent',
          }}
          onClick={() => setActiveTab('measurements')}
        >
          <FileText size={16} /> Medicoes
        </button>
        <button
          className="btn"
          style={{
            borderRadius: 0,
            borderBottom: activeTab === 'claims' ? '2px solid var(--color-primary)' : '2px solid transparent',
            marginBottom: '-2px',
            fontWeight: activeTab === 'claims' ? 600 : 400,
            color: activeTab === 'claims' ? 'var(--color-primary)' : 'var(--color-secondary-text)',
            padding: '10px 20px',
            backgroundColor: 'transparent',
          }}
          onClick={() => setActiveTab('claims')}
        >
          <AlertTriangle size={16} /> Reivindicacoes
        </button>
      </div>

      {/* ----------------------------------------------------------------
          TAB: MEASUREMENTS
      ---------------------------------------------------------------- */}
      {activeTab === 'measurements' && (
        <>
          {measurementsLoading ? (
            <LoadingSpinner />
          ) : measurements.length === 0 ? (
            <EmptyState
              message="Nenhuma medicao encontrada."
              action={
                <button className="btn btn-primary" onClick={() => openCreateMeasurement()}>
                  <Plus size={18} /> Nova Medicao
                </button>
              }
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>N Medicao</th>
                    <th>Periodo</th>
                    <th>Observacoes</th>
                    <th>Valor Total</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {measurements.map((measurement) => (
                    <>
                      <motion.tr key={measurement.id} variants={tableRowVariants}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={16} color="var(--color-primary)" />
                            <span style={{ fontWeight: 500 }}>{measurement.measurement_number}</span>
                          </div>
                        </td>
                        <td>
                          {measurement.measurement_period_start
                            ? `${formatDate(measurement.measurement_period_start)} - ${formatDate(measurement.measurement_period_end)}`
                            : '-'}
                        </td>
                        <td>{measurement.observations || '-'}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(measurement.total_value)}</td>
                        <td>
                          <StatusBadge
                            status={measurement.status}
                            colorMap={MEASUREMENT_STATUS_COLORS}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <ApprovalActions
                              status={measurement.status}
                              onSubmit={measurement.status === 'rascunho' ? () => handleSubmitMeasurement(measurement.id) : undefined}
                              onApprove={measurement.status === 'submetida' ? () => handleApproveMeasurement(measurement.id) : undefined}
                              onReject={measurement.status === 'submetida' ? () => { setRejectingMeasurementId(measurement.id); setRejectionReason(''); } : undefined}
                              loading={actionLoading}
                            />
                            <button
                              className="btn btn-icon"
                              title="Ver itens"
                              onClick={() => handleToggleMeasurement(measurement)}
                            >
                              {expandedMeasurementId === measurement.id
                                ? <ChevronUp size={16} />
                                : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                      {expandedMeasurementId === measurement.id && (
                        <tr key={`${measurement.id}-detail`}>
                          <td colSpan={6} style={{ padding: '0', backgroundColor: 'var(--color-primary-bg)' }}>
                            <div style={{ padding: '16px 24px', borderTop: '2px solid var(--color-primary)' }}>
                              <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: '13px', color: 'var(--color-primary-text)' }}>
                                Itens da Medicao
                              </p>
                              {expandLoading ? (
                                <LoadingSpinner />
                              ) : expandedMeasurement?.items && expandedMeasurement.items.length > 0 ? (
                                renderMeasurementItems(expandedMeasurement.items)
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
                currentPage={measurementsPage}
                totalPages={measurementsTotalPages}
                perPage={measurementsPerPage}
                totalItems={measurementsTotalItems}
                onPageChange={setMeasurementsPage}
                onPerPageChange={(pp) => { setMeasurementsPerPage(pp); setMeasurementsPage(1); }}
              />
            </div>
          )}
        </>
      )}

      {/* ----------------------------------------------------------------
          TAB: CLAIMS
      ---------------------------------------------------------------- */}
      {activeTab === 'claims' && (
        <>
          {claimsLoading ? (
            <LoadingSpinner />
          ) : claims.length === 0 ? (
            <EmptyState
              message="Nenhuma reivindicacao encontrada."
              action={
                <button className="btn btn-primary" onClick={() => openCreateClaim()}>
                  <Plus size={18} /> Nova Reivindicacao
                </button>
              }
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Numero</th>
                    <th>Titulo</th>
                    <th>Tipo</th>
                    <th>Valor Pleiteado</th>
                    <th>Valor Aprovado</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {claims.map((claim) => (
                    <>
                      <motion.tr key={claim.id} variants={tableRowVariants}>
                        <td>
                          <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{claim.claim_number}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={16} color="var(--color-warning)" />
                            <span style={{ fontWeight: 500 }}>{claim.title}</span>
                          </div>
                        </td>
                        <td>{claim.claim_type || '-'}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(claim.claimed_value)}</td>
                        <td>{formatCurrency(claim.approved_value)}</td>
                        <td>
                          <StatusBadge
                            status={claim.status}
                            colorMap={CLAIM_STATUS_COLORS}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {!['encerrada', 'aceita', 'rejeitada'].includes(claim.status) && (
                              <button
                                className="btn btn-secondary"
                                style={{ fontSize: '12px', padding: '4px 10px' }}
                                onClick={() => openCloseClaimModal(claim.id)}
                                disabled={actionLoading}
                              >
                                Encerrar
                              </button>
                            )}
                            <button
                              className="btn btn-icon"
                              title="Ver detalhes"
                              onClick={() => handleToggleClaim(claim)}
                            >
                              {expandedClaimId === claim.id
                                ? <ChevronUp size={16} />
                                : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                      {expandedClaimId === claim.id && (
                        <tr key={`${claim.id}-detail`}>
                          <td colSpan={7} style={{ padding: '0', backgroundColor: 'var(--color-primary-bg)' }}>
                            <div style={{ padding: '16px 24px', borderTop: '2px solid var(--color-primary)' }}>
                              <p style={{ fontWeight: 600, marginBottom: '4px', fontSize: '13px', color: 'var(--color-primary-text)' }}>
                                Descricao
                              </p>
                              <p style={{ marginBottom: '16px', fontSize: '13px' }}>{claim.description}</p>
                              <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: '13px', color: 'var(--color-primary-text)' }}>
                                Evidencias
                              </p>
                              {claimExpandLoading ? (
                                <LoadingSpinner />
                              ) : expandedClaim?.evidences && expandedClaim.evidences.length > 0 ? (
                                <table style={{ width: '100%', fontSize: '13px' }}>
                                  <thead>
                                    <tr style={{ backgroundColor: 'var(--color-alternate)' }}>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Arquivo</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Descricao</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Tipo</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Data</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {expandedClaim.evidences.map((ev) => (
                                      <tr key={ev.id} style={{ borderBottom: '1px solid var(--color-alternate)' }}>
                                        <td style={{ padding: '8px 12px' }}>
                                          <a href={ev.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
                                            {ev.file_url}
                                          </a>
                                        </td>
                                        <td style={{ padding: '8px 12px' }}>{ev.description || '-'}</td>
                                        <td style={{ padding: '8px 12px' }}>{ev.evidence_type || '-'}</td>
                                        <td style={{ padding: '8px 12px' }}>{formatDate(ev.created_at)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                                  Nenhuma evidencia cadastrada.
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
                currentPage={claimsPage}
                totalPages={claimsTotalPages}
                perPage={claimsPerPage}
                totalItems={claimsTotalItems}
                onPageChange={setClaimsPage}
                onPerPageChange={(pp) => { setClaimsPerPage(pp); setClaimsPage(1); }}
              />
            </div>
          )}
        </>
      )}

      {/* ----------------------------------------------------------------
          Modal: Create Measurement
      ---------------------------------------------------------------- */}
      {showCreateMeasurement && (
        <div className="modal-backdrop" onClick={() => resetMeasurementModal()}>
          <div className="modal-content" style={{ padding: '24px', width: '680px', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>Nova Medicao</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>Projeto *</label>
                <select
                  className="input-field"
                  style={measurementErrors.project ? errorBorder : undefined}
                  value={selectedProjectId ?? ''}
                  onChange={(e) => { setSelectedProjectId(e.target.value ? Number(e.target.value) : null); setMeasurementErrors(prev => { const n = { ...prev }; delete n.project; return n; }); }}
                >
                  <option value="">Selecione um projeto</option>
                  {modalProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {measurementErrors.project && <span style={errorText}>{measurementErrors.project}</span>}
              </div>

              <div className="input-group">
                <label>Titulo *</label>
                <input
                  className="input-field"
                  style={measurementErrors.title ? errorBorder : undefined}
                  value={measurementTitle}
                  onChange={(e) => { setMeasurementTitle(e.target.value); setMeasurementErrors(prev => { const n = { ...prev }; delete n.title; return n; }); }}
                  placeholder="Ex: Medicao 1 - Fundacao"
                />
                {measurementErrors.title && <span style={errorText}>{measurementErrors.title}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Data da Medicao *</label>
                  <input
                    type="date"
                    className="input-field"
                    style={measurementErrors.measurement_date ? errorBorder : undefined}
                    value={measurementDate}
                    onChange={(e) => { setMeasurementDate(e.target.value); setMeasurementErrors(prev => { const n = { ...prev }; delete n.measurement_date; return n; }); }}
                  />
                  {measurementErrors.measurement_date && <span style={errorText}>{measurementErrors.measurement_date}</span>}
                </div>
                <div />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Inicio do Periodo</label>
                  <input
                    type="date"
                    className="input-field"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Fim do Periodo</label>
                  <input
                    type="date"
                    className="input-field"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Observacoes</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={measurementNotes}
                  onChange={(e) => setMeasurementNotes(e.target.value)}
                  placeholder="Observacoes sobre a medicao..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Items section */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontWeight: 600, fontSize: '14px' }}>Itens da Medicao *</label>
                  <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={addItemRow}>
                    <Plus size={14} /> Adicionar Item
                  </button>
                </div>
                {measurementErrors.items && <span style={errorText}>{measurementErrors.items}</span>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {measurementItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'start' }}>
                      <div>
                        <input
                          className="input-field"
                          placeholder="Descricao do item"
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          style={{ fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <input
                          className="input-field"
                          placeholder="Unidade"
                          value={item.unit}
                          onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                          style={{ fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <input
                          className="input-field"
                          placeholder="0,00"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', quantityMask(e.target.value))}
                          style={{ ...(measurementErrors[`item_qty_${idx}`] ? errorBorder : {}), fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <input
                          className="input-field"
                          placeholder="0,00"
                          value={item.unit_price}
                          onChange={(e) => updateItem(idx, 'unit_price', currencyMask(e.target.value))}
                          style={{ ...(measurementErrors[`item_price_${idx}`] ? errorBorder : {}), fontSize: '13px' }}
                        />
                      </div>
                      <button
                        className="btn btn-icon"
                        style={{ marginTop: '2px', color: '#dc2626' }}
                        onClick={() => removeItemRow(idx)}
                        disabled={measurementItems.length <= 1}
                        title="Remover item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'right', marginTop: '8px', fontWeight: 600, fontSize: '14px' }}>
                  Total: {formatCurrency(itemsTotal)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => resetMeasurementModal()}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateMeasurement}
              >
                {measurementModalLoading ? <span className="spinner" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------
          Modal: Reject Measurement
      ---------------------------------------------------------------- */}
      {rejectingMeasurementId !== null && (
        <div className="modal-backdrop" onClick={() => setRejectingMeasurementId(null)}>
          <div className="modal-content" style={{ padding: '24px', width: '420px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>Rejeitar Medicao</h3>
            <div className="input-group">
              <label>Motivo da Rejeicao</label>
              <textarea
                className="input-field"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Descreva o motivo da rejeicao..."
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setRejectingMeasurementId(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleRejectMeasurement}
                disabled={actionLoading}
              >
                {actionLoading ? <span className="spinner" /> : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------
          Modal: Create Claim
      ---------------------------------------------------------------- */}
      {showCreateClaim && (
        <div className="modal-backdrop" onClick={() => resetClaimModal()}>
          <div className="modal-content" style={{ padding: '24px', width: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>Nova Reivindicacao</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>Projeto *</label>
                <select
                  className="input-field"
                  style={claimErrors.project ? errorBorder : undefined}
                  value={selectedProjectId ?? ''}
                  onChange={(e) => { setSelectedProjectId(e.target.value ? Number(e.target.value) : null); setClaimErrors(prev => { const n = { ...prev }; delete n.project; return n; }); }}
                >
                  <option value="">Selecione um projeto</option>
                  {modalProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {claimErrors.project && <span style={errorText}>{claimErrors.project}</span>}
              </div>
              <div className="input-group">
                <label>Titulo *</label>
                <input
                  className="input-field"
                  style={claimErrors.title ? errorBorder : undefined}
                  value={claimTitle}
                  onChange={(e) => { setClaimTitle(e.target.value); setClaimErrors(prev => { const n = { ...prev }; delete n.title; return n; }); }}
                  placeholder="Titulo da reivindicacao"
                />
                {claimErrors.title && <span style={errorText}>{claimErrors.title}</span>}
              </div>
              <div className="input-group">
                <label>Descricao *</label>
                <textarea
                  className="input-field"
                  rows={3}
                  style={claimErrors.description ? errorBorder : undefined}
                  value={claimDescription}
                  onChange={(e) => { setClaimDescription(e.target.value); setClaimErrors(prev => { const n = { ...prev }; delete n.description; return n; }); }}
                  placeholder="Descricao detalhada da reivindicacao..."
                />
                {claimErrors.description && <span style={errorText}>{claimErrors.description}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Tipo</label>
                  <input
                    className="input-field"
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    placeholder="Ex: Prazo, Custo"
                  />
                </div>
                <div className="input-group">
                  <label>Valor Pleiteado (R$)</label>
                  <input
                    className="input-field"
                    value={claimValueRequested}
                    onChange={(e) => setClaimValueRequested(currencyMask(e.target.value))}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => resetClaimModal()}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateClaim}
              >
                {claimModalLoading ? <span className="spinner" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------
          Modal: Close Claim
      ---------------------------------------------------------------- */}
      {closingClaimId !== null && (
        <div className="modal-backdrop" onClick={() => setClosingClaimId(null)}>
          <div className="modal-content" style={{ padding: '24px', width: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>Encerrar Reivindicacao</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>Resolucao *</label>
                <textarea
                  className="input-field"
                  rows={3}
                  style={closeErrors.resolution ? errorBorder : undefined}
                  value={closeResolution}
                  onChange={(e) => { setCloseResolution(e.target.value); setCloseErrors(prev => { const n = { ...prev }; delete n.resolution; return n; }); }}
                  placeholder="Descreva a resolucao da reivindicacao..."
                />
                {closeErrors.resolution && <span style={errorText}>{closeErrors.resolution}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Resultado</label>
                  <select
                    className="input-field"
                    value={closeOutcome}
                    onChange={(e) => setCloseOutcome(e.target.value as typeof closeOutcome)}
                  >
                    <option value="aprovada">Aprovada</option>
                    <option value="negada">Negada</option>
                    <option value="parcialmente_aprovada">Parcialmente Aprovada</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Valor Aprovado (R$)</label>
                  <input
                    className="input-field"
                    value={closeValueApproved}
                    onChange={(e) => setCloseValueApproved(currencyMask(e.target.value))}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setClosingClaimId(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCloseClaim}
                disabled={actionLoading}
              >
                {actionLoading ? <span className="spinner" /> : 'Encerrar'}
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

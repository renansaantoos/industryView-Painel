import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { contractsApi } from '../../services';
import type { ContractMeasurement, ContractClaim, MeasurementItem } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import ApprovalActions from '../../components/common/ApprovalActions';
import { Plus, ChevronDown, ChevronUp, FileText, AlertTriangle } from 'lucide-react';

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
  em_analise: { bg: '#fef9c3', color: '#a16207', label: 'Em Análise' },
  aceita:     { bg: '#dcfce7', color: '#16a34a', label: 'Aceita' },
  rejeitada:  { bg: 'transparent', color: '#dc2626', label: 'Rejeitada' },
  encerrada:  { bg: 'var(--color-alternate)', color: 'var(--color-secondary-text)', label: 'Encerrada' },
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

export default function ContractsManagement() {
  const { t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();

  useEffect(() => {
    setNavBarSelection(25);
  }, []);

  const [activeTab, setActiveTab] = useState<'measurements' | 'claims'>('measurements');

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
  const [measurementNumber, setMeasurementNumber] = useState('');
  const [referencePeriod, setReferencePeriod] = useState('');
  const [measurementDescription, setMeasurementDescription] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [measurementModalLoading, setMeasurementModalLoading] = useState(false);

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
  const [claimEstimatedValue, setClaimEstimatedValue] = useState('');
  const [claimModalLoading, setClaimModalLoading] = useState(false);

  // Shared action loading
  const [actionLoading, setActionLoading] = useState(false);

  // ------------------------------------------------------------------
  // Load measurements
  // ------------------------------------------------------------------
  const loadMeasurements = useCallback(async () => {
    if (!projectsInfo) return;
    setMeasurementsLoading(true);
    try {
      const data = await contractsApi.listMeasurements({
        projects_id: projectsInfo.id,
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
    if (!projectsInfo) return;
    setClaimsLoading(true);
    try {
      const data = await contractsApi.listClaims({
        projects_id: projectsInfo.id,
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
  const handleCreateMeasurement = async () => {
    if (!projectsInfo || !measurementNumber.trim()) return;
    setMeasurementModalLoading(true);
    try {
      await contractsApi.createMeasurement({
        projects_id: projectsInfo.id,
        measurement_number: measurementNumber.trim(),
        reference_period: referencePeriod.trim(),
        description: measurementDescription.trim() || undefined,
        total_value: totalValue ? parseFloat(totalValue) : undefined,
      });
      setMeasurementNumber('');
      setReferencePeriod('');
      setMeasurementDescription('');
      setTotalValue('');
      setShowCreateMeasurement(false);
      loadMeasurements();
    } catch (err) {
      console.error('Failed to create measurement:', err);
    } finally {
      setMeasurementModalLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Measurement approval flow
  // ------------------------------------------------------------------
  const handleSubmitMeasurement = async (id: number) => {
    setActionLoading(true);
    try {
      await contractsApi.submitMeasurement(id);
      loadMeasurements();
    } catch (err) {
      console.error('Failed to submit measurement:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveMeasurement = async (id: number) => {
    setActionLoading(true);
    try {
      await contractsApi.approveMeasurement(id);
      loadMeasurements();
    } catch (err) {
      console.error('Failed to approve measurement:', err);
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
    } catch (err) {
      console.error('Failed to reject measurement:', err);
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
  const handleCreateClaim = async () => {
    if (!projectsInfo || !claimTitle.trim() || !claimDescription.trim()) return;
    setClaimModalLoading(true);
    try {
      await contractsApi.createClaim({
        projects_id: projectsInfo.id,
        title: claimTitle.trim(),
        description: claimDescription.trim(),
        claim_type: claimType.trim() || undefined,
        estimated_value: claimEstimatedValue ? parseFloat(claimEstimatedValue) : undefined,
      });
      setClaimTitle('');
      setClaimDescription('');
      setClaimType('');
      setClaimEstimatedValue('');
      setShowCreateClaim(false);
      loadClaims();
    } catch (err) {
      console.error('Failed to create claim:', err);
    } finally {
      setClaimModalLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Close claim
  // ------------------------------------------------------------------
  const handleCloseClaim = async (id: number) => {
    setActionLoading(true);
    try {
      await contractsApi.closeClaim(id);
      loadClaims();
    } catch (err) {
      console.error('Failed to close claim:', err);
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
          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Descrição</th>
          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Unidade</th>
          <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Quantidade</th>
          <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Preço Unit.</th>
          <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} style={{ borderBottom: '1px solid var(--color-alternate)' }}>
            <td style={{ padding: '8px 12px' }}>{item.description}</td>
            <td style={{ padding: '8px 12px' }}>{item.unit || '-'}</td>
            <td style={{ padding: '8px 12px', textAlign: 'right' }}>{item.quantity}</td>
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
        subtitle="Gestão de medições e revindicações contratuais"
        breadcrumb={projectsInfo ? `${projectsInfo.name} / Contratos` : 'Contratos'}
        actions={
          activeTab === 'measurements' ? (
            <button className="btn btn-primary" onClick={() => setShowCreateMeasurement(true)}>
              <Plus size={18} /> Nova Medição
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowCreateClaim(true)}>
              <Plus size={18} /> Nova Revindicação
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
          <FileText size={16} /> Medições
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
          <AlertTriangle size={16} /> Revindicações
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
              message="Nenhuma medição encontrada."
              action={
                <button className="btn btn-primary" onClick={() => setShowCreateMeasurement(true)}>
                  <Plus size={18} /> Nova Medição
                </button>
              }
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nº Medição</th>
                    <th>Período de Referência</th>
                    <th>Descrição</th>
                    <th>Valor Total</th>
                    <th>Status</th>
                    <th>Ações</th>
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
                        <td>{measurement.reference_period || '-'}</td>
                        <td>{measurement.description || '-'}</td>
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
                                Itens da Medição
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
              message="Nenhuma revindicação encontrada."
              action={
                <button className="btn btn-primary" onClick={() => setShowCreateClaim(true)}>
                  <Plus size={18} /> Nova Revindicação
                </button>
              }
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Tipo</th>
                    <th>Valor Estimado</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {claims.map((claim) => (
                    <>
                      <motion.tr key={claim.id} variants={tableRowVariants}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={16} color="var(--color-warning)" />
                            <span style={{ fontWeight: 500 }}>{claim.title}</span>
                          </div>
                        </td>
                        <td>{claim.claim_type || '-'}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(claim.estimated_value)}</td>
                        <td>
                          <StatusBadge
                            status={claim.status}
                            colorMap={CLAIM_STATUS_COLORS}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {!['encerrada'].includes(claim.status) && (
                              <button
                                className="btn btn-secondary"
                                style={{ fontSize: '12px', padding: '4px 10px' }}
                                onClick={() => handleCloseClaim(claim.id)}
                                disabled={actionLoading}
                              >
                                Encerrar
                              </button>
                            )}
                            <button
                              className="btn btn-icon"
                              title="Ver evidências"
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
                          <td colSpan={5} style={{ padding: '0', backgroundColor: 'var(--color-primary-bg)' }}>
                            <div style={{ padding: '16px 24px', borderTop: '2px solid var(--color-primary)' }}>
                              <p style={{ fontWeight: 600, marginBottom: '4px', fontSize: '13px', color: 'var(--color-primary-text)' }}>
                                Descrição
                              </p>
                              <p style={{ marginBottom: '16px', fontSize: '13px' }}>{claim.description}</p>
                              <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: '13px', color: 'var(--color-primary-text)' }}>
                                Evidências
                              </p>
                              {claimExpandLoading ? (
                                <LoadingSpinner />
                              ) : expandedClaim?.evidences && expandedClaim.evidences.length > 0 ? (
                                <table style={{ width: '100%', fontSize: '13px' }}>
                                  <thead>
                                    <tr style={{ backgroundColor: 'var(--color-alternate)' }}>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Arquivo</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Descrição</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Enviado por</th>
                                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Data</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {expandedClaim.evidences.map((ev) => (
                                      <tr key={ev.id} style={{ borderBottom: '1px solid var(--color-alternate)' }}>
                                        <td style={{ padding: '8px 12px' }}>
                                          <a href={ev.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
                                            {ev.file_name || ev.file_url}
                                          </a>
                                        </td>
                                        <td style={{ padding: '8px 12px' }}>{ev.description || '-'}</td>
                                        <td style={{ padding: '8px 12px' }}>{ev.uploader_name || '-'}</td>
                                        <td style={{ padding: '8px 12px' }}>{new Date(ev.created_at).toLocaleDateString('pt-BR')}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                                  Nenhuma evidência cadastrada.
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
        <div className="modal-backdrop" onClick={() => setShowCreateMeasurement(false)}>
          <div className="modal-content" style={{ padding: '24px', width: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>Nova Medição</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Número da Medição *</label>
                  <input
                    className="input-field"
                    value={measurementNumber}
                    onChange={(e) => setMeasurementNumber(e.target.value)}
                    placeholder="Ex: MED-001"
                  />
                </div>
                <div className="input-group">
                  <label>Período de Referência</label>
                  <input
                    className="input-field"
                    value={referencePeriod}
                    onChange={(e) => setReferencePeriod(e.target.value)}
                    placeholder="Ex: Jan/2025"
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Descrição</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={measurementDescription}
                  onChange={(e) => setMeasurementDescription(e.target.value)}
                  placeholder="Descrição da medição..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="input-group">
                <label>Valor Total (R$)</label>
                <input
                  type="number"
                  className="input-field"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateMeasurement(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateMeasurement}
                disabled={measurementModalLoading || !measurementNumber.trim()}
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
            <h3 style={{ marginBottom: '16px' }}>Rejeitar Medição</h3>
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
        <div className="modal-backdrop" onClick={() => setShowCreateClaim(false)}>
          <div className="modal-content" style={{ padding: '24px', width: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>Nova Revindicação</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>Título *</label>
                <input
                  className="input-field"
                  value={claimTitle}
                  onChange={(e) => setClaimTitle(e.target.value)}
                  placeholder="Título da revindicação"
                />
              </div>
              <div className="input-group">
                <label>Descrição *</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  placeholder="Descrição detalhada da revindicação..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Tipo de Revindicação</label>
                  <input
                    className="input-field"
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    placeholder="Ex: Prazo, Custo"
                  />
                </div>
                <div className="input-group">
                  <label>Valor Estimado (R$)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={claimEstimatedValue}
                    onChange={(e) => setClaimEstimatedValue(e.target.value)}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateClaim(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateClaim}
                disabled={claimModalLoading || !claimTitle.trim() || !claimDescription.trim()}
              >
                {claimModalLoading ? <span className="spinner" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

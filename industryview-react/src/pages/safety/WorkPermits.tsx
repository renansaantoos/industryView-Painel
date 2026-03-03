import React, { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../contexts/AppStateContext';
import { workPermitsApi, projectsApi } from '../../services';
import type { WorkPermit, WorkPermitSignature, ProjectInfo, ProjectBacklog } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import SortableHeader from '../../components/common/SortableHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import SearchableSelect from '../../components/common/SearchableSelect';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  StopCircle,
  Flame,
  Zap,
  ArrowUp,
  Wind,
  ShieldCheck,
  FileCheck,
  User,
} from 'lucide-react';

// ── Status colour map ─────────────────────────────────────────────────────────

const STATUS_COLOR_MAP: Record<string, { bg: string; color: string; label: string }> = {
  solicitada: {
    bg: 'var(--color-status-02)',
    color: 'var(--color-warning)',
    label: 'Solicitada',
  },
  aprovada: {
    bg: 'var(--color-status-04)',
    color: 'var(--color-success)',
    label: 'Aprovada',
  },
  ativa: {
    bg: '#e8f0fe',
    color: 'var(--color-primary)',
    label: 'Ativa',
  },
  encerrada: {
    bg: 'var(--color-alternate)',
    color: 'var(--color-secondary-text)',
    label: 'Encerrada',
  },
  cancelada: {
    bg: 'var(--color-status-01)',
    color: 'var(--color-error)',
    label: 'Cancelada',
  },
};

// ── Permit type config ────────────────────────────────────────────────────────

interface PermitTypeConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const PERMIT_TYPE_CONFIG: Record<string, PermitTypeConfig> = {
  pt_geral: {
    label: 'Geral',
    icon: <ShieldCheck size={13} />,
    color: 'var(--color-primary)',
    bg: '#e8f0fe',
  },
  pt_quente: {
    label: 'Trabalho a Quente',
    icon: <Flame size={13} />,
    color: '#d97706',
    bg: '#fef3c7',
  },
  pt_altura: {
    label: 'Trabalho em Altura',
    icon: <ArrowUp size={13} />,
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  pt_confinado: {
    label: 'Espaço Confinado',
    icon: <Wind size={13} />,
    color: '#0891b2',
    bg: '#e0f2fe',
  },
  pt_eletrica: {
    label: 'Elétrica',
    icon: <Zap size={13} />,
    color: '#b45309',
    bg: '#fef9c3',
  },
};

const ROLE_CONFIG: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  solicitante: {
    bg: '#eff6ff',
    color: '#2563eb',
    icon: <User size={12} />,
  },
  aprovador: {
    bg: '#f0fdf4',
    color: '#16a34a',
    icon: <CheckCircle size={12} />,
  },
  cancelamento: {
    bg: '#fef2f2',
    color: '#dc2626',
    icon: <XCircle size={12} />,
  },
  encerramento: {
    bg: '#f8fafc',
    color: '#475569',
    icon: <StopCircle size={12} />,
  },
};

const PERMIT_TYPE_OPTIONS = Object.entries(PERMIT_TYPE_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

// ── Toast interface ───────────────────────────────────────────────────────────

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function WorkPermits() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { projectsInfo, setNavBarSelection } = useAppState();

  // ── List state ──────────────────────────────────────────────────────────────
  const [permits, setPermits] = useState<WorkPermit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // ── Sort state ─────────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') { setSortField(null); setSortDirection(null); }
      else setSortDirection('asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ── Create modal ─────────────────────────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('pt_geral');
  const [createLocation, setCreateLocation] = useState('');
  const [createRiskDescription, setCreateRiskDescription] = useState('');
  const [createControlMeasures, setCreateControlMeasures] = useState('');
  const [createValidFrom, setCreateValidFrom] = useState('');
  const [createValidUntil, setCreateValidUntil] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [createProjectId, setCreateProjectId] = useState<number | ''>('');
  const [createBacklogId, setCreateBacklogId] = useState<number | ''>('');
  const [projectBacklogs, setProjectBacklogs] = useState<ProjectBacklog[]>([]);
  const [backlogsLoading, setBacklogsLoading] = useState(false);

  // ── Projects list for modal dropdown ────────────────────────────────────────
  const [allProjects, setAllProjects] = useState<ProjectInfo[]>([]);

  // ── Cancel modal ──────────────────────────────────────────────────────────────
  const [cancelPermit, setCancelPermit] = useState<WorkPermit | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // ── Approval action loading ───────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // ── Toast ────────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<ToastState | null>(null);

  // Current datetime for min constraint on valid_from
  const nowDateTime = useMemo(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  }, [showCreateModal]);

  const projectMap = useMemo(() => {
    const map: Record<number, string> = {};
    allProjects.forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [allProjects]);

  // Client-side sort
  const sortedPermits = useMemo(() => {
    if (!sortField || !sortDirection) return permits;

    return [...permits].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      if (sortField === 'project') {
        aVal = (projectMap[a.projects_id || 0] || '').toLowerCase();
        bVal = (projectMap[b.projects_id || 0] || '').toLowerCase();
      } else if (sortField === 'id') {
        aVal = a.id;
        bVal = b.id;
      } else if (sortField === 'type') {
        aVal = PERMIT_TYPE_CONFIG[a.permit_type]?.label.toLowerCase() || '';
        bVal = PERMIT_TYPE_CONFIG[b.permit_type]?.label.toLowerCase() || '';
      } else if (sortField === 'location') {
        aVal = (a.location || '').toLowerCase();
        bVal = (b.location || '').toLowerCase();
      } else if (sortField === 'status') {
        aVal = (STATUS_COLOR_MAP[a.status]?.label || '').toLowerCase();
        bVal = (STATUS_COLOR_MAP[b.status]?.label || '').toLowerCase();
      } else if (sortField === 'valid_from') {
        aVal = a.valid_from || '';
        bVal = b.valid_from || '';
      } else if (sortField === 'valid_until') {
        aVal = a.valid_until || '';
        bVal = b.valid_until || '';
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [permits, sortField, sortDirection, projectMap]);

  useEffect(() => {
    setNavBarSelection(17);
  }, []);

  // Load projects for create modal dropdown
  useEffect(() => {
    projectsApi.queryAllProjects({ per_page: 100 }).then((data) => {
      setAllProjects(data.items ?? []);
    }).catch(() => { });
  }, []);

  // Pre-select project when projectsInfo changes
  useEffect(() => {
    if (projectsInfo?.id) setCreateProjectId(projectsInfo.id);
  }, [projectsInfo]);

  // Load backlogs when project selection changes in create modal
  useEffect(() => {
    if (!createProjectId) { setProjectBacklogs([]); setCreateBacklogId(''); return; }
    setBacklogsLoading(true);
    projectsApi.getAllProjectBacklogs(Number(createProjectId))
      .then((data) => setProjectBacklogs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setBacklogsLoading(false));
  }, [createProjectId]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadPermits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await workPermitsApi.listWorkPermits({
        projects_id: projectsInfo?.id,
        company_id: user?.companyId,
        permit_type: filterType || undefined,
        status: filterStatus || undefined,
        page,
        per_page: perPage,
      });
      setPermits(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load work permits:', err);
      showToast(t('common.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, user?.companyId, filterType, filterStatus, page, perPage, showToast, t]);

  useEffect(() => {
    loadPermits();
  }, [loadPermits]);

  const handleToggleExpand = useCallback(
    async (permitId: number) => {
      if (expandedRow === permitId) {
        setExpandedRow(null);
        return;
      }
      setExpandedRow(permitId);
      // Fetch full record with signatures if not already loaded
      const existing = permits.find((p) => p.id === permitId);
      if (existing && !existing.signatures) {
        try {
          const full = await workPermitsApi.getWorkPermit(permitId);
          setPermits((prev) => prev.map((p) => (p.id === permitId ? { ...p, signatures: full.signatures } : p)));
        } catch (err) {
          console.error('Failed to load permit signatures:', err);
        }
      }
    },
    [expandedRow, permits],
  );

  const validateCreateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!createProjectId) errors.project = t('workPermits.projectRequired');
    if (!createLocation.trim()) errors.location = t('workPermits.locationRequired');
    if (!createRiskDescription.trim()) errors.riskDescription = t('workPermits.riskDescriptionRequired');
    if (!createControlMeasures.trim()) errors.controlMeasures = t('workPermits.controlMeasuresRequired');
    if (!createValidUntil) errors.validUntil = 'A data de vencimento é obrigatória';
    if (createValidFrom && createValidUntil && createValidUntil <= createValidFrom) {
      errors.validUntil = 'O vencimento deve ser posterior ao início';
    }
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreatePermit = async () => {
    if (!validateCreateForm()) return;
    setCreateLoading(true);
    try {
      await workPermitsApi.createWorkPermit({
        permit_type: createType as WorkPermit['permit_type'],
        location: createLocation.trim(),
        risk_description: createRiskDescription.trim(),
        control_measures: createControlMeasures.trim(),
        valid_from: createValidFrom || undefined,
        valid_until: createValidUntil || undefined,
        projects_id: Number(createProjectId),
        company_id: user?.companyId,
        projects_backlogs_id: createBacklogId ? Number(createBacklogId) : undefined,
      });
      setCreateLocation('');
      setCreateRiskDescription('');
      setCreateControlMeasures('');
      setCreateValidFrom('');
      setCreateValidUntil('');
      setCreateType('pt_geral');
      setCreateBacklogId('');
      setCreateErrors({});
      setShowCreateModal(false);
      showToast(t('workPermits.createSuccess'), 'success');
      loadPermits();
    } catch (err) {
      console.error('Failed to create work permit:', err);
      showToast(t('common.errorSaving'), 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleApprove = async (permit: WorkPermit) => {
    setActionLoading(permit.id);
    try {
      await workPermitsApi.approveWorkPermit(permit.id);
      showToast(t('workPermits.approveSuccess'), 'success');
      loadPermits();
    } catch (err) {
      console.error('Failed to approve permit:', err);
      showToast(t('common.errorSaving'), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async (permit: WorkPermit) => {
    setActionLoading(permit.id);
    try {
      await workPermitsApi.closeWorkPermit(permit.id);
      showToast(t('workPermits.closeSuccess'), 'success');
      loadPermits();
    } catch (err) {
      console.error('Failed to close permit:', err);
      showToast(t('common.errorSaving'), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelPermit) return;
    setCancelLoading(true);
    try {
      await workPermitsApi.cancelWorkPermit(cancelPermit.id, {
        cancellation_reason: cancelReason.trim() || undefined,
      });
      setCancelPermit(null);
      setCancelReason('');
      showToast(t('workPermits.cancelSuccess'), 'success');
      loadPermits();
    } catch (err) {
      console.error('Failed to cancel permit:', err);
      showToast(t('common.errorSaving'), 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const [datePart, timePart] = dateStr.split('T');
      const [year, month, day] = datePart.split('-');
      const time = timePart ? timePart.slice(0, 5) : '';
      return time ? `${day}/${month}/${year} ${time}` : `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const isActionLoading = (id: number) => actionLoading === id;

  return (
    <div>
      <PageHeader
        title={t('workPermits.title')}
        subtitle={t('workPermits.subtitle')}
        actions={
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> {t('workPermits.newPermit')}
          </button>
        }
      />

      <ProjectFilterDropdown />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="input-group" style={{ margin: 0, minWidth: '200px' }}>
          <SearchableSelect
            options={PERMIT_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
            value={filterType || undefined}
            onChange={(val) => { setFilterType(String(val ?? '')); setPage(1); }}
            placeholder={t('workPermits.allTypes')}
            allowClear
            style={{ minWidth: '200px' }}
          />
        </div>
        <div className="input-group" style={{ margin: 0, minWidth: '200px' }}>
          <SearchableSelect
            options={Object.entries(STATUS_COLOR_MAP).map(([value, cfg]) => ({ value, label: cfg.label }))}
            value={filterStatus || undefined}
            onChange={(val) => { setFilterStatus(String(val ?? '')); setPage(1); }}
            placeholder={t('workPermits.allStatuses')}
            allowClear
            style={{ minWidth: '200px' }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : permits.length === 0 ? (
        <EmptyState
          message={t('common.noData')}
          action={
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> {t('workPermits.newPermit')}
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '36px' }} />
                <SortableHeader label={t('common.project')} field="project" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label="ID" field="id" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('workPermits.type')} field="type" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('workPermits.location')} field="location" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('workPermits.status')} field="status" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('workPermits.validFrom')} field="valid_from" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('workPermits.validUntil')} field="valid_until" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody key={sortedPermits.map(p => p.id).join()} variants={staggerParent} initial="initial" animate="animate">
              {sortedPermits.map((permit) => {
                const typeCfg = PERMIT_TYPE_CONFIG[permit.permit_type] ?? PERMIT_TYPE_CONFIG.pt_geral;
                const isLoadingAction = isActionLoading(permit.id);

                return (
                  <Fragment key={permit.id}>
                    <motion.tr variants={tableRowVariants}>
                      {/* Expand toggle */}
                      <td>
                        <button
                          className="btn btn-icon"
                          onClick={() => handleToggleExpand(permit.id)}
                          style={{ padding: '2px' }}
                        >
                          {expandedRow === permit.id ? (
                            <ChevronDown size={16} color="var(--color-primary)" />
                          ) : (
                            <ChevronRight size={16} color="var(--color-secondary-text)" />
                          )}
                        </button>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--color-secondary-text)', fontWeight: 500 }}>
                        {projectMap[permit.projects_id || 0] || '-'}
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--color-secondary-text)', fontWeight: 500 }}>
                        #{permit.id}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: typeCfg.bg,
                            color: typeCfg.color,
                          }}
                        >
                          {typeCfg.icon}
                          {typeCfg.label}
                        </span>
                      </td>
                      <td style={{ maxWidth: '180px' }}>
                        <span
                          style={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '13px',
                          }}
                          title={permit.location}
                        >
                          {permit.location}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={permit.status} colorMap={STATUS_COLOR_MAP} />
                        {permit.cancellation_reason && (
                          <div
                            style={{
                              fontSize: '11px',
                              color: 'var(--color-error)',
                              marginTop: '3px',
                              maxWidth: '130px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={permit.cancellation_reason}
                          >
                            ✕ {permit.cancellation_reason}
                          </div>
                        )}
                        {permit.renewal_reason && (
                          <div
                            style={{
                              fontSize: '11px',
                              color: 'var(--color-warning)',
                              marginTop: '3px',
                              maxWidth: '130px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={permit.renewal_reason}
                          >
                            ↻ {permit.renewal_reason}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {formatDateTime(permit.valid_from)}
                      </td>
                      <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {formatDateTime(permit.valid_until)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
                          {/* Approve – only when solicitada */}
                          {permit.status === 'solicitada' && (
                            <button
                              className="btn btn-icon"
                              title={t('workPermits.approve')}
                              onClick={() => handleApprove(permit)}
                              disabled={isLoadingAction}
                            >
                              {isLoadingAction ? (
                                <span className="spinner" style={{ width: 14, height: 14 }} />
                              ) : (
                                <CheckCircle size={16} color="var(--color-success)" />
                              )}
                            </button>
                          )}

                          {/* Close – only when ativa */}
                          {permit.status === 'ativa' && (
                            <button
                              className="btn btn-icon"
                              title={t('workPermits.close')}
                              onClick={() => handleClose(permit)}
                              disabled={isLoadingAction}
                            >
                              {isLoadingAction ? (
                                <span className="spinner" style={{ width: 14, height: 14 }} />
                              ) : (
                                <StopCircle size={16} color="var(--color-secondary-text)" />
                              )}
                            </button>
                          )}

                          {/* Cancel – when solicitada or aprovada or ativa */}
                          {['solicitada', 'aprovada', 'ativa'].includes(permit.status) && (
                            <button
                              className="btn btn-icon"
                              title={t('workPermits.cancel')}
                              onClick={() => setCancelPermit(permit)}
                              disabled={isLoadingAction}
                            >
                              <XCircle size={16} color="var(--color-error)" />
                            </button>
                          )}

                          {/* View signatures icon (always visible) */}
                          <button
                            className="btn btn-icon"
                            title={t('workPermits.viewSignatures')}
                            onClick={() => handleToggleExpand(permit.id)}
                          >
                            <FileCheck size={16} color="var(--color-primary)" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expanded signatures row */}
                    {expandedRow === permit.id && (
                      <tr key={`${permit.id}-expanded`}>
                        <td
                          colSpan={9}
                          style={{ padding: '0', backgroundColor: 'var(--color-primary-bg)' }}
                        >
                          <div
                            style={{
                              padding: '16px 24px',
                              borderTop: '1px solid var(--color-alternate)',
                            }}
                          >
                            {/* Permit details */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '12px',
                                marginBottom: '16px',
                              }}
                            >
                              <div>
                                <p
                                  style={{
                                    fontSize: '11px',
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '4px',
                                  }}
                                >
                                  {t('workPermits.riskDescription')}
                                </p>
                                <p style={{ fontSize: '13px', color: 'var(--color-primary-text)' }}>
                                  {permit.risk_description || '-'}
                                </p>
                              </div>
                              <div>
                                <p
                                  style={{
                                    fontSize: '11px',
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '4px',
                                  }}
                                >
                                  {t('workPermits.controlMeasures')}
                                </p>
                                <p style={{ fontSize: '13px', color: 'var(--color-primary-text)' }}>
                                  {permit.control_measures || '-'}
                                </p>
                              </div>
                              {permit.cancellation_reason && (
                                <div>
                                  <p
                                    style={{
                                      fontSize: '11px',
                                      color: 'var(--color-error)',
                                      fontWeight: 600,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em',
                                      marginBottom: '4px',
                                    }}
                                  >
                                    {t('workPermits.cancellationReason')}
                                  </p>
                                  <p style={{ fontSize: '13px', color: 'var(--color-error)' }}>
                                    {permit.cancellation_reason}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Signatures */}
                            <p
                              style={{
                                fontWeight: 600,
                                fontSize: '13px',
                                color: 'var(--color-primary-text)',
                                marginBottom: '10px',
                              }}
                            >
                              {t('workPermits.signatures')}
                            </p>
                            {!permit.signatures ? (
                              <LoadingSpinner />
                            ) : permit.signatures.length === 0 ? (
                              <p
                                style={{
                                  fontSize: '13px',
                                  color: 'var(--color-secondary-text)',
                                  fontStyle: 'italic',
                                }}
                              >
                                {t('workPermits.noSignatures')}
                              </p>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {permit.signatures.map((sig: WorkPermitSignature) => {
                                  const role = (sig.role || '').toLowerCase();
                                  const cfg = ROLE_CONFIG[role] || {
                                    bg: 'var(--color-status-04)',
                                    color: 'var(--color-success)',
                                    icon: <CheckCircle size={12} />,
                                  };

                                  return (
                                    <div
                                      key={sig.id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '5px 14px',
                                        borderRadius: '24px',
                                        backgroundColor: cfg.bg,
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        color: cfg.color,
                                        border: `1px solid ${cfg.color}20`,
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                      }}
                                    >
                                      {cfg.icon}
                                      <span style={{ fontWeight: 600 }}>
                                        {sig.user_name || (sig as any).user?.name || `ID ${sig.users_id}`}
                                      </span>
                                      {sig.role && (
                                        <span
                                          style={{
                                            fontSize: '11px',
                                            opacity: 0.8,
                                            marginLeft: '2px',
                                            textTransform: 'lowercase',
                                          }}
                                        >
                                          · {sig.role}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
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

      {/* Create Permit Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => { setShowCreateModal(false); setCreateErrors({}); setCreateBacklogId(''); }}>
          <div
            className="modal-content"
            style={{ padding: '24px', width: '540px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
              {t('workPermits.newPermit')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label>{t('common.project')} *</label>
                <SearchableSelect
                  options={allProjects.map((p) => ({ value: p.id, label: p.name }))}
                  value={createProjectId || undefined}
                  onChange={(val) => {
                    setCreateProjectId(val !== undefined ? Number(val) : '');
                    if (createErrors.project) setCreateErrors((prev) => { const newErrors = { ...prev }; delete newErrors.project; return newErrors; });
                  }}
                  placeholder={t('workPermits.selectProject')}
                  allowClear
                  style={createErrors.project ? { border: '1px solid var(--color-error)', borderRadius: '6px' } : {}}
                />
                {createErrors.project && <span className="input-error">{createErrors.project}</span>}
              </div>
              <div className="input-group">
                <label>{t('workPermits.type')} *</label>
                <SearchableSelect
                  options={PERMIT_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                  value={createType}
                  onChange={(val) => setCreateType(String(val ?? ''))}
                />
              </div>
              <div className="input-group">
                <label>Tarefa vinculada</label>
                <SearchableSelect
                  options={projectBacklogs.map((b) => ({ value: b.id, label: b.name || b.description || `#${b.id}` }))}
                  value={createBacklogId || undefined}
                  onChange={(val) => setCreateBacklogId(val !== undefined ? Number(val) : '')}
                  placeholder={backlogsLoading ? 'Carregando tarefas...' : (createProjectId ? 'Selecione uma tarefa (opcional)...' : 'Selecione um projeto primeiro')}
                  allowClear
                />
              </div>
              <div className="input-group">
                <label>{t('workPermits.location')} *</label>
                <input
                  className={`input-field${createErrors.location ? ' error' : ''}`}
                  value={createLocation}
                  onChange={(e) => {
                    setCreateLocation(e.target.value);
                    if (createErrors.location) setCreateErrors((prev) => { const newErrors = { ...prev }; delete newErrors.location; return newErrors; });
                  }}
                  placeholder={t('workPermits.locationPlaceholder')}
                />
                {createErrors.location && <span className="input-error">{createErrors.location}</span>}
              </div>
              <div className="input-group">
                <label>{t('workPermits.riskDescription')} *</label>
                <textarea
                  className={`input-field${createErrors.riskDescription ? ' error' : ''}`}
                  value={createRiskDescription}
                  onChange={(e) => {
                    setCreateRiskDescription(e.target.value);
                    if (createErrors.riskDescription) setCreateErrors((prev) => { const newErrors = { ...prev }; delete newErrors.riskDescription; return newErrors; });
                  }}
                  placeholder={t('workPermits.riskDescriptionPlaceholder')}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
                {createErrors.riskDescription && <span className="input-error">{createErrors.riskDescription}</span>}
              </div>
              <div className="input-group">
                <label>{t('workPermits.controlMeasures')} *</label>
                <textarea
                  className={`input-field${createErrors.controlMeasures ? ' error' : ''}`}
                  value={createControlMeasures}
                  onChange={(e) => {
                    setCreateControlMeasures(e.target.value);
                    if (createErrors.controlMeasures) setCreateErrors((prev) => { const newErrors = { ...prev }; delete newErrors.controlMeasures; return newErrors; });
                  }}
                  placeholder={t('workPermits.controlMeasuresPlaceholder')}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
                {createErrors.controlMeasures && <span className="input-error">{createErrors.controlMeasures}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>{t('workPermits.validFrom')}</label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={createValidFrom}
                    min={nowDateTime}
                    onChange={(e) => {
                      setCreateValidFrom(e.target.value);
                      if (createValidUntil && createValidUntil <= e.target.value) {
                        setCreateValidUntil('');
                      }
                    }}
                  />
                </div>
                <div className="input-group">
                  <label>{t('workPermits.validUntil')} *</label>
                  <input
                    type="datetime-local"
                    className={`input-field${createErrors.validUntil ? ' error' : ''}`}
                    value={createValidUntil}
                    min={createValidFrom || nowDateTime}
                    onChange={(e) => {
                      setCreateValidUntil(e.target.value);
                      if (createErrors.validUntil) setCreateErrors((prev) => { const n = { ...prev }; delete n.validUntil; return n; });
                    }}
                  />
                  {createErrors.validUntil && <span className="input-error">{createErrors.validUntil}</span>}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => { setShowCreateModal(false); setCreateErrors({}); setCreateBacklogId(''); }}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreatePermit}
                disabled={createLoading}
              >
                {createLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Permit Modal */}
      {cancelPermit && (
        <div className="modal-backdrop" onClick={() => setCancelPermit(null)}>
          <div
            className="modal-content"
            style={{ padding: '24px', width: '420px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              {t('workPermits.cancelPermit')}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '20px' }}>
              {t('workPermits.cancelConfirmMessage', { id: cancelPermit.id })}
            </p>
            <div className="input-group">
              <label>{t('workPermits.cancellationReason')}</label>
              <textarea
                className="input-field"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t('workPermits.cancellationReasonPlaceholder')}
                rows={3}
                style={{ resize: 'vertical' }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setCancelPermit(null)}>
                {t('common.back')}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? <span className="spinner" /> : t('workPermits.confirmCancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 2000,
            padding: '12px 20px',
            borderRadius: '8px',
            background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeIn 0.2s ease',
            maxWidth: '360px',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { safetyApi } from '../../services';
import type { SafetyIncident, SafetyIncidentStatistics } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Plus,
  Search,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield,
  FileText,
  Users,
  Paperclip,
  FlaskConical,
  X,
} from 'lucide-react';

// ── Severity configuration ───────────────────────────────────────────────────

type Severity = SafetyIncident['severity'];
type Status = SafetyIncident['status'];

const SEVERITY_CONFIG: Record<Severity, { bg: string; color: string; label: string }> = {
  quase_acidente: { bg: '#F0F0F0', color: '#555555', label: '' },
  leve: { bg: '#EEF4FF', color: '#1D5CC6', label: '' },
  moderado: { bg: '#FFF9E6', color: '#B98E00', label: '' },
  grave: { bg: '#FFF0E6', color: '#C25B00', label: '' },
  fatal: { bg: '#FDE8E8', color: '#C0392B', label: '' },
};

const STATUS_CONFIG: Record<Status, { bg: string; color: string; label: string }> = {
  aberto: { bg: '#FDE8E8', color: '#C0392B', label: '' },
  em_investigacao: { bg: '#FFF9E6', color: '#B98E00', label: '' },
  encerrado: { bg: '#F4FEF9', color: '#028F58', label: '' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

// ── Stats Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  bg: string;
  color: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, bg, color, icon }: StatCardProps) {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        flex: '1',
        minWidth: '140px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-primary-text)' }}>
          {value}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', lineHeight: 1.3 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ── SeverityBadge / StatusBadge inline ───────────────────────────────────────

function SeverityBadge({ severity, label }: { severity: Severity; label: string }) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <span className="badge" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {label}
    </span>
  );
}

function StatusBadge({ status, label }: { status: Status; label: string }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="badge" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {label}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SafetyIncidents() {
  const { t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();
  const { user } = useAuthContext();

  // List state
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Statistics
  const [stats, setStats] = useState<SafetyIncidentStatistics | null>(null);

  // Expanded rows
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formSeverity, setFormSeverity] = useState<Severity>('leve');
  const [formClassification, setFormClassification] = useState('');
  const [formCategory, setFormCategory] = useState('');

  // Investigate modal
  const [investigateTarget, setInvestigateTarget] = useState<SafetyIncident | null>(null);
  const [investigateRootCause, setInvestigateRootCause] = useState('');
  const [investigateActions, setInvestigateActions] = useState('');
  const [investigateLoading, setInvestigateLoading] = useState(false);

  // Close modal
  const [closeTarget, setCloseTarget] = useState<SafetyIncident | null>(null);
  const [closeRootCause, setCloseRootCause] = useState('');
  const [closeActions, setCloseActions] = useState('');
  const [closeLoading, setCloseLoading] = useState(false);

  // Translated labels derived once per render
  const severityLabel: Record<Severity, string> = {
    quase_acidente: t('safety.nearMiss'),
    leve: t('safety.minor'),
    moderado: t('safety.moderate'),
    grave: t('safety.serious'),
    fatal: t('safety.fatal'),
  };

  const statusLabel: Record<Status, string> = {
    aberto: t('safety.open'),
    em_investigacao: t('safety.investigating'),
    encerrado: t('safety.closed'),
  };

  useEffect(() => {
    setNavBarSelection(14);
  }, []);

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof safetyApi.listIncidents>[0] = {
        page,
        per_page: perPage,
        severity: filterSeverity || undefined,
        status: filterStatus || undefined,
        initial_date: dateFrom || undefined,
        final_date: dateTo || undefined,
      };
      if (projectsInfo?.id) {
        params.projects_id = projectsInfo.id;
      }
      const data = await safetyApi.listIncidents(params);
      setIncidents(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, page, perPage, filterSeverity, filterStatus, dateFrom, dateTo]);

  const loadStats = useCallback(async () => {
    try {
      const params: Parameters<typeof safetyApi.getIncidentStatistics>[0] = {};
      if (projectsInfo?.id) {
        params.projects_id = projectsInfo.id;
      }
      const data = await safetyApi.getIncidentStatistics(params);
      setStats(data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  }, [projectsInfo]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const resetCreateForm = () => {
    setFormDate('');
    setFormDescription('');
    setFormLocation('');
    setFormSeverity('leve');
    setFormClassification('');
    setFormCategory('');
  };

  const handleCreateIncident = async () => {
    if (!formDate || !formDescription.trim() || !user) return;
    setCreateLoading(true);
    try {
      const payload: Parameters<typeof safetyApi.createIncident>[0] = {
        reported_by: user.id,
        incident_date: formDate,
        description: formDescription.trim(),
        location: formLocation.trim() || undefined,
        severity: formSeverity,
      };
      if (projectsInfo?.id) {
        payload.projects_id = projectsInfo.id;
      }
      await safetyApi.createIncident(payload);
      resetCreateForm();
      setShowCreateModal(false);
      loadIncidents();
      loadStats();
    } catch (err) {
      console.error('Failed to create incident:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInvestigate = async () => {
    if (!investigateTarget) return;
    setInvestigateLoading(true);
    try {
      await safetyApi.investigateIncident(investigateTarget.id, {
        root_cause: investigateRootCause.trim() || undefined,
        corrective_actions: investigateActions.trim() || undefined,
      });
      setInvestigateTarget(null);
      setInvestigateRootCause('');
      setInvestigateActions('');
      loadIncidents();
    } catch (err) {
      console.error('Failed to investigate incident:', err);
    } finally {
      setInvestigateLoading(false);
    }
  };

  const handleClose = async () => {
    if (!closeTarget || !closeRootCause.trim() || !closeActions.trim()) return;
    setCloseLoading(true);
    try {
      await safetyApi.closeIncident(closeTarget.id, {
        root_cause: closeRootCause.trim(),
        corrective_actions: closeActions.trim(),
      });
      setCloseTarget(null);
      setCloseRootCause('');
      setCloseActions('');
      loadIncidents();
    } catch (err) {
      console.error('Failed to close incident:', err);
    } finally {
      setCloseLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await safetyApi.updateIncident(id, { deleted: true });
      loadIncidents();
      loadStats();
    } catch (err) {
      console.error('Failed to delete incident:', err);
    }
    setDeleteConfirm(null);
  };

  const toggleExpandedRow = (id: number) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const handleFilterChange = () => {
    setPage(1);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title={t('safety.incidents')}
        subtitle={t('safety.incidentsSubtitle')}
        breadcrumb={
          projectsInfo
            ? `${t('nav.ssma')} / ${projectsInfo.name} / ${t('safety.incidents')}`
            : `${t('nav.ssma')} / ${t('safety.incidents')}`
        }
        actions={
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> {t('safety.createIncident')}
          </button>
        }
      />

      <ProjectFilterDropdown />

      {/* Stats - Bird Pyramid style */}
      {stats && (
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <StatCard
            label={t('common.total')}
            value={stats.total}
            bg="var(--color-tertiary-bg)"
            color="var(--color-primary)"
            icon={<Shield size={20} />}
          />
          <StatCard
            label={severityLabel.quase_acidente}
            value={stats.by_severity?.quase_acidente ?? 0}
            bg="#F0F0F0"
            color="#555555"
            icon={<AlertTriangle size={20} />}
          />
          <StatCard
            label={severityLabel.leve}
            value={stats.by_severity?.leve ?? 0}
            bg="#EEF4FF"
            color="#1D5CC6"
            icon={<AlertTriangle size={20} />}
          />
          <StatCard
            label={severityLabel.moderado}
            value={stats.by_severity?.moderado ?? 0}
            bg="#FFF9E6"
            color="#B98E00"
            icon={<AlertTriangle size={20} />}
          />
          <StatCard
            label={severityLabel.grave}
            value={stats.by_severity?.grave ?? 0}
            bg="#FFF0E6"
            color="#C25B00"
            icon={<AlertTriangle size={20} />}
          />
          <StatCard
            label={severityLabel.fatal}
            value={stats.by_severity?.fatal ?? 0}
            bg="#FDE8E8"
            color="#C0392B"
            icon={<AlertTriangle size={20} />}
          />
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{ flex: 1, minWidth: '200px', maxWidth: '340px', position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-secondary-text)',
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder={t('safety.searchIncidents')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '32px' }}
          />
        </div>

        {/* Severity filter */}
        <select
          className="select-field"
          style={{ maxWidth: '180px' }}
          value={filterSeverity}
          onChange={(e) => {
            setFilterSeverity(e.target.value);
            handleFilterChange();
          }}
        >
          <option value="">{t('common.severity')} — {t('common.filter')}</option>
          <option value="quase_acidente">{severityLabel.quase_acidente}</option>
          <option value="leve">{severityLabel.leve}</option>
          <option value="moderado">{severityLabel.moderado}</option>
          <option value="grave">{severityLabel.grave}</option>
          <option value="fatal">{severityLabel.fatal}</option>
        </select>

        {/* Status filter */}
        <select
          className="select-field"
          style={{ maxWidth: '180px' }}
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            handleFilterChange();
          }}
        >
          <option value="">{t('common.status')} — {t('common.filter')}</option>
          <option value="aberto">{statusLabel.aberto}</option>
          <option value="em_investigacao">{statusLabel.em_investigacao}</option>
          <option value="encerrado">{statusLabel.encerrado}</option>
        </select>

        {/* Date range */}
        <input
          type="date"
          className="input-field"
          style={{ maxWidth: '150px' }}
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            handleFilterChange();
          }}
          title={t('common.from')}
        />
        <input
          type="date"
          className="input-field"
          style={{ maxWidth: '150px' }}
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            handleFilterChange();
          }}
          title={t('common.to')}
        />

        {/* Clear filters */}
        {(filterSeverity || filterStatus || dateFrom || dateTo) && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setFilterSeverity('');
              setFilterStatus('');
              setDateFrom('');
              setDateTo('');
              setPage(1);
            }}
          >
            <X size={14} /> {t('common.clear')}
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : incidents.length === 0 ? (
        <EmptyState
          message={t('common.noData')}
          action={
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> {t('safety.createIncident')}
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '36px' }} />
                <th>{t('common.date')}</th>
                <th>{t('common.description')}</th>
                <th>{t('safety.severity')}</th>
                <th>{t('safety.classification')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {incidents
                .filter(
                  (inc) =>
                    !search ||
                    inc.description.toLowerCase().includes(search.toLowerCase()) ||
                    (inc.location || '').toLowerCase().includes(search.toLowerCase()) ||
                    (inc.classification || '').toLowerCase().includes(search.toLowerCase()),
                )
                .map((incident) => (
                  <>
                    <motion.tr key={incident.id} variants={tableRowVariants}>
                      {/* Expand toggle */}
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button
                          className="btn btn-icon"
                          onClick={() => toggleExpandedRow(incident.id)}
                          title={
                            expandedRow === incident.id ? t('common.details') : t('common.details')
                          }
                        >
                          {expandedRow === incident.id ? (
                            <ChevronUp size={14} color="var(--color-secondary-text)" />
                          ) : (
                            <ChevronDown size={14} color="var(--color-secondary-text)" />
                          )}
                        </button>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {formatDate(incident.incident_date)}
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                          }}
                        >
                          <AlertTriangle
                            size={15}
                            color={SEVERITY_CONFIG[incident.severity].color}
                            style={{ flexShrink: 0, marginTop: '2px' }}
                          />
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '240px',
                              display: 'inline-block',
                            }}
                          >
                            {incident.description}
                          </span>
                        </div>
                        {incident.location && (
                          <div
                            style={{
                              fontSize: '11px',
                              color: 'var(--color-secondary-text)',
                              marginTop: '2px',
                              paddingLeft: '23px',
                            }}
                          >
                            {incident.location}
                          </div>
                        )}
                      </td>
                      <td>
                        <SeverityBadge
                          severity={incident.severity}
                          label={severityLabel[incident.severity]}
                        />
                      </td>
                      <td>{incident.classification || '-'}</td>
                      <td>
                        <StatusBadge
                          status={incident.status}
                          label={statusLabel[incident.status]}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {incident.status === 'aberto' && (
                            <button
                              className="btn btn-icon"
                              title={t('safety.investigate')}
                              onClick={() => {
                                setInvestigateTarget(incident);
                                setInvestigateRootCause(incident.root_cause || '');
                                setInvestigateActions(incident.corrective_actions || '');
                              }}
                            >
                              <FlaskConical size={15} color="var(--color-warning)" />
                            </button>
                          )}
                          {incident.status === 'em_investigacao' && (
                            <button
                              className="btn btn-icon"
                              title={t('safety.closeIncident')}
                              onClick={() => {
                                setCloseTarget(incident);
                                setCloseRootCause(incident.root_cause || '');
                                setCloseActions(incident.corrective_actions || '');
                              }}
                            >
                              <Shield size={15} color="var(--color-success)" />
                            </button>
                          )}
                          <button
                            className="btn btn-icon"
                            title={t('common.delete')}
                            onClick={() => setDeleteConfirm(incident.id)}
                          >
                            <Trash2 size={15} color="var(--color-error)" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expandable detail row */}
                    {expandedRow === incident.id && (
                      <tr key={`${incident.id}-expanded`}>
                        <td colSpan={7} style={{ padding: 0, borderBottom: '2px solid var(--color-alternate)' }}>
                          <div
                            style={{
                              padding: '16px 24px',
                              background: 'var(--color-secondary)',
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                              gap: '16px',
                            }}
                          >
                            {/* Root cause & actions */}
                            {incident.root_cause && (
                              <div>
                                <div
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--color-secondary-text)',
                                    marginBottom: '4px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                  }}
                                >
                                  {t('safety.rootCause')}
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--color-primary-text)' }}>
                                  {incident.root_cause}
                                </p>
                              </div>
                            )}
                            {incident.corrective_actions && (
                              <div>
                                <div
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--color-secondary-text)',
                                    marginBottom: '4px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                  }}
                                >
                                  {t('safety.correctiveActions')}
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--color-primary-text)' }}>
                                  {incident.corrective_actions}
                                </p>
                              </div>
                            )}

                            {/* Witnesses */}
                            <div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: 'var(--color-secondary-text)',
                                  marginBottom: '6px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                }}
                              >
                                <Users size={13} />
                                {t('common.witnesses')}
                              </div>
                              {incident.witnesses && incident.witnesses.length > 0 ? (
                                incident.witnesses.map((w) => (
                                  <div
                                    key={w.id}
                                    style={{ fontSize: '13px', color: 'var(--color-primary-text)' }}
                                  >
                                    {w.user_name || `ID ${w.users_id}`}
                                    {w.statement && (
                                      <span style={{ color: 'var(--color-secondary-text)' }}>
                                        {' — '}{w.statement}
                                      </span>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <span
                                  style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}
                                >
                                  {t('common.witnesses')} —
                                </span>
                              )}
                            </div>

                            {/* Attachments */}
                            <div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: 'var(--color-secondary-text)',
                                  marginBottom: '6px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                }}
                              >
                                <Paperclip size={13} />
                                {t('common.attachments')}
                              </div>
                              {incident.attachments && incident.attachments.length > 0 ? (
                                incident.attachments.map((att) => (
                                  <div key={att.id} style={{ fontSize: '13px' }}>
                                    <a
                                      href={att.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: 'var(--color-primary)' }}
                                    >
                                      <FileText size={12} style={{ marginRight: '4px' }} />
                                      {att.file_name || att.file_url}
                                    </a>
                                  </div>
                                ))
                              ) : (
                                <span
                                  style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}
                                >
                                  {t('common.attachments')} —
                                </span>
                              )}
                            </div>

                            {/* Reporter & timestamps */}
                            <div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: 'var(--color-secondary-text)',
                                  marginBottom: '4px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                }}
                              >
                                {t('safety.reportedBy')}
                              </div>
                              <p style={{ fontSize: '13px', color: 'var(--color-primary-text)' }}>
                                {incident.reporter_name || `ID ${incident.reported_by}`}
                              </p>
                              {incident.investigated_at && (
                                <p
                                  style={{
                                    fontSize: '12px',
                                    color: 'var(--color-secondary-text)',
                                    marginTop: '4px',
                                  }}
                                >
                                  {t('safety.investigating')}: {formatDate(incident.investigated_at)}
                                </p>
                              )}
                              {incident.closed_at && (
                                <p
                                  style={{
                                    fontSize: '12px',
                                    color: 'var(--color-secondary-text)',
                                    marginTop: '4px',
                                  }}
                                >
                                  {t('safety.closed')}: {formatDate(incident.closed_at)}
                                </p>
                              )}
                            </div>
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
            onPerPageChange={(pp) => {
              setPerPage(pp);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* ── Create Incident Modal ──────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', width: '480px' }}
          >
            <h3 style={{ marginBottom: '16px' }}>{t('safety.createIncident')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>{t('safety.incidentDate')} *</label>
                <input
                  type="date"
                  className="input-field"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>{t('common.description')} *</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={t('common.description')}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="input-group">
                <label>{t('common.location')}</label>
                <input
                  className="input-field"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder={t('common.location')}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>{t('safety.severity')} *</label>
                  <select
                    className="select-field"
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as Severity)}
                  >
                    <option value="quase_acidente">{severityLabel.quase_acidente}</option>
                    <option value="leve">{severityLabel.leve}</option>
                    <option value="moderado">{severityLabel.moderado}</option>
                    <option value="grave">{severityLabel.grave}</option>
                    <option value="fatal">{severityLabel.fatal}</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>{t('safety.classification')}</label>
                  <input
                    className="input-field"
                    value={formClassification}
                    onChange={(e) => setFormClassification(e.target.value)}
                    placeholder={t('safety.classification')}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>{t('safety.category')}</label>
                <input
                  className="input-field"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder={t('safety.category')}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateIncident}
                disabled={createLoading || !formDate || !formDescription.trim()}
              >
                {createLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Investigate Modal ─────────────────────────────────────────────── */}
      {investigateTarget && (
        <div className="modal-backdrop" onClick={() => setInvestigateTarget(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', width: '480px' }}
          >
            <h3 style={{ marginBottom: '8px' }}>{t('safety.investigate')}</h3>
            <p style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
              {investigateTarget.description}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>{t('safety.rootCause')}</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={investigateRootCause}
                  onChange={(e) => setInvestigateRootCause(e.target.value)}
                  placeholder={t('safety.rootCause')}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="input-group">
                <label>{t('safety.correctiveActions')}</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={investigateActions}
                  onChange={(e) => setInvestigateActions(e.target.value)}
                  placeholder={t('safety.correctiveActions')}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setInvestigateTarget(null)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleInvestigate}
                disabled={investigateLoading}
              >
                {investigateLoading ? <span className="spinner" /> : t('safety.investigate')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Close Incident Modal ───────────────────────────────────────────── */}
      {closeTarget && (
        <div className="modal-backdrop" onClick={() => setCloseTarget(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', width: '480px' }}
          >
            <h3 style={{ marginBottom: '8px' }}>{t('safety.closeIncident')}</h3>
            <p style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
              {closeTarget.description}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>{t('safety.rootCause')} *</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={closeRootCause}
                  onChange={(e) => setCloseRootCause(e.target.value)}
                  placeholder={t('safety.rootCause')}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="input-group">
                <label>{t('safety.correctiveActions')} *</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={closeActions}
                  onChange={(e) => setCloseActions(e.target.value)}
                  placeholder={t('safety.correctiveActions')}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setCloseTarget(null)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleClose}
                disabled={
                  closeLoading || !closeRootCause.trim() || !closeActions.trim()
                }
              >
                {closeLoading ? <span className="spinner" /> : t('safety.closeIncident')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ────────────────────────────────────────────────── */}
      {deleteConfirm !== null && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('safety.confirmDelete')}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

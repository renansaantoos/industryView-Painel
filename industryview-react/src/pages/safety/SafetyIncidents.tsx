import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { safetyApi, projectsApi, usersApi } from '../../services';
import type { SafetyIncident, SafetyIncidentStatistics, ProjectInfo, UserListItem } from '../../types';
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

type Classification = SafetyIncident['classification'];

const SEVERITY_CONFIG: Record<Severity, { bg: string; color: string; label: string }> = {
  quase_acidente: { bg: '#F0F0F0', color: '#555555', label: '' },
  primeiros_socorros: { bg: '#EEF4FF', color: '#1D5CC6', label: '' },
  sem_afastamento: { bg: '#FFF9E6', color: '#B98E00', label: '' },
  com_afastamento: { bg: '#FFF0E6', color: '#C25B00', label: '' },
  fatal: { bg: '#FDE8E8', color: '#C0392B', label: '' },
};

const STATUS_CONFIG: Record<Status, { bg: string; color: string; label: string }> = {
  registrado: { bg: '#FDE8E8', color: '#C0392B', label: '' },
  em_investigacao: { bg: '#FFF9E6', color: '#B98E00', label: '' },
  investigado: { bg: '#E8F0FE', color: '#1D5CC6', label: '' },
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
  const [expandedDetail, setExpandedDetail] = useState<SafetyIncident | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add witness inline form
  const [showWitnessForm, setShowWitnessForm] = useState(false);
  const [witnessName, setWitnessName] = useState('');
  const [witnessStatement, setWitnessStatement] = useState('');
  const [witnessLoading, setWitnessLoading] = useState(false);

  // Add attachment inline form
  const [showAttachmentForm, setShowAttachmentForm] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentLoading, setAttachmentLoading] = useState(false);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Projects list for modal dropdown
  const [allProjects, setAllProjects] = useState<ProjectInfo[]>([]);
  // Users list for involved user dropdown
  const [allUsers, setAllUsers] = useState<UserListItem[]>([]);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formProjectId, setFormProjectId] = useState<number | ''>('');
  const [formDate, setFormDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formSeverity, setFormSeverity] = useState<Severity>('quase_acidente');
  const [formClassification, setFormClassification] = useState<Classification | ''>('');
  const [formCategory, setFormCategory] = useState('');
  const [formInvolvedUserId, setFormInvolvedUserId] = useState<number | ''>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formTouched, setFormTouched] = useState(false);

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
    quase_acidente: t('safety.nearMiss', 'Quase Acidente'),
    primeiros_socorros: t('safety.firstAid', 'Primeiros Socorros'),
    sem_afastamento: t('safety.noLostTime', 'Sem Afastamento'),
    com_afastamento: t('safety.lostTime', 'Com Afastamento'),
    fatal: t('safety.fatal', 'Fatal'),
  };

  const statusLabel: Record<Status, string> = {
    registrado: t('safety.registered', 'Registrado'),
    em_investigacao: t('safety.investigating', 'Em Investigacao'),
    investigado: t('safety.investigated', 'Investigado'),
    encerrado: t('safety.closed', 'Encerrado'),
  };

  const classificationLabel: Record<Classification, string> = {
    tipico: t('safety.classTypical', 'Tipico'),
    trajeto: t('safety.classCommute', 'Trajeto'),
    doenca_ocupacional: t('safety.classOccupational', 'Doenca Ocupacional'),
  };

  useEffect(() => {
    setNavBarSelection(14);
  }, []);

  // Load projects and users for create modal dropdowns
  useEffect(() => {
    projectsApi.queryAllProjects({ per_page: 100 }).then((data) => {
      setAllProjects(data.items ?? []);
    }).catch(() => {});
    usersApi.getAllUsersDropdown().then((data) => {
      setAllUsers(data ?? []);
    }).catch(() => {});
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
    setFormProjectId(projectsInfo?.id ?? '');
    setFormDate('');
    setFormDescription('');
    setFormLocation('');
    setFormSeverity('quase_acidente');
    setFormClassification('');
    setFormCategory('');
    setFormInvolvedUserId('');
    setFormErrors({});
    setFormTouched(false);
  };

  const openCreateModal = () => {
    setFormProjectId(projectsInfo?.id ?? '');
    setShowCreateModal(true);
  };

  const validateCreateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!formProjectId) errors.project = t('safety.validation.projectRequired', 'Selecione um projeto');
    if (!formDate) errors.date = t('safety.validation.dateRequired', 'Data do incidente e obrigatoria');
    if (!formDescription.trim()) errors.description = t('safety.validation.descriptionRequired', 'Descricao e obrigatoria');
    if (formDescription.trim().length > 0 && formDescription.trim().length < 10) errors.description = t('safety.validation.descriptionMin', 'Descricao deve ter ao menos 10 caracteres');
    if (!formClassification) errors.classification = t('safety.validation.classificationRequired', 'Classificacao e obrigatoria');
    if (!formCategory.trim()) errors.category = t('safety.validation.categoryRequired', 'Categoria e obrigatoria');
    return errors;
  };

  const handleCreateIncident = async () => {
    setFormTouched(true);
    const errors = validateCreateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0 || !user) return;

    setCreateLoading(true);
    try {
      await safetyApi.createIncident({
        reported_by: user.id,
        incident_date: formDate,
        description: formDescription.trim(),
        severity: formSeverity,
        classification: formClassification as Classification,
        category: formCategory.trim(),
        projects_id: Number(formProjectId),
        location_description: formLocation.trim() || undefined,
        involved_user_id: formInvolvedUserId ? Number(formInvolvedUserId) : undefined,
      });
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
    if (!investigateTarget || !user) return;
    setInvestigateLoading(true);
    try {
      await safetyApi.investigateIncident(investigateTarget.id, {
        investigated_by: user.id,
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
    if (!closeTarget || !closeRootCause.trim() || !closeActions.trim() || !user) return;
    setCloseLoading(true);
    try {
      await safetyApi.closeIncident(closeTarget.id, {
        closed_by: user.id,
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

  const toggleExpandedRow = async (id: number) => {
    if (expandedRow === id) {
      setExpandedRow(null);
      setExpandedDetail(null);
      setShowWitnessForm(false);
      setShowAttachmentForm(false);
      return;
    }
    setExpandedRow(id);
    setDetailLoading(true);
    try {
      const detail = await safetyApi.getIncident(id);
      setExpandedDetail(detail);
    } catch {
      setExpandedDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const reloadExpandedDetail = async (id: number) => {
    try {
      const detail = await safetyApi.getIncident(id);
      setExpandedDetail(detail);
    } catch { /* ignore */ }
  };

  const handleAddWitness = async (incidentId: number) => {
    if (!witnessName.trim()) return;
    setWitnessLoading(true);
    try {
      await safetyApi.addWitness(incidentId, {
        witness_name: witnessName.trim(),
        witness_statement: witnessStatement.trim() || undefined,
      });
      setWitnessName('');
      setWitnessStatement('');
      setShowWitnessForm(false);
      reloadExpandedDetail(incidentId);
    } catch (err) {
      console.error('Failed to add witness:', err);
    } finally {
      setWitnessLoading(false);
    }
  };

  const handleAddAttachment = async (incidentId: number) => {
    if (!attachmentFile || !user) return;
    setAttachmentLoading(true);
    try {
      // 1. Upload file to server
      const uploaded = await safetyApi.uploadFile(attachmentFile);
      // 2. Create attachment record linked to incident
      await safetyApi.addAttachment(incidentId, {
        file_url: uploaded.file_url,
        file_type: uploaded.file_type,
        description: uploaded.file_name,
        uploaded_by_user_id: user.id,
      });
      setAttachmentFile(null);
      setShowAttachmentForm(false);
      reloadExpandedDetail(incidentId);
    } catch (err) {
      console.error('Failed to add attachment:', err);
    } finally {
      setAttachmentLoading(false);
    }
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
          <button className="btn btn-primary" onClick={openCreateModal}>
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
            value={stats.total_incidents}
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
            label={severityLabel.primeiros_socorros}
            value={stats.by_severity?.primeiros_socorros ?? 0}
            bg="#EEF4FF"
            color="#1D5CC6"
            icon={<AlertTriangle size={20} />}
          />
          <StatCard
            label={severityLabel.sem_afastamento}
            value={stats.by_severity?.sem_afastamento ?? 0}
            bg="#FFF9E6"
            color="#B98E00"
            icon={<AlertTriangle size={20} />}
          />
          <StatCard
            label={severityLabel.com_afastamento}
            value={stats.by_severity?.com_afastamento ?? 0}
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
          <option value="primeiros_socorros">{severityLabel.primeiros_socorros}</option>
          <option value="sem_afastamento">{severityLabel.sem_afastamento}</option>
          <option value="com_afastamento">{severityLabel.com_afastamento}</option>
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
          <option value="registrado">{statusLabel.registrado}</option>
          <option value="em_investigacao">{statusLabel.em_investigacao}</option>
          <option value="investigado">{statusLabel.investigado}</option>
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
            <button className="btn btn-primary" onClick={openCreateModal}>
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
                    (inc.location_description || '').toLowerCase().includes(search.toLowerCase()) ||
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
                        {incident.location_description && (
                          <div
                            style={{
                              fontSize: '11px',
                              color: 'var(--color-secondary-text)',
                              marginTop: '2px',
                              paddingLeft: '23px',
                            }}
                          >
                            {incident.location_description}
                          </div>
                        )}
                      </td>
                      <td>
                        <SeverityBadge
                          severity={incident.severity}
                          label={severityLabel[incident.severity]}
                        />
                      </td>
                      <td>{incident.classification ? classificationLabel[incident.classification] || incident.classification : '-'}</td>
                      <td>
                        <StatusBadge
                          status={incident.status}
                          label={statusLabel[incident.status]}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {incident.status === 'registrado' && (
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
                          {detailLoading ? (
                            <div style={{ padding: '24px', textAlign: 'center' }}>
                              <span className="spinner" />
                            </div>
                          ) : (
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
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary-text)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {t('safety.rootCause')}
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--color-primary-text)' }}>{incident.root_cause}</p>
                              </div>
                            )}
                            {incident.corrective_actions && (
                              <div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary-text)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {t('safety.correctiveActions')}
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--color-primary-text)' }}>{incident.corrective_actions}</p>
                              </div>
                            )}

                            {/* Witnesses */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary-text)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <Users size={13} />
                                {t('common.witnesses', 'Testemunhas')}
                                {incident.status !== 'encerrado' && (
                                  <button
                                    className="btn btn-icon"
                                    title={t('safety.addWitness', 'Adicionar testemunha')}
                                    onClick={() => { setShowWitnessForm(!showWitnessForm); setShowAttachmentForm(false); }}
                                    style={{ marginLeft: '4px', padding: '2px' }}
                                  >
                                    <Plus size={14} color="var(--color-primary)" />
                                  </button>
                                )}
                              </div>

                              {/* Witness list */}
                              {expandedDetail?.witnesses && expandedDetail.witnesses.length > 0 ? (
                                expandedDetail.witnesses.map((w) => (
                                  <div key={w.id} style={{ fontSize: '13px', color: 'var(--color-primary-text)', marginBottom: '4px' }}>
                                    {w.witness_name}
                                    {w.witness_role && (
                                      <span style={{ color: 'var(--color-secondary-text)', fontSize: '11px', marginLeft: '6px' }}>({w.witness_role})</span>
                                    )}
                                    {w.witness_statement && (
                                      <span style={{ color: 'var(--color-secondary-text)' }}>{' \u2014 '}{w.witness_statement}</span>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                                  {t('safety.noWitnesses', 'Nenhuma testemunha registrada')}
                                </span>
                              )}

                              {/* Add witness form */}
                              {showWitnessForm && (
                                <div style={{ marginTop: '8px', padding: '10px', background: 'var(--color-primary-bg)', borderRadius: '6px', border: '1px solid var(--color-alternate)' }}>
                                  <input
                                    className="input-field"
                                    placeholder={t('safety.witnessName', 'Nome da testemunha *')}
                                    value={witnessName}
                                    onChange={(e) => setWitnessName(e.target.value)}
                                    style={{ marginBottom: '6px', fontSize: '12px' }}
                                  />
                                  <input
                                    className="input-field"
                                    placeholder={t('safety.witnessStatement', 'Depoimento (opcional)')}
                                    value={witnessStatement}
                                    onChange={(e) => setWitnessStatement(e.target.value)}
                                    style={{ marginBottom: '8px', fontSize: '12px' }}
                                  />
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => { setShowWitnessForm(false); setWitnessName(''); setWitnessStatement(''); }}>
                                      {t('common.cancel')}
                                    </button>
                                    <button
                                      className="btn btn-primary"
                                      style={{ fontSize: '11px', padding: '4px 10px' }}
                                      onClick={() => handleAddWitness(incident.id)}
                                      disabled={witnessLoading || !witnessName.trim()}
                                    >
                                      {witnessLoading ? <span className="spinner" /> : t('common.add', 'Adicionar')}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Attachments */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary-text)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <Paperclip size={13} />
                                {t('common.attachments', 'Anexos')}
                                {incident.status !== 'encerrado' && (
                                  <button
                                    className="btn btn-icon"
                                    title={t('safety.addAttachment', 'Adicionar anexo')}
                                    onClick={() => { setShowAttachmentForm(!showAttachmentForm); setShowWitnessForm(false); }}
                                    style={{ marginLeft: '4px', padding: '2px' }}
                                  >
                                    <Plus size={14} color="var(--color-primary)" />
                                  </button>
                                )}
                              </div>

                              {/* Attachment list */}
                              {expandedDetail?.attachments && expandedDetail.attachments.length > 0 ? (
                                expandedDetail.attachments.map((att) => (
                                  <div key={att.id} style={{ fontSize: '13px', marginBottom: '4px' }}>
                                    <a href={att.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <FileText size={12} />
                                      {att.description || att.file_url.split('/').pop() || 'Anexo'}
                                    </a>
                                    {att.file_type && (
                                      <span style={{ color: 'var(--color-secondary-text)', fontSize: '11px', marginLeft: '6px' }}>
                                        ({att.file_type.split('/').pop()?.toUpperCase()})
                                      </span>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                                  {t('safety.noAttachments', 'Nenhum anexo registrado')}
                                </span>
                              )}

                              {/* Add attachment form */}
                              {showAttachmentForm && (
                                <div style={{ marginTop: '8px', padding: '10px', background: 'var(--color-primary-bg)', borderRadius: '6px', border: '1px solid var(--color-alternate)' }}>
                                  <label
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '10px 14px',
                                      border: '2px dashed var(--color-alternate)',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      color: 'var(--color-secondary-text)',
                                      marginBottom: '8px',
                                      transition: 'border-color 0.2s',
                                    }}
                                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                                    onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-alternate)'; }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.currentTarget.style.borderColor = 'var(--color-alternate)';
                                      const droppedFile = e.dataTransfer.files[0];
                                      if (droppedFile) setAttachmentFile(droppedFile);
                                    }}
                                  >
                                    <Paperclip size={16} />
                                    {attachmentFile ? (
                                      <span style={{ color: 'var(--color-primary-text)' }}>
                                        {attachmentFile.name}
                                        <span style={{ color: 'var(--color-secondary-text)', marginLeft: '6px' }}>
                                          ({(attachmentFile.size / 1024).toFixed(0)} KB)
                                        </span>
                                      </span>
                                    ) : (
                                      t('safety.dropOrClickFile', 'Clique para selecionar ou arraste um arquivo aqui')
                                    )}
                                    <input
                                      type="file"
                                      style={{ display: 'none' }}
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) setAttachmentFile(f);
                                      }}
                                    />
                                  </label>
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => { setShowAttachmentForm(false); setAttachmentFile(null); }}>
                                      {t('common.cancel')}
                                    </button>
                                    <button
                                      className="btn btn-primary"
                                      style={{ fontSize: '11px', padding: '4px 10px' }}
                                      onClick={() => handleAddAttachment(incident.id)}
                                      disabled={attachmentLoading || !attachmentFile}
                                    >
                                      {attachmentLoading ? <span className="spinner" /> : t('safety.uploadFile', 'Enviar arquivo')}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Reporter, involved user & timestamps */}
                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                              <div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary-text)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {t('safety.reportedBy', 'Reportado por')}
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--color-primary-text)' }}>
                                  {incident.reporter_name || `ID ${incident.reported_by_user_id}`}
                                </p>
                              </div>
                              {incident.involved_user_id && (
                                <div>
                                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary-text)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {t('safety.involvedUser', 'Funcionario Envolvido')}
                                  </div>
                                  <p style={{ fontSize: '13px', color: 'var(--color-primary-text)' }}>
                                    {allUsers.find(u => u.id === incident.involved_user_id)?.name || `ID ${incident.involved_user_id}`}
                                  </p>
                                </div>
                              )}
                              {incident.closed_at && (
                                <div>
                                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary-text)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {t('safety.closedAt', 'Encerrado em')}
                                  </div>
                                  <p style={{ fontSize: '13px', color: 'var(--color-primary-text)' }}>
                                    {formatDate(incident.closed_at)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          )}
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
        <div className="modal-backdrop" onClick={() => { setShowCreateModal(false); resetCreateForm(); }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', width: '520px' }}
          >
            <h3 style={{ marginBottom: '16px' }}>{t('safety.createIncident')}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Project dropdown */}
              <div className="input-group">
                <label>{t('common.project', 'Projeto')} <span style={{ color: '#C0392B' }}>*</span></label>
                <select
                  className="select-field"
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value ? Number(e.target.value) : '')}
                  style={formTouched && formErrors.project ? { borderColor: '#C0392B' } : {}}
                >
                  <option value="">{t('safety.selectProject', 'Selecione um projeto...')}</option>
                  {allProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {formTouched && formErrors.project && (
                  <span style={{ color: '#C0392B', fontSize: '12px', marginTop: '4px' }}>{formErrors.project}</span>
                )}
              </div>

              {/* Date */}
              <div className="input-group">
                <label>{t('safety.incidentDate', 'Data do Incidente')} <span style={{ color: '#C0392B' }}>*</span></label>
                <input
                  type="date"
                  className="input-field"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  style={formTouched && formErrors.date ? { borderColor: '#C0392B' } : {}}
                />
                {formTouched && formErrors.date && (
                  <span style={{ color: '#C0392B', fontSize: '12px', marginTop: '4px' }}>{formErrors.date}</span>
                )}
              </div>

              {/* Description */}
              <div className="input-group">
                <label>{t('common.description', 'Descricao')} <span style={{ color: '#C0392B' }}>*</span></label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={t('safety.descriptionPlaceholder', 'Descreva o incidente com detalhes (min. 10 caracteres)')}
                  style={{ resize: 'vertical', ...(formTouched && formErrors.description ? { borderColor: '#C0392B' } : {}) }}
                />
                {formTouched && formErrors.description && (
                  <span style={{ color: '#C0392B', fontSize: '12px', marginTop: '4px' }}>{formErrors.description}</span>
                )}
              </div>

              {/* Severity + Classification */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>{t('safety.severity', 'Severidade')} <span style={{ color: '#C0392B' }}>*</span></label>
                  <select
                    className="select-field"
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as Severity)}
                  >
                    <option value="quase_acidente">{severityLabel.quase_acidente}</option>
                    <option value="primeiros_socorros">{severityLabel.primeiros_socorros}</option>
                    <option value="sem_afastamento">{severityLabel.sem_afastamento}</option>
                    <option value="com_afastamento">{severityLabel.com_afastamento}</option>
                    <option value="fatal">{severityLabel.fatal}</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>{t('safety.classification', 'Classificacao')} <span style={{ color: '#C0392B' }}>*</span></label>
                  <select
                    className="select-field"
                    value={formClassification}
                    onChange={(e) => setFormClassification(e.target.value as Classification)}
                    style={formTouched && formErrors.classification ? { borderColor: '#C0392B' } : {}}
                  >
                    <option value="">{t('common.select', 'Selecione...')}</option>
                    <option value="tipico">{classificationLabel.tipico}</option>
                    <option value="trajeto">{classificationLabel.trajeto}</option>
                    <option value="doenca_ocupacional">{classificationLabel.doenca_ocupacional}</option>
                  </select>
                  {formTouched && formErrors.classification && (
                    <span style={{ color: '#C0392B', fontSize: '12px', marginTop: '4px' }}>{formErrors.classification}</span>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="input-group">
                <label>{t('safety.category', 'Categoria')} <span style={{ color: '#C0392B' }}>*</span></label>
                <input
                  className="input-field"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder={t('safety.categoryPlaceholder', 'Ex: Queda, Corte, Queimadura...')}
                  style={formTouched && formErrors.category ? { borderColor: '#C0392B' } : {}}
                />
                {formTouched && formErrors.category && (
                  <span style={{ color: '#C0392B', fontSize: '12px', marginTop: '4px' }}>{formErrors.category}</span>
                )}
              </div>

              {/* Location (optional) */}
              <div className="input-group">
                <label>{t('common.location', 'Local')}</label>
                <input
                  className="input-field"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder={t('safety.locationPlaceholder', 'Local do incidente')}
                />
              </div>

              {/* Involved user (optional) */}
              <div className="input-group">
                <label>{t('safety.involvedUser', 'Funcionario Envolvido')}</label>
                <select
                  className="select-field"
                  value={formInvolvedUserId}
                  onChange={(e) => setFormInvolvedUserId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">{t('common.none', 'Nenhum')}</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => { setShowCreateModal(false); resetCreateForm(); }}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateIncident}
                disabled={createLoading}
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

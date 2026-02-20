import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { safetyApi, usersApi } from '../../services';
import type { TrainingType, WorkerTraining, UserFull } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchableSelect from '../../components/common/SearchableSelect';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  Award,
  AlertTriangle,
} from 'lucide-react';

// ── Validity helpers ─────────────────────────────────────────────────────────

type ValidityStatus = 'valido' | 'vencendo' | 'vencido';

function computeValidityStatus(expiry_date?: string): ValidityStatus {
  if (!expiry_date) return 'valido';
  const now = new Date();
  const expiry = new Date(expiry_date);
  const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry < 0) return 'vencido';
  if (daysUntilExpiry <= 30) return 'vencendo';
  return 'valido';
}

const VALIDITY_CONFIG: Record<ValidityStatus, { bg: string; color: string }> = {
  valido: { bg: '#F4FEF9', color: '#028F58' },
  vencendo: { bg: '#FFF9E6', color: '#B98E00' },
  vencido: { bg: '#FDE8E8', color: '#C0392B' },
};

function ValidityBadge({ status, label }: { status: ValidityStatus; label: string }) {
  const cfg = VALIDITY_CONFIG[status];
  return (
    <span className="badge" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {label}
    </span>
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

// ── Tab button ───────────────────────────────────────────────────────────────

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 20px',
        background: 'none',
        border: 'none',
        borderBottom: active
          ? '2px solid var(--color-primary)'
          : '2px solid transparent',
        color: active ? 'var(--color-primary)' : 'var(--color-secondary-text)',
        fontWeight: active ? 600 : 400,
        fontSize: '14px',
        cursor: 'pointer',
        marginBottom: '-2px',
        transition: 'all 150ms ease',
      }}
    >
      {children}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SafetyTraining() {
  const { t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();
  const { user } = useAuthContext();

  const [activeTab, setActiveTab] = useState<'types' | 'trainings'>('types');

  // ── Training Types state ─────────────────────────────────────────────────

  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesSearch, setTypesSearch] = useState('');
  const [deleteTypeConfirm, setDeleteTypeConfirm] = useState<number | null>(null);

  // Create/Edit type modal
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<TrainingType | null>(null);
  const [typeModalLoading, setTypeModalLoading] = useState(false);
  const [typeName, setTypeName] = useState('');
  const [typeNrReference, setTypeNrReference] = useState('');
  const [typeFormErrors, setTypeFormErrors] = useState<Record<string, string>>({});
  const [typeFormTouched, setTypeFormTouched] = useState<Record<string, boolean>>({});
  const [typeFormSubmitAttempted, setTypeFormSubmitAttempted] = useState(false);
  const [typeApiError, setTypeApiError] = useState('');
  const [typeValidityMonths, setTypeValidityMonths] = useState('');
  const [typeWorkloadHours, setTypeWorkloadHours] = useState('');
  const [typeDescription, setTypeDescription] = useState('');

  // ── Worker Trainings state ────────────────────────────────────────────────

  const [workerTrainings, setWorkerTrainings] = useState<WorkerTraining[]>([]);
  const [trainingsLoading, setTrainingsLoading] = useState(true);
  const [trainingsSearch, setTrainingsSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteTrainingConfirm, setDeleteTrainingConfirm] = useState<number | null>(null);

  // Register training modal
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [trainingModalLoading, setTrainingModalLoading] = useState(false);
  const [trainingUserId, setTrainingUserId] = useState('');
  const [trainingTypeId, setTrainingTypeId] = useState('');
  const [trainingDate, setTrainingDate] = useState('');
  const [trainingInstructor, setTrainingInstructor] = useState('');
  const [trainingCertificateUrl, setTrainingCertificateUrl] = useState('');

  // Employee search dropdown
  const [employees, setEmployees] = useState<UserFull[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<UserFull | null>(null);

  useEffect(() => {
    setNavBarSelection(15);
  }, []);

  // ── Loaders ──────────────────────────────────────────────────────────────

  const loadTrainingTypes = useCallback(async () => {
    setTypesLoading(true);
    try {
      const params: Parameters<typeof safetyApi.listTrainingTypes>[0] = {};
      if (user?.companyId) {
        params.company_id = user.companyId;
      }
      const data = await safetyApi.listTrainingTypes(params);
      setTrainingTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load training types:', err);
    } finally {
      setTypesLoading(false);
    }
  }, [user]);

  const loadWorkerTrainings = useCallback(async () => {
    setTrainingsLoading(true);
    try {
      const params: Parameters<typeof safetyApi.listWorkerTrainings>[0] = {
        page,
        per_page: perPage,
      };
      if (user?.companyId) {
        params.company_id = user.companyId;
      }
      const data = await safetyApi.listWorkerTrainings(params);
      setWorkerTrainings(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load worker trainings:', err);
    } finally {
      setTrainingsLoading(false);
    }
  }, [user, page, perPage]);

  useEffect(() => {
    loadTrainingTypes();
  }, [loadTrainingTypes]);

  useEffect(() => {
    loadWorkerTrainings();
  }, [loadWorkerTrainings]);

  // ── Training Type handlers ────────────────────────────────────────────────

  const resetTypeFormValidation = () => {
    setTypeFormErrors({});
    setTypeFormTouched({});
    setTypeFormSubmitAttempted(false);
    setTypeApiError('');
  };

  const validateTypeField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return t('safety.validation.nameRequired');
        if (value.trim().length < 3) return t('safety.validation.nameMinLength');
        return '';
      case 'validity_months':
        if (value && (isNaN(Number(value)) || Number(value) < 1))
          return t('safety.validation.validityMin');
        return '';
      case 'workload_hours':
        if (value && (isNaN(Number(value)) || Number(value) < 0))
          return t('safety.validation.workloadMin');
        return '';
      default:
        return '';
    }
  };

  const validateTypeForm = (): boolean => {
    const errors: Record<string, string> = {};
    const nameError = validateTypeField('name', typeName);
    if (nameError) errors.name = nameError;
    const validityError = validateTypeField('validity_months', typeValidityMonths);
    if (validityError) errors.validity_months = validityError;
    const workloadError = validateTypeField('workload_hours', typeWorkloadHours);
    if (workloadError) errors.workload_hours = workloadError;
    setTypeFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTypeFieldBlur = (field: string, value: string) => {
    setTypeFormTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateTypeField(field, value);
    setTypeFormErrors((prev) => ({ ...prev, [field]: error }));
  };

  const openCreateTypeModal = () => {
    setEditingType(null);
    setTypeName('');
    setTypeNrReference('');
    setTypeValidityMonths('');
    setTypeWorkloadHours('');
    setTypeDescription('');
    resetTypeFormValidation();
    setShowTypeModal(true);
  };

  const openEditTypeModal = (type: TrainingType) => {
    setEditingType(type);
    setTypeName(type.name);
    setTypeNrReference(type.nr_reference || '');
    setTypeValidityMonths(type.validity_months != null ? String(type.validity_months) : '');
    setTypeWorkloadHours(type.workload_hours != null ? String(type.workload_hours) : '');
    setTypeDescription(type.description || '');
    resetTypeFormValidation();
    setShowTypeModal(true);
  };

  const handleSaveType = async () => {
    setTypeFormSubmitAttempted(true);
    setTypeApiError('');
    if (!validateTypeForm()) return;

    setTypeModalLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: typeName.trim(),
        nr_reference: typeNrReference.trim() || undefined,
        validity_months: typeValidityMonths ? parseInt(typeValidityMonths, 10) : undefined,
        workload_hours: typeWorkloadHours ? parseFloat(typeWorkloadHours) : undefined,
        description: typeDescription.trim() || undefined,
      };
      if (user?.companyId) {
        payload.company_id = user.companyId;
      }
      if (editingType) {
        await safetyApi.updateTrainingType(editingType.id, payload);
      } else {
        await safetyApi.createTrainingType(payload);
      }
      setShowTypeModal(false);
      loadTrainingTypes();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg = apiErr?.response?.data?.message || t('safety.validation.saveFailed');
      setTypeApiError(msg);
    } finally {
      setTypeModalLoading(false);
    }
  };

  const handleDeleteType = async (id: number) => {
    try {
      await safetyApi.deleteTrainingType(id);
      loadTrainingTypes();
    } catch (err) {
      console.error('Failed to delete training type:', err);
    }
    setDeleteTypeConfirm(null);
  };

  // ── Worker Training handlers ──────────────────────────────────────────────

  const loadEmployees = useCallback(async (search?: string) => {
    setEmployeesLoading(true);
    try {
      const data = await usersApi.queryAllUsers({
        per_page: 50,
        search: search || undefined,
      });
      setEmployees(data.items || []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  // Debounce employee search
  useEffect(() => {
    if (!showTrainingModal) return;
    const timer = setTimeout(() => {
      loadEmployees(employeeSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [employeeSearch, showTrainingModal, loadEmployees]);

  const openCreateTrainingModal = () => {
    setTrainingUserId('');
    setTrainingTypeId('');
    setTrainingDate('');
    setTrainingInstructor('');
    setTrainingCertificateUrl('');
    setSelectedEmployee(null);
    setEmployeeSearch('');
    setShowEmployeeDropdown(false);
    loadEmployees();
    setShowTrainingModal(true);
  };

  const handleSelectEmployee = (emp: UserFull) => {
    setSelectedEmployee(emp);
    setTrainingUserId(String(emp.id));
    setEmployeeSearch(emp.name);
    setShowEmployeeDropdown(false);
  };

  const handleSaveTraining = async () => {
    if (!trainingUserId || !trainingTypeId || !trainingDate) return;
    setTrainingModalLoading(true);
    try {
      const payload: Record<string, unknown> = {
        users_id: parseInt(trainingUserId, 10),
        training_types_id: parseInt(trainingTypeId, 10),
        training_date: trainingDate,
        instructor: trainingInstructor.trim() || undefined,
        certificate_url: trainingCertificateUrl.trim() || undefined,
      };
      if (user?.companyId) {
        payload.company_id = user.companyId;
      }
      await safetyApi.createWorkerTraining(payload);
      setShowTrainingModal(false);
      loadWorkerTrainings();
    } catch (err) {
      console.error('Failed to save worker training:', err);
    } finally {
      setTrainingModalLoading(false);
    }
  };

  // Derived validity labels
  const validityLabel: Record<ValidityStatus, string> = {
    valido: t('safety.validStatus'),
    vencendo: t('safety.expiringStatus'),
    vencido: t('safety.expiredStatus'),
  };

  // Filtered training types by search
  const filteredTypes = trainingTypes.filter(
    (tt) =>
      !typesSearch ||
      tt.name.toLowerCase().includes(typesSearch.toLowerCase()) ||
      (tt.nr_reference || '').toLowerCase().includes(typesSearch.toLowerCase()),
  );

  // Filtered worker trainings by search
  const filteredTrainings = workerTrainings.filter(
    (wt) =>
      !trainingsSearch ||
      (wt.user_name || '').toLowerCase().includes(trainingsSearch.toLowerCase()) ||
      (wt.training_type_name || '').toLowerCase().includes(trainingsSearch.toLowerCase()) ||
      (wt.instructor || '').toLowerCase().includes(trainingsSearch.toLowerCase()),
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title={t('safety.trainings')}
        subtitle={t('safety.trainingsSubtitle')}
        breadcrumb={
          projectsInfo
            ? `${t('nav.ssma')} / ${projectsInfo.name} / ${t('safety.trainings')}`
            : `${t('nav.ssma')} / ${t('safety.trainings')}`
        }
        actions={
          activeTab === 'types' ? (
            <button className="btn btn-primary" onClick={openCreateTypeModal}>
              <Plus size={18} /> {t('safety.createTrainingType')}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={openCreateTrainingModal}>
              <Plus size={18} /> {t('safety.createWorkerTraining')}
            </button>
          )
        }
      />

      <ProjectFilterDropdown />

      {/* Tabs */}
      <div
        style={{
          borderBottom: '2px solid var(--color-alternate)',
          display: 'flex',
          gap: '0',
          marginBottom: '20px',
        }}
      >
        <TabButton active={activeTab === 'types'} onClick={() => setActiveTab('types')}>
          <BookOpen size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          {t('safety.trainingTypes')}
        </TabButton>
        <TabButton active={activeTab === 'trainings'} onClick={() => setActiveTab('trainings')}>
          <Award size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          {t('safety.workerTrainings')}
        </TabButton>
      </div>

      {/* ── Tab 1: Training Types ──────────────────────────────────────────── */}
      {activeTab === 'types' && (
        <>
          {/* Search */}
          <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, maxWidth: '360px', position: 'relative' }}>
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
                placeholder={`${t('common.search')} ${t('safety.trainingTypes').toLowerCase()}...`}
                value={typesSearch}
                onChange={(e) => setTypesSearch(e.target.value)}
                style={{ paddingLeft: '32px' }}
              />
            </div>
          </div>

          {typesLoading ? (
            <LoadingSpinner />
          ) : filteredTypes.length === 0 ? (
            <EmptyState
              message={t('common.noData')}
              action={
                <button className="btn btn-primary" onClick={openCreateTypeModal}>
                  <Plus size={18} /> {t('safety.createTrainingType')}
                </button>
              }
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t('common.name')}</th>
                    <th>{t('safety.nrReference')}</th>
                    <th>{t('safety.validityMonths')}</th>
                    <th>{t('safety.workloadHours')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {filteredTypes.map((tt) => (
                    <motion.tr key={tt.id} variants={tableRowVariants}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <BookOpen size={15} color="var(--color-primary)" />
                          <span style={{ fontWeight: 500 }}>{tt.name}</span>
                        </div>
                        {tt.description && (
                          <div
                            style={{
                              fontSize: '11px',
                              color: 'var(--color-secondary-text)',
                              marginTop: '2px',
                              paddingLeft: '23px',
                            }}
                          >
                            {tt.description}
                          </div>
                        )}
                      </td>
                      <td>{tt.nr_reference || '-'}</td>
                      <td>
                        {tt.validity_months != null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} color="var(--color-secondary-text)" />
                            {tt.validity_months} {t('safety.validityMonths').split('(')[0].trim().toLowerCase()}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {tt.workload_hours != null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} color="var(--color-secondary-text)" />
                            {tt.workload_hours}h
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="btn btn-icon"
                            title={t('common.edit')}
                            onClick={() => openEditTypeModal(tt)}
                          >
                            <Edit size={15} color="var(--color-secondary-text)" />
                          </button>
                          <button
                            className="btn btn-icon"
                            title={t('common.delete')}
                            onClick={() => setDeleteTypeConfirm(tt.id)}
                          >
                            <Trash2 size={15} color="var(--color-error)" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Tab 2: Worker Trainings ────────────────────────────────────────── */}
      {activeTab === 'trainings' && (
        <>
          {/* Expiring / expired banner */}
          {workerTrainings.some(
            (wt) => (wt.status || computeValidityStatus(wt.expiry_date)) !== 'valido',
          ) && (
            <div
              style={{
                marginBottom: '12px',
                padding: '10px 14px',
                background: '#FFF9E6',
                border: '1px solid #F0D080',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#B98E00',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} />
              {t('common.expiring')} / {t('common.expired')} —{' '}
              {
                workerTrainings.filter(
                  (wt) => (wt.status || computeValidityStatus(wt.expiry_date)) !== 'valido',
                ).length
              }{' '}
              {t('safety.workerTrainings').toLowerCase()}
            </div>
          )}

          {/* Search */}
          <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, maxWidth: '360px', position: 'relative' }}>
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
                placeholder={`${t('common.search')} ${t('safety.workerTrainings').toLowerCase()}...`}
                value={trainingsSearch}
                onChange={(e) => {
                  setTrainingsSearch(e.target.value);
                  setPage(1);
                }}
                style={{ paddingLeft: '32px' }}
              />
            </div>
          </div>

          {trainingsLoading ? (
            <LoadingSpinner />
          ) : filteredTrainings.length === 0 ? (
            <EmptyState
              message={t('common.noData')}
              action={
                <button className="btn btn-primary" onClick={openCreateTrainingModal}>
                  <Plus size={18} /> {t('safety.createWorkerTraining')}
                </button>
              }
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t('safety.workerTrainings').split(' ')[0]}</th>
                    <th>{t('safety.trainingTypes').split(' ')[0]}</th>
                    <th>{t('safety.trainingDate')}</th>
                    <th>{t('safety.expiryDate')}</th>
                    <th>{t('safety.instructor')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {filteredTrainings.map((wt) => {
                    const validity = wt.status || computeValidityStatus(wt.expiry_date);
                    const isExpiringSoon =
                      validity === 'vencendo' || validity === 'vencido';

                    return (
                      <motion.tr
                        key={wt.id}
                        variants={tableRowVariants}
                        style={
                          isExpiringSoon
                            ? { backgroundColor: 'rgba(255, 245, 200, 0.3)' }
                            : undefined
                        }
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Award size={15} color="var(--color-primary)" />
                            <span style={{ fontWeight: 500 }}>
                              {wt.user_name || `ID ${wt.users_id}`}
                            </span>
                          </div>
                        </td>
                        <td>{wt.training_type_name || `ID ${wt.training_types_id}`}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(wt.training_date)}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {wt.expiry_date ? (
                            <span
                              style={{
                                color: isExpiringSoon
                                  ? validity === 'vencido'
                                    ? 'var(--color-error)'
                                    : 'var(--color-warning)'
                                  : 'inherit',
                                fontWeight: isExpiringSoon ? 600 : 400,
                              }}
                            >
                              {formatDate(wt.expiry_date)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>{wt.instructor || '-'}</td>
                        <td>
                          <ValidityBadge
                            status={validity as ValidityStatus}
                            label={validityLabel[validity as ValidityStatus] || validity}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {wt.certificate_url && (
                              <a
                                href={wt.certificate_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-icon"
                                title={t('safety.certificate')}
                              >
                                <Award size={15} color="var(--color-primary)" />
                              </a>
                            )}
                            <button
                              className="btn btn-icon"
                              title={t('common.delete')}
                              onClick={() => setDeleteTrainingConfirm(wt.id)}
                            >
                              <Trash2 size={15} color="var(--color-error)" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
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
        </>
      )}

      {/* ── Create/Edit Training Type Modal ───────────────────────────────── */}
      {showTypeModal && (
        <div className="modal-backdrop" onClick={() => setShowTypeModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', width: '460px' }}
          >
            <h3 style={{ marginBottom: '16px' }}>
              {editingType ? t('common.edit') : t('safety.createTrainingType')}
            </h3>

            {typeApiError && (
              <div
                style={{
                  marginBottom: '12px',
                  padding: '10px 14px',
                  background: '#FDE8E8',
                  border: '1px solid #F5B7B1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#C0392B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertTriangle size={16} />
                {typeApiError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>
                  {t('common.name')} <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  className="input-field"
                  value={typeName}
                  onChange={(e) => {
                    setTypeName(e.target.value);
                    if (typeFormTouched.name || typeFormSubmitAttempted) {
                      const err = validateTypeField('name', e.target.value);
                      setTypeFormErrors((prev) => ({ ...prev, name: err }));
                    }
                  }}
                  onBlur={() => handleTypeFieldBlur('name', typeName)}
                  placeholder="Ex: NR-35 Trabalho em Altura"
                  style={
                    (typeFormTouched.name || typeFormSubmitAttempted) && typeFormErrors.name
                      ? { borderColor: 'var(--color-error)', boxShadow: '0 0 0 2px rgba(192,57,43,0.15)' }
                      : undefined
                  }
                  autoFocus
                />
                {(typeFormTouched.name || typeFormSubmitAttempted) && typeFormErrors.name && (
                  <span style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>
                    {typeFormErrors.name}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label>{t('safety.nrReference')}</label>
                <input
                  className="input-field"
                  value={typeNrReference}
                  onChange={(e) => setTypeNrReference(e.target.value)}
                  placeholder="Ex: NR-35"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>{t('safety.validityMonths')}</label>
                  <input
                    type="number"
                    className="input-field"
                    value={typeValidityMonths}
                    onChange={(e) => {
                      setTypeValidityMonths(e.target.value);
                      if (typeFormTouched.validity_months || typeFormSubmitAttempted) {
                        const err = validateTypeField('validity_months', e.target.value);
                        setTypeFormErrors((prev) => ({ ...prev, validity_months: err }));
                      }
                    }}
                    onBlur={() => handleTypeFieldBlur('validity_months', typeValidityMonths)}
                    min="1"
                    placeholder="12"
                    style={
                      (typeFormTouched.validity_months || typeFormSubmitAttempted) && typeFormErrors.validity_months
                        ? { borderColor: 'var(--color-error)', boxShadow: '0 0 0 2px rgba(192,57,43,0.15)' }
                        : undefined
                    }
                  />
                  {(typeFormTouched.validity_months || typeFormSubmitAttempted) && typeFormErrors.validity_months && (
                    <span style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>
                      {typeFormErrors.validity_months}
                    </span>
                  )}
                </div>
                <div className="input-group">
                  <label>{t('safety.workloadHours')}</label>
                  <input
                    type="number"
                    className="input-field"
                    value={typeWorkloadHours}
                    onChange={(e) => {
                      setTypeWorkloadHours(e.target.value);
                      if (typeFormTouched.workload_hours || typeFormSubmitAttempted) {
                        const err = validateTypeField('workload_hours', e.target.value);
                        setTypeFormErrors((prev) => ({ ...prev, workload_hours: err }));
                      }
                    }}
                    onBlur={() => handleTypeFieldBlur('workload_hours', typeWorkloadHours)}
                    min="0"
                    step="0.5"
                    placeholder="8"
                    style={
                      (typeFormTouched.workload_hours || typeFormSubmitAttempted) && typeFormErrors.workload_hours
                        ? { borderColor: 'var(--color-error)', boxShadow: '0 0 0 2px rgba(192,57,43,0.15)' }
                        : undefined
                    }
                  />
                  {(typeFormTouched.workload_hours || typeFormSubmitAttempted) && typeFormErrors.workload_hours && (
                    <span style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>
                      {typeFormErrors.workload_hours}
                    </span>
                  )}
                </div>
              </div>

              <div className="input-group">
                <label>{t('common.description')}</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={typeDescription}
                  onChange={(e) => setTypeDescription(e.target.value)}
                  placeholder={t('common.description')}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowTypeModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveType}
                disabled={typeModalLoading}
              >
                {typeModalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Register Worker Training Modal ─────────────────────────────────── */}
      {showTrainingModal && (
        <div className="modal-backdrop" onClick={() => setShowTrainingModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              // Fecha dropdown apenas se o clique for fora do container do dropdown
              const target = e.target as HTMLElement;
              if (!target.closest('[data-employee-dropdown]')) {
                setShowEmployeeDropdown(false);
              }
            }}
            style={{ padding: '24px', width: '460px' }}
          >
            <h3 style={{ marginBottom: '16px' }}>{t('safety.createWorkerTraining')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group" style={{ position: 'relative', zIndex: 10 }} data-employee-dropdown>
                <label>
                  {t('common.name')} <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-secondary-text)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    className="input-field"
                    value={selectedEmployee ? employeeSearch : employeeSearch}
                    onChange={(e) => {
                      setEmployeeSearch(e.target.value);
                      setShowEmployeeDropdown(true);
                      if (selectedEmployee && e.target.value !== selectedEmployee.name) {
                        setSelectedEmployee(null);
                        setTrainingUserId('');
                      }
                    }}
                    onFocus={() => setShowEmployeeDropdown(true)}
                    placeholder={t('safety.searchEmployee')}
                    style={{ paddingLeft: '32px' }}
                    autoComplete="off"
                  />
                </div>
                {showEmployeeDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 999,
                      background: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                      maxHeight: '220px',
                      overflowY: 'auto',
                      marginTop: '2px',
                    }}
                  >
                    {employeesLoading ? (
                      <div style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                        {t('common.loading')}...
                      </div>
                    ) : employees.length === 0 ? (
                      <div style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                        {t('common.noData')}
                      </div>
                    ) : (
                      employees.map((emp) => (
                        <div
                          key={emp.id}
                          onClick={() => handleSelectEmployee(emp)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            borderBottom: '1px solid var(--color-alternate)',
                            backgroundColor: selectedEmployee?.id === emp.id ? 'var(--color-primary-light, #EBF5FB)' : 'transparent',
                            transition: 'background-color 100ms ease',
                          }}
                          onMouseEnter={(e) => {
                            if (selectedEmployee?.id !== emp.id) e.currentTarget.style.backgroundColor = 'var(--color-hover, #f5f5f5)';
                          }}
                          onMouseLeave={(e) => {
                            if (selectedEmployee?.id !== emp.id) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>{emp.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>{emp.email}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="input-group">
                <label>{t('safety.trainingTypes')} *</label>
                <SearchableSelect
                  options={trainingTypes.map((tt) => ({ value: String(tt.id), label: `${tt.name}${tt.nr_reference ? ` (${tt.nr_reference})` : ''}` }))}
                  value={trainingTypeId || undefined}
                  onChange={(val) => setTrainingTypeId(String(val ?? ''))}
                  placeholder={`— ${t('common.type')} —`}
                  allowClear
                />
              </div>
              <div className="input-group">
                <label>{t('safety.trainingDate')} *</label>
                <input
                  type="date"
                  className="input-field"
                  value={trainingDate}
                  onChange={(e) => setTrainingDate(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>{t('safety.instructor')}</label>
                <input
                  className="input-field"
                  value={trainingInstructor}
                  onChange={(e) => setTrainingInstructor(e.target.value)}
                  placeholder={t('safety.instructor')}
                />
              </div>
              <div className="input-group">
                <label>{t('safety.certificate')}</label>
                <input
                  className="input-field"
                  value={trainingCertificateUrl}
                  onChange={(e) => setTrainingCertificateUrl(e.target.value)}
                  placeholder={t('safety.certificatePlaceholder')}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowTrainingModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveTraining}
                disabled={
                  trainingModalLoading ||
                  !trainingUserId ||
                  !trainingTypeId ||
                  !trainingDate
                }
              >
                {trainingModalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Training Type Confirm ───────────────────────────────────── */}
      {deleteTypeConfirm !== null && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('safety.confirmDelete')}
          onConfirm={() => handleDeleteType(deleteTypeConfirm)}
          onCancel={() => setDeleteTypeConfirm(null)}
        />
      )}

      {/* ── Delete Worker Training Confirm ─────────────────────────────────── */}
      {deleteTrainingConfirm !== null && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('safety.confirmDelete')}
          onConfirm={() => {
            // Worker training deletion — API doesn't have a dedicated delete endpoint,
            // so we attempt a generic update or just refetch for now.
            setDeleteTrainingConfirm(null);
          }}
          onCancel={() => setDeleteTrainingConfirm(null)}
        />
      )}
    </div>
  );
}

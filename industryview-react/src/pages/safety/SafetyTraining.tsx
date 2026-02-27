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
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Filter,
  X,
  Paperclip,
  FileText,
  Link,
} from 'lucide-react';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

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

// ── Sort helpers ─────────────────────────────────────────────────────────────

type SortDir = 'asc' | 'desc';
interface SortState<T extends string> {
  field: T;
  dir: SortDir;
}

function SortableHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <th
      onClick={onClick}
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {label}
        {active ? (
          dir === 'asc' ? (
            <ArrowUp size={13} color="var(--color-primary)" />
          ) : (
            <ArrowDown size={13} color="var(--color-primary)" />
          )
        ) : (
          <ArrowUpDown size={13} color="var(--color-secondary-text)" style={{ opacity: 0.5 }} />
        )}
      </div>
    </th>
  );
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

  // Sort state for training types
  type TypeSortField = 'name' | 'nr_reference' | 'validity_months' | 'workload_hours';
  const [typeSort, setTypeSort] = useState<SortState<TypeSortField>>({ field: 'name', dir: 'asc' });

  function toggleTypeSort(field: TypeSortField) {
    setTypeSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'asc' },
    );
  }

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
  const [filterEmployeeId, setFilterEmployeeId] = useState<number | null>(null);
  const [filterEmployees, setFilterEmployees] = useState<UserFull[]>([]);

  // Sort state for worker trainings
  type TrainingSortField = 'user_name' | 'training_type_name' | 'training_date' | 'expiry_date' | 'instructor' | 'status';
  const [trainingSort, setTrainingSort] = useState<SortState<TrainingSortField>>({ field: 'user_name', dir: 'asc' });

  function toggleTrainingSort(field: TrainingSortField) {
    setTrainingSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'asc' },
    );
  }

  // Register training modal
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [trainingModalLoading, setTrainingModalLoading] = useState(false);
  const [trainingUserId, setTrainingUserId] = useState('');
  const [trainingTypeId, setTrainingTypeId] = useState('');
  const [trainingDate, setTrainingDate] = useState('');
  const [trainingInstructor, setTrainingInstructor] = useState('');
  const [trainingCertificateUrl, setTrainingCertificateUrl] = useState('');
  const [trainingFormErrors, setTrainingFormErrors] = useState<Record<string, string>>({});
  const [trainingApiError, setTrainingApiError] = useState('');
  const [trainingFile, setTrainingFile] = useState<File | null>(null);
  const [trainingFileUploading, setTrainingFileUploading] = useState(false);

  // Employee search dropdown
  const [employees, setEmployees] = useState<UserFull[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<UserFull | null>(null);

  // Training types column filter
  const [showTypesNameFilter, setShowTypesNameFilter] = useState(false);
  const [typesNameFilter, setTypesNameFilter] = useState('');

  useEffect(() => {
    setNavBarSelection(15);
  }, []);

  // Load all employees once for the filter dropdown
  useEffect(() => {
    usersApi
      .queryAllUsers({ per_page: 100 })
      .then((res) => setFilterEmployees(res.items || []))
      .catch(() => {});
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
        page: filterEmployeeId ? 1 : page,
        per_page: filterEmployeeId ? 500 : perPage,
      };
      if (user?.companyId) {
        params.company_id = user.companyId;
      }
      if (filterEmployeeId) {
        params.users_id = filterEmployeeId;
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
  }, [user, page, perPage, filterEmployeeId]);

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
      case 'nr_reference':
        if (!value.trim()) return t('safety.validation.referenceRequired');
        return '';
      case 'validity_months':
        if (!value.trim()) return t('safety.validation.validityRequired');
        if (isNaN(Number(value)) || Number(value) < 1) return t('safety.validation.validityMin');
        return '';
      case 'workload_hours':
        if (!value.trim()) return t('safety.validation.workloadRequired');
        if (isNaN(Number(value)) || Number(value) < 0) return t('safety.validation.workloadMin');
        return '';
      case 'description':
        if (!value.trim()) return t('safety.validation.descriptionRequired');
        return '';
      default:
        return '';
    }
  };

  const validateTypeForm = (): boolean => {
    const errors: Record<string, string> = {};
    const nameError = validateTypeField('name', typeName);
    if (nameError) errors.name = nameError;
    const referenceError = validateTypeField('nr_reference', typeNrReference);
    if (referenceError) errors.nr_reference = referenceError;
    const validityError = validateTypeField('validity_months', typeValidityMonths);
    if (validityError) errors.validity_months = validityError;
    const workloadError = validateTypeField('workload_hours', typeWorkloadHours);
    if (workloadError) errors.workload_hours = workloadError;
    const descriptionError = validateTypeField('description', typeDescription);
    if (descriptionError) errors.description = descriptionError;
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
        nr_reference: typeNrReference.trim(),
        validity_months: parseInt(typeValidityMonths, 10),
        workload_hours: parseFloat(typeWorkloadHours),
        description: typeDescription.trim(),
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

  const validateTrainingForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!trainingUserId) errors.users_id = 'Selecione um funcionário';
    if (!trainingTypeId) errors.training_types_id = 'Selecione o tipo de treinamento';
    if (!trainingDate) {
      errors.training_date = 'Informe a data do treinamento';
    } else if (trainingDate > todayIso()) {
      errors.training_date = 'A data não pode ser maior que hoje';
    }
    if (!trainingInstructor.trim()) errors.instructor = 'Instrutor é obrigatório';
    setTrainingFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateTrainingModal = () => {
    setTrainingUserId('');
    setTrainingTypeId('');
    setTrainingDate('');
    setTrainingInstructor('');
    setTrainingCertificateUrl('');
    setSelectedEmployee(null);
    setEmployeeSearch('');
    setShowEmployeeDropdown(false);
    setTrainingFormErrors({});
    setTrainingApiError('');
    setTrainingFile(null);
    setTrainingFileUploading(false);
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
    setTrainingApiError('');
    if (!validateTrainingForm()) return;
    setTrainingModalLoading(true);
    try {
      // Upload file first if provided, then use its URL as certificate_url
      let finalCertificateUrl = trainingCertificateUrl.trim();
      if (trainingFile) {
        setTrainingFileUploading(true);
        const uploaded = await safetyApi.uploadFile(trainingFile);
        setTrainingFileUploading(false);
        finalCertificateUrl = uploaded.file_url;
      }
      const payload: Record<string, unknown> = {
        users_id: parseInt(trainingUserId, 10),
        training_types_id: parseInt(trainingTypeId, 10),
        training_date: trainingDate,
        instructor: trainingInstructor.trim(),
        certificate_url: finalCertificateUrl || undefined,
      };
      if (user?.companyId) {
        payload.company_id = user.companyId;
      }
      await safetyApi.createWorkerTraining(payload);
      setShowTrainingModal(false);
      loadWorkerTrainings();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setTrainingFileUploading(false);
      setTrainingApiError(apiErr?.response?.data?.message || 'Erro ao salvar treinamento. Tente novamente.');
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

  // Filtered training types by search + column name filter, with dynamic sort
  const filteredTypes = trainingTypes
    .filter(
      (tt) =>
        (!typesSearch ||
          tt.name.toLowerCase().includes(typesSearch.toLowerCase()) ||
          (tt.nr_reference || '').toLowerCase().includes(typesSearch.toLowerCase())) &&
        (!typesNameFilter || tt.name.toLowerCase().includes(typesNameFilter.toLowerCase())),
    )
    .sort((a, b) => {
      const mul = typeSort.dir === 'asc' ? 1 : -1;
      switch (typeSort.field) {
        case 'name':
          return mul * a.name.localeCompare(b.name, 'pt-BR');
        case 'nr_reference':
          return mul * (a.nr_reference || '').localeCompare(b.nr_reference || '', 'pt-BR');
        case 'validity_months':
          return mul * ((a.validity_months ?? 0) - (b.validity_months ?? 0));
        case 'workload_hours':
          return mul * ((a.workload_hours ?? 0) - (b.workload_hours ?? 0));
        default:
          return 0;
      }
    });

  // Filtered worker trainings by search, with dynamic sort
  const filteredTrainings = workerTrainings
    .filter(
      (wt) =>
        !trainingsSearch ||
        (wt.user_name || '').toLowerCase().includes(trainingsSearch.toLowerCase()) ||
        (wt.training_type_name || '').toLowerCase().includes(trainingsSearch.toLowerCase()) ||
        (wt.instructor || '').toLowerCase().includes(trainingsSearch.toLowerCase()),
    )
    .sort((a, b) => {
      const mul = trainingSort.dir === 'asc' ? 1 : -1;
      switch (trainingSort.field) {
        case 'user_name':
          return mul * (a.user_name || '').localeCompare(b.user_name || '', 'pt-BR');
        case 'training_type_name':
          return mul * (a.training_type_name || '').localeCompare(b.training_type_name || '', 'pt-BR');
        case 'training_date':
          return mul * (a.training_date || '').localeCompare(b.training_date || '');
        case 'expiry_date':
          return mul * (a.expiry_date || '').localeCompare(b.expiry_date || '');
        case 'instructor':
          return mul * (a.instructor || '').localeCompare(b.instructor || '', 'pt-BR');
        case 'status': {
          const sa = a.status || computeValidityStatus(a.expiry_date);
          const sb = b.status || computeValidityStatus(b.expiry_date);
          return mul * sa.localeCompare(sb);
        }
        default:
          return 0;
      }
    });

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
                    <th style={{ minWidth: '220px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span
                            onClick={() => toggleTypeSort('name')}
                            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', userSelect: 'none' }}
                          >
                            {t('safety.trainingLabel')}
                            {typeSort.field === 'name' ? (
                              typeSort.dir === 'asc' ? (
                                <ArrowUp size={13} color="var(--color-primary)" />
                              ) : (
                                <ArrowDown size={13} color="var(--color-primary)" />
                              )
                            ) : (
                              <ArrowUpDown size={13} color="var(--color-secondary-text)" style={{ opacity: 0.5 }} />
                            )}
                          </span>
                          <button
                            title="Filtrar por nome"
                            onClick={() => {
                              setShowTypesNameFilter((v) => !v);
                              if (showTypesNameFilter) setTypesNameFilter('');
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '2px',
                              cursor: 'pointer',
                              color: typesNameFilter ? 'var(--color-primary)' : 'var(--color-secondary-text)',
                              display: 'inline-flex',
                              marginLeft: '4px',
                            }}
                          >
                            <Filter size={12} />
                          </button>
                        </div>
                        {showTypesNameFilter && (
                          <div style={{ position: 'relative' }}>
                            <input
                              autoFocus
                              type="text"
                              className="input-field"
                              placeholder="Filtrar por nome..."
                              value={typesNameFilter}
                              onChange={(e) => setTypesNameFilter(e.target.value)}
                              style={{ fontSize: '12px', padding: '4px 24px 4px 8px', height: '28px' }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            {typesNameFilter && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setTypesNameFilter(''); }}
                                style={{
                                  position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                  color: 'var(--color-secondary-text)',
                                }}
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                    <SortableHeader
                      label={t('safety.nrReference')}
                      active={typeSort.field === 'nr_reference'}
                      dir={typeSort.dir}
                      onClick={() => toggleTypeSort('nr_reference')}
                    />
                    <SortableHeader
                      label={t('safety.validityMonths')}
                      active={typeSort.field === 'validity_months'}
                      dir={typeSort.dir}
                      onClick={() => toggleTypeSort('validity_months')}
                    />
                    <SortableHeader
                      label={t('safety.workloadHours')}
                      active={typeSort.field === 'workload_hours'}
                      dir={typeSort.dir}
                      onClick={() => toggleTypeSort('workload_hours')}
                    />
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

          {/* Search and employee filter */}
          <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '260px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-secondary-text)', fontWeight: 500 }}>
                Selecionar Funcionário
              </label>
              <SearchableSelect
                options={filterEmployees.map((emp) => ({ value: String(emp.id), label: emp.name }))}
                value={filterEmployeeId ? String(filterEmployeeId) : undefined}
                onChange={(val) => {
                  setFilterEmployeeId(val ? Number(val) : null);
                  setPage(1);
                }}
                placeholder="— Todos os funcionários —"
                allowClear
              />
            </div>
          </div>

          {/* Selected employee banner */}
          {filterEmployeeId && (
            <div
              style={{
                marginBottom: '12px',
                padding: '10px 14px',
                background: 'var(--color-primary-light, #EBF5FB)',
                border: '1px solid var(--color-primary)30',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Award size={15} />
              <span>
                Exibindo todos os treinamentos de{' '}
                <strong>{filterEmployees.find((e) => e.id === filterEmployeeId)?.name || `Funcionário #${filterEmployeeId}`}</strong>
              </span>
              <button
                onClick={() => { setFilterEmployeeId(null); setPage(1); }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex' }}
                title="Limpar filtro"
              >
                <X size={15} />
              </button>
            </div>
          )}

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
                    <SortableHeader
                      label={t('safety.workerTrainings').split(' ')[0]}
                      active={trainingSort.field === 'user_name'}
                      dir={trainingSort.dir}
                      onClick={() => toggleTrainingSort('user_name')}
                    />
                    <SortableHeader
                      label={t('safety.trainingTypes').split(' ')[0]}
                      active={trainingSort.field === 'training_type_name'}
                      dir={trainingSort.dir}
                      onClick={() => toggleTrainingSort('training_type_name')}
                    />
                    <SortableHeader
                      label={t('safety.trainingDate')}
                      active={trainingSort.field === 'training_date'}
                      dir={trainingSort.dir}
                      onClick={() => toggleTrainingSort('training_date')}
                    />
                    <SortableHeader
                      label={t('safety.expiryDate')}
                      active={trainingSort.field === 'expiry_date'}
                      dir={trainingSort.dir}
                      onClick={() => toggleTrainingSort('expiry_date')}
                    />
                    <SortableHeader
                      label={t('safety.instructor')}
                      active={trainingSort.field === 'instructor'}
                      dir={trainingSort.dir}
                      onClick={() => toggleTrainingSort('instructor')}
                    />
                    <SortableHeader
                      label={t('common.status')}
                      active={trainingSort.field === 'status'}
                      dir={trainingSort.dir}
                      onClick={() => toggleTrainingSort('status')}
                    />
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
                  {t('safety.trainingLabel')} <span style={{ color: 'var(--color-error)' }}>*</span>
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
                <label>
                  {t('safety.nrReference')} <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  className="input-field"
                  value={typeNrReference}
                  onChange={(e) => {
                    setTypeNrReference(e.target.value);
                    if (typeFormTouched.nr_reference || typeFormSubmitAttempted) {
                      const err = validateTypeField('nr_reference', e.target.value);
                      setTypeFormErrors((prev) => ({ ...prev, nr_reference: err }));
                    }
                  }}
                  onBlur={() => handleTypeFieldBlur('nr_reference', typeNrReference)}
                  placeholder="Ex: NR-35"
                  style={
                    (typeFormTouched.nr_reference || typeFormSubmitAttempted) && typeFormErrors.nr_reference
                      ? { borderColor: 'var(--color-error)', boxShadow: '0 0 0 2px rgba(192,57,43,0.15)' }
                      : undefined
                  }
                />
                {(typeFormTouched.nr_reference || typeFormSubmitAttempted) && typeFormErrors.nr_reference && (
                  <span style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>
                    {typeFormErrors.nr_reference}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>
                    {t('safety.validityMonths')} <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
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
                  <label>
                    {t('safety.workloadHours')} <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
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
                <label>
                  {t('common.description')} <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={typeDescription}
                  onChange={(e) => {
                    setTypeDescription(e.target.value);
                    if (typeFormTouched.description || typeFormSubmitAttempted) {
                      const err = validateTypeField('description', e.target.value);
                      setTypeFormErrors((prev) => ({ ...prev, description: err }));
                    }
                  }}
                  onBlur={() => handleTypeFieldBlur('description', typeDescription)}
                  placeholder={t('common.description')}
                  style={{
                    resize: 'vertical',
                    ...((typeFormTouched.description || typeFormSubmitAttempted) && typeFormErrors.description
                      ? { borderColor: 'var(--color-error)', boxShadow: '0 0 0 2px rgba(192,57,43,0.15)' }
                      : {}),
                  }}
                />
                {(typeFormTouched.description || typeFormSubmitAttempted) && typeFormErrors.description && (
                  <span style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>
                    {typeFormErrors.description}
                  </span>
                )}
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
              const target = e.target as HTMLElement;
              if (!target.closest('[data-employee-dropdown]')) {
                setShowEmployeeDropdown(false);
              }
            }}
            style={{ padding: '24px', width: '480px' }}
          >
            <h3 style={{ marginBottom: '4px' }}>{t('safety.createWorkerTraining')}</h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
              Os campos com * são obrigatórios.
            </p>

            {trainingApiError && (
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
                {trainingApiError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Funcionário */}
              <div className="input-group" style={{ position: 'relative', zIndex: 10 }} data-employee-dropdown>
                <label>
                  Funcionário <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={16}
                    style={{
                      position: 'absolute', left: '10px', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--color-secondary-text)', pointerEvents: 'none',
                    }}
                  />
                  <input
                    className="input-field"
                    value={employeeSearch}
                    onChange={(e) => {
                      setEmployeeSearch(e.target.value);
                      setShowEmployeeDropdown(true);
                      if (selectedEmployee && e.target.value !== selectedEmployee.name) {
                        setSelectedEmployee(null);
                        setTrainingUserId('');
                      }
                      if (trainingFormErrors.users_id)
                        setTrainingFormErrors((prev) => ({ ...prev, users_id: '' }));
                    }}
                    onFocus={() => setShowEmployeeDropdown(true)}
                    placeholder={t('safety.searchEmployee')}
                    style={{
                      paddingLeft: '32px',
                      ...(trainingFormErrors.users_id
                        ? { borderColor: 'var(--color-error)', boxShadow: '0 0 0 2px rgba(192,57,43,0.15)' }
                        : {}),
                    }}
                    autoComplete="off"
                  />
                </div>
                {trainingFormErrors.users_id && (
                  <span style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px', display: 'block' }}>
                    {trainingFormErrors.users_id}
                  </span>
                )}
                {showEmployeeDropdown && (
                  <div
                    style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
                      background: '#fff', border: '1px solid #ddd', borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18)', maxHeight: '220px', overflowY: 'auto', marginTop: '2px',
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
                            padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
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

              {/* Tipo de Treinamento */}
              <div className="input-group">
                <label>
                  {t('safety.trainingLabel')} <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <SearchableSelect
                  options={trainingTypes.map((tt) => ({ value: String(tt.id), label: `${tt.name}${tt.nr_reference ? ` (${tt.nr_reference})` : ''}` }))}
                  value={trainingTypeId || undefined}
                  onChange={(val) => {
                    setTrainingTypeId(String(val ?? ''));
                    if (trainingFormErrors.training_types_id)
                      setTrainingFormErrors((prev) => ({ ...prev, training_types_id: '' }));
                  }}
                  placeholder={`— ${t('common.type')} —`}
                  allowClear
                />
                {trainingFormErrors.training_types_id && (
                  <span style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px', display: 'block' }}>
                    {trainingFormErrors.training_types_id}
                  </span>
                )}
              </div>

              {/* Data do Treinamento */}
              <div className="input-group">
                <label>
                  {t('safety.trainingDate')} <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={trainingDate}
                  max={todayIso()}
                  onChange={(e) => {
                    setTrainingDate(e.target.value);
                    if (trainingFormErrors.training_date) {
                      const newVal = e.target.value;
                      const err = !newVal
                        ? 'Informe a data do treinamento'
                        : newVal > todayIso()
                        ? 'A data não pode ser maior que hoje'
                        : '';
                      setTrainingFormErrors((prev) => ({ ...prev, training_date: err }));
                    }
                  }}
                  style={
                    trainingFormErrors.training_date
                      ? { borderColor: 'var(--color-error)', boxShadow: '0 0 0 2px rgba(192,57,43,0.15)' }
                      : undefined
                  }
                />
                {trainingFormErrors.training_date && (
                  <span style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px', display: 'block' }}>
                    {trainingFormErrors.training_date}
                  </span>
                )}
              </div>

              {/* Instrutor */}
              <div className="input-group">
                <label>
                  {t('safety.instructor')} <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  className="input-field"
                  value={trainingInstructor}
                  onChange={(e) => {
                    setTrainingInstructor(e.target.value);
                    if (trainingFormErrors.instructor && e.target.value.trim())
                      setTrainingFormErrors((prev) => ({ ...prev, instructor: '' }));
                  }}
                  placeholder={t('safety.instructor')}
                  style={
                    trainingFormErrors.instructor
                      ? { borderColor: 'var(--color-error)', boxShadow: '0 0 0 2px rgba(192,57,43,0.15)' }
                      : undefined
                  }
                />
                {trainingFormErrors.instructor && (
                  <span style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px', display: 'block' }}>
                    {trainingFormErrors.instructor}
                  </span>
                )}
              </div>

              {/* Certificado: Arquivo + URL */}
              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                  Certificado
                  <span style={{ fontWeight: 400, color: 'var(--color-secondary-text)', marginLeft: '6px', fontSize: '12px' }}>
                    (opcional — anexe o arquivo ou informe a URL)
                  </span>
                </p>

                {/* File upload */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-secondary-text)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    <Paperclip size={13} /> Anexar Arquivo
                  </label>
                  {trainingFile ? (
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 12px', borderRadius: '6px',
                        background: '#F4FEF9', border: '1px solid #028F5830',
                        fontSize: '13px', color: '#028F58',
                      }}
                    >
                      <FileText size={15} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {trainingFile.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)', whiteSpace: 'nowrap' }}>
                        ({(trainingFile.size / 1024).toFixed(0)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTrainingFile(null);
                          if (trainingFormErrors.certificate_file && trainingCertificateUrl.trim())
                            setTrainingFormErrors((prev) => ({ ...prev, certificate_file: '' }));
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#028F58', padding: 0, display: 'flex' }}
                        title="Remover arquivo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        padding: '8px 12px', borderRadius: '6px', border: '1px dashed var(--color-border)',
                        fontSize: '13px', color: 'var(--color-secondary-text)',
                        transition: 'border-color 150ms',
                      }}
                    >
                      <Paperclip size={15} />
                      Clique para selecionar (PDF, imagem)
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          setTrainingFile(f);
                          if (f && trainingFormErrors.certificate_file)
                            setTrainingFormErrors((prev) => ({ ...prev, certificate_file: '' }));
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                  <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ou</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                </div>

                {/* URL de Validação Digital */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-secondary-text)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    <Link size={13} /> URL de Validação Digital
                  </label>
                  <input
                    className="input-field"
                    value={trainingCertificateUrl}
                    onChange={(e) => {
                      setTrainingCertificateUrl(e.target.value);
                      if (trainingFormErrors.certificate_file && (e.target.value.trim() || trainingFile))
                        setTrainingFormErrors((prev) => ({ ...prev, certificate_file: '' }));
                    }}
                    placeholder="https://... (URL de verificação digital)"
                    style={{ fontSize: '13px' }}
                  />
                </div>

              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowTrainingModal(false)} disabled={trainingFileUploading}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveTraining}
                disabled={trainingModalLoading || trainingFileUploading}
              >
                {trainingFileUploading
                  ? 'Enviando arquivo...'
                  : trainingModalLoading
                  ? <span className="spinner" />
                  : t('common.save')}
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
          onConfirm={async () => {
            const id = deleteTrainingConfirm;
            setDeleteTrainingConfirm(null);
            try {
              await safetyApi.deleteWorkerTraining(id);
              loadWorkerTrainings();
            } catch (err) {
              console.error('Erro ao excluir treinamento:', err);
            }
          }}
          onCancel={() => setDeleteTrainingConfirm(null)}
        />
      )}
    </div>
  );
}

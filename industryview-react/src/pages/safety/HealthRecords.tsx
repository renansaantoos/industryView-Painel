import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useAppState } from '../../contexts/AppStateContext';
import { healthApi, usersApi } from '../../services';
import type { HealthRecord } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchableSelect from '../../components/common/SearchableSelect';
import {
  Plus,
  Edit,
  ClipboardList,
  Filter,
  X,
  AlertTriangle,
  Search,
} from 'lucide-react';

/* =========================================
   Constants
   ========================================= */

const EXAM_TYPES = [
  { value: 'admissional', label: 'Admissional' },
  { value: 'periodico', label: 'Periódico' },
  { value: 'retorno_trabalho', label: 'Retorno ao Trabalho' },
  { value: 'mudanca_funcao', label: 'Mudança de Função' },
  { value: 'demissional', label: 'Demissional' },
] as const;

const RESULT_OPTIONS = [
  { value: 'apto', label: 'Apto' },
  { value: 'inapto', label: 'Inapto' },
  { value: 'apto_restricao', label: 'Apto com Restrição' },
] as const;

const PER_PAGE = 10;

/* =========================================
   Types
   ========================================= */

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

interface RecordForm {
  users_id: string;
  exam_type: string;
  exam_date: string;
  expiry_date: string;
  result: string;
  restriction_description: string;
  doctor_name: string;
  crm: string;
}

const EMPTY_FORM: RecordForm = {
  users_id: '',
  exam_type: 'admissional',
  exam_date: new Date().toISOString().slice(0, 10),
  expiry_date: '',
  result: 'apto',
  restriction_description: '',
  doctor_name: '',
  crm: '',
};

/* =========================================
   Helpers
   ========================================= */

function formatDate(dateStr?: string | number): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('pt-BR');
}

function getExpiryStatus(expiry_date?: string | number): 'expired' | 'expiring_soon' | 'ok' | 'none' {
  if (!expiry_date) return 'none';
  const now = new Date();
  const expiry = new Date(expiry_date);
  if (isNaN(expiry.getTime())) return 'none';
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring_soon';
  return 'ok';
}

function getResultBadgeStyle(result: HealthRecord['result']): React.CSSProperties {
  switch (result) {
    case 'apto':
      return { backgroundColor: 'var(--color-status-04)', color: 'var(--color-success)' };
    case 'inapto':
      return { backgroundColor: 'var(--color-status-05)', color: 'var(--color-error)' };
    case 'apto_restricao':
      return { backgroundColor: '#FFF8E7', color: 'var(--color-warning)' };
  }
}

function getResultLabel(result: HealthRecord['result']): string {
  return RESULT_OPTIONS.find((r) => r.value === result)?.label ?? result;
}

function getExamTypeLabel(examType: string): string {
  return EXAM_TYPES.find((et) => et.value === examType)?.label ?? examType;
}

function getRowBackground(expiryStatus: ReturnType<typeof getExpiryStatus>): string | undefined {
  if (expiryStatus === 'expired') return 'rgba(230, 84, 84, 0.06)';
  if (expiryStatus === 'expiring_soon') return 'rgba(239, 169, 83, 0.08)';
  return undefined;
}

/* =========================================
   Main Component
   ========================================= */

export default function HealthRecords() {
  const { projectsInfo, setNavBarSelection } = useAppState();

  useEffect(() => {
    setNavBarSelection(19);
  }, []);

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [filterExamType, setFilterExamType] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [form, setForm] = useState<RecordForm>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RecordForm, string>>>({});
  const [formTouched, setFormTouched] = useState(false);

  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<HealthRecord | null>(null);

  const [toast, setToast] = useState<ToastState | null>(null);

  /* =========================================
     Toast
     ========================================= */

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  /* =========================================
     Load Records
     ========================================= */

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof healthApi.listRecords>[0] = {
        page,
        per_page: PER_PAGE,
      };
      if (projectsInfo) params.company_id = projectsInfo.id;
      if (filterExamType) params.exam_type = filterExamType;
      const data = await healthApi.listRecords(params);
      setRecords(data.items ?? []);
      setTotalPages(data.pageTotal ?? 1);
      setTotalItems(data.itemsTotal ?? 0);
    } catch {
      showToast('Erro ao carregar registros de saúde', 'error');
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, page, filterExamType, showToast]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  /* =========================================
     Load Users for Dropdown
     ========================================= */

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await usersApi.queryAllUsers({ per_page: 50 });
      setUsers((data.items ?? []).map((u: any) => ({ id: u.id, name: u.name })));
    } catch {
      showToast('Erro ao carregar lista de colaboradores', 'error');
    } finally {
      setUsersLoading(false);
    }
  }, [showToast]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter((u) => u.name?.toLowerCase().includes(q));
  }, [users, userSearch]);

  const selectedUserName = useMemo(() => {
    if (!form.users_id) return '';
    const u = users.find((u) => String(u.id) === form.users_id);
    if (u?.name) return u.name;
    // Fallback: usar o nome do registro sendo editado
    if (editingRecord && String(editingRecord.users_id) === form.users_id) {
      return editingRecord.user_name ?? '';
    }
    return '';
  }, [form.users_id, users, editingRecord]);

  /* =========================================
     Form Validation
     ========================================= */

  const validateForm = useCallback((): Partial<Record<keyof RecordForm, string>> => {
    const errors: Partial<Record<keyof RecordForm, string>> = {};
    if (!form.users_id) errors.users_id = 'Selecione um colaborador';
    if (!form.exam_type) errors.exam_type = 'Selecione o tipo de exame';
    if (!form.exam_date) errors.exam_date = 'Informe a data do exame';
    if (!form.result) errors.result = 'Selecione o resultado';
    if (form.result === 'apto_restricao' && !form.restriction_description.trim()) {
      errors.restriction_description = 'Descreva a restrição para resultado "Apto com Restrição"';
    }
    return errors;
  }, [form]);

  /* =========================================
     Handlers
     ========================================= */

  const openCreateModal = () => {
    setEditingRecord(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormTouched(false);
    setUserSearch('');
    setShowUserDropdown(false);
    setShowModal(true);
    loadUsers();
  };

  const openEditModal = (record: HealthRecord) => {
    setEditingRecord(record);
    const toDateStr = (v: string | number | undefined): string => {
      if (!v) return '';
      const d = new Date(v);
      if (isNaN(d.getTime())) return String(v).slice(0, 10);
      return d.toISOString().slice(0, 10);
    };
    setForm({
      users_id: String(record.users_id),
      exam_type: record.exam_type,
      exam_date: toDateStr(record.exam_date),
      expiry_date: toDateStr(record.expiry_date),
      result: record.result,
      restriction_description: record.restriction_description ?? '',
      doctor_name: record.doctor_name ?? '',
      crm: record.crm ?? '',
    });
    setFormErrors({});
    setFormTouched(false);
    setUserSearch('');
    setShowUserDropdown(false);
    setShowModal(true);
    loadUsers();
  };

  const handleSave = async () => {
    setFormTouched(true);
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setFormLoading(true);
    try {
      const payload = {
        users_id: parseInt(form.users_id, 10),
        exam_type: form.exam_type,
        exam_date: form.exam_date,
        expiry_date: form.expiry_date || undefined,
        result: form.result,
        restriction_description: form.result === 'apto_restricao' ? form.restriction_description.trim() || undefined : undefined,
        doctor_name: form.doctor_name.trim() || undefined,
        crm: form.crm.trim() || undefined,
      };
      if (editingRecord) {
        await healthApi.updateRecord(editingRecord.id, payload);
        showToast('Registro atualizado com sucesso', 'success');
      } else {
        await healthApi.createRecord(payload);
        showToast('Registro criado com sucesso', 'success');
      }
      setShowModal(false);
      loadRecords();
    } catch {
      showToast('Erro ao salvar registro', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Health records don't have a dedicated delete endpoint in the service,
  // so the delete confirm is wired but handled gracefully.
  const handleDeleteConfirmed = async () => {
    if (!deleteConfirm) return;
    try {
      await healthApi.updateRecord(deleteConfirm.id, { is_active: false });
      showToast('Registro inativado', 'success');
    } catch {
      showToast('Erro ao excluir registro', 'error');
    } finally {
      setDeleteConfirm(null);
      loadRecords();
    }
  };

  const handleClearFilters = () => {
    setFilterExamType('');
    setPage(1);
  };

  /* =========================================
     Render
     ========================================= */

  return (
    <div>
      <PageHeader
        title="Registros de Saúde"
        subtitle="Controle de ASOs e aptidão ocupacional dos colaboradores"
        breadcrumb="Segurança / Saúde Ocupacional"
        actions={
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> Novo Registro
          </button>
        }
      />

      <ProjectFilterDropdown />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-secondary-text)' }}>
          <Filter size={16} />
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Filtrar por tipo:</span>
        </div>
        <div className="input-group" style={{ margin: 0, flex: '0 0 220px' }}>
          <SearchableSelect
            options={EXAM_TYPES.map((et) => ({ value: et.value, label: et.label }))}
            value={filterExamType || undefined}
            onChange={(val) => { setFilterExamType(String(val ?? '')); setPage(1); }}
            placeholder="Todos os tipos de exame"
            allowClear
            style={{ flex: '0 0 220px' }}
          />
        </div>
        {filterExamType && (
          <button className="btn btn-icon" title="Limpar filtro" onClick={handleClearFilters}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : records.length === 0 ? (
        <EmptyState
          message="Nenhum registro de saúde encontrado"
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> Novo Registro
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Tipo de Exame</th>
                <th>Data do Exame</th>
                <th>Data de Validade</th>
                <th>Resultado</th>
                <th>Médico / CRM</th>
                <th>Ações</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {records.map((record) => {
                const expiryStatus = getExpiryStatus(record.expiry_date);
                const rowBg = getRowBackground(expiryStatus);
                return (
                  <motion.tr key={record.id} variants={tableRowVariants} style={{ backgroundColor: rowBg }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClipboardList size={16} color="var(--color-primary)" />
                        <span style={{ fontWeight: 500 }}>
                          {record.user_name ?? `ID ${record.users_id}`}
                        </span>
                      </div>
                    </td>
                    <td>{getExamTypeLabel(record.exam_type)}</td>
                    <td>{formatDate(record.exam_date)}</td>
                    <td>
                      {record.expiry_date ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {expiryStatus !== 'ok' && (
                            <AlertTriangle
                              size={14}
                              color={expiryStatus === 'expired' ? 'var(--color-error)' : 'var(--color-warning)'}
                            />
                          )}
                          <span
                            style={{
                              color: expiryStatus === 'expired'
                                ? 'var(--color-error)'
                                : expiryStatus === 'expiring_soon'
                                ? 'var(--color-warning)'
                                : 'var(--color-primary-text)',
                              fontWeight: expiryStatus !== 'ok' ? 600 : 400,
                            }}
                          >
                            {formatDate(record.expiry_date)}
                          </span>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      <div>
                        <span className="badge" style={getResultBadgeStyle(record.result)}>
                          {getResultLabel(record.result)}
                        </span>
                        {record.result === 'apto_restricao' && record.restriction_description && (
                          <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '4px', maxWidth: '200px' }}>
                            {record.restriction_description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                      {record.doctor_name ?? '-'}
                      {record.crm && (
                        <div style={{ fontSize: '11px' }}>CRM: {record.crm}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="btn btn-icon"
                          title="Editar"
                          onClick={() => openEditModal(record)}
                        >
                          <Edit size={16} color="var(--color-primary)" />
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
            perPage={PER_PAGE}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', padding: '28px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>
                {editingRecord ? 'Editar Registro de Saúde' : 'Novo Registro de Saúde (ASO)'}
              </h3>
              <button className="btn btn-icon" onClick={() => setShowModal(false)} title="Fechar">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Colaborador - searchable dropdown */}
              <div className="input-group">
                <label>Colaborador <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  {form.users_id && selectedUserName ? (
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)', backgroundColor: 'var(--color-secondary-bg)',
                        cursor: 'pointer',
                      }}
                      onClick={() => { setShowUserDropdown(true); setUserSearch(''); if (users.length === 0) loadUsers(); }}
                    >
                      <span style={{ fontWeight: 500 }}>{selectedUserName}</span>
                      <X size={14} style={{ cursor: 'pointer', color: 'var(--color-secondary-text)' }}
                        onClick={(e) => { e.stopPropagation(); setForm((f) => ({ ...f, users_id: '' })); }}
                      />
                    </div>
                  ) : (
                    <>
                      <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-text)' }} />
                        <input
                          className="input-field"
                          placeholder={usersLoading ? 'Carregando colaboradores...' : 'Buscar colaborador pelo nome...'}
                          value={userSearch}
                          onChange={(e) => { setUserSearch(e.target.value); setShowUserDropdown(true); }}
                          onFocus={() => setShowUserDropdown(true)}
                          style={{
                            paddingLeft: '34px',
                            borderColor: formTouched && formErrors.users_id ? 'var(--color-error)' : undefined,
                          }}
                        />
                      </div>
                      {showUserDropdown && (
                        <div style={{
                          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                          maxHeight: '180px', overflowY: 'auto',
                          backgroundColor: 'var(--color-secondary-bg)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          boxShadow: 'var(--shadow-md)',
                          marginTop: '4px',
                        }}>
                          {usersLoading ? (
                            <div style={{ padding: '12px', fontSize: '13px', color: 'var(--color-secondary-text)', textAlign: 'center' }}>
                              Carregando colaboradores...
                            </div>
                          ) : filteredUsers.length === 0 ? (
                            <div style={{ padding: '12px', fontSize: '13px', color: 'var(--color-secondary-text)', textAlign: 'center' }}>
                              {users.length === 0 ? (
                                <span>
                                  Nenhum colaborador carregado.{' '}
                                  <span style={{ color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={loadUsers}>
                                    Tentar novamente
                                  </span>
                                </span>
                              ) : 'Nenhum colaborador encontrado'}
                            </div>
                          ) : filteredUsers.map((u) => (
                            <div
                              key={u.id}
                              style={{
                                padding: '8px 12px', cursor: 'pointer', fontSize: '14px',
                                borderBottom: '1px solid var(--color-border)',
                              }}
                              onMouseDown={() => {
                                setForm((f) => ({ ...f, users_id: String(u.id) }));
                                setShowUserDropdown(false);
                                setUserSearch('');
                              }}
                              onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = 'var(--color-hover)'; }}
                              onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = 'transparent'; }}
                            >
                              {u.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {formTouched && formErrors.users_id && (
                  <span style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>{formErrors.users_id}</span>
                )}
              </div>

              {/* Tipo de Exame */}
              <div className="input-group">
                <label>Tipo de Exame <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <SearchableSelect
                  options={EXAM_TYPES.map((et) => ({ value: et.value, label: et.label }))}
                  value={form.exam_type || undefined}
                  onChange={(val) => setForm((f) => ({ ...f, exam_type: String(val ?? '') }))}
                  style={formTouched && formErrors.exam_type ? { border: '1px solid var(--color-error)', borderRadius: '6px' } : {}}
                />
                {formTouched && formErrors.exam_type && (
                  <span style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>{formErrors.exam_type}</span>
                )}
              </div>

              {/* Datas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Data do Exame <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.exam_date}
                    onChange={(e) => setForm((f) => ({ ...f, exam_date: e.target.value }))}
                    style={{ borderColor: formTouched && formErrors.exam_date ? 'var(--color-error)' : undefined }}
                  />
                  {formTouched && formErrors.exam_date && (
                    <span style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>{formErrors.exam_date}</span>
                  )}
                </div>
                <div className="input-group">
                  <label>Data de Validade</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.expiry_date}
                    onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))}
                  />
                </div>
              </div>

              {/* Resultado */}
              <div className="input-group">
                <label>Resultado <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <SearchableSelect
                  options={RESULT_OPTIONS.map((ro) => ({ value: ro.value, label: ro.label }))}
                  value={form.result || undefined}
                  onChange={(val) => setForm((f) => ({ ...f, result: String(val ?? '') }))}
                  style={formTouched && formErrors.result ? { border: '1px solid var(--color-error)', borderRadius: '6px' } : {}}
                />
                {formTouched && formErrors.result && (
                  <span style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>{formErrors.result}</span>
                )}
              </div>

              {/* Descrição da Restrição - condicional */}
              {form.result === 'apto_restricao' && (
                <div className="input-group">
                  <label>Descrição da Restrição <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <textarea
                    className="input-field"
                    placeholder="Descreva as restrições ocupacionais..."
                    rows={3}
                    value={form.restriction_description}
                    onChange={(e) => setForm((f) => ({ ...f, restriction_description: e.target.value }))}
                    style={{
                      resize: 'vertical',
                      borderColor: formTouched && formErrors.restriction_description ? 'var(--color-error)' : undefined,
                    }}
                  />
                  {formTouched && formErrors.restriction_description && (
                    <span style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>{formErrors.restriction_description}</span>
                  )}
                </div>
              )}

              {/* Médico / CRM */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Nome do Médico</label>
                  <input
                    className="input-field"
                    placeholder="Dr. João Silva"
                    value={form.doctor_name}
                    onChange={(e) => setForm((f) => ({ ...f, doctor_name: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label>CRM</label>
                  <input
                    className="input-field"
                    placeholder="CRM/SP 12345"
                    value={form.crm}
                    onChange={(e) => setForm((f) => ({ ...f, crm: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={formLoading}>
                {formLoading ? <span className="spinner" /> : editingRecord ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ConfirmModal
          title="Inativar Registro"
          message={`Tem certeza que deseja inativar o registro de saúde de "${deleteConfirm.user_name ?? `ID ${deleteConfirm.users_id}`}"?`}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: 'var(--shadow-lg)',
            maxWidth: '360px',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

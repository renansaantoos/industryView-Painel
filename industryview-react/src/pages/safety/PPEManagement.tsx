import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { ppeApi, usersApi } from '../../services';
import type { PpeType, PpeDelivery, UserFull } from '../../types';
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
  Trash2,
  ShieldCheck,
  RotateCcw,
  Package,
  Filter,
  X,
  Search,
  ChevronDown,
} from 'lucide-react';

/* =========================================
   Types
   ========================================= */

type ActiveTab = 'types' | 'deliveries';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

interface PpeTypeForm {
  name: string;
  ca_number: string;
  validity_months: string;
  description: string;
}

interface DeliveryForm {
  ppe_types_id: string;
  users_id: string;
  quantity: string;
  delivery_date: string;
  observation: string;
}

const EMPTY_PPE_TYPE_FORM: PpeTypeForm = {
  name: '',
  ca_number: '',
  validity_months: '',
  description: '',
};

const EMPTY_DELIVERY_FORM: DeliveryForm = {
  ppe_types_id: '',
  users_id: '',
  quantity: '1',
  delivery_date: new Date().toISOString().slice(0, 10),
  observation: '',
};

const PER_PAGE = 10;

/* =========================================
   Helpers
   ========================================= */

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('pt-BR');
}

/* =========================================
   Main Component
   ========================================= */

export default function PPEManagement() {
  const { projectsInfo, setNavBarSelection } = useAppState();
  const { user } = useAuthContext();

  useEffect(() => {
    setNavBarSelection(18);
  }, []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('types');
  const [toast, setToast] = useState<ToastState | null>(null);

  /* ---- PPE Types state ---- */
  const [ppeTypes, setPpeTypes] = useState<PpeType[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<PpeType | null>(null);
  const [typeForm, setTypeForm] = useState<PpeTypeForm>(EMPTY_PPE_TYPE_FORM);
  const [typeFormLoading, setTypeFormLoading] = useState(false);
  const [deleteTypeConfirm, setDeleteTypeConfirm] = useState<PpeType | null>(null);
  const [typeErrors, setTypeErrors] = useState<Partial<Record<keyof PpeTypeForm, string>>>({});

  /* ---- Deliveries state ---- */
  const [deliveries, setDeliveries] = useState<PpeDelivery[]>([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(true);
  const [deliveryPage, setDeliveryPage] = useState(1);
  const [deliveryTotalPages, setDeliveryTotalPages] = useState(1);
  const [deliveryTotalItems, setDeliveryTotalItems] = useState(0);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterPpeTypeId, setFilterPpeTypeId] = useState('');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>(EMPTY_DELIVERY_FORM);
  const [deliveryFormLoading, setDeliveryFormLoading] = useState(false);
  const [returningDeliveryId, setReturningDeliveryId] = useState<number | null>(null);
  const [deliveryErrors, setDeliveryErrors] = useState<Partial<Record<keyof DeliveryForm, string>>>({});

  /* ---- Employee dropdown state ---- */
  const [employeesList, setEmployeesList] = useState<UserFull[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const employeeDropdownRef = useRef<HTMLDivElement>(null);
  const employeeSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* =========================================
     Toast
     ========================================= */

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  /* =========================================
     Load PPE Types
     ========================================= */

  const loadPpeTypes = useCallback(async () => {
    setTypesLoading(true);
    try {
      const params: Parameters<typeof ppeApi.listPpeTypes>[0] = {};
      if (user?.companyId) params.company_id = user.companyId;
      const data = await ppeApi.listPpeTypes(params);
      const list = Array.isArray(data) ? data : (data as any)?.items ?? [];
      setPpeTypes(list);
    } catch {
      showToast('Erro ao carregar tipos de EPI', 'error');
    } finally {
      setTypesLoading(false);
    }
  }, [user, showToast]);

  /* =========================================
     Load Deliveries
     ========================================= */

  const loadDeliveries = useCallback(async () => {
    setDeliveriesLoading(true);
    try {
      const params: Parameters<typeof ppeApi.listDeliveries>[0] = {
        page: deliveryPage,
        per_page: PER_PAGE,
      };
      if (user?.companyId) params.company_id = user.companyId;
      if (filterSearch.trim()) params.search = filterSearch.trim();
      if (filterPpeTypeId.trim()) params.ppe_types_id = parseInt(filterPpeTypeId, 10);
      const data = await ppeApi.listDeliveries(params);
      setDeliveries(data.items ?? []);
      setDeliveryTotalPages(data.pageTotal ?? 1);
      setDeliveryTotalItems(data.itemsTotal ?? 0);
    } catch {
      showToast('Erro ao carregar entregas de EPI', 'error');
    } finally {
      setDeliveriesLoading(false);
    }
  }, [user, deliveryPage, filterSearch, filterPpeTypeId, showToast]);

  useEffect(() => {
    if (activeTab === 'types') loadPpeTypes();
  }, [activeTab, loadPpeTypes]);

  useEffect(() => {
    if (activeTab === 'deliveries') loadDeliveries();
  }, [activeTab, loadDeliveries]);

  /* =========================================
     Load Employees for dropdown
     ========================================= */

  const loadEmployees = useCallback(async (search = '') => {
    setEmployeesLoading(true);
    try {
      const data = await usersApi.queryAllUsers({ per_page: 50, search: search || undefined });
      const list = Array.isArray(data) ? data : (data as any)?.items ?? [];
      setEmployeesList(list);
    } catch {
      // silently fail — dropdown will just be empty
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  const handleEmployeeSearch = (value: string) => {
    setEmployeeSearch(value);
    if (employeeSearchTimerRef.current) clearTimeout(employeeSearchTimerRef.current);
    employeeSearchTimerRef.current = setTimeout(() => loadEmployees(value), 300);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(e.target as Node)) {
        setShowEmployeeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* =========================================
     Validation Helpers
     ========================================= */

  const validateTypeForm = (): boolean => {
    const errors: Partial<Record<keyof PpeTypeForm, string>> = {};
    if (!typeForm.name.trim()) errors.name = 'Nome é obrigatório';
    if (!typeForm.ca_number.trim()) errors.ca_number = 'Número do CA é obrigatório';
    else if (!/^\d+$/.test(typeForm.ca_number.trim())) errors.ca_number = 'Apenas números são permitidos';
    if (!typeForm.validity_months.trim()) errors.validity_months = 'Validade é obrigatória';
    else {
      const m = parseInt(typeForm.validity_months, 10);
      if (isNaN(m) || m < 1) errors.validity_months = 'Valor mínimo é 1';
      else if (m > 120) errors.validity_months = 'Máximo 120 meses';
    }
    setTypeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTypeField = (field: keyof PpeTypeForm, value: string) => {
    setTypeForm((f) => ({ ...f, [field]: value }));
    if (typeErrors[field]) setTypeErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateDeliveryForm = (): boolean => {
    const errors: Partial<Record<keyof DeliveryForm, string>> = {};
    if (!deliveryForm.ppe_types_id) errors.ppe_types_id = 'Tipo de EPI é obrigatório';
    if (!deliveryForm.users_id.trim()) errors.users_id = 'Colaborador é obrigatório';
    if (!deliveryForm.quantity.trim() || parseInt(deliveryForm.quantity, 10) < 1) errors.quantity = 'Quantidade mínima é 1';
    if (!deliveryForm.delivery_date) errors.delivery_date = 'Data de entrega é obrigatória';
    setDeliveryErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDeliveryField = (field: keyof DeliveryForm, value: string) => {
    setDeliveryForm((f) => ({ ...f, [field]: value }));
    if (deliveryErrors[field]) setDeliveryErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  /* =========================================
     PPE Type Handlers
     ========================================= */

  const openCreateType = () => {
    setEditingType(null);
    setTypeForm(EMPTY_PPE_TYPE_FORM);
    setTypeErrors({});
    setShowTypeModal(true);
  };

  const openEditType = (ppeType: PpeType) => {
    setEditingType(ppeType);
    setTypeForm({
      name: ppeType.name,
      ca_number: ppeType.ca_number ?? '',
      validity_months: ppeType.validity_months != null ? String(ppeType.validity_months) : '',
      description: ppeType.description ?? '',
    });
    setTypeErrors({});
    setShowTypeModal(true);
  };

  const handleSaveType = async () => {
    if (!validateTypeForm()) return;
    setTypeFormLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: typeForm.name.trim(),
        ca_number: typeForm.ca_number.trim(),
        validity_months: parseInt(typeForm.validity_months, 10),
        description: typeForm.description.trim() || undefined,
      };
      if (editingType) {
        await ppeApi.updatePpeType(editingType.id, payload as any);
        showToast('Tipo de EPI atualizado com sucesso', 'success');
      } else {
        payload.company_id = user?.companyId || 1;
        await ppeApi.createPpeType(payload as any);
        showToast('Tipo de EPI criado com sucesso', 'success');
      }
      setShowTypeModal(false);
      loadPpeTypes();
    } catch {
      showToast('Erro ao salvar tipo de EPI', 'error');
    } finally {
      setTypeFormLoading(false);
    }
  };

  const handleDeleteType = async () => {
    if (!deleteTypeConfirm) return;
    try {
      await ppeApi.deletePpeType(deleteTypeConfirm.id);
      showToast('Tipo de EPI excluído', 'success');
      setDeleteTypeConfirm(null);
      loadPpeTypes();
    } catch {
      showToast('Erro ao excluir tipo de EPI', 'error');
      setDeleteTypeConfirm(null);
    }
  };

  /* =========================================
     Delivery Handlers
     ========================================= */

  const openCreateDelivery = () => {
    setDeliveryForm(EMPTY_DELIVERY_FORM);
    setDeliveryErrors({});
    setSelectedEmployeeName('');
    setEmployeeSearch('');
    setShowEmployeeDropdown(false);
    loadEmployees();
    setShowDeliveryModal(true);
  };

  const handleSaveDelivery = async () => {
    if (!validateDeliveryForm()) return;
    setDeliveryFormLoading(true);
    try {
      await ppeApi.createDelivery({
        ppe_types_id: parseInt(deliveryForm.ppe_types_id, 10),
        users_id: parseInt(deliveryForm.users_id, 10),
        quantity: parseInt(deliveryForm.quantity, 10) || 1,
        delivery_date: deliveryForm.delivery_date,
        observation: deliveryForm.observation.trim() || undefined,
      });
      showToast('Entrega registrada com sucesso', 'success');
      setShowDeliveryModal(false);
      loadDeliveries();
    } catch {
      showToast('Erro ao registrar entrega', 'error');
    } finally {
      setDeliveryFormLoading(false);
    }
  };

  const handleRegisterReturn = async (deliveryId: number) => {
    setReturningDeliveryId(deliveryId);
    try {
      await ppeApi.registerReturn(deliveryId);
      showToast('Devolução registrada com sucesso', 'success');
      loadDeliveries();
    } catch {
      showToast('Erro ao registrar devolução', 'error');
    } finally {
      setReturningDeliveryId(null);
    }
  };

  const handleClearDeliveryFilters = () => {
    setFilterSearch('');
    setFilterPpeTypeId('');
    setDeliveryPage(1);
  };

  /* =========================================
     Tab style helpers
     ========================================= */

  const tabContainerStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: '2px solid var(--color-alternate)',
    marginBottom: '20px',
    gap: '4px',
  };

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? 'var(--color-primary)' : 'var(--color-secondary-text)',
    background: 'none',
    border: 'none',
    borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
    marginBottom: '-2px',
    cursor: 'pointer',
    transition: 'color var(--transition-fast), border-color var(--transition-fast)',
  });

  /* =========================================
     Render
     ========================================= */

  return (
    <div>
      <PageHeader
        title="Gestão de EPI"
        subtitle="Controle de tipos de EPI e entregas para colaboradores"
        breadcrumb="Segurança / EPI"
        actions={
          activeTab === 'types' ? (
            <button className="btn btn-primary" onClick={openCreateType}>
              <Plus size={18} /> Novo Tipo de EPI
            </button>
          ) : (
            <button className="btn btn-primary" onClick={openCreateDelivery}>
              <Plus size={18} /> Registrar Entrega
            </button>
          )
        }
      />

      <ProjectFilterDropdown />

      {/* Tabs */}
      <div style={tabContainerStyle}>
        <button style={tabButtonStyle(activeTab === 'types')} onClick={() => setActiveTab('types')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} />
            Tipos de EPI
          </div>
        </button>
        <button style={tabButtonStyle(activeTab === 'deliveries')} onClick={() => setActiveTab('deliveries')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={16} />
            Entregas
          </div>
        </button>
      </div>

      {/* Tab: PPE Types */}
      {activeTab === 'types' && (
        <>
          {typesLoading ? (
            <LoadingSpinner />
          ) : ppeTypes.length === 0 ? (
            <EmptyState
              message="Nenhum tipo de EPI cadastrado"
              action={
                <button className="btn btn-primary" onClick={openCreateType}>
                  <Plus size={18} /> Novo Tipo de EPI
                </button>
              }
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Número do CA</th>
                    <th>Validade (meses)</th>
                    <th>Descrição</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {ppeTypes.map((ppeType) => (
                    <motion.tr key={ppeType.id} variants={tableRowVariants}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ShieldCheck size={16} color="var(--color-primary)" />
                          <span style={{ fontWeight: 500 }}>{ppeType.name}</span>
                        </div>
                      </td>
                      <td>{ppeType.ca_number ?? '-'}</td>
                      <td>{ppeType.validity_months != null ? `${ppeType.validity_months} meses` : '-'}</td>
                      <td style={{ maxWidth: '280px', color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                        {ppeType.description ?? '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="btn btn-icon"
                            title="Editar"
                            onClick={() => openEditType(ppeType)}
                          >
                            <Edit size={16} color="var(--color-primary)" />
                          </button>
                          <button
                            className="btn btn-icon"
                            title="Excluir"
                            onClick={() => setDeleteTypeConfirm(ppeType)}
                          >
                            <Trash2 size={16} color="var(--color-error)" />
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

      {/* Tab: Deliveries */}
      {activeTab === 'deliveries' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-secondary-text)' }}>
              <Filter size={16} />
              <span style={{ fontSize: '13px', fontWeight: 500 }}>Filtros:</span>
            </div>
            <div className="input-group" style={{ margin: 0, flex: '0 0 260px', position: 'relative' }}>
              <Search
                size={14}
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
                type="text"
                className="input-field"
                placeholder="Nome ou ID do colaborador"
                value={filterSearch}
                onChange={(e) => { setFilterSearch(e.target.value); setDeliveryPage(1); }}
                style={{ paddingLeft: '32px' }}
              />
            </div>
            <div className="input-group" style={{ margin: 0, flex: '0 0 200px' }}>
              <SearchableSelect
                options={ppeTypes.map((pt) => ({ value: String(pt.id), label: pt.name }))}
                value={filterPpeTypeId || undefined}
                onChange={(val) => { setFilterPpeTypeId(String(val ?? '')); setDeliveryPage(1); }}
                placeholder="Todos os tipos de EPI"
                allowClear
                style={{ flex: '0 0 200px' }}
              />
            </div>
            {(filterSearch || filterPpeTypeId) && (
              <button className="btn btn-icon" title="Limpar filtros" onClick={handleClearDeliveryFilters}>
                <X size={16} />
              </button>
            )}
          </div>

          {deliveriesLoading ? (
            <LoadingSpinner />
          ) : deliveries.length === 0 ? (
            <EmptyState
              message="Nenhuma entrega de EPI encontrada"
              action={
                <button className="btn btn-primary" onClick={openCreateDelivery}>
                  <Plus size={18} /> Registrar Entrega
                </button>
              }
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Colaborador</th>
                    <th>Tipo de EPI</th>
                    <th>Quantidade</th>
                    <th>Data de Entrega</th>
                    <th>Data de Devolução</th>
                    <th>Devolvido</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {deliveries.map((delivery) => (
                    <motion.tr key={delivery.id} variants={tableRowVariants}>
                      <td style={{ fontWeight: 500 }}>
                        {delivery.user?.name
                          ? `${delivery.user.name} (ID ${delivery.users_id})`
                          : delivery.user_name
                            ? `${delivery.user_name} (ID ${delivery.users_id})`
                            : `ID ${delivery.users_id}`}
                      </td>
                      <td>{delivery.ppe_type?.name ?? delivery.ppe_type_name ?? `ID ${delivery.ppe_types_id}`}</td>
                      <td>{delivery.quantity}</td>
                      <td>{formatDate(delivery.delivery_date)}</td>
                      <td>{delivery.return_date ? formatDate(delivery.return_date) : '-'}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: delivery.returned ? 'var(--color-status-04)' : 'var(--color-status-05)',
                            color: delivery.returned ? 'var(--color-success)' : 'var(--color-error)',
                          }}
                        >
                          {delivery.returned ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td>
                        {!delivery.returned && (
                          <button
                            className="btn btn-icon"
                            title="Registrar Devolução"
                            disabled={returningDeliveryId === delivery.id}
                            onClick={() => handleRegisterReturn(delivery.id)}
                          >
                            {returningDeliveryId === delivery.id ? (
                              <span className="spinner" style={{ width: 16, height: 16 }} />
                            ) : (
                              <RotateCcw size={16} color="var(--color-primary)" />
                            )}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
              <Pagination
                currentPage={deliveryPage}
                totalPages={deliveryTotalPages}
                perPage={PER_PAGE}
                totalItems={deliveryTotalItems}
                onPageChange={setDeliveryPage}
              />
            </div>
          )}
        </>
      )}

      {/* PPE Type Modal */}
      {showTypeModal && (
        <div className="modal-backdrop" onClick={() => setShowTypeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>{editingType ? 'Editar Tipo de EPI' : 'Novo Tipo de EPI'}</h3>
              <button className="btn btn-icon" onClick={() => setShowTypeModal(false)} title="Fechar">
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>Nome <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input
                  className={`input-field${typeErrors.name ? ' error' : ''}`}
                  placeholder="Ex: Capacete de Segurança"
                  value={typeForm.name}
                  onChange={(e) => handleTypeField('name', e.target.value)}
                />
                {typeErrors.name && <span className="input-error">{typeErrors.name}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Número do CA <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input
                    className={`input-field${typeErrors.ca_number ? ' error' : ''}`}
                    placeholder="Ex: 12345"
                    inputMode="numeric"
                    value={typeForm.ca_number}
                    onChange={(e) => handleTypeField('ca_number', e.target.value)}
                  />
                  {typeErrors.ca_number && <span className="input-error">{typeErrors.ca_number}</span>}
                </div>
                <div className="input-group">
                  <label>Validade (meses) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input
                    type="number"
                    className={`input-field${typeErrors.validity_months ? ' error' : ''}`}
                    placeholder="Ex: 12"
                    min="1"
                    value={typeForm.validity_months}
                    onChange={(e) => handleTypeField('validity_months', e.target.value)}
                  />
                  {typeErrors.validity_months && <span className="input-error">{typeErrors.validity_months}</span>}
                </div>
              </div>
              <div className="input-group">
                <label>Descrição</label>
                <textarea
                  className="input-field"
                  placeholder="Descrição do EPI..."
                  rows={3}
                  value={typeForm.description}
                  onChange={(e) => handleTypeField('description', e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
                <span style={{ color: 'var(--color-error)' }}>*</span> Campos obrigatórios
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowTypeModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSaveType} disabled={typeFormLoading}>
                {typeFormLoading ? <span className="spinner" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="modal-backdrop" onClick={() => setShowDeliveryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Registrar Entrega de EPI</h3>
              <button className="btn btn-icon" onClick={() => setShowDeliveryModal(false)} title="Fechar">
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>Tipo de EPI <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <SearchableSelect
                  options={ppeTypes.map((pt) => ({ value: String(pt.id), label: pt.name }))}
                  value={deliveryForm.ppe_types_id || undefined}
                  onChange={(val) => handleDeliveryField('ppe_types_id', String(val ?? ''))}
                  placeholder="Selecione o tipo de EPI"
                  allowClear
                  style={deliveryErrors.ppe_types_id ? { border: '1px solid var(--color-error)', borderRadius: '6px' } : {}}
                />
                {deliveryErrors.ppe_types_id && <span className="input-error">{deliveryErrors.ppe_types_id}</span>}
              </div>
              <div className="input-group" ref={employeeDropdownRef} style={{ position: 'relative' }}>
                <label>Colaborador <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <div
                  className={`input-field${deliveryErrors.users_id ? ' error' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    overflow: 'hidden',
                  }}
                  onClick={() => {
                    setShowEmployeeDropdown((prev) => !prev);
                    if (!showEmployeeDropdown && employeesList.length === 0) loadEmployees();
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      color: selectedEmployeeName ? 'var(--color-text)' : 'var(--color-secondary-text)',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {selectedEmployeeName || 'Selecione o colaborador'}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      marginRight: '10px',
                      color: 'var(--color-secondary-text)',
                      transition: 'transform 0.2s',
                      transform: showEmployeeDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </div>

                {showEmployeeDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 100,
                      backgroundColor: 'var(--color-surface, #fff)',
                      border: '1px solid var(--color-alternate, #e0e0e0)',
                      borderRadius: 'var(--radius-md, 8px)',
                      boxShadow: 'var(--shadow-lg, 0 4px 12px rgba(0,0,0,0.15))',
                      marginTop: '4px',
                      maxHeight: '280px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--color-alternate, #e0e0e0)' }}>
                      <div style={{ position: 'relative' }}>
                        <Search
                          size={14}
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
                          placeholder="Buscar por nome..."
                          value={employeeSearch}
                          onChange={(e) => handleEmployeeSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ paddingLeft: '32px', margin: 0 }}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div style={{ overflowY: 'auto', maxHeight: '220px' }}>
                      {employeesLoading ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                          Carregando...
                        </div>
                      ) : employeesList.length === 0 ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                          Nenhum colaborador encontrado
                        </div>
                      ) : (
                        employeesList.map((emp) => (
                          <div
                            key={emp.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeliveryField('users_id', String(emp.id));
                              setSelectedEmployeeName(emp.name);
                              setShowEmployeeDropdown(false);
                              setEmployeeSearch('');
                            }}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              backgroundColor: deliveryForm.users_id === String(emp.id) ? 'var(--color-primary-light, #e8f0fe)' : 'transparent',
                              transition: 'background-color 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              if (deliveryForm.users_id !== String(emp.id))
                                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-hover, #f5f5f5)';
                            }}
                            onMouseLeave={(e) => {
                              if (deliveryForm.users_id !== String(emp.id))
                                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                            }}
                          >
                            <div style={{ fontWeight: 500 }}>{emp.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{emp.email}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                {deliveryErrors.users_id && <span className="input-error">{deliveryErrors.users_id}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Quantidade <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input
                    type="number"
                    className={`input-field${deliveryErrors.quantity ? ' error' : ''}`}
                    min="1"
                    value={deliveryForm.quantity}
                    onChange={(e) => handleDeliveryField('quantity', e.target.value)}
                  />
                  {deliveryErrors.quantity && <span className="input-error">{deliveryErrors.quantity}</span>}
                </div>
                <div className="input-group">
                  <label>Data de Entrega <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input
                    type="date"
                    className={`input-field${deliveryErrors.delivery_date ? ' error' : ''}`}
                    value={deliveryForm.delivery_date}
                    onChange={(e) => handleDeliveryField('delivery_date', e.target.value)}
                  />
                  {deliveryErrors.delivery_date && <span className="input-error">{deliveryErrors.delivery_date}</span>}
                </div>
              </div>
              <div className="input-group">
                <label>Observação</label>
                <textarea
                  className="input-field"
                  placeholder="Observações sobre a entrega..."
                  rows={3}
                  value={deliveryForm.observation}
                  onChange={(e) => handleDeliveryField('observation', e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-secondary-text)', marginTop: '4px' }}>
                <span style={{ color: 'var(--color-error)' }}>*</span> Campos obrigatórios
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeliveryModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSaveDelivery} disabled={deliveryFormLoading}>
                {deliveryFormLoading ? <span className="spinner" /> : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Type Confirm */}
      {deleteTypeConfirm && (
        <ConfirmModal
          title="Excluir Tipo de EPI"
          message={`Tem certeza que deseja excluir o tipo "${deleteTypeConfirm.name}"? Esta ação não pode ser desfeita.`}
          onConfirm={handleDeleteType}
          onCancel={() => setDeleteTypeConfirm(null)}
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

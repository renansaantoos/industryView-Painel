import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  staggerParent,
  tableRowVariants,
  modalBackdropVariants,
  modalContentVariants,
} from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { clientsApi } from '../../services';
import type { Client, ClientPayload } from '../../services/api/clients';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  Phone,
  X,
  MapPin,
  FileText,
  Briefcase,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalize(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function fuzzyMatch(target: string | null | undefined, query: string): boolean {
  if (!target) return false;
  if (!query) return true;
  return normalize(target).includes(normalize(query));
}

// ── Toast ─────────────────────────────────────────────────────────────────────

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

// ── Tab types ─────────────────────────────────────────────────────────────────

type ModalTab = 'registration' | 'addresses' | 'contacts' | 'business';

// ── Empty form factory ────────────────────────────────────────────────────────

function emptyForm(): ClientPayload {
  return {
    legal_name: '',
    trade_name: '',
    cnpj: '',
    state_registration: '',
    state_registration_type: '',
    main_cnae: '',
    billing_address: '',
    billing_number: '',
    billing_complement: '',
    billing_neighborhood: '',
    billing_city: '',
    billing_state: '',
    billing_cep: '',
    delivery_same_as_billing: true,
    delivery_address: '',
    delivery_number: '',
    delivery_complement: '',
    delivery_neighborhood: '',
    delivery_city: '',
    delivery_state: '',
    delivery_cep: '',
    receiving_hours: '',
    vehicle_restrictions: '',
    latitude: undefined,
    longitude: undefined,
    purchasing_contact_name: '',
    purchasing_contact_email: '',
    purchasing_contact_phone: '',
    financial_contact_name: '',
    financial_contact_email: '',
    financial_contact_phone: '',
    warehouse_contact_name: '',
    warehouse_contact_email: '',
    warehouse_contact_phone: '',
    industry_segment: '',
    purchase_potential: '',
    default_payment_terms: '',
    responsible_salesperson: '',
    notes: '',
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="input-group">
      <label>
        {label}
        {required && <span style={{ color: 'var(--color-error)', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div
      style={{
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--color-primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        padding: '6px 0 4px',
        borderBottom: '1px solid var(--color-border, rgba(0,0,0,0.08))',
        marginBottom: '12px',
        marginTop: '6px',
      }}
    >
      {title}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Clients() {
  const { t } = useTranslation();
  const { setNavBarSelection } = useAppState();

  // List state
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('registration');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientPayload>(emptyForm());
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ClientPayload, string>>>({});
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Toast
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNavBarSelection(32);
  }, []);

  // ── Toast helpers ──────────────────────────────────────────────────────────

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Data loading ───────────────────────────────────────────────────────────

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientsApi.listClients({
        page,
        per_page: perPage,
        search: search || undefined,
      });
      setClients(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load clients:', err);
      showToast(t('common.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, showToast, t]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // ── Client-side filtered list ──────────────────────────────────────────────

  const filteredClients = clients.filter((client) => {
    if (!search) return true;
    return (
      fuzzyMatch(client.legal_name, search) ||
      fuzzyMatch(client.trade_name, search) ||
      fuzzyMatch(client.cnpj, search) ||
      fuzzyMatch(client.billing_city, search) ||
      fuzzyMatch(client.purchasing_contact_name, search) ||
      fuzzyMatch(client.industry_segment, search)
    );
  });

  // ── Form helpers ───────────────────────────────────────────────────────────

  function openCreateModal() {
    setEditingClient(null);
    setFormData(emptyForm());
    setFormErrors({});
    setActiveTab('registration');
    setShowModal(true);
  }

  function openEditModal(client: Client) {
    setEditingClient(client);
    setFormData({
      legal_name: client.legal_name || '',
      trade_name: client.trade_name || '',
      cnpj: client.cnpj || '',
      state_registration: client.state_registration || '',
      state_registration_type: client.state_registration_type || '',
      main_cnae: client.main_cnae || '',
      billing_address: client.billing_address || '',
      billing_number: client.billing_number || '',
      billing_complement: client.billing_complement || '',
      billing_neighborhood: client.billing_neighborhood || '',
      billing_city: client.billing_city || '',
      billing_state: client.billing_state || '',
      billing_cep: client.billing_cep || '',
      delivery_same_as_billing: client.delivery_same_as_billing ?? true,
      delivery_address: client.delivery_address || '',
      delivery_number: client.delivery_number || '',
      delivery_complement: client.delivery_complement || '',
      delivery_neighborhood: client.delivery_neighborhood || '',
      delivery_city: client.delivery_city || '',
      delivery_state: client.delivery_state || '',
      delivery_cep: client.delivery_cep || '',
      receiving_hours: client.receiving_hours || '',
      vehicle_restrictions: client.vehicle_restrictions || '',
      latitude: client.latitude ?? undefined,
      longitude: client.longitude ?? undefined,
      purchasing_contact_name: client.purchasing_contact_name || '',
      purchasing_contact_email: client.purchasing_contact_email || '',
      purchasing_contact_phone: client.purchasing_contact_phone || '',
      financial_contact_name: client.financial_contact_name || '',
      financial_contact_email: client.financial_contact_email || '',
      financial_contact_phone: client.financial_contact_phone || '',
      warehouse_contact_name: client.warehouse_contact_name || '',
      warehouse_contact_email: client.warehouse_contact_email || '',
      warehouse_contact_phone: client.warehouse_contact_phone || '',
      industry_segment: client.industry_segment || '',
      purchase_potential: client.purchase_potential || '',
      default_payment_terms: client.default_payment_terms || '',
      responsible_salesperson: client.responsible_salesperson || '',
      notes: client.notes || '',
    });
    setFormErrors({});
    setActiveTab('registration');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingClient(null);
    setFormData(emptyForm());
    setFormErrors({});
  }

  function handleFieldChange(field: keyof ClientPayload, value: string | boolean | number | undefined) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validateForm(): boolean {
    const errors: Partial<Record<keyof ClientPayload, string>> = {};
    if (!formData.legal_name.trim()) {
      errors.legal_name = t('common.requiredField');
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Navigate to the tab that has the error
      setActiveTab('registration');
    }
    return Object.keys(errors).length === 0;
  }

  function trimStr(val: string | undefined): string | undefined {
    if (!val) return undefined;
    const trimmed = val.trim();
    return trimmed || undefined;
  }

  async function handleSave() {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload: ClientPayload = {
        legal_name: formData.legal_name.trim(),
        trade_name: trimStr(formData.trade_name),
        cnpj: trimStr(formData.cnpj),
        state_registration: trimStr(formData.state_registration),
        state_registration_type: trimStr(formData.state_registration_type),
        main_cnae: trimStr(formData.main_cnae),
        billing_address: trimStr(formData.billing_address),
        billing_number: trimStr(formData.billing_number),
        billing_complement: trimStr(formData.billing_complement),
        billing_neighborhood: trimStr(formData.billing_neighborhood),
        billing_city: trimStr(formData.billing_city),
        billing_state: trimStr(formData.billing_state),
        billing_cep: trimStr(formData.billing_cep),
        delivery_same_as_billing: formData.delivery_same_as_billing,
        delivery_address: trimStr(formData.delivery_address),
        delivery_number: trimStr(formData.delivery_number),
        delivery_complement: trimStr(formData.delivery_complement),
        delivery_neighborhood: trimStr(formData.delivery_neighborhood),
        delivery_city: trimStr(formData.delivery_city),
        delivery_state: trimStr(formData.delivery_state),
        delivery_cep: trimStr(formData.delivery_cep),
        receiving_hours: trimStr(formData.receiving_hours),
        vehicle_restrictions: trimStr(formData.vehicle_restrictions),
        latitude: formData.latitude,
        longitude: formData.longitude,
        purchasing_contact_name: trimStr(formData.purchasing_contact_name),
        purchasing_contact_email: trimStr(formData.purchasing_contact_email),
        purchasing_contact_phone: trimStr(formData.purchasing_contact_phone),
        financial_contact_name: trimStr(formData.financial_contact_name),
        financial_contact_email: trimStr(formData.financial_contact_email),
        financial_contact_phone: trimStr(formData.financial_contact_phone),
        warehouse_contact_name: trimStr(formData.warehouse_contact_name),
        warehouse_contact_email: trimStr(formData.warehouse_contact_email),
        warehouse_contact_phone: trimStr(formData.warehouse_contact_phone),
        industry_segment: trimStr(formData.industry_segment),
        purchase_potential: trimStr(formData.purchase_potential),
        default_payment_terms: trimStr(formData.default_payment_terms),
        responsible_salesperson: trimStr(formData.responsible_salesperson),
        notes: trimStr(formData.notes),
      };

      if (editingClient) {
        await clientsApi.updateClient(editingClient.id, payload);
        showToast(t('clients.updateSuccess'));
      } else {
        await clientsApi.createClient(payload);
        showToast(t('clients.createSuccess'));
      }
      closeModal();
      loadClients();
    } catch (err) {
      console.error('Failed to save client:', err);
      showToast(t('common.errorSaving'), 'error');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDelete(id: number) {
    try {
      await clientsApi.deleteClient(id);
      showToast(t('clients.deleteSuccess'));
      loadClients();
    } catch (err) {
      console.error('Failed to delete client:', err);
      showToast(t('common.errorSaving'), 'error');
    } finally {
      setDeleteConfirm(null);
    }
  }

  // ── Tab styling helpers ────────────────────────────────────────────────────

  const TABS: { key: ModalTab; label: string }[] = [
    { key: 'registration', label: t('clients.tabs.registration') },
    { key: 'addresses', label: t('clients.tabs.addresses') },
    { key: 'contacts', label: t('clients.tabs.contacts') },
    { key: 'business', label: t('clients.tabs.business') },
  ];

  function tabStyle(key: ModalTab): React.CSSProperties {
    const isActive = activeTab === key;
    return {
      padding: '10px 18px',
      fontSize: '14px',
      fontWeight: isActive ? 600 : 400,
      color: isActive ? 'var(--color-primary)' : 'var(--color-secondary-text)',
      background: 'none',
      border: 'none',
      borderBottom: isActive
        ? '2px solid var(--color-primary)'
        : '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      whiteSpace: 'nowrap',
      marginBottom: '-2px',
    };
  }

  // ── Industry segment options ───────────────────────────────────────────────

  const SEGMENT_OPTIONS = [
    { value: 'alimentar', label: t('clients.segments.food') },
    { value: 'metalmecanico', label: t('clients.segments.metalworking') },
    { value: 'quimico', label: t('clients.segments.chemical') },
    { value: 'farmaceutico', label: t('clients.segments.pharmaceutical') },
    { value: 'automotivo', label: t('clients.segments.automotive') },
    { value: 'textil', label: t('clients.segments.textile') },
    { value: 'construcao_civil', label: t('clients.segments.construction') },
    { value: 'energia', label: t('clients.segments.energy') },
    { value: 'mineracao', label: t('clients.segments.mining') },
    { value: 'outro', label: t('clients.segments.other') },
  ];

  const STATE_REG_TYPE_OPTIONS = [
    { value: 'contribuinte', label: t('clients.contributor') },
    { value: 'isento', label: t('clients.exempt') },
    { value: 'nao_contribuinte', label: t('clients.nonContributor') },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title={t('clients.title')}
        subtitle={t('clients.subtitle')}
        actions={
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> {t('clients.addClient')}
          </button>
        }
      />

      {/* Search bar */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-secondary-text)',
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder={t('clients.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredClients.length === 0 ? (
        <EmptyState
          message={t('clients.noClients')}
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> {t('clients.addClient')}
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('clients.legalName')} / {t('clients.tradeName')}</th>
                <th>{t('clients.cnpj')}</th>
                <th>{t('clients.industrySegment')}</th>
                <th>{t('clients.city')} / {t('clients.state')}</th>
                <th>{t('clients.purchasingContact')}</th>
                <th>{t('clients.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {filteredClients.map((client) => (
                <motion.tr key={client.id} variants={tableRowVariants}>
                  {/* Name */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={18} color="var(--color-primary)" />
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {client.trade_name || client.legal_name || '-'}
                        </div>
                        {client.trade_name && client.legal_name && (
                          <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                            {client.legal_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* CNPJ */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color="var(--color-secondary-text)" />
                      {client.cnpj || '-'}
                    </div>
                  </td>
                  {/* Segment */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={14} color="var(--color-secondary-text)" />
                      {client.industry_segment
                        ? SEGMENT_OPTIONS.find((s) => s.value === client.industry_segment)?.label ||
                          client.industry_segment
                        : '-'}
                    </div>
                  </td>
                  {/* City / State */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--color-secondary-text)" />
                      {[client.billing_city, client.billing_state].filter(Boolean).join(' / ') || '-'}
                    </div>
                  </td>
                  {/* Purchasing contact */}
                  <td>
                    <div>
                      <div>{client.purchasing_contact_name || '-'}</div>
                      {client.purchasing_contact_phone && (
                        <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={11} />
                          {client.purchasing_contact_phone}
                        </div>
                      )}
                    </div>
                  </td>
                  {/* Actions */}
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-icon"
                        title={t('common.edit')}
                        onClick={() => openEditModal(client)}
                      >
                        <Edit size={16} color="var(--color-secondary-text)" />
                      </button>
                      <button
                        className="btn btn-icon"
                        title={t('common.delete')}
                        onClick={() => setDeleteConfirm(client.id)}
                      >
                        <Trash2 size={16} color="var(--color-error)" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
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

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-backdrop"
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={closeModal}
          >
            <motion.div
              className="modal-content"
              variants={modalContentVariants}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '900px', width: '100%' }}
            >
              {/* Modal header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0',
                }}
              >
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                  {editingClient ? t('clients.editClient') : t('clients.addClient')}
                </h2>
                <button className="btn btn-icon" onClick={closeModal}>
                  <X size={18} />
                </button>
              </div>

              {/* Tab bar */}
              <div
                style={{
                  display: 'flex',
                  borderBottom: '2px solid var(--color-alternate, rgba(0,0,0,0.08))',
                  marginTop: '16px',
                  marginBottom: '20px',
                  overflowX: 'auto',
                }}
              >
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    style={tabStyle(tab.key)}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div
                style={{
                  minHeight: '360px',
                  maxHeight: 'calc(80vh - 220px)',
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}
              >

                {/* ── Tab 1: Dados Cadastrais ── */}
                {activeTab === 'registration' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Razão Social — required */}
                    <FormField
                      label={t('clients.legalName')}
                      required
                      error={formErrors.legal_name}
                    >
                      <input
                        type="text"
                        className="input-field"
                        value={formData.legal_name}
                        onChange={(e) => handleFieldChange('legal_name', e.target.value)}
                        placeholder={t('clients.legalName')}
                      />
                    </FormField>

                    {/* Nome Fantasia */}
                    <FormField label={t('clients.tradeName')}>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.trade_name}
                        onChange={(e) => handleFieldChange('trade_name', e.target.value)}
                        placeholder={t('clients.tradeName')}
                      />
                    </FormField>

                    {/* CNPJ + Inscrição Estadual */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <FormField label={t('clients.cnpj')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.cnpj}
                          onChange={(e) => handleFieldChange('cnpj', e.target.value)}
                          placeholder="00.000.000/0000-00"
                        />
                      </FormField>
                      <FormField label={t('clients.stateRegistration')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.state_registration}
                          onChange={(e) => handleFieldChange('state_registration', e.target.value)}
                          placeholder={t('clients.stateRegistration')}
                        />
                      </FormField>
                    </div>

                    {/* Tipo IE + CNAE */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <FormField label={t('clients.stateRegistrationType')}>
                        <select
                          className="select-field"
                          value={formData.state_registration_type}
                          onChange={(e) => handleFieldChange('state_registration_type', e.target.value)}
                        >
                          <option value="">—</option>
                          {STATE_REG_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </FormField>
                      <FormField label={t('clients.mainCnae')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.main_cnae}
                          onChange={(e) => handleFieldChange('main_cnae', e.target.value)}
                          placeholder="0000-0/00"
                        />
                      </FormField>
                    </div>
                  </div>
                )}

                {/* ── Tab 2: Endereços ── */}
                {activeTab === 'addresses' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <SectionHeader title={t('clients.billingAddress')} />

                    {/* Logradouro + Número */}
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px' }}>
                      <FormField label={t('clients.address')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.billing_address}
                          onChange={(e) => handleFieldChange('billing_address', e.target.value)}
                          placeholder={t('clients.address')}
                        />
                      </FormField>
                      <FormField label={t('clients.number')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.billing_number}
                          onChange={(e) => handleFieldChange('billing_number', e.target.value)}
                          placeholder="N°"
                        />
                      </FormField>
                    </div>

                    {/* Complemento + Bairro */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <FormField label={t('clients.complement')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.billing_complement}
                          onChange={(e) => handleFieldChange('billing_complement', e.target.value)}
                          placeholder={t('clients.complement')}
                        />
                      </FormField>
                      <FormField label={t('clients.neighborhood')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.billing_neighborhood}
                          onChange={(e) => handleFieldChange('billing_neighborhood', e.target.value)}
                          placeholder={t('clients.neighborhood')}
                        />
                      </FormField>
                    </div>

                    {/* Cidade + UF + CEP */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                      <FormField label={t('clients.city')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.billing_city}
                          onChange={(e) => handleFieldChange('billing_city', e.target.value)}
                          placeholder={t('clients.city')}
                        />
                      </FormField>
                      <FormField label={t('clients.state')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.billing_state}
                          onChange={(e) => handleFieldChange('billing_state', e.target.value)}
                          placeholder="UF"
                          maxLength={2}
                        />
                      </FormField>
                      <FormField label={t('clients.cep')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.billing_cep}
                          onChange={(e) => handleFieldChange('billing_cep', e.target.value)}
                          placeholder="00000-000"
                        />
                      </FormField>
                    </div>

                    {/* Delivery checkbox */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 14px',
                        background: 'var(--color-alternate, rgba(0,0,0,0.03))',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      onClick={() =>
                        handleFieldChange(
                          'delivery_same_as_billing',
                          !formData.delivery_same_as_billing
                        )
                      }
                    >
                      <input
                        type="checkbox"
                        checked={formData.delivery_same_as_billing ?? true}
                        onChange={(e) =>
                          handleFieldChange('delivery_same_as_billing', e.target.checked)
                        }
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>
                        {t('clients.deliverySameAsBilling')}
                      </span>
                    </div>

                    {/* Delivery address — show when not same as billing */}
                    {!formData.delivery_same_as_billing && (
                      <>
                        <SectionHeader title={t('clients.deliveryAddress')} />

                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px' }}>
                          <FormField label={t('clients.address')}>
                            <input
                              type="text"
                              className="input-field"
                              value={formData.delivery_address}
                              onChange={(e) => handleFieldChange('delivery_address', e.target.value)}
                              placeholder={t('clients.address')}
                            />
                          </FormField>
                          <FormField label={t('clients.number')}>
                            <input
                              type="text"
                              className="input-field"
                              value={formData.delivery_number}
                              onChange={(e) => handleFieldChange('delivery_number', e.target.value)}
                              placeholder="N°"
                            />
                          </FormField>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <FormField label={t('clients.complement')}>
                            <input
                              type="text"
                              className="input-field"
                              value={formData.delivery_complement}
                              onChange={(e) =>
                                handleFieldChange('delivery_complement', e.target.value)
                              }
                              placeholder={t('clients.complement')}
                            />
                          </FormField>
                          <FormField label={t('clients.neighborhood')}>
                            <input
                              type="text"
                              className="input-field"
                              value={formData.delivery_neighborhood}
                              onChange={(e) =>
                                handleFieldChange('delivery_neighborhood', e.target.value)
                              }
                              placeholder={t('clients.neighborhood')}
                            />
                          </FormField>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                          <FormField label={t('clients.city')}>
                            <input
                              type="text"
                              className="input-field"
                              value={formData.delivery_city}
                              onChange={(e) => handleFieldChange('delivery_city', e.target.value)}
                              placeholder={t('clients.city')}
                            />
                          </FormField>
                          <FormField label={t('clients.state')}>
                            <input
                              type="text"
                              className="input-field"
                              value={formData.delivery_state}
                              onChange={(e) => handleFieldChange('delivery_state', e.target.value)}
                              placeholder="UF"
                              maxLength={2}
                            />
                          </FormField>
                          <FormField label={t('clients.cep')}>
                            <input
                              type="text"
                              className="input-field"
                              value={formData.delivery_cep}
                              onChange={(e) => handleFieldChange('delivery_cep', e.target.value)}
                              placeholder="00000-000"
                            />
                          </FormField>
                        </div>

                        {/* Receiving hours + Vehicle restrictions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <FormField label={t('clients.receivingHours')}>
                            <input
                              type="text"
                              className="input-field"
                              value={formData.receiving_hours}
                              onChange={(e) => handleFieldChange('receiving_hours', e.target.value)}
                              placeholder="Ex: Seg-Sex 08h-17h"
                            />
                          </FormField>
                          <FormField label={t('clients.vehicleRestrictions')}>
                            <input
                              type="text"
                              className="input-field"
                              value={formData.vehicle_restrictions}
                              onChange={(e) =>
                                handleFieldChange('vehicle_restrictions', e.target.value)
                              }
                              placeholder={t('clients.vehicleRestrictions')}
                            />
                          </FormField>
                        </div>
                      </>
                    )}

                    {/* Latitude + Longitude */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <FormField label={t('clients.latitude')}>
                        <input
                          type="number"
                          className="input-field"
                          value={formData.latitude ?? ''}
                          onChange={(e) =>
                            handleFieldChange(
                              'latitude',
                              e.target.value ? parseFloat(e.target.value) : undefined
                            )
                          }
                          placeholder="-23.550520"
                          step="any"
                        />
                      </FormField>
                      <FormField label={t('clients.longitude')}>
                        <input
                          type="number"
                          className="input-field"
                          value={formData.longitude ?? ''}
                          onChange={(e) =>
                            handleFieldChange(
                              'longitude',
                              e.target.value ? parseFloat(e.target.value) : undefined
                            )
                          }
                          placeholder="-46.633309"
                          step="any"
                        />
                      </FormField>
                    </div>
                  </div>
                )}

                {/* ── Tab 3: Contatos ── */}
                {activeTab === 'contacts' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Compras */}
                    <SectionHeader title={t('clients.purchasingContact')} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <FormField label={t('clients.contactName')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.purchasing_contact_name}
                          onChange={(e) =>
                            handleFieldChange('purchasing_contact_name', e.target.value)
                          }
                          placeholder={t('clients.contactName')}
                        />
                      </FormField>
                      <FormField label={t('clients.contactEmail')}>
                        <input
                          type="email"
                          className="input-field"
                          value={formData.purchasing_contact_email}
                          onChange={(e) =>
                            handleFieldChange('purchasing_contact_email', e.target.value)
                          }
                          placeholder="email@empresa.com"
                        />
                      </FormField>
                      <FormField label={t('clients.contactPhone')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.purchasing_contact_phone}
                          onChange={(e) =>
                            handleFieldChange('purchasing_contact_phone', e.target.value)
                          }
                          placeholder="(00) 00000-0000"
                        />
                      </FormField>
                    </div>

                    {/* Financeiro */}
                    <SectionHeader title={t('clients.financialContact')} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <FormField label={t('clients.contactName')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.financial_contact_name}
                          onChange={(e) =>
                            handleFieldChange('financial_contact_name', e.target.value)
                          }
                          placeholder={t('clients.contactName')}
                        />
                      </FormField>
                      <FormField label={t('clients.contactEmail')}>
                        <input
                          type="email"
                          className="input-field"
                          value={formData.financial_contact_email}
                          onChange={(e) =>
                            handleFieldChange('financial_contact_email', e.target.value)
                          }
                          placeholder="email@empresa.com"
                        />
                      </FormField>
                      <FormField label={t('clients.contactPhone')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.financial_contact_phone}
                          onChange={(e) =>
                            handleFieldChange('financial_contact_phone', e.target.value)
                          }
                          placeholder="(00) 00000-0000"
                        />
                      </FormField>
                    </div>

                    {/* Recebimento/Almoxarifado */}
                    <SectionHeader title={t('clients.warehouseContact')} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <FormField label={t('clients.contactName')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.warehouse_contact_name}
                          onChange={(e) =>
                            handleFieldChange('warehouse_contact_name', e.target.value)
                          }
                          placeholder={t('clients.contactName')}
                        />
                      </FormField>
                      <FormField label={t('clients.contactEmail')}>
                        <input
                          type="email"
                          className="input-field"
                          value={formData.warehouse_contact_email}
                          onChange={(e) =>
                            handleFieldChange('warehouse_contact_email', e.target.value)
                          }
                          placeholder="email@empresa.com"
                        />
                      </FormField>
                      <FormField label={t('clients.contactPhone')}>
                        <input
                          type="text"
                          className="input-field"
                          value={formData.warehouse_contact_phone}
                          onChange={(e) =>
                            handleFieldChange('warehouse_contact_phone', e.target.value)
                          }
                          placeholder="(00) 00000-0000"
                        />
                      </FormField>
                    </div>
                  </div>
                )}

                {/* ── Tab 4: Negócios ── */}
                {activeTab === 'business' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Segmento */}
                    <FormField label={t('clients.industrySegment')}>
                      <select
                        className="select-field"
                        value={formData.industry_segment}
                        onChange={(e) => handleFieldChange('industry_segment', e.target.value)}
                      >
                        <option value="">—</option>
                        {SEGMENT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    {/* Potencial de Compra */}
                    <FormField label={t('clients.purchasePotential')}>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.purchase_potential}
                        onChange={(e) => handleFieldChange('purchase_potential', e.target.value)}
                        placeholder={t('clients.purchasePotential')}
                      />
                    </FormField>

                    {/* Condição de Pagamento */}
                    <FormField label={t('clients.defaultPaymentTerms')}>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.default_payment_terms}
                        onChange={(e) =>
                          handleFieldChange('default_payment_terms', e.target.value)
                        }
                        placeholder="Ex: 30/60/90 dias"
                      />
                    </FormField>

                    {/* Vendedor/Representante */}
                    <FormField label={t('clients.responsibleSalesperson')}>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.responsible_salesperson}
                        onChange={(e) =>
                          handleFieldChange('responsible_salesperson', e.target.value)
                        }
                        placeholder={t('clients.responsibleSalesperson')}
                      />
                    </FormField>

                    {/* Observações */}
                    <FormField label={t('clients.notes')}>
                      <textarea
                        className="input-field"
                        value={formData.notes}
                        onChange={(e) => handleFieldChange('notes', e.target.value)}
                        placeholder={t('clients.notes')}
                        rows={4}
                        style={{ resize: 'vertical' }}
                      />
                    </FormField>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--color-border, rgba(0,0,0,0.08))',
                }}
              >
                {/* Tab navigation hints */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {TABS.map((tab, idx) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background:
                          activeTab === tab.key
                            ? 'var(--color-primary)'
                            : 'var(--color-alternate, rgba(0,0,0,0.15))',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'background 0.15s ease',
                      }}
                      title={tab.label}
                      aria-label={`${t('common.go to')} ${tab.label}`}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                    {t('common.cancel')}
                  </button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? t('common.loading') : t('common.save')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      {deleteConfirm !== null && (
        <ConfirmModal
          title={t('clients.deleteClient')}
          message={t('clients.confirmDelete')}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
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

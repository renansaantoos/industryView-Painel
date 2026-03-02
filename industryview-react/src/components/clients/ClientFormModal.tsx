/**
 * ClientFormModal
 *
 * Reusable 4-tab client creation / editing modal.
 * Used by both the Clients management page and the Create Project page.
 *
 * Props:
 *   isOpen        – controls visibility
 *   onClose       – called when the user cancels or closes
 *   onSave(client) – called with the newly created / updated Client record
 *   editingClient  – if provided, the modal is in "edit" mode
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { clientsApi, projectsApi } from '../../services';
import type { Client, ClientPayload, ClientUnit, ClientUnitPayload } from '../../services/api/clients';
import type { ProjectInfo } from '../../types/project';
import { X, Check, ChevronDown } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function unmask(value: string): string {
  return value.replace(/\D/g, '');
}

function applyMask(value: string, mask: string): string {
  const digits = unmask(value);
  let result = '';
  let digitIndex = 0;
  for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
    if (mask[i] === '9') {
      result += digits[digitIndex++];
    } else {
      result += mask[i];
    }
  }
  return result;
}

export function maskCNPJ(value: string): string {
  return applyMask(value, '99.999.999/9999-99');
}

function maskCEP(value: string): string {
  return applyMask(value, '99999-999');
}

function maskPhone(value: string): string {
  const digits = unmask(value);
  if (digits.length <= 10) return applyMask(value, '(99) 9999-9999');
  return applyMask(value, '(99) 99999-9999');
}

// ── Country codes ──────────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: '+55', label: '+55 Brasil' },
  { code: '+1', label: '+1 EUA / Canadá' },
  { code: '+44', label: '+44 Reino Unido' },
  { code: '+49', label: '+49 Alemanha' },
  { code: '+33', label: '+33 França' },
  { code: '+34', label: '+34 Espanha' },
  { code: '+39', label: '+39 Itália' },
  { code: '+54', label: '+54 Argentina' },
  { code: '+56', label: '+56 Chile' },
  { code: '+57', label: '+57 Colômbia' },
  { code: '+51', label: '+51 Peru' },
  { code: '+598', label: '+598 Uruguai' },
  { code: '+595', label: '+595 Paraguai' },
  { code: '+591', label: '+591 Bolívia' },
  { code: '+58', label: '+58 Venezuela' },
  { code: '+86', label: '+86 China' },
  { code: '+81', label: '+81 Japão' },
];

interface PhonePrefixes {
  purchasing: string;
  financial: string;
  warehouse: string;
}

function emptyPrefixes(): PhonePrefixes {
  return { purchasing: '+55', financial: '+55', warehouse: '+55' };
}

function parsePhonePrefix(stored: string): { prefix: string; localDigits: string } {
  if (!stored) return { prefix: '+55', localDigits: '' };
  const allDigits = stored.replace(/\D/g, '');
  if (stored.startsWith('+')) {
    const sorted = COUNTRY_CODES.slice().sort((a, b) => b.code.length - a.code.length);
    for (const { code } of sorted) {
      const codeDigits = code.replace(/\D/g, '');
      if (allDigits.startsWith(codeDigits)) {
        return { prefix: code, localDigits: allDigits.slice(codeDigits.length) };
      }
    }
  }
  return { prefix: '+55', localDigits: allDigits };
}

function maskCNAE(value: string): string {
  return applyMask(value, '9999-9/99');
}

function maskStateRegistration(value: string): string {
  return value.replace(/[^\d.]/g, '');
}

// ── CNPJ validation ───────────────────────────────────────────────────────────

function validateCNPJChecksum(cnpj: string): boolean {
  const digits = unmask(cnpj);
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  function calcDigit(base: string, weights: number[]): number {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) sum += parseInt(base[i], 10) * weights[i];
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  const first = calcDigit(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (first !== parseInt(digits[12], 10)) return false;
  const second = calcDigit(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return second === parseInt(digits[13], 10);
}

// ── ViaCEP ────────────────────────────────────────────────────────────────────

interface ViaCEPResponse {
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
}

async function fetchAddressByCEP(cep: string): Promise<ViaCEPResponse | null> {
  const cleanCep = unmask(cep);
  if (cleanCep.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (res.ok) {
      const data = await res.json();
      if (!data.erro) return data as ViaCEPResponse;
    }
  } catch { /* fallback below */ }
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
    if (res.ok) {
      const data = await res.json();
      return {
        logradouro: data.street || '',
        complemento: '',
        bairro: data.neighborhood || '',
        localidade: data.city || '',
        uf: data.state || '',
      };
    }
  } catch { /* both failed */ }
  return null;
}

// ── Tab types ─────────────────────────────────────────────────────────────────

type ModalTab = 'registration' | 'addresses' | 'contacts' | 'business';

// ── Masked display state ──────────────────────────────────────────────────────

interface MaskedDisplayState {
  cnpj: string;
  main_cnae: string;
  billing_cep: string;
  delivery_cep: string;
  purchasing_contact_phone: string;
  financial_contact_phone: string;
  warehouse_contact_phone: string;
}

function emptyDisplay(): MaskedDisplayState {
  return {
    cnpj: '',
    main_cnae: '',
    billing_cep: '',
    delivery_cep: '',
    purchasing_contact_phone: '',
    financial_contact_phone: '',
    warehouse_contact_phone: '',
  };
}

// ── Empty unit form factory ───────────────────────────────────────────────────

function emptyUnitForm(): ClientUnitPayload {
  return {
    unit_type: 'MATRIZ',
    label: '',
    cnpj: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
  };
}

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
  fieldKey?: string;
  children: React.ReactNode;
}

function FormField({ label, required, error, fieldKey, children }: FormFieldProps) {
  return (
    <div className="input-group" data-field={fieldKey}>
      <label
        style={{
          fontSize: '0.82rem',
          fontWeight: 500,
          color: error ? 'var(--color-error)' : undefined,
        }}
      >
        {label}
        {required && (
          <span style={{ color: 'var(--color-error)', marginLeft: '2px', fontWeight: 700 }}>
            *
          </span>
        )}
      </label>
      <div
        style={error ? ({ '--field-border': 'var(--color-error)' } as React.CSSProperties) : undefined}
        className={error ? 'field-has-error' : ''}
      >
        {children}
      </div>
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-error)',
              marginTop: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>!</span>
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
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

function CepSpinner() {
  return (
    <div
      style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        border: '2px solid var(--color-alternate, rgba(0,0,0,0.1))',
        borderTopColor: 'var(--color-primary)',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
}

// ── PhoneInput ────────────────────────────────────────────────────────────────

interface PhoneInputProps {
  prefix: string;
  onPrefixChange: (p: string) => void;
  value: string;
  onChange: (masked: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

function PhoneInput({ prefix, onPrefixChange, value, onChange, onBlur, placeholder }: PhoneInputProps) {
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      <select
        value={prefix}
        onChange={(e) => onPrefixChange(e.target.value)}
        className="input-field"
        style={{ width: '140px', flexShrink: 0, fontSize: '0.8rem', padding: '0 6px', cursor: 'pointer' }}
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.code} value={c.code}>{c.label}</option>
        ))}
      </select>
      <input
        type="text"
        className="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder ?? '(00) 00000-0000'}
        maxLength={15}
        inputMode="numeric"
        style={{ flex: 1 }}
      />
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  editingClient?: Client | null;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ClientFormModal({
  isOpen,
  onClose,
  onSave,
  editingClient = null,
}: ClientFormModalProps) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<ModalTab>('registration');
  const [formData, setFormData] = useState<ClientPayload>(emptyForm());
  const [display, setDisplay] = useState<MaskedDisplayState>(emptyDisplay());
  const [phonePrefixes, setPhonePrefixes] = useState<PhonePrefixes>(emptyPrefixes());
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const [shakeBtn, setShakeBtn] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [billingCepLoading, setBillingCepLoading] = useState(false);
  const [deliveryCepLoading, setDeliveryCepLoading] = useState(false);
  const [billingCepSuccess, setBillingCepSuccess] = useState(false);
  const [deliveryCepSuccess, setDeliveryCepSuccess] = useState(false);

  // Unidades (Matriz/Filiais) - gerenciadas localmente e sincronizadas com API
  const [units, setUnits] = useState<ClientUnit[]>([]);
  const [unitFormOpen, setUnitFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ClientUnit | null>(null);
  const [savingUnit, setSavingUnit] = useState(false);
  const [unitForm, setUnitForm] = useState<ClientUnitPayload>(emptyUnitForm());
  const [unitCepDisplay, setUnitCepDisplay] = useState('');
  const [unitCnpjDisplay, setUnitCnpjDisplay] = useState('');

  // Project linking state
  const [availableProjects, setAvailableProjects] = useState<ProjectInfo[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [initialProjectIds, setInitialProjectIds] = useState<number[]>([]);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const projectDropdownRef = useRef<HTMLDivElement | null>(null);

  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inject keyframe animations once
  useEffect(() => {
    const styleId = 'client-form-modal-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(5px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(3px); }
          75% { transform: translateX(-2px); }
        }
        .field-has-error .input-field,
        .field-has-error .select-field {
          border-color: var(--color-error) !important;
          box-shadow: 0 0 0 2px rgba(192, 57, 43, 0.12) !important;
        }
        .field-has-error .input-field:focus,
        .field-has-error .select-field:focus {
          border-color: var(--color-error) !important;
          box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.2) !important;
        }
        .btn-shake { animation: shake 0.4s ease-in-out; }
        .tab-error-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--color-error);
          display: inline-block; margin-left: 6px;
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Close project dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target as Node)
      ) {
        setProjectDropdownOpen(false);
      }
    }
    if (projectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [projectDropdownOpen]);

  // Load available projects and pre-select linked ones when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setSelectedProjectIds([]);
    setInitialProjectIds([]);
    setProjectDropdownOpen(false);

    projectsApi
      .queryAllProjects({ per_page: 100 })
      .then((response) => {
        const projects = response.items ?? [];
        setAvailableProjects(projects);

        if (editingClient) {
          const linked = projects
            .filter((p) => p.client_id === editingClient.id)
            .map((p) => p.id);
          setSelectedProjectIds(linked);
          setInitialProjectIds(linked);
        }
      })
      .catch(() => {
        setAvailableProjects([]);
      });
  }, [isOpen, editingClient]);

  // Populate form when editingClient changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (editingClient) {
      const rawCnpj = editingClient.cnpj || '';
      const rawCnae = editingClient.main_cnae || '';
      const rawBillingCep = editingClient.billing_cep || '';
      const rawDeliveryCep = editingClient.delivery_cep || '';
      const rawPurchasingPhone = editingClient.purchasing_contact_phone || '';
      const rawFinancialPhone = editingClient.financial_contact_phone || '';
      const rawWarehousePhone = editingClient.warehouse_contact_phone || '';

      const parsedPurchasing = parsePhonePrefix(rawPurchasingPhone);
      const parsedFinancial = parsePhonePrefix(rawFinancialPhone);
      const parsedWarehouse = parsePhonePrefix(rawWarehousePhone);

      setPhonePrefixes({
        purchasing: parsedPurchasing.prefix,
        financial: parsedFinancial.prefix,
        warehouse: parsedWarehouse.prefix,
      });

      setFormData({
        legal_name: editingClient.legal_name || '',
        trade_name: editingClient.trade_name || '',
        cnpj: unmask(rawCnpj),
        state_registration: editingClient.state_registration || '',
        state_registration_type: editingClient.state_registration_type || '',
        main_cnae: unmask(rawCnae),
        billing_address: editingClient.billing_address || '',
        billing_number: editingClient.billing_number || '',
        billing_complement: editingClient.billing_complement || '',
        billing_neighborhood: editingClient.billing_neighborhood || '',
        billing_city: editingClient.billing_city || '',
        billing_state: editingClient.billing_state || '',
        billing_cep: unmask(rawBillingCep),
        delivery_same_as_billing: editingClient.delivery_same_as_billing ?? true,
        delivery_address: editingClient.delivery_address || '',
        delivery_number: editingClient.delivery_number || '',
        delivery_complement: editingClient.delivery_complement || '',
        delivery_neighborhood: editingClient.delivery_neighborhood || '',
        delivery_city: editingClient.delivery_city || '',
        delivery_state: editingClient.delivery_state || '',
        delivery_cep: unmask(rawDeliveryCep),
        receiving_hours: editingClient.receiving_hours || '',
        vehicle_restrictions: editingClient.vehicle_restrictions || '',
        latitude: editingClient.latitude ?? undefined,
        longitude: editingClient.longitude ?? undefined,
        purchasing_contact_name: editingClient.purchasing_contact_name || '',
        purchasing_contact_email: editingClient.purchasing_contact_email || '',
        purchasing_contact_phone: parsedPurchasing.localDigits,
        financial_contact_name: editingClient.financial_contact_name || '',
        financial_contact_email: editingClient.financial_contact_email || '',
        financial_contact_phone: parsedFinancial.localDigits,
        warehouse_contact_name: editingClient.warehouse_contact_name || '',
        warehouse_contact_email: editingClient.warehouse_contact_email || '',
        warehouse_contact_phone: parsedWarehouse.localDigits,
        industry_segment: editingClient.industry_segment || '',
        purchase_potential: editingClient.purchase_potential || '',
        default_payment_terms: editingClient.default_payment_terms || '',
        responsible_salesperson: editingClient.responsible_salesperson || '',
        notes: editingClient.notes || '',
      });

      setDisplay({
        cnpj: maskCNPJ(rawCnpj),
        main_cnae: maskCNAE(rawCnae),
        billing_cep: maskCEP(rawBillingCep),
        delivery_cep: maskCEP(rawDeliveryCep),
        purchasing_contact_phone: maskPhone(parsedPurchasing.localDigits),
        financial_contact_phone: maskPhone(parsedFinancial.localDigits),
        warehouse_contact_phone: maskPhone(parsedWarehouse.localDigits),
      });
      if (editingClient.id) {
        clientsApi.listClientUnits(editingClient.id)
          .then(setUnits)
          .catch(() => {});
      }
    } else {
      setFormData(emptyForm());
      setDisplay(emptyDisplay());
      setPhonePrefixes(emptyPrefixes());
      setUnits([]);
      setUnitFormOpen(false);
      setEditingUnit(null);
    }

    setFormErrors({});
    setFormSubmitted(false);
    setActiveTab('registration');
    setBillingCepSuccess(false);
    setDeliveryCepSuccess(false);
  }, [isOpen, editingClient]);

  // ── CEP handlers ──────────────────────────────────────────────────────────

  async function handleBillingCepChange(maskedValue: string) {
    const clean = unmask(maskedValue);
    setDisplay((prev) => ({ ...prev, billing_cep: maskedValue }));
    setFormData((prev) => ({ ...prev, billing_cep: clean }));
    setBillingCepSuccess(false);
    if (formErrors['billing_cep']) setFormErrors((prev) => ({ ...prev, billing_cep: undefined }));
    if (clean.length !== 8) return;

    setBillingCepLoading(true);
    const result = await fetchAddressByCEP(clean);
    setBillingCepLoading(false);

    if (!result) {
      setFormErrors((prev) => ({ ...prev, billing_cep: t('clients.validation.cepNotFound') }));
      return;
    }
    setBillingCepSuccess(true);
    setFormData((prev) => ({
      ...prev,
      billing_address: result.logradouro || prev.billing_address,
      billing_complement: result.complemento || prev.billing_complement,
      billing_neighborhood: result.bairro || prev.billing_neighborhood,
      billing_city: result.localidade || prev.billing_city,
      billing_state: result.uf || prev.billing_state,
    }));
  }

  async function handleDeliveryCepChange(maskedValue: string) {
    const clean = unmask(maskedValue);
    setDisplay((prev) => ({ ...prev, delivery_cep: maskedValue }));
    setFormData((prev) => ({ ...prev, delivery_cep: clean }));
    setDeliveryCepSuccess(false);
    if (formErrors['delivery_cep']) setFormErrors((prev) => ({ ...prev, delivery_cep: undefined }));
    if (clean.length !== 8) return;

    setDeliveryCepLoading(true);
    const result = await fetchAddressByCEP(clean);
    setDeliveryCepLoading(false);

    if (!result) {
      setFormErrors((prev) => ({ ...prev, delivery_cep: t('clients.validation.cepNotFound') }));
      return;
    }
    setDeliveryCepSuccess(true);
    setFormData((prev) => ({
      ...prev,
      delivery_address: result.logradouro || prev.delivery_address,
      delivery_complement: result.complemento || prev.delivery_complement,
      delivery_neighborhood: result.bairro || prev.delivery_neighborhood,
      delivery_city: result.localidade || prev.delivery_city,
      delivery_state: result.uf || prev.delivery_state,
    }));
  }

  // ── Field helpers ──────────────────────────────────────────────────────────

  function handleFieldChange(
    field: keyof ClientPayload,
    value: string | boolean | number | undefined,
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as string]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  // ── Tab / field mapping ───────────────────────────────────────────────────

  const TAB_FIELDS: Record<ModalTab, string[]> = {
    registration: ['legal_name', 'trade_name', 'cnpj'],
    addresses: [
      'billing_cep', 'billing_state', 'billing_city', 'billing_address',
      'billing_number', 'billing_neighborhood',
      'delivery_cep', 'delivery_state', 'delivery_city', 'delivery_address',
      'delivery_number', 'delivery_neighborhood',
    ],
    contacts: [
      'purchasing_contact_name', 'purchasing_contact_email', 'purchasing_contact_phone',
      'financial_contact_name', 'financial_contact_email', 'financial_contact_phone',
    ],
    business: ['industry_segment'],
  };

  function getTabForField(field: string): ModalTab | null {
    for (const [tab, fields] of Object.entries(TAB_FIELDS)) {
      if (fields.includes(field)) return tab as ModalTab;
    }
    return null;
  }

  function getTabErrorCount(tab: ModalTab): number {
    return TAB_FIELDS[tab].filter((f) => formErrors[f]).length;
  }

  // ── Validation ────────────────────────────────────────────────────────────

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateSingleField = useCallback(
    (field: string, value: unknown): string | undefined => {
      const requiredMsg = t('clients.validation.requiredField');

      switch (field) {
        case 'legal_name':
          if (!value || !String(value).trim()) return t('clients.validation.requiredLegalName');
          return undefined;
        case 'trade_name':
          if (!value || !String(value).trim()) return requiredMsg;
          return undefined;
        case 'cnpj': {
          const digits = unmask(String(value || ''));
          if (!digits) return requiredMsg;
          if (digits.length < 14) return t('clients.validation.incompleteCnpj');
          if (!validateCNPJChecksum(digits)) return t('clients.validation.invalidCnpj');
          return undefined;
        }
        case 'billing_cep': {
          const digits = unmask(String(value || ''));
          if (!digits) return requiredMsg;
          if (digits.length < 8) return t('clients.validation.incompleteCep');
          return undefined;
        }
        case 'billing_state': {
          const v = String(value || '');
          if (!v) return requiredMsg;
          if (!/^[A-Za-z]{2}$/.test(v)) return t('clients.validation.invalidState');
          return undefined;
        }
        case 'billing_city':
        case 'billing_address':
        case 'billing_number':
        case 'billing_neighborhood':
          if (!value || !String(value).trim()) return requiredMsg;
          return undefined;
        case 'delivery_cep': {
          if (formData.delivery_same_as_billing) return undefined;
          const digits = unmask(String(value || ''));
          if (!digits) return requiredMsg;
          if (digits.length < 8) return t('clients.validation.incompleteCep');
          return undefined;
        }
        case 'delivery_state': {
          if (formData.delivery_same_as_billing) return undefined;
          const v = String(value || '');
          if (!v) return requiredMsg;
          if (!/^[A-Za-z]{2}$/.test(v)) return t('clients.validation.invalidState');
          return undefined;
        }
        case 'delivery_city':
        case 'delivery_address':
        case 'delivery_number':
        case 'delivery_neighborhood':
          if (formData.delivery_same_as_billing) return undefined;
          if (!value || !String(value).trim()) return requiredMsg;
          return undefined;
        case 'purchasing_contact_name':
        case 'financial_contact_name':
          if (!value || !String(value).trim()) return requiredMsg;
          return undefined;
        case 'purchasing_contact_email':
        case 'financial_contact_email': {
          const v = String(value || '');
          if (!v) return requiredMsg;
          if (!EMAIL_REGEX.test(v)) return t('clients.validation.invalidEmail');
          return undefined;
        }
        case 'purchasing_contact_phone':
        case 'financial_contact_phone': {
          const digits = unmask(String(value || ''));
          if (!digits) return requiredMsg;
          if (digits.length < 10) return t('clients.validation.incompletePhone');
          if (digits.length !== 10 && digits.length !== 11) return t('clients.validation.invalidPhone');
          return undefined;
        }
        case 'warehouse_contact_email': {
          const v = String(value || '');
          if (v.length > 0 && !EMAIL_REGEX.test(v)) return t('clients.validation.invalidEmail');
          return undefined;
        }
        case 'warehouse_contact_phone': {
          const digits = unmask(String(value || ''));
          if (digits.length > 0 && digits.length < 10) return t('clients.validation.incompletePhone');
          return undefined;
        }
        case 'industry_segment':
          if (!value || !String(value).trim()) return requiredMsg;
          return undefined;
        default:
          return undefined;
      }
    },
    [t, formData.delivery_same_as_billing],
  );

  function handleFieldBlur(field: string, value: unknown) {
    if (!formSubmitted && !formErrors[field]) return;
    const error = validateSingleField(field, value);
    setFormErrors((prev) => ({ ...prev, [field]: error }));
  }

  function validateForm(): boolean {
    const errors: Partial<Record<string, string>> = {};
    const allFields = Object.values(TAB_FIELDS).flat();
    for (const field of allFields) {
      const value = (formData as unknown as Record<string, unknown>)[field];
      const error = validateSingleField(field, value);
      if (error) errors[field] = error;
    }

    setFormErrors(errors);
    const errorCount = Object.keys(errors).length;

    if (errorCount > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const targetTab = getTabForField(firstErrorField);
      if (targetTab) setActiveTab(targetTab);

      setShakeBtn(true);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = setTimeout(() => setShakeBtn(false), 500);

      setTimeout(() => {
        const el = document.querySelector(`[data-field="${firstErrorField}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }

    return errorCount === 0;
  }

  function trimStr(val: string | undefined): string | undefined {
    if (!val) return undefined;
    const trimmed = val.trim();
    return trimmed || undefined;
  }

  // ── Unit management ───────────────────────────────────────────────────────

  async function handleSaveUnit() {
    if (!unitForm.unit_type) return;
    setSavingUnit(true);
    try {
      if (editingUnit && editingClient) {
        const updated = await clientsApi.updateClientUnit(editingClient.id, editingUnit.id, unitForm);
        setUnits((prev) => prev.map((u) => u.id === updated.id ? updated : u));
      } else if (editingClient) {
        const created = await clientsApi.createClientUnit(editingClient.id, unitForm);
        setUnits((prev) => [...prev, created]);
      } else {
        const tempUnit: ClientUnit = {
          id: -(Date.now()),
          client_id: 0,
          ...unitForm,
        } as ClientUnit;
        if (editingUnit) {
          setUnits((prev) => prev.map((u) => u.id === editingUnit.id ? tempUnit : u));
        } else {
          setUnits((prev) => [...prev, tempUnit]);
        }
      }
      setUnitFormOpen(false);
      setEditingUnit(null);
      setUnitForm(emptyUnitForm());
      setUnitCepDisplay('');
      setUnitCnpjDisplay('');
    } finally {
      setSavingUnit(false);
    }
  }

  async function handleDeleteUnit(unit: ClientUnit) {
    if (editingClient && unit.id > 0) {
      await clientsApi.deleteClientUnit(editingClient.id, unit.id);
    }
    setUnits((prev) => prev.filter((u) => u.id !== unit.id));
  }

  function handleOpenUnitForm(unit?: ClientUnit) {
    if (unit) {
      setEditingUnit(unit);
      setUnitForm({
        unit_type: unit.unit_type,
        label: unit.label || '',
        cnpj: unit.cnpj ? unit.cnpj.replace(/\D/g, '') : '',
        address: unit.address || '',
        number: unit.number || '',
        complement: unit.complement || '',
        neighborhood: unit.neighborhood || '',
        city: unit.city || '',
        state: unit.state || '',
        cep: unit.cep ? unit.cep.replace(/\D/g, '') : '',
      });
      setUnitCepDisplay(unit.cep ? maskCEP(unit.cep) : '');
      setUnitCnpjDisplay(unit.cnpj ? maskCNPJ(unit.cnpj) : '');
    } else {
      setEditingUnit(null);
      setUnitForm(emptyUnitForm());
      setUnitCepDisplay('');
      setUnitCnpjDisplay('');
    }
    setUnitFormOpen(true);
  }

  async function handleSave() {
    setFormSubmitted(true);
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload: ClientPayload = {
        legal_name: formData.legal_name.trim(),
        trade_name: trimStr(formData.trade_name),
        cnpj: trimStr(unmask(formData.cnpj || '')),
        state_registration: trimStr(formData.state_registration),
        state_registration_type: trimStr(formData.state_registration_type),
        main_cnae: trimStr(unmask(formData.main_cnae || '')),
        billing_address: trimStr(formData.billing_address),
        billing_number: trimStr(formData.billing_number),
        billing_complement: trimStr(formData.billing_complement),
        billing_neighborhood: trimStr(formData.billing_neighborhood),
        billing_city: trimStr(formData.billing_city),
        billing_state: trimStr(formData.billing_state?.toUpperCase()),
        billing_cep: trimStr(unmask(formData.billing_cep || '')),
        delivery_same_as_billing: formData.delivery_same_as_billing,
        delivery_address: trimStr(formData.delivery_address),
        delivery_number: trimStr(formData.delivery_number),
        delivery_complement: trimStr(formData.delivery_complement),
        delivery_neighborhood: trimStr(formData.delivery_neighborhood),
        delivery_city: trimStr(formData.delivery_city),
        delivery_state: trimStr(formData.delivery_state?.toUpperCase()),
        delivery_cep: trimStr(unmask(formData.delivery_cep || '')),
        receiving_hours: trimStr(formData.receiving_hours),
        vehicle_restrictions: trimStr(formData.vehicle_restrictions),
        latitude: formData.latitude,
        longitude: formData.longitude,
        purchasing_contact_name: trimStr(formData.purchasing_contact_name),
        purchasing_contact_email: trimStr(formData.purchasing_contact_email),
        purchasing_contact_phone: trimStr(phonePrefixes.purchasing + unmask(formData.purchasing_contact_phone || '')),
        financial_contact_name: trimStr(formData.financial_contact_name),
        financial_contact_email: trimStr(formData.financial_contact_email),
        financial_contact_phone: trimStr(phonePrefixes.financial + unmask(formData.financial_contact_phone || '')),
        warehouse_contact_name: trimStr(formData.warehouse_contact_name),
        warehouse_contact_email: trimStr(formData.warehouse_contact_email),
        warehouse_contact_phone: trimStr(phonePrefixes.warehouse + unmask(formData.warehouse_contact_phone || '')),
        industry_segment: trimStr(formData.industry_segment),
        purchase_potential: trimStr(formData.purchase_potential),
        default_payment_terms: trimStr(formData.default_payment_terms),
        responsible_salesperson: trimStr(formData.responsible_salesperson),
        notes: trimStr(formData.notes),
      };

      let savedClient: Client;
      if (editingClient) {
        savedClient = await clientsApi.updateClient(editingClient.id, payload);
      } else {
        savedClient = await clientsApi.createClient(payload);
        // Salvar unidades locais
        if (units.length > 0) {
          await Promise.all(
            units.map((u) =>
              clientsApi.createClientUnit(Number(savedClient.id), {
                unit_type: u.unit_type,
                label: u.label || undefined,
                cnpj: u.cnpj || undefined,
                address: u.address || undefined,
                number: u.number || undefined,
                complement: u.complement || undefined,
                neighborhood: u.neighborhood || undefined,
                city: u.city || undefined,
                state: u.state || undefined,
                cep: u.cep || undefined,
              })
            )
          );
        }
      }

      // Link newly selected projects and unlink removed ones as a best-effort side effect.
      // Even if some project updates fail, the client record is already saved.
      const toLink = selectedProjectIds.filter((id) => !initialProjectIds.includes(id));
      const toUnlink = initialProjectIds.filter((id) => !selectedProjectIds.includes(id));

      const linkingCalls = [
        ...toLink.map((id) =>
          projectsApi.editProject(id, { client_id: savedClient.id }).catch((err) =>
            console.error(`Failed to link project ${id} to client:`, err),
          ),
        ),
        ...toUnlink.map((id) =>
          projectsApi.editProject(id, { client_id: undefined }).catch((err) =>
            console.error(`Failed to unlink project ${id} from client:`, err),
          ),
        ),
      ];

      if (linkingCalls.length > 0) {
        await Promise.allSettled(linkingCalls);
      }

      onSave(savedClient);
    } catch (err) {
      console.error('Failed to save client:', err);
    } finally {
      setSaving(false);
    }
  }

  // ── Tabs config ───────────────────────────────────────────────────────────

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
      whiteSpace: 'nowrap' as const,
      marginBottom: '-2px',
    };
  }

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            variants={modalContentVariants}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '900px', width: '100%' }}
          >
            {/* Header */}
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
              <button className="btn btn-icon" onClick={onClose}>
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
              {TABS.map((tab) => {
                const errCount = getTabErrorCount(tab.key);
                return (
                  <button
                    key={tab.key}
                    style={tabStyle(tab.key)}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                    {errCount > 0 && (
                      <span
                        className="tab-error-dot"
                        title={`${errCount} ${errCount === 1 ? 'erro' : 'erros'}`}
                      />
                    )}
                  </button>
                );
              })}
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
              {/* Tab 1: Dados Cadastrais */}
              {activeTab === 'registration' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <FormField
                    label={t('clients.legalName')}
                    required
                    error={formErrors['legal_name']}
                    fieldKey="legal_name"
                  >
                    <input
                      type="text"
                      className="input-field"
                      value={formData.legal_name}
                      onChange={(e) => handleFieldChange('legal_name', e.target.value)}
                      onBlur={(e) => handleFieldBlur('legal_name', e.target.value)}
                      placeholder={t('clients.legalName')}
                      autoFocus
                    />
                  </FormField>

                  <FormField
                    label={t('clients.tradeName')}
                    required
                    error={formErrors['trade_name']}
                    fieldKey="trade_name"
                  >
                    <input
                      type="text"
                      className="input-field"
                      value={formData.trade_name}
                      onChange={(e) => handleFieldChange('trade_name', e.target.value)}
                      onBlur={(e) => handleFieldBlur('trade_name', e.target.value)}
                      placeholder={t('clients.tradeName')}
                    />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <FormField
                      label={t('clients.cnpj')}
                      required
                      error={formErrors['cnpj']}
                      fieldKey="cnpj"
                    >
                      <input
                        type="text"
                        className="input-field"
                        value={display.cnpj}
                        onChange={(e) => {
                          const masked = maskCNPJ(e.target.value);
                          setDisplay((prev) => ({ ...prev, cnpj: masked }));
                          handleFieldChange('cnpj', unmask(masked));
                        }}
                        onBlur={() => handleFieldBlur('cnpj', formData.cnpj)}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                        inputMode="numeric"
                      />
                    </FormField>
                    <FormField label={t('clients.stateRegistration')}>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.state_registration}
                        onChange={(e) =>
                          handleFieldChange('state_registration', maskStateRegistration(e.target.value))
                        }
                        placeholder={t('clients.stateRegistration')}
                      />
                    </FormField>
                  </div>

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
                </div>
              )}

              {/* Tab 2: Enderecos */}
              {activeTab === 'addresses' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <SectionHeader title={t('clients.billingAddress')} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.5fr 2fr', gap: '12px' }}>
                    <FormField
                      label={t('clients.cep')}
                      required
                      error={formErrors['billing_cep']}
                      fieldKey="billing_cep"
                    >
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="input-field"
                          value={display.billing_cep}
                          onChange={(e) => handleBillingCepChange(maskCEP(e.target.value))}
                          onBlur={() => handleFieldBlur('billing_cep', formData.billing_cep)}
                          placeholder="00000-000"
                          maxLength={9}
                          inputMode="numeric"
                          style={{ paddingRight: billingCepLoading || billingCepSuccess ? '34px' : undefined }}
                        />
                        {billingCepLoading && <CepSpinner />}
                        {billingCepSuccess && !billingCepLoading && (
                          <Check
                            size={14}
                            style={{
                              position: 'absolute', right: '10px', top: '50%',
                              transform: 'translateY(-50%)', color: 'var(--color-success, #028F58)',
                            }}
                          />
                        )}
                      </div>
                    </FormField>
                    <FormField
                      label={t('clients.state')}
                      required
                      error={formErrors['billing_state']}
                      fieldKey="billing_state"
                    >
                      <input
                        type="text"
                        className="input-field"
                        value={formData.billing_state}
                        onChange={(e) => handleFieldChange('billing_state', e.target.value.toUpperCase())}
                        onBlur={(e) => handleFieldBlur('billing_state', e.target.value)}
                        placeholder="UF"
                        maxLength={2}
                      />
                    </FormField>
                    <FormField
                      label={t('clients.city')}
                      required
                      error={formErrors['billing_city']}
                      fieldKey="billing_city"
                    >
                      <input
                        type="text"
                        className="input-field"
                        value={formData.billing_city}
                        onChange={(e) => handleFieldChange('billing_city', e.target.value)}
                        onBlur={(e) => handleFieldBlur('billing_city', e.target.value)}
                        placeholder={t('clients.city')}
                      />
                    </FormField>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px' }}>
                    <FormField
                      label={t('clients.address')}
                      required
                      error={formErrors['billing_address']}
                      fieldKey="billing_address"
                    >
                      <input
                        type="text"
                        className="input-field"
                        value={formData.billing_address}
                        onChange={(e) => handleFieldChange('billing_address', e.target.value)}
                        onBlur={(e) => handleFieldBlur('billing_address', e.target.value)}
                        placeholder={t('clients.address')}
                      />
                    </FormField>
                    <FormField
                      label={t('clients.number')}
                      required
                      error={formErrors['billing_number']}
                      fieldKey="billing_number"
                    >
                      <input
                        type="text"
                        className="input-field"
                        value={formData.billing_number}
                        onChange={(e) => handleFieldChange('billing_number', e.target.value)}
                        onBlur={(e) => handleFieldBlur('billing_number', e.target.value)}
                        placeholder="N°"
                      />
                    </FormField>
                  </div>

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
                    <FormField
                      label={t('clients.neighborhood')}
                      required
                      error={formErrors['billing_neighborhood']}
                      fieldKey="billing_neighborhood"
                    >
                      <input
                        type="text"
                        className="input-field"
                        value={formData.billing_neighborhood}
                        onChange={(e) => handleFieldChange('billing_neighborhood', e.target.value)}
                        onBlur={(e) => handleFieldBlur('billing_neighborhood', e.target.value)}
                        placeholder={t('clients.neighborhood')}
                      />
                    </FormField>
                  </div>

                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '12px 14px',
                      background: 'var(--color-alternate, rgba(0,0,0,0.03))',
                      borderRadius: '8px', cursor: 'pointer', userSelect: 'none',
                    }}
                    onClick={() =>
                      handleFieldChange('delivery_same_as_billing', !formData.delivery_same_as_billing)
                    }
                  >
                    <input
                      type="checkbox"
                      checked={formData.delivery_same_as_billing ?? true}
                      onChange={(e) => handleFieldChange('delivery_same_as_billing', e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>
                      {t('clients.deliverySameAsBilling')}
                    </span>
                  </div>

                  {!formData.delivery_same_as_billing && (
                    <>
                      <SectionHeader title={t('clients.deliveryAddress')} />

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.5fr 2fr', gap: '12px' }}>
                        <FormField
                          label={t('clients.cep')}
                          required
                          error={formErrors['delivery_cep']}
                          fieldKey="delivery_cep"
                        >
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              className="input-field"
                              value={display.delivery_cep}
                              onChange={(e) => handleDeliveryCepChange(maskCEP(e.target.value))}
                              onBlur={() => handleFieldBlur('delivery_cep', formData.delivery_cep)}
                              placeholder="00000-000"
                              maxLength={9}
                              inputMode="numeric"
                              style={{ paddingRight: deliveryCepLoading || deliveryCepSuccess ? '34px' : undefined }}
                            />
                            {deliveryCepLoading && <CepSpinner />}
                            {deliveryCepSuccess && !deliveryCepLoading && (
                              <Check
                                size={14}
                                style={{
                                  position: 'absolute', right: '10px', top: '50%',
                                  transform: 'translateY(-50%)', color: 'var(--color-success, #028F58)',
                                }}
                              />
                            )}
                          </div>
                        </FormField>
                        <FormField
                          label={t('clients.state')}
                          required
                          error={formErrors['delivery_state']}
                          fieldKey="delivery_state"
                        >
                          <input
                            type="text"
                            className="input-field"
                            value={formData.delivery_state}
                            onChange={(e) =>
                              handleFieldChange('delivery_state', e.target.value.toUpperCase())
                            }
                            onBlur={(e) => handleFieldBlur('delivery_state', e.target.value)}
                            placeholder="UF"
                            maxLength={2}
                          />
                        </FormField>
                        <FormField
                          label={t('clients.city')}
                          required
                          error={formErrors['delivery_city']}
                          fieldKey="delivery_city"
                        >
                          <input
                            type="text"
                            className="input-field"
                            value={formData.delivery_city}
                            onChange={(e) => handleFieldChange('delivery_city', e.target.value)}
                            onBlur={(e) => handleFieldBlur('delivery_city', e.target.value)}
                            placeholder={t('clients.city')}
                          />
                        </FormField>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px' }}>
                        <FormField
                          label={t('clients.address')}
                          required
                          error={formErrors['delivery_address']}
                          fieldKey="delivery_address"
                        >
                          <input
                            type="text"
                            className="input-field"
                            value={formData.delivery_address}
                            onChange={(e) => handleFieldChange('delivery_address', e.target.value)}
                            onBlur={(e) => handleFieldBlur('delivery_address', e.target.value)}
                            placeholder={t('clients.address')}
                          />
                        </FormField>
                        <FormField
                          label={t('clients.number')}
                          required
                          error={formErrors['delivery_number']}
                          fieldKey="delivery_number"
                        >
                          <input
                            type="text"
                            className="input-field"
                            value={formData.delivery_number}
                            onChange={(e) => handleFieldChange('delivery_number', e.target.value)}
                            onBlur={(e) => handleFieldBlur('delivery_number', e.target.value)}
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
                            onChange={(e) => handleFieldChange('delivery_complement', e.target.value)}
                            placeholder={t('clients.complement')}
                          />
                        </FormField>
                        <FormField
                          label={t('clients.neighborhood')}
                          required
                          error={formErrors['delivery_neighborhood']}
                          fieldKey="delivery_neighborhood"
                        >
                          <input
                            type="text"
                            className="input-field"
                            value={formData.delivery_neighborhood}
                            onChange={(e) => handleFieldChange('delivery_neighborhood', e.target.value)}
                            onBlur={(e) => handleFieldBlur('delivery_neighborhood', e.target.value)}
                            placeholder={t('clients.neighborhood')}
                          />
                        </FormField>
                      </div>

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
                            onChange={(e) => handleFieldChange('vehicle_restrictions', e.target.value)}
                            placeholder={t('clients.vehicleRestrictions')}
                          />
                        </FormField>
                      </div>
                    </>
                  )}

                  {/* ── Unidades (Matriz / Filiais) ─────────────────────────── */}
                  <div style={{ marginTop: '24px' }}>
                    {/* Header da seção */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Matriz / Filiais
                      </span>
                      {!unitFormOpen && (
                        <button
                          type="button"
                          onClick={() => handleOpenUnitForm()}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--color-border)',
                            background: 'transparent', color: 'var(--color-primary)', fontSize: '0.8rem',
                            fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          + Adicionar
                        </button>
                      )}
                    </div>

                    {/* Lista de unidades */}
                    {units.map((unit) => (
                      <div
                        key={unit.id}
                        style={{
                          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                          padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)',
                          marginBottom: '8px', background: 'var(--color-surface)',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span style={{
                              fontSize: '0.72rem', fontWeight: 700, padding: '1px 7px',
                              borderRadius: '4px', letterSpacing: '0.05em',
                              background: unit.unit_type === 'MATRIZ' ? 'var(--color-primary)' : 'var(--color-surface-alt, #e8f0fe)',
                              color: unit.unit_type === 'MATRIZ' ? '#fff' : 'var(--color-primary)',
                              border: unit.unit_type === 'FILIAL' ? '1px solid var(--color-primary)' : 'none',
                            }}>
                              {unit.unit_type}
                            </span>
                            {unit.label && <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{unit.label}</span>}
                          </div>
                          {unit.cnpj && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{maskCNPJ(unit.cnpj)}</div>}
                          {(unit.city || unit.state) && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                              {[unit.address, unit.number, unit.city, unit.state].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginLeft: '8px', flexShrink: 0 }}>
                          <button type="button" onClick={() => handleOpenUnitForm(unit)}
                            style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem' }}>
                            Editar
                          </button>
                          <button type="button" onClick={() => handleDeleteUnit(unit)}
                            style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid var(--color-error, #ef4444)', background: 'transparent', color: 'var(--color-error, #ef4444)', cursor: 'pointer', fontSize: '0.75rem' }}>
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Form inline de nova/editar unidade */}
                    {unitFormOpen && (
                      <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--color-primary)', background: 'var(--color-surface)', marginTop: '8px' }}>
                        <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '0.85rem' }}>
                          {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
                        </div>

                        {/* Tipo (toggle) */}
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ fontSize: '0.82rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                            Tipo <span style={{ color: 'var(--color-error)' }}>*</span>
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {(['MATRIZ', 'FILIAL'] as const).map((t) => (
                              <button key={t} type="button"
                                onClick={() => setUnitForm((f) => ({ ...f, unit_type: t }))}
                                style={{
                                  flex: 1, padding: '7px', borderRadius: '6px',
                                  border: '1.5px solid',
                                  borderColor: unitForm.unit_type === t ? 'var(--color-primary)' : 'var(--color-border)',
                                  background: unitForm.unit_type === t ? 'var(--color-primary)' : 'transparent',
                                  color: unitForm.unit_type === t ? '#fff' : 'var(--color-text)',
                                  fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                                }}>
                                {t === 'MATRIZ' ? 'Matriz' : 'Filial'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Label e CNPJ */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Identificação</label>
                            <input type="text" className="input-field" placeholder="Ex: Filial SP"
                              value={unitForm.label || ''}
                              onChange={(e) => setUnitForm((f) => ({ ...f, label: e.target.value }))} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>CNPJ</label>
                            <input type="text" className="input-field" placeholder="00.000.000/0000-00"
                              value={unitCnpjDisplay}
                              inputMode="numeric" maxLength={18}
                              onChange={(e) => {
                                const masked = maskCNPJ(e.target.value);
                                setUnitCnpjDisplay(masked);
                                setUnitForm((f) => ({ ...f, cnpj: unmask(masked) }));
                              }} />
                          </div>
                        </div>

                        {/* CEP */}
                        <div style={{ marginBottom: '10px' }}>
                          <label style={{ fontSize: '0.82rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>CEP</label>
                          <input type="text" className="input-field" placeholder="00000-000"
                            value={unitCepDisplay} inputMode="numeric" maxLength={9}
                            onChange={(e) => {
                              const masked = maskCEP(e.target.value);
                              setUnitCepDisplay(masked);
                              setUnitForm((f) => ({ ...f, cep: unmask(masked) }));
                            }}
                            onBlur={async () => {
                              const cepDigits = unmask(unitCepDisplay);
                              if (cepDigits.length === 8) {
                                const addr = await fetchAddressByCEP(cepDigits);
                                if (addr) {
                                  setUnitForm((f) => ({
                                    ...f,
                                    address: addr.logradouro || f.address,
                                    complement: addr.complemento || f.complement,
                                    neighborhood: addr.bairro || f.neighborhood,
                                    city: addr.localidade || f.city,
                                    state: addr.uf || f.state,
                                  }));
                                }
                              }
                            }} />
                        </div>

                        {/* Endereço */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Logradouro</label>
                            <input type="text" className="input-field" placeholder="Rua, Av..."
                              value={unitForm.address || ''}
                              onChange={(e) => setUnitForm((f) => ({ ...f, address: e.target.value }))} />
                          </div>
                          <div style={{ width: '90px' }}>
                            <label style={{ fontSize: '0.82rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Número</label>
                            <input type="text" className="input-field"
                              value={unitForm.number || ''}
                              onChange={(e) => setUnitForm((f) => ({ ...f, number: e.target.value }))} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 60px', gap: '10px', marginBottom: '14px' }}>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Bairro</label>
                            <input type="text" className="input-field"
                              value={unitForm.neighborhood || ''}
                              onChange={(e) => setUnitForm((f) => ({ ...f, neighborhood: e.target.value }))} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Cidade</label>
                            <input type="text" className="input-field"
                              value={unitForm.city || ''}
                              onChange={(e) => setUnitForm((f) => ({ ...f, city: e.target.value }))} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.82rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>UF</label>
                            <input type="text" className="input-field" maxLength={2}
                              value={unitForm.state || ''}
                              onChange={(e) => setUnitForm((f) => ({ ...f, state: e.target.value.toUpperCase() }))} />
                          </div>
                        </div>

                        {/* Ações do form de unidade */}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button type="button"
                            onClick={() => { setUnitFormOpen(false); setEditingUnit(null); setUnitForm(emptyUnitForm()); setUnitCepDisplay(''); setUnitCnpjDisplay(''); }}
                            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontSize: '0.82rem' }}>
                            Cancelar
                          </button>
                          <button type="button" onClick={handleSaveUnit} disabled={savingUnit}
                            style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>
                            {savingUnit ? 'Salvando...' : editingUnit ? 'Salvar' : 'Adicionar'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Contatos */}
              {activeTab === 'contacts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <SectionHeader title={t('clients.purchasingContact')} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <FormField
                      label={t('clients.contactName')}
                      required
                      error={formErrors['purchasing_contact_name']}
                      fieldKey="purchasing_contact_name"
                    >
                      <input
                        type="text"
                        className="input-field"
                        value={formData.purchasing_contact_name}
                        onChange={(e) => handleFieldChange('purchasing_contact_name', e.target.value)}
                        onBlur={(e) => handleFieldBlur('purchasing_contact_name', e.target.value)}
                        placeholder={t('clients.contactName')}
                      />
                    </FormField>
                    <FormField
                      label={t('clients.contactEmail')}
                      required
                      error={formErrors['purchasing_contact_email']}
                      fieldKey="purchasing_contact_email"
                    >
                      <input
                        type="email"
                        className="input-field"
                        value={formData.purchasing_contact_email}
                        onChange={(e) => handleFieldChange('purchasing_contact_email', e.target.value)}
                        onBlur={(e) => handleFieldBlur('purchasing_contact_email', e.target.value)}
                        placeholder="email@empresa.com"
                      />
                    </FormField>
                    <FormField
                      label={t('clients.contactPhone')}
                      required
                      error={formErrors['purchasing_contact_phone']}
                      fieldKey="purchasing_contact_phone"
                    >
                      <PhoneInput
                        prefix={phonePrefixes.purchasing}
                        onPrefixChange={(p) => setPhonePrefixes((prev) => ({ ...prev, purchasing: p }))}
                        value={display.purchasing_contact_phone}
                        onChange={(e) => {
                          const masked = maskPhone(e);
                          setDisplay((prev) => ({ ...prev, purchasing_contact_phone: masked }));
                          handleFieldChange('purchasing_contact_phone', unmask(masked));
                        }}
                        onBlur={() => handleFieldBlur('purchasing_contact_phone', formData.purchasing_contact_phone)}
                      />
                    </FormField>
                  </div>

                  <SectionHeader title={t('clients.financialContact')} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <FormField
                      label={t('clients.contactName')}
                      required
                      error={formErrors['financial_contact_name']}
                      fieldKey="financial_contact_name"
                    >
                      <input
                        type="text"
                        className="input-field"
                        value={formData.financial_contact_name}
                        onChange={(e) => handleFieldChange('financial_contact_name', e.target.value)}
                        onBlur={(e) => handleFieldBlur('financial_contact_name', e.target.value)}
                        placeholder={t('clients.contactName')}
                      />
                    </FormField>
                    <FormField
                      label={t('clients.contactEmail')}
                      required
                      error={formErrors['financial_contact_email']}
                      fieldKey="financial_contact_email"
                    >
                      <input
                        type="email"
                        className="input-field"
                        value={formData.financial_contact_email}
                        onChange={(e) => handleFieldChange('financial_contact_email', e.target.value)}
                        onBlur={(e) => handleFieldBlur('financial_contact_email', e.target.value)}
                        placeholder="email@empresa.com"
                      />
                    </FormField>
                    <FormField
                      label={t('clients.contactPhone')}
                      required
                      error={formErrors['financial_contact_phone']}
                      fieldKey="financial_contact_phone"
                    >
                      <PhoneInput
                        prefix={phonePrefixes.financial}
                        onPrefixChange={(p) => setPhonePrefixes((prev) => ({ ...prev, financial: p }))}
                        value={display.financial_contact_phone}
                        onChange={(e) => {
                          const masked = maskPhone(e);
                          setDisplay((prev) => ({ ...prev, financial_contact_phone: masked }));
                          handleFieldChange('financial_contact_phone', unmask(masked));
                        }}
                        onBlur={() => handleFieldBlur('financial_contact_phone', formData.financial_contact_phone)}
                      />
                    </FormField>
                  </div>

                  <SectionHeader title={t('clients.warehouseContact')} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <FormField label={t('clients.contactName')}>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.warehouse_contact_name}
                        onChange={(e) => handleFieldChange('warehouse_contact_name', e.target.value)}
                        placeholder={t('clients.contactName')}
                      />
                    </FormField>
                    <FormField
                      label={t('clients.contactEmail')}
                      error={formErrors['warehouse_contact_email']}
                      fieldKey="warehouse_contact_email"
                    >
                      <input
                        type="email"
                        className="input-field"
                        value={formData.warehouse_contact_email}
                        onChange={(e) => handleFieldChange('warehouse_contact_email', e.target.value)}
                        onBlur={(e) => handleFieldBlur('warehouse_contact_email', e.target.value)}
                        placeholder="email@empresa.com"
                      />
                    </FormField>
                    <FormField
                      label={t('clients.contactPhone')}
                      error={formErrors['warehouse_contact_phone']}
                      fieldKey="warehouse_contact_phone"
                    >
                      <PhoneInput
                        prefix={phonePrefixes.warehouse}
                        onPrefixChange={(p) => setPhonePrefixes((prev) => ({ ...prev, warehouse: p }))}
                        value={display.warehouse_contact_phone}
                        onChange={(e) => {
                          const masked = maskPhone(e);
                          setDisplay((prev) => ({ ...prev, warehouse_contact_phone: masked }));
                          handleFieldChange('warehouse_contact_phone', unmask(masked));
                        }}
                        onBlur={() => handleFieldBlur('warehouse_contact_phone', formData.warehouse_contact_phone)}
                      />
                    </FormField>
                  </div>
                </div>
              )}

              {/* Tab 4: Negocios */}
              {activeTab === 'business' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <FormField
                    label={t('clients.industrySegment')}
                    required
                    error={formErrors['industry_segment']}
                    fieldKey="industry_segment"
                  >
                    <select
                      className="select-field"
                      value={formData.industry_segment}
                      onChange={(e) => handleFieldChange('industry_segment', e.target.value)}
                      onBlur={(e) => handleFieldBlur('industry_segment', e.target.value)}
                    >
                      <option value="">—</option>
                      {SEGMENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  {/* Project multi-select */}
                  <div className="input-group">
                    <label style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                      {t('clients.linkProjects')}
                    </label>
                    <div ref={projectDropdownRef} style={{ position: 'relative' }}>
                      {/* Trigger button */}
                      <button
                        type="button"
                        onClick={() => setProjectDropdownOpen((prev) => !prev)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          fontSize: '14px',
                          border: '1px solid var(--color-border, rgba(0,0,0,0.15))',
                          borderRadius: '6px',
                          background: 'var(--color-surface, #fff)',
                          cursor: 'pointer',
                          color:
                            selectedProjectIds.length > 0
                              ? 'var(--color-text)'
                              : 'var(--color-secondary-text)',
                          textAlign: 'left',
                        }}
                      >
                        <span>
                          {selectedProjectIds.length > 0
                            ? t('clients.projectsSelected', { count: selectedProjectIds.length })
                            : t('clients.selectProjects')}
                        </span>
                        <ChevronDown
                          size={16}
                          style={{
                            flexShrink: 0,
                            marginLeft: '8px',
                            transition: 'transform 0.15s ease',
                            transform: projectDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            color: 'var(--color-secondary-text)',
                          }}
                        />
                      </button>

                      {/* Dropdown panel */}
                      {projectDropdownOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 4px)',
                            left: 0,
                            right: 0,
                            zIndex: 100,
                            background: 'var(--color-surface, #fff)',
                            border: '1px solid var(--color-border, rgba(0,0,0,0.15))',
                            borderRadius: '6px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                            maxHeight: '200px',
                            overflowY: 'auto',
                          }}
                        >
                          {availableProjects.length === 0 ? (
                            <div
                              style={{
                                padding: '12px 14px',
                                fontSize: '13px',
                                color: 'var(--color-secondary-text)',
                              }}
                            >
                              {t('clients.noProjectsAvailable')}
                            </div>
                          ) : (
                            availableProjects.map((project) => {
                              const isChecked = selectedProjectIds.includes(project.id);
                              return (
                                <label
                                  key={project.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '9px 14px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    borderBottom:
                                      '1px solid var(--color-border, rgba(0,0,0,0.06))',
                                    background: isChecked
                                      ? 'var(--color-alternate, rgba(0,0,0,0.04))'
                                      : 'transparent',
                                    transition: 'background 0.1s ease',
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      setSelectedProjectIds((prev) =>
                                        isChecked
                                          ? prev.filter((id) => id !== project.id)
                                          : [...prev, project.id],
                                      );
                                    }}
                                    style={{ width: '15px', height: '15px', flexShrink: 0 }}
                                  />
                                  <span style={{ minWidth: 0 }}>
                                    <span
                                      style={{
                                        fontWeight: isChecked ? 600 : 400,
                                        color: 'var(--color-text)',
                                      }}
                                    >
                                      {project.name}
                                    </span>
                                    {project.registrationNumber && (
                                      <span
                                        style={{
                                          marginLeft: '6px',
                                          color: 'var(--color-secondary-text)',
                                        }}
                                      >
                                        — {project.registrationNumber}
                                      </span>
                                    )}
                                  </span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <FormField label={t('clients.purchasePotential')}>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.purchase_potential}
                      onChange={(e) => handleFieldChange('purchase_potential', e.target.value)}
                      placeholder={t('clients.purchasePotential')}
                    />
                  </FormField>

                  <FormField label={t('clients.defaultPaymentTerms')}>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.default_payment_terms}
                      onChange={(e) => handleFieldChange('default_payment_terms', e.target.value)}
                      placeholder="Ex: 30/60/90 dias"
                    />
                  </FormField>

                  <FormField label={t('clients.responsibleSalesperson')}>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.responsible_salesperson}
                      onChange={(e) => handleFieldChange('responsible_salesperson', e.target.value)}
                      placeholder={t('clients.responsibleSalesperson')}
                    />
                  </FormField>

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

            {/* Footer */}
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
              <div style={{ display: 'flex', gap: '8px' }}>
                {TABS.map((tab) => (
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
                    aria-label={`Ir para ${tab.label}`}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
                  {t('common.cancel')}
                </button>
                <button
                  className={`btn btn-primary ${shakeBtn ? 'btn-shake' : ''}`}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

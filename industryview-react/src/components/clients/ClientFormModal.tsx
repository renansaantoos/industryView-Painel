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
import { clientsApi } from '../../services';
import type { Client, ClientPayload } from '../../services/api/clients';
import { X, Check } from 'lucide-react';

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
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const [shakeBtn, setShakeBtn] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [billingCepLoading, setBillingCepLoading] = useState(false);
  const [deliveryCepLoading, setDeliveryCepLoading] = useState(false);
  const [billingCepSuccess, setBillingCepSuccess] = useState(false);
  const [deliveryCepSuccess, setDeliveryCepSuccess] = useState(false);

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
        purchasing_contact_phone: unmask(rawPurchasingPhone),
        financial_contact_name: editingClient.financial_contact_name || '',
        financial_contact_email: editingClient.financial_contact_email || '',
        financial_contact_phone: unmask(rawFinancialPhone),
        warehouse_contact_name: editingClient.warehouse_contact_name || '',
        warehouse_contact_email: editingClient.warehouse_contact_email || '',
        warehouse_contact_phone: unmask(rawWarehousePhone),
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
        purchasing_contact_phone: maskPhone(rawPurchasingPhone),
        financial_contact_phone: maskPhone(rawFinancialPhone),
        warehouse_contact_phone: maskPhone(rawWarehousePhone),
      });
    } else {
      setFormData(emptyForm());
      setDisplay(emptyDisplay());
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
      const value = (formData as Record<string, unknown>)[field];
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
        purchasing_contact_phone: trimStr(unmask(formData.purchasing_contact_phone || '')),
        financial_contact_name: trimStr(formData.financial_contact_name),
        financial_contact_email: trimStr(formData.financial_contact_email),
        financial_contact_phone: trimStr(unmask(formData.financial_contact_phone || '')),
        warehouse_contact_name: trimStr(formData.warehouse_contact_name),
        warehouse_contact_email: trimStr(formData.warehouse_contact_email),
        warehouse_contact_phone: trimStr(unmask(formData.warehouse_contact_phone || '')),
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
                      <input
                        type="text"
                        className="input-field"
                        value={display.purchasing_contact_phone}
                        onChange={(e) => {
                          const masked = maskPhone(e.target.value);
                          setDisplay((prev) => ({ ...prev, purchasing_contact_phone: masked }));
                          handleFieldChange('purchasing_contact_phone', unmask(masked));
                        }}
                        onBlur={() =>
                          handleFieldBlur('purchasing_contact_phone', formData.purchasing_contact_phone)
                        }
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        inputMode="numeric"
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
                      <input
                        type="text"
                        className="input-field"
                        value={display.financial_contact_phone}
                        onChange={(e) => {
                          const masked = maskPhone(e.target.value);
                          setDisplay((prev) => ({ ...prev, financial_contact_phone: masked }));
                          handleFieldChange('financial_contact_phone', unmask(masked));
                        }}
                        onBlur={() =>
                          handleFieldBlur('financial_contact_phone', formData.financial_contact_phone)
                        }
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        inputMode="numeric"
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
                      <input
                        type="text"
                        className="input-field"
                        value={display.warehouse_contact_phone}
                        onChange={(e) => {
                          const masked = maskPhone(e.target.value);
                          setDisplay((prev) => ({ ...prev, warehouse_contact_phone: masked }));
                          handleFieldChange('warehouse_contact_phone', unmask(masked));
                        }}
                        onBlur={() =>
                          handleFieldBlur('warehouse_contact_phone', formData.warehouse_contact_phone)
                        }
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        inputMode="numeric"
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

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../services';
import { Building2, Plus, Phone, Mail } from 'lucide-react';
import { MotionPage } from '../../lib/motion';
import { CnpjInput } from '../../components/company/CnpjInput';
import { CepLookup } from '../../components/company/CepLookup';
import type { CepAddress } from '../../components/company/CepLookup';
import './Auth.css';

interface CompanyForm {
  brand_name: string;
  legal_name: string;
  cnpj: string;
  phone: string;
  email: string;
  cep: string;
  address_line: string;
  numero: string;
  bairro: string;
  complemento: string;
  city: string;
  state: string;
}

const initialForm: CompanyForm = {
  brand_name: '',
  legal_name: '',
  cnpj: '',
  phone: '',
  email: '',
  cep: '',
  address_line: '',
  numero: '',
  bairro: '',
  complemento: '',
  city: '',
  state: '',
};

function applyPhoneMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function CompanySelect() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState<CompanyForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field: keyof CompanyForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressFound = useCallback((address: CepAddress) => {
    setForm(prev => ({
      ...prev,
      address_line: address.address_line,
      bairro: address.bairro,
      complemento: address.complemento,
      city: address.city,
      state: address.state,
    }));
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.brand_name.trim()) {
      setError('O nome fantasia da empresa é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const result = await usersApi.createCompany({
        name: form.brand_name,
        legal_name: form.legal_name || undefined,
        cnpj: form.cnpj || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        cep: form.cep || undefined,
        numero: form.numero || undefined,
        address_line: form.address_line || undefined,
        bairro: form.bairro || undefined,
        complemento: form.complemento || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
      });
      if (user) {
        updateUser({ companyId: result.id });
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // If user already has a company, redirect
  if (user?.companyId && user.companyId > 0) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <MotionPage variant="auth">
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-section" style={{ overflowY: 'auto' }}>
          <div className="auth-form-wrapper" style={{ maxWidth: '520px' }}>
            <h1 className="auth-brand">IndustryView</h1>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'var(--color-tertiary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Building2 size={32} color="var(--color-primary)" />
              </div>
              <h2 className="auth-title">{t('auth.selectCompany')}</h2>
              <p className="auth-subtitle">
                Preencha os dados da sua empresa para continuar.
              </p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleCreateCompany} className="auth-form">
              {/* Dados da Empresa */}
              <div style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid var(--color-alternate)',
                paddingBottom: 'var(--spacing-xs)',
              }}>
                Dados da Empresa
              </div>

              <div className="input-group">
                <label htmlFor="brand_name">
                  Nome Fantasia <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  id="brand_name"
                  type="text"
                  className="input-field"
                  placeholder="Nome fantasia da empresa"
                  value={form.brand_name}
                  onChange={(e) => updateField('brand_name', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="legal_name">Razão Social</label>
                <input
                  id="legal_name"
                  type="text"
                  className="input-field"
                  placeholder="Razão social da empresa"
                  value={form.legal_name}
                  onChange={(e) => updateField('legal_name', e.target.value)}
                />
              </div>

              <CnpjInput
                value={form.cnpj}
                onChange={(val) => updateField('cnpj', val)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                <div className="input-group">
                  <label htmlFor="phone">Telefone</label>
                  <input
                    id="phone"
                    type="text"
                    className="input-field"
                    placeholder="(00) 0 0000-0000"
                    value={form.phone}
                    onChange={(e) => updateField('phone', applyPhoneMask(e.target.value))}
                    maxLength={16}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="input-field"
                    placeholder="empresa@email.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>
              </div>

              {/* Endereço */}
              <div style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid var(--color-alternate)',
                paddingBottom: 'var(--spacing-xs)',
                marginTop: 'var(--spacing-sm)',
              }}>
                Endereço
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                <CepLookup
                  value={form.cep}
                  onChange={(val) => updateField('cep', val)}
                  onAddressFound={handleAddressFound}
                />

                <div className="input-group">
                  <label htmlFor="numero">Número</label>
                  <input
                    id="numero"
                    type="text"
                    className="input-field"
                    placeholder="Nº"
                    value={form.numero}
                    onChange={(e) => updateField('numero', e.target.value)}
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="address_line">Logradouro</label>
                <input
                  id="address_line"
                  type="text"
                  className="input-field"
                  placeholder="Rua, Avenida, etc."
                  value={form.address_line}
                  onChange={(e) => updateField('address_line', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                <div className="input-group">
                  <label htmlFor="bairro">Bairro</label>
                  <input
                    id="bairro"
                    type="text"
                    className="input-field"
                    placeholder="Bairro"
                    value={form.bairro}
                    onChange={(e) => updateField('bairro', e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="complemento">Complemento</label>
                  <input
                    id="complemento"
                    type="text"
                    className="input-field"
                    placeholder="Sala, Andar, etc."
                    value={form.complemento}
                    onChange={(e) => updateField('complemento', e.target.value)}
                    maxLength={100}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)' }}>
                <div className="input-group">
                  <label htmlFor="city">Cidade</label>
                  <input
                    id="city"
                    type="text"
                    className="input-field"
                    placeholder="Cidade"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="state">UF</label>
                  <input
                    id="state"
                    type="text"
                    className="input-field"
                    placeholder="UF"
                    value={form.state}
                    onChange={(e) => updateField('state', e.target.value.toUpperCase())}
                    maxLength={2}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading} style={{ marginTop: 'var(--spacing-sm)' }}>
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <Plus size={18} />
                    {t('auth.createCompany')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="auth-image-section">
          <div className="auth-image-content">
            <div className="auth-image-overlay">
              <h2>IndustryView</h2>
              <p>Plataforma completa para gestão de projetos e operações em campo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </MotionPage>
  );
}

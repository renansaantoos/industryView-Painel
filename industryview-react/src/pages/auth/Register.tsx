import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail, isRequired, passwordsMatch } from '../../utils/validators';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { MotionPage } from '../../lib/motion';
import './Auth.css';

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const PASSWORD_RULES = [
  { key: 'minLength', test: (p: string) => p.length >= 8, label: 'Mínimo 8 caracteres' },
  { key: 'uppercase', test: (p: string) => /[A-Z]/.test(p), label: 'Uma letra maiúscula' },
  { key: 'lowercase', test: (p: string) => /[a-z]/.test(p), label: 'Uma letra minúscula' },
  { key: 'number', test: (p: string) => /[0-9]/.test(p), label: 'Um número' },
  { key: 'symbol', test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'Um símbolo (!@#$%...)' },
];

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password],
  );
  const allPasswordRulesPassed = passwordChecks.every((c) => c.passed);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isRequired(name)) newErrors.name = t('auth.nameRequired');
    if (!isRequired(email) || !isValidEmail(email)) newErrors.email = t('auth.emailRequired');
    if (!isRequired(phone)) newErrors.phone = t('auth.phoneRequired');
    if (!isRequired(password)) {
      newErrors.password = t('auth.passwordRequired');
    } else if (!allPasswordRulesPassed) {
      newErrors.password = 'A senha não atende todos os requisitos';
    }
    if (!passwordsMatch(password, confirmPassword)) newErrors.confirmPassword = t('auth.passwordsDoNotMatch');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await signup(name, email, phone, password);
      navigate('/empresa', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: { field: string; message: string }[] } } };
      const apiErrors = axiosErr?.response?.data?.errors;

      if (apiErrors && apiErrors.length > 0) {
        const fieldMap: Record<string, string> = { password_hash: 'password' };
        const newErrors: Record<string, string> = {};
        for (const e of apiErrors) {
          const key = fieldMap[e.field] || e.field;
          newErrors[key] = newErrors[key] ? `${newErrors[key]}. ${e.message}` : e.message;
        }
        setErrors(newErrors);
      } else {
        setError(axiosErr?.response?.data?.message || (err instanceof Error ? err.message : t('common.error')));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionPage variant="auth">
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <h1 className="auth-brand">IndustryView</h1>
            <h2 className="auth-title">{t('auth.register')}</h2>
            <p className="auth-subtitle">{t('auth.loginSubtitle')}</p>

            {error && (
              <div className="auth-error">
                <strong>{t('common.error')}</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="name">{t('common.name')}</label>
                <input
                  id="name"
                  type="text"
                  className={`input-field ${errors.name ? 'error' : ''}`}
                  placeholder={t('auth.namePlaceholder')}
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
                />
                {errors.name && <span className="input-error">{errors.name}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="email">{t('auth.email')}</label>
                <input
                  id="email"
                  type="email"
                  className={`input-field ${errors.email ? 'error' : ''}`}
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                />
                {errors.email && <span className="input-error">{errors.email}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="phone">{t('common.phone')}</label>
                <input
                  id="phone"
                  type="tel"
                  className={`input-field ${errors.phone ? 'error' : ''}`}
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => { setPhone(maskPhone(e.target.value)); setErrors(prev => ({ ...prev, phone: '' })); }}
                />
                {errors.phone && <span className="input-error">{errors.phone}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="password">{t('auth.password')}</label>
                <div className="input-password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`input-field ${errors.password ? 'error' : ''}`}
                    placeholder="**********"
                    value={password}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                  />
                  <button type="button" className="input-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="input-error">{errors.password}</span>}
                {(passwordFocused || password.length > 0) && (
                  <ul className="password-rules">
                    {passwordChecks.map((rule) => (
                      <li key={rule.key} className={`password-rule ${rule.passed ? 'passed' : 'pending'}`}>
                        {rule.passed ? <Check size={14} /> : <X size={14} />}
                        <span>{rule.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
                <div className="input-password-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="**********"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                  />
                  <button type="button" className="input-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="input-error">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                {loading ? <span className="spinner" /> : t('auth.register')}
              </button>
            </form>

            <p className="auth-switch-text">
              {t('auth.alreadyHaveAccount')}
              <Link to="/login">{t('auth.loginHere')}</Link>
            </p>
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

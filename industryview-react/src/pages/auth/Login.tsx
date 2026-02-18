import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail } from '../../utils/validators';
import { Eye, EyeOff } from 'lucide-react';
import { MotionPage } from '../../lib/motion';
import './Auth.css';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // If already logged in, redirect to dashboard
  if (isLoggedIn) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const validate = (): boolean => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError(t('auth.emailRequired'));
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError(t('auth.emailRequired'));
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError(t('auth.passwordRequired'));
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
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

            <div className="auth-mobile-image">
              <img
                src="/assets/login-illustration.svg"
                alt="Gestão de projetos"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>

            <h2 className="auth-title">{t('auth.welcome')}</h2>
            <p className="auth-subtitle">{t('auth.loginSubtitle')}</p>

            {error && (
              <div className="auth-error">
                <strong>{t('common.error')}</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="email">{t('auth.email')}</label>
                <input
                  id="email"
                  type="email"
                  className={`input-field ${emailError ? 'error' : ''}`}
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  autoComplete="email"
                />
                {emailError && <span className="input-error">{emailError}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="password">{t('auth.password')}</label>
                <div className="input-password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`input-field ${passwordError ? 'error' : ''}`}
                    placeholder="**********"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && <span className="input-error">{passwordError}</span>}
              </div>

              <div className="auth-forgot-link">
                <Link to="/esqueci-senha">{t('auth.forgotPassword')}</Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit-btn"
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : t('auth.login')}
              </button>
            </form>

            <p className="auth-switch-text">
              {t('auth.noAccount')}
              <Link to="/cadastro">{t('auth.registerHere')}</Link>
            </p>
          </div>
        </div>

        <div className="auth-image-section">
          <div className="auth-image-content">
            <img
              src="/assets/login-illustration.svg"
              alt="Project management illustration"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
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

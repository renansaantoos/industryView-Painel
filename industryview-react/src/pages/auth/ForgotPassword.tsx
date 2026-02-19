import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../services';
import { isValidEmail } from '../../utils/validators';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { MotionPage } from '../../lib/motion';
import './Auth.css';

type Step = 'email' | 'code' | 'password';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(email)) {
      setError(t('auth.emailRequired'));
      return;
    }

    setLoading(true);
    try {
      await authApi.sendRecoveryCode(email);
      setSuccess('Código enviado para o e-mail.');
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) {
      setError('Insira o código recebido.');
      return;
    }

    setLoading(true);
    try {
      await authApi.validateRecoveryCode(email, code);
      setStep('password');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword.trim() || newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = step === 'email' ? 0 : step === 'code' ? 1 : 2;

  return (
    <MotionPage variant="auth">
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <h1 className="auth-brand">IndustryView</h1>
            <h2 className="auth-title">{t('auth.resetPassword')}</h2>

            <div className="auth-steps">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`auth-step ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'completed' : ''}`}
                />
              ))}
            </div>

            {error && <div className="auth-error">{error}</div>}
            {success && (
              <div style={{
                backgroundColor: 'var(--color-status-04)',
                color: 'var(--color-success)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '16px',
              }}>
                {success}
              </div>
            )}

            {step === 'email' && (
              <form onSubmit={handleSendCode} className="auth-form">
                <div className="input-group">
                  <label htmlFor="email">{t('auth.email')}</label>
                  <input
                    id="email"
                    type="email"
                    className="input-field"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                  {loading ? <span className="spinner" /> : t('auth.sendCode')}
                </button>
              </form>
            )}

            {step === 'code' && (
              <form onSubmit={handleVerifyCode} className="auth-form">
                <div className="input-group">
                  <label htmlFor="code">{t('auth.code')}</label>
                  <input
                    id="code"
                    type="text"
                    className="input-field"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                  {loading ? <span className="spinner" /> : t('auth.verifyCode')}
                </button>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="input-group">
                  <label htmlFor="newPassword">{t('auth.newPassword')}</label>
                  <div className="input-password-wrapper">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      className="input-field"
                      placeholder="**********"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button type="button" className="input-password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
                  <div className="input-password-wrapper">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input-field"
                      placeholder="**********"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button type="button" className="input-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                  {loading ? <span className="spinner" /> : t('auth.resetPassword')}
                </button>
              </form>
            )}

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                <ArrowLeft size={16} /> {t('common.back')}
              </Link>
            </div>
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

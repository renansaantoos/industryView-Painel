import { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { usersApi } from '../../../services';

interface Props {
  usersId: number;
  email: string | undefined;
}

export default function ResetPasswordTab({ usersId, email }: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isValid = newPassword.length >= 8 && newPassword === confirmPassword;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      await usersApi.adminResetPassword(usersId, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      showToast('Senha redefinida com sucesso.', 'success');
    } catch {
      showToast('Erro ao redefinir senha. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div
        style={{
          padding: '40px 24px',
          textAlign: 'center',
          color: 'var(--color-secondary-text)',
          fontSize: '14px',
        }}
      >
        <KeyRound size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
        <p>Este funcionário não possui email cadastrado.</p>
        <p style={{ fontSize: '13px', marginTop: '4px' }}>
          Cadastre um email nos Dados Pessoais para habilitar a redefinição de senha.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '480px' }}>
      <div
        style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 4px' }}>Redefinir senha</h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-secondary-text)' }}>
            Email: <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Nova senha
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'}
                className="input-field"
                placeholder="Mínimo 8 caracteres, 1 maiúscula, 1 símbolo"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ paddingRight: '40px', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                style={{
                  position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showNew
                  ? <EyeOff size={16} color="var(--color-secondary-text)" />
                  : <Eye size={16} color="var(--color-secondary-text)" />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Confirmar nova senha
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                className="input-field"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingRight: '40px', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                style={{
                  position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showConfirm
                  ? <EyeOff size={16} color="var(--color-secondary-text)" />
                  : <Eye size={16} color="var(--color-secondary-text)" />}
              </button>
            </div>
            {passwordMismatch && (
              <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>
                Senhas não conferem
              </p>
            )}
          </div>

          {toast && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                background: toast.type === 'success' ? 'rgba(2,143,88,0.1)' : 'rgba(192,57,43,0.1)',
                color: toast.type === 'success' ? '#028F58' : '#C0392B',
                border: `1px solid ${toast.type === 'success' ? '#028F58' : '#C0392B'}`,
              }}
            >
              {toast.message}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !isValid}
          >
            {loading ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>
      </div>
    </div>
  );
}

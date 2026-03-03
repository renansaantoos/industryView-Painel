import { useEffect, useState } from 'react';
import { useRouteError } from 'react-router-dom';

/**
 * Global error fallback for React Router.
 * When an auth context error or any unexpected crash happens,
 * clears stale auth data and redirects the user to /login.
 */
export default function RouteErrorFallback() {
  const error = useRouteError();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    console.error('[RouteErrorFallback]', error);

    // Clear potentially corrupt auth state
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_infoUser');
    localStorage.removeItem('ff_projectsInfo');

    // Countdown then redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.replace('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [error]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f8f9fa',
    }}>
      <div style={{
        textAlign: 'center', padding: '40px',
        backgroundColor: '#fff', borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)', maxWidth: '420px',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EFA953" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
          Sessão expirada
        </h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: 1.5 }}>
          Sua sessão foi interrompida. Você será redirecionado para o login em {countdown}s...
        </p>
        <button
          onClick={() => window.location.replace('/login')}
          style={{
            padding: '10px 32px', fontSize: '14px', fontWeight: 500,
            color: '#fff', backgroundColor: '#1D5CC6',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
          }}
        >
          Ir para o login agora
        </button>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUpChild } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { AlertTriangle, CreditCard, LogOut } from 'lucide-react';

export default function ExpiredPlan() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleUpgrade = () => {
    navigate('/page-price');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
      }}
    >
      <motion.div
        variants={fadeUpChild}
        initial="initial"
        animate="animate"
        className="card"
        style={{
          textAlign: 'center',
          maxWidth: '480px',
          width: '100%',
          padding: '48px 32px',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'var(--color-status-01)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <AlertTriangle size={40} color="var(--color-error)" />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-primary-text)' }}>
          {t('expired.title')}
        </h2>

        <p style={{ fontSize: '14px', color: 'var(--color-secondary-text)', lineHeight: 1.6, marginBottom: '32px' }}>
          {t('expired.description')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn btn-primary" onClick={handleUpgrade} style={{ width: '100%' }}>
            <CreditCard size={18} /> {t('expired.upgrade')}
          </button>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%' }}>
            <LogOut size={18} /> {t('expired.logout')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

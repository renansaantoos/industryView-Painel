import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { notificationsApi } from '../../services';
import type { Notification } from '../../types';
import { badgePop, dropdownVariants } from '../../lib/motion';

export default function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recent, setRecent] = useState<Notification[]>([]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationsApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleToggle = async () => {
    if (!showDropdown) {
      try {
        const data = await notificationsApi.listNotifications({ per_page: 5 });
        setRecent(data.items || []);
      } catch {
        // silent
      }
    }
    setShowDropdown(!showDropdown);
  };

  const handleClick = async (n: Notification) => {
    if (!n.is_read) {
      await notificationsApi.markAsRead(n.id);
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setShowDropdown(false);
    if (n.reference_table && n.reference_id) {
      navigate('/notificacoes');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn btn-icon"
        onClick={handleToggle}
        style={{ position: 'relative' }}
        title={t('nav.notifications')}
      >
        <Bell size={20} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              variants={badgePop}
              initial="initial"
              animate="animate"
              exit={{ scale: 0, transition: { duration: 0.15 } }}
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: 'var(--color-error)',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 999 }}
              onClick={() => setShowDropdown(false)}
            />
            <motion.div
              variants={dropdownVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '8px',
                width: '320px',
                background: 'var(--color-card-bg)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '1px solid var(--color-alternate)',
                zIndex: 1000,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-alternate)', fontWeight: 600, fontSize: '14px' }}>
                {t('nav.notifications')}
              </div>
              {recent.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                  {t('common.noData')}
                </div>
              ) : (
                recent.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--color-alternate)',
                      cursor: 'pointer',
                      backgroundColor: n.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                    }}
                  >
                    <div style={{ fontWeight: n.is_read ? 400 : 600, fontSize: '13px' }}>{n.title}</div>
                    <div style={{ color: 'var(--color-secondary-text)', fontSize: '11px', marginTop: '2px' }}>{n.message}</div>
                  </div>
                ))
              )}
              <div
                style={{ padding: '10px 16px', textAlign: 'center', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '13px', fontWeight: 500 }}
                onClick={() => { setShowDropdown(false); navigate('/notificacoes'); }}
              >
                {t('notifications.viewAll')}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

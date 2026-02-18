import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react';
import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { emptyStateVariants } from '../../lib/motion';

interface EmptyStateProps {
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ message, icon, action }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      variants={emptyStateVariants}
      initial="initial"
      animate="animate"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{
        color: 'var(--color-alternate)',
        marginBottom: '16px',
      }}>
        {icon || <Inbox size={48} />}
      </div>
      <p style={{
        fontSize: '14px',
        color: 'var(--color-secondary-text)',
        marginBottom: action ? '16px' : '0',
      }}>
        {message || t('common.noData')}
      </p>
      {action}
    </motion.div>
  );
}

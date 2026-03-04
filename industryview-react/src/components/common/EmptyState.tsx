import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react';
import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { emptyStateVariants } from '../../lib/motion';

interface EmptyStateProps {
  message?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ message, title, description, icon, action }: EmptyStateProps) {
  const { t } = useTranslation();
  const displayMessage = message ?? (title && description ? `${title}. ${description}` : title ?? description) ?? t('common.noData');

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
      {title && (
        <p style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--color-primary-text)',
          marginBottom: '4px',
        }}>
          {title}
        </p>
      )}
      <p style={{
        fontSize: '14px',
        color: 'var(--color-secondary-text)',
        marginBottom: action ? '16px' : '0',
      }}>
        {displayMessage}
      </p>
      {action}
    </motion.div>
  );
}

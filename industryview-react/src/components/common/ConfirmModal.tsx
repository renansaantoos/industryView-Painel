import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../../lib/motion';

interface ConfirmModalProps {
  isOpen?: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen = true,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { t } = useTranslation();

  const btnClass = variant === 'danger' ? 'btn btn-danger' : variant === 'warning' ? 'btn btn-warning' : 'btn btn-primary';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onCancel}
          style={{ animation: 'none' }}
        >
          <motion.div
            className="modal-content"
            variants={modalContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={e => e.stopPropagation()}
            style={{ padding: '24px', minWidth: '320px', maxWidth: '420px' }}
          >
            <h3 style={{ marginBottom: '12px' }}>{title}</h3>
            <p style={{ marginBottom: '24px', color: 'var(--color-secondary-text)', fontSize: '14px' }}>
              {message}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={onCancel}>
                {cancelLabel || t('common.cancel')}
              </button>
              <button className={btnClass} onClick={onConfirm}>
                {confirmLabel || t('common.confirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

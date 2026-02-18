import { useTranslation } from 'react-i18next';
import { Check, X, Send, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';

interface ApprovalActionsProps {
  status: string;
  onFinalize?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  loading?: boolean;
}

export default function ApprovalActions({
  status,
  onFinalize,
  onApprove,
  onReject,
  onClose,
  onCancel,
  onSubmit,
  loading,
}: ApprovalActionsProps) {
  const { t } = useTranslation();

  return (
    <motion.div variants={staggerParent} initial="initial" animate="animate" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {status === 'rascunho' && onFinalize && (
        <motion.button variants={fadeUpChild} className="btn btn-primary" onClick={onFinalize} disabled={loading}>
          <Send size={16} /> {t('common.finalize')}
        </motion.button>
      )}
      {status === 'rascunho' && onSubmit && (
        <motion.button variants={fadeUpChild} className="btn btn-primary" onClick={onSubmit} disabled={loading}>
          <Send size={16} /> {t('common.submit')}
        </motion.button>
      )}
      {(status === 'finalizado' || status === 'submetida') && onApprove && (
        <motion.button variants={fadeUpChild} className="btn btn-primary" onClick={onApprove} disabled={loading} style={{ backgroundColor: 'var(--color-success)' }}>
          <Check size={16} /> {t('common.approve')}
        </motion.button>
      )}
      {(status === 'finalizado' || status === 'submetida') && onReject && (
        <motion.button variants={fadeUpChild} className="btn btn-secondary" onClick={onReject} disabled={loading} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
          <X size={16} /> {t('common.reject')}
        </motion.button>
      )}
      {onClose && !['encerrado', 'encerrada', 'cancelada'].includes(status) && (
        <motion.button variants={fadeUpChild} className="btn btn-secondary" onClick={onClose} disabled={loading}>
          <Lock size={16} /> {t('common.close')}
        </motion.button>
      )}
      {onCancel && !['cancelada', 'encerrada', 'encerrado'].includes(status) && (
        <motion.button variants={fadeUpChild} className="btn btn-secondary" onClick={onCancel} disabled={loading} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
          <X size={16} /> {t('common.cancel')}
        </motion.button>
      )}
    </motion.div>
  );
}

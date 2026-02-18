import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, authPageVariants, staggerParent, modalBackdropVariants, modalContentVariants } from './variants';

// --- MotionPage ---
interface MotionPageProps {
  children: ReactNode;
  variant?: 'default' | 'auth';
  className?: string;
  style?: React.CSSProperties;
}

export function MotionPage({ children, variant = 'default', className, style }: MotionPageProps) {
  const variants = variant === 'auth' ? authPageVariants : pageVariants;
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// --- MotionList ---
interface MotionListProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MotionList({ children, className, style }: MotionListProps) {
  return (
    <motion.div
      variants={staggerParent}
      initial="initial"
      animate="animate"
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// --- MotionModal ---
interface MotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  style?: React.CSSProperties;
}

export function MotionModal({ isOpen, onClose, children, style }: MotionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
          style={{ animation: 'none' }}
        >
          <motion.div
            className="modal-content"
            variants={modalContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={style}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

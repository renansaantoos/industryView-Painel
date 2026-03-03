import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

// ── Page-level variants ──

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ── Stagger parent / children ──

export const staggerParent: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.04 } },
};

export const fadeUpChild: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export const fadeInChild: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
};

export const scaleChild: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
};

// ── Table rows ──

export const tableRowVariants: Variants = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

// ── Dropdown / slide ──

export const dropdownVariants: Variants = {
  initial: { opacity: 0, y: -4, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.1 } },
};

export const slideDownVariants: Variants = {
  initial: { opacity: 0, height: 0, overflow: 'hidden' },
  animate: { opacity: 1, height: 'auto', overflow: 'hidden', transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, height: 0, overflow: 'hidden', transition: { duration: 0.15 } },
};

// ── Modal ──

export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.1 } },
};

// ── Empty state ──

export const emptyStateVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ── Badge pop (notifications) ──

export const badgePop: Variants = {
  initial: { scale: 0 },
  animate: { scale: 1, transition: { type: 'spring', stiffness: 500, damping: 20 } },
};

// ── MotionPage wrapper ──

interface MotionPageProps {
  children: ReactNode;
  variant?: 'default' | 'auth';
}

export function MotionPage({ children, variant = 'default' }: MotionPageProps) {
  const variants = variant === 'auth'
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.4 } } }
    : pageVariants;

  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

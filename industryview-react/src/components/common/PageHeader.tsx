import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumb, actions }: PageHeaderProps) {
  return (
    <motion.div
      variants={staggerParent}
      initial="initial"
      animate="animate"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div>
        {breadcrumb && (
          <motion.span variants={fadeUpChild} style={{
            fontSize: '12px',
            color: 'var(--color-secondary-text)',
            marginBottom: '4px',
            display: 'block',
          }}>
            {breadcrumb}
          </motion.span>
        )}
        <motion.h1 variants={fadeUpChild} style={{ fontSize: '24px', fontWeight: 600, marginBottom: '4px' }}>{title}</motion.h1>
        {subtitle && (
          <motion.p variants={fadeUpChild} style={{ fontSize: '14px', color: 'var(--color-secondary-text)', maxWidth: '600px' }}>
            {subtitle}
          </motion.p>
        )}
      </div>
      {actions && (
        <motion.div variants={fadeUpChild} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {actions}
        </motion.div>
      )}
    </motion.div>
  );
}

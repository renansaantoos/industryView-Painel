import { motion } from 'framer-motion';
import { scaleChild } from '../../lib/motion';

interface StatusBadgeProps {
  status: string;
  colorMap: Record<string, { bg: string; color: string; label?: string }>;
  label?: string;
}

export default function StatusBadge({ status, colorMap, label }: StatusBadgeProps) {
  const config = colorMap[status] || { bg: 'var(--color-alternate)', color: 'var(--color-secondary-text)' };
  return (
    <motion.span
      variants={scaleChild}
      initial="initial"
      animate="animate"
      className="badge"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {label || config.label || status}
    </motion.span>
  );
}

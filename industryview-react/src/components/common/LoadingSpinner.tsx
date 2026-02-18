import { motion } from 'framer-motion';
import { fadeInChild } from '../../lib/motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export default function LoadingSpinner({ size = 'md', fullPage = false }: LoadingSpinnerProps) {
  const className = `spinner ${size === 'lg' ? 'spinner-lg' : ''}`;

  if (fullPage) {
    return (
      <motion.div
        variants={fadeInChild}
        initial="initial"
        animate="animate"
        className="loading-overlay"
        style={{ minHeight: '60vh' }}
      >
        <div className={className} />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeInChild}
      initial="initial"
      animate="animate"
      className="loading-overlay"
    >
      <div className={className} />
    </motion.div>
  );
}

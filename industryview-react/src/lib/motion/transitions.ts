import type { Transition } from 'framer-motion';

// Aligned with CSS variables in variables.css
export const transitionFast: Transition = { duration: 0.15, ease: 'easeOut' };
export const transitionNormal: Transition = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] };
export const transitionSlow: Transition = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] };

export const transitionSpring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const staggerContainer: Transition = {
  staggerChildren: 0.06,
};

export const staggerContainerFast: Transition = {
  staggerChildren: 0.04,
};

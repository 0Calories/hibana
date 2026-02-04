import type { TargetAndTransition } from 'framer-motion';
import type { FlameState } from '../../hooks/useFlameTimer';

export const stateVariants: Record<FlameState, TargetAndTransition> = {
  untended: {
    scale: 0.9,
    opacity: 0.88,
    y: 0,
  },
  active: {
    scale: 1.1,
    opacity: 1,
    y: -4,
  },
  paused: {
    scale: 0.8,
    opacity: 0.95,
    y: 0,
  },
  completed: {
    scale: 0,
    opacity: 1,
    y: 0.9,
  },
};

export const flickerVariants: Record<FlameState, TargetAndTransition> = {
  untended: {
    scaleY: [1, 0.95, 1.02, 0.98, 1],
    scaleX: [1, 1.02, 0.98, 1.01, 1],
  },
  active: {
    scaleY: [1, 1.1, 0.95, 1.15, 0.9, 1.05, 1],
    scaleX: [1, 0.95, 1.05, 0.92, 1.08, 0.97, 1],
  },
  paused: {
    scaleY: [1, 0.98, 1.01, 0.99, 1],
    scaleX: [1, 1.01, 0.99, 1.005, 1],
  },
  completed: {
    scaleY: 1,
    scaleX: 1,
  },
};

export const radiateVariants: Record<FlameState, TargetAndTransition> = {
  untended: {
    scale: [1, 1.08, 1.03, 1.06, 1],
    rotate: [0, 3, -2, 1, 0],
  },
  active: {
    scale: [1, 1.15, 1.08, 1.12, 1.05, 1.1, 1],
    rotate: [0, 5, -3, 4, -2, 3, 0],
  },
  paused: {
    scale: [1, 1.05, 1.02, 1.04, 1],
    rotate: [0, 2, -1, 1, 0],
  },
  completed: {
    scale: 1,
    rotate: 0,
  },
};

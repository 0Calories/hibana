import type { TargetAndTransition } from 'framer-motion';
import type { FlameState } from '../../../utils/types';

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
  sealing: {
    scale: 1.15,
    opacity: 1,
    y: -6,
  },
  sealed: {
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
  sealing: {
    scaleY: [1, 1.12, 0.88, 1.15, 0.85, 1.1, 1],
    scaleX: [1, 0.9, 1.1, 0.88, 1.12, 0.92, 1],
  },
  sealed: {
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
  sealing: {
    scale: [1, 1.18, 1.05, 1.2, 1.08, 1.15, 1],
    rotate: [0, 6, -4, 5, -3, 4, 0],
  },
  sealed: {
    scale: 1,
    rotate: 0,
  },
};

'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface GoldenPulseProps {
  show: boolean;
}

export function GoldenPulse({ show }: GoldenPulseProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 rounded-xl"
          initial={{
            boxShadow:
              '0 0 0px rgba(251, 191, 36, 0.8), inset 0 0 0px rgba(251, 191, 36, 0)',
          }}
          animate={{
            boxShadow: [
              '0 0 0px rgba(251, 191, 36, 0.8), inset 0 0 0px rgba(251, 191, 36, 0)',
              '0 0 40px rgba(251, 191, 36, 0.5), inset 0 0 20px rgba(251, 191, 36, 0.15)',
              '0 0 80px rgba(251, 191, 36, 0), inset 0 0 0px rgba(251, 191, 36, 0)',
            ],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.4,
            ease: 'easeOut',
          }}
        />
      )}
    </AnimatePresence>
  );
}

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
            boxShadow: '0 0 0px rgba(251, 191, 36, 0.6)',
          }}
          animate={{
            boxShadow: [
              '0 0 0px rgba(251, 191, 36, 0.6)',
              '0 0 30px rgba(251, 191, 36, 0.4)',
              '0 0 60px rgba(251, 191, 36, 0)',
            ],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.2,
            ease: 'easeOut',
          }}
        />
      )}
    </AnimatePresence>
  );
}

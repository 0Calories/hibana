'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { GeometricFlame } from '@/app/(app)/flames/components/flame-card/effects/GeometricFlame';
import { FLAME_HEX_COLORS } from '@/app/(app)/flames/utils/colors';

export function HeroFlame() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0 -m-16 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(249,115,22,0.25) 0%, rgba(249,115,22,0.08) 40%, transparent 70%)',
        }}
      />
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative h-48 w-36 sm:h-64 sm:w-48 lg:h-80 lg:w-60"
      >
        <GeometricFlame
          state="active"
          level={7}
          colors={FLAME_HEX_COLORS.orange}
        />
      </motion.div>
    </div>
  );
}

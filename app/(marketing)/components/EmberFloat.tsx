'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

export function EmberFloat() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-0 -m-12 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(251,146,60,0.2) 0%, rgba(167,139,250,0.08) 50%, transparent 70%)',
        }}
      />

      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      >
        <Image
          src="/ember.png"
          alt="Ember — Hibana's AI flame-sprite companion"
          width={180}
          height={270}
          className="relative select-none drop-shadow-[0_0_60px_rgba(251,146,60,0.35)]"
          draggable={false}
          priority={false}
        />
      </motion.div>
    </div>
  );
}

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

/** Sparkles that orbit around Ember */
const EMBER_SPARKLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: 15 + ((i * 2741) % 70),
  y: 10 + ((i * 1723) % 75),
  size: 2 + ((i * 937) % 3),
  delay: ((i * 571) % 4000) / 1000,
  duration: 2 + ((i * 1291) % 2000) / 1000,
}));

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

      {/* Sparkle particles around Ember */}
      {!shouldReduceMotion &&
        EMBER_SPARKLES.map((s) => (
          <motion.div
            key={s.id}
            className="pointer-events-none absolute rounded-full bg-amber-300"
            style={{
              width: s.size,
              height: s.size,
              left: `${s.x}%`,
              top: `${s.y}%`,
              boxShadow: `0 0 ${s.size * 2}px rgba(251,191,36,0.5)`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.3, 0.5],
            }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          />
        ))}

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
          className="relative drop-shadow-[0_0_60px_rgba(251,146,60,0.35)]"
          priority={false}
        />
      </motion.div>
    </div>
  );
}

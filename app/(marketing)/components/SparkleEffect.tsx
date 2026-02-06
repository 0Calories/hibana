'use client';

import { motion, useReducedMotion } from 'framer-motion';

/** Deterministic sparkle particles for decorative elements */
const SPARKLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 10 + ((i * 2741) % 80),
  y: 10 + ((i * 1723) % 80),
  size: 2 + ((i * 937) % 3),
  delay: ((i * 571) % 3000) / 1000,
  duration: 1.5 + ((i * 1291) % 2000) / 1000,
}));

/**
 * Overlay container that scatters animated sparkle dots.
 * Wrap it around any element to add sparkles.
 */
export function SparkleEffect({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <span className="relative inline-block">
      {children}
      {!shouldReduceMotion &&
        SPARKLES.map((s) => (
          <motion.span
            key={s.id}
            className="pointer-events-none absolute rounded-full bg-amber-300"
            style={{
              width: s.size,
              height: s.size,
              left: `${s.x}%`,
              top: `${s.y}%`,
              boxShadow: `0 0 ${s.size * 2}px rgba(251,191,36,0.6)`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          />
        ))}
    </span>
  );
}

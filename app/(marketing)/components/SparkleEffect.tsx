'use client';

import { motion, useReducedMotion } from 'framer-motion';

/** Deterministic star-shaped sparkle particles for decorative elements */
const SPARKLES = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  x: 1 + ((i * 2741) % 90),
  y: 1 + ((i * 1723) % 90),
  size: 3 + ((i * 937) % 3),
  delay: ((i * 571) % 3000) / 1000,
  duration: 5 + ((i * 1291) % 5000) / 1000,
  rotation: (i * 433) % 30,
  color: i % 3 === 0 ? '#fde68a' : i % 2 === 0 ? '#fbbf24' : '#ffffff',
}));

/**
 * Overlay container that scatters animated star-shaped sparkle dots.
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
            className="pointer-events-none absolute"
            style={{
              width: s.size,
              height: s.size,
              left: `${s.x}%`,
              top: `${s.y}%`,
              backgroundColor: s.color,
              transform: 'rotate(45deg)',
              boxShadow: `0 0 ${s.size * 2}px ${s.color}90`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.3, 1.3, 0.3],
              rotate: [45, 45 + s.rotation, 45],
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

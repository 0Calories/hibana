'use client';

import { motion, useReducedMotion } from 'framer-motion';

const EMBER_DATA = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: (i * 2741) % 100,
  size: 1.5 + ((i * 1723) % 5),
  delay: ((i * 937) % 10000) / 1000,
  duration: 5 + ((i * 1291) % 8),
  drift: -40 + ((i * 571) % 80),
  color:
    i % 7 === 0
      ? '#f43f5e'
      : i % 5 === 0
        ? '#f97316'
        : i % 3 === 0
          ? '#f59e0b'
          : i % 2 === 0
            ? '#fbbf24'
            : '#fb923c',
  opacity: 0.1 + ((i * 317) % 50) / 100,
}));

export function HeroEmbers() {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {EMBER_DATA.map((ember) => (
        <motion.div
          key={ember.id}
          className="absolute rounded-full"
          style={{
            left: `${ember.x}%`,
            bottom: '-5%',
            width: ember.size,
            height: ember.size,
            backgroundColor: ember.color,
            boxShadow: `0 0 ${ember.size * 2}px ${ember.color}`,
          }}
          animate={{
            y: '-120vh',
            x: [0, ember.drift, ember.drift * 0.5],
            opacity: [0, ember.opacity, ember.opacity * 0.8, 0],
          }}
          transition={{
            duration: ember.duration,
            delay: ember.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

'use client';

import { motion, useReducedMotion } from 'framer-motion';

const EMBER_DATA = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: (i * 2741) % 100,
  size: 2 + ((i * 1723) % 4),
  delay: ((i * 937) % 8000) / 1000,
  duration: 4 + ((i * 1291) % 6),
  drift: -30 + ((i * 571) % 60),
  color:
    i % 5 === 0
      ? '#E60076'
      : i % 3 === 0
        ? '#ff69b4'
        : i % 2 === 0
          ? '#ff91ce'
          : '#d4006a',
  opacity: 0.15 + ((i * 317) % 45) / 100,
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
          }}
          animate={{
            y: '-120vh',
            x: [0, ember.drift],
            opacity: [0, ember.opacity, ember.opacity, 0],
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

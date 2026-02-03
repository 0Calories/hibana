'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import type { FlameState } from '../hooks/useFlameTimer';

interface ParticleEmbersProps {
  state: FlameState;
  color: string;
}

interface Particle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 30 + Math.random() * 40, // 30-70% horizontal position
    size: 4 + Math.random() * 4, // 4-8px
    delay: Math.random() * 2, // 0-2s staggered delay
    duration: 2 + Math.random() * 1.5, // 2-3.5s float duration
  }));
}

export function ParticleEmbers({ state, color }: ParticleEmbersProps) {
  const shouldReduceMotion = useReducedMotion();
  const isActive = state === 'active';

  // Generate particles once and memoize
  const particles = useMemo(() => generateParticles(10), []);

  // Don't render particles if reduced motion is preferred or not active
  if (shouldReduceMotion || !isActive) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {isActive &&
          particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                bottom: '30%',
                width: particle.size,
                height: particle.size,
                backgroundColor: color,
              }}
              initial={{ opacity: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: -150,
                x: [0, (Math.random() - 0.5) * 30],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}
      </AnimatePresence>
    </div>
  );
}

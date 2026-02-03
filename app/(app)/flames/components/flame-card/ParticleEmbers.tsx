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
    x: 35 + Math.random() * 30, // 35-65% horizontal position
    size: 3 + Math.random() * 3, // 3-6px
    delay: Math.random() * 1.5, // 0-1.5s staggered delay
    duration: 1.5 + Math.random() * 1, // 1.5-2.5s float duration
  }));
}

export function ParticleEmbers({ state, color }: ParticleEmbersProps) {
  const shouldReduceMotion = useReducedMotion();
  const isActive = state === 'active';

  // Fewer particles for compact cards
  const particles = useMemo(() => generateParticles(6), []);

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
                bottom: '40%',
                width: particle.size,
                height: particle.size,
                backgroundColor: color,
              }}
              initial={{ opacity: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: -80,
                x: [0, (Math.random() - 0.5) * 20],
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

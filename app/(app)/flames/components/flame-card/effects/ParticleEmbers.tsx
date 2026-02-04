'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import type { FlameState } from '../../hooks/useFlameTimer';

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
  drift: number;
}

// Deterministic particle generation to avoid hydration mismatch
function generateParticles(count: number, sizeMultiplier: number): Particle[] {
  const particles: Particle[] = [];
  const seed = 42;
  for (let i = 0; i < count; i++) {
    const hash = (seed * (i + 1) * 9973) % 10000;
    particles.push({
      id: i,
      x: 35 + (hash % 30), // 35-65% horizontal position
      size: (3 + (hash % 30) / 10) * sizeMultiplier, // 3-6px base, scaled
      delay: (hash % 1500) / 1000, // 0-1.5s staggered delay
      duration: 1.5 + (hash % 1000) / 1000, // 1.5-2.5s float duration
      drift: (hash % 20) - 10, // -10 to 10px horizontal drift
    });
  }
  return particles;
}

export function ParticleEmbers({ state, color }: ParticleEmbersProps) {
  const shouldReduceMotion = useReducedMotion();
  const isActive = state === 'active';
  const isPaused = state === 'paused';
  const isUntended = state === 'untended';
  const showEmbers = isActive || isPaused || isUntended;

  // Different particle counts and sizes based on state
  // Use state directly in deps to ensure re-generation on state change
  const particles = useMemo(() => {
    if (state === 'active') {
      return generateParticles(8, 1.4); // Many large particles when active
    }
    if (state === 'paused') {
      return generateParticles(3, 1); // Few particles when paused
    }
    if (state === 'untended') {
      return generateParticles(2, 1); // Very few particles when untended
    }
    return [];
  }, [state]);

  if (shouldReduceMotion || !showEmbers) {
    return null;
  }

  // Adjust intensity based on state
  const opacityMultiplier = isActive ? 1 : 0.4;
  // Speed: active = normal, paused = slower, untended = very slow
  const speedMultiplier = isActive ? 1 : isPaused ? 2 : 2.5;

  return (
    <div
      key={`embers-${state}`}
      className="pointer-events-none absolute inset-0 scale-75 md:scale-100"
    >
      <AnimatePresence>
        {particles.map((particle) => (
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
              opacity: [0, opacityMultiplier, opacityMultiplier, 0],
              y: -80,
              x: [0, particle.drift],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: particle.duration * speedMultiplier,
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

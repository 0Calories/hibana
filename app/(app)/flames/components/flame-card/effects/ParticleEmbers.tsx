'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import type { BaseParticleProps, ParticleStateConfig } from './particles';
import {
  generateBaseParticle,
  generateParticles,
  getAnimationIntensity,
  shouldShowParticles,
} from './particles';

const EMBER_STATE_CONFIG: ParticleStateConfig = {
  active: { count: 8, sizeMultiplier: 1.4 },
  paused: { count: 3, sizeMultiplier: 1 },
  untended: { count: 2, sizeMultiplier: 1 },
};

export function ParticleEmbers({ state, color }: BaseParticleProps) {
  const shouldReduceMotion = useReducedMotion();
  const showEmbers = shouldShowParticles(state);

  const particles = useMemo(
    () =>
      generateParticles(state, EMBER_STATE_CONFIG, (index, sizeMultiplier) => {
        const base = generateBaseParticle(index);
        return { ...base, size: base.size * sizeMultiplier };
      }),
    [state],
  );

  if (shouldReduceMotion || !showEmbers) {
    return null;
  }

  const { opacity, speed } = getAnimationIntensity(state);

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
              opacity: [0, opacity, opacity, 0],
              y: -80,
              x: [0, particle.drift],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: particle.duration * speed,
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

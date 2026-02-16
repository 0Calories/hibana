'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import type { BaseParticleProps } from './particles';
import {
  generateBaseParticle,
  generateParticles,
  getParticleIntensity,
  shouldShowParticles,
} from './particles';
import type { EmberEffectConfig, ShapeColors } from './types';

interface ParticleEmbersProps extends BaseParticleProps {
  config: EmberEffectConfig;
}

const EMBER_PALETTE = (colors: ShapeColors) =>
  [colors.light, colors.light, colors.medium] as const;

export function ParticleEmbers({ state, colors, config }: ParticleEmbersProps) {
  const shouldReduceMotion = useReducedMotion();
  const sealedCount = config.states.sealed?.count ?? 0;
  const showEmbers =
    shouldShowParticles(state) || (state === 'sealed' && sealedCount > 0);
  const { states } = config;

  const particles = useMemo(
    () =>
      generateParticles(state, states, (index, sizeMultiplier) => {
        const base = generateBaseParticle(index);
        return { ...base, size: base.size * sizeMultiplier };
      }),
    [state, states],
  );

  if (shouldReduceMotion || !showEmbers) {
    return null;
  }

  const { opacity, speed } = getParticleIntensity(state, {});
  const palette = EMBER_PALETTE(colors);

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
              backgroundColor: palette[particle.colorIndex % palette.length],
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

'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  type BaseParticleProps,
  generateBaseParticle,
  generateParticles,
  getParticleIntensity,
  ParticleField,
  shouldShowParticles,
} from '../../particles';
import type { EmberEffectConfig, ShapeColors } from './types';

interface ParticleEmbersProps extends BaseParticleProps {
  config: EmberEffectConfig;
}

const EMBER_PALETTE = (colors: ShapeColors) =>
  [colors.light, colors.light, colors.medium] as const;

export function ParticleEmbers({ state, colors, config }: ParticleEmbersProps) {
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

  const { opacity, speed } = getParticleIntensity(state, {});
  const palette = EMBER_PALETTE(colors);

  return (
    <ParticleField
      key={`embers-${state}`}
      particles={particles}
      active={showEmbers}
      className="pointer-events-none absolute inset-0 scale-75 md:scale-100"
    >
      {(particle) => (
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
      )}
    </ParticleField>
  );
}

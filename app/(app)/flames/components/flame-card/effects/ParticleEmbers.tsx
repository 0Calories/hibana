'use client';

import { motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import {
  type BaseParticleProps,
  generateFloatingParticle,
  generateParticles,
  getParticleIntensity,
  type Particle,
  ParticleField,
  shouldShowParticles,
} from '../../particles';
import type { EmberEffectConfig, ShapeColors } from './types';

const RISE_HEIGHT = 140;

interface ParticleEmbersProps extends BaseParticleProps {
  config: EmberEffectConfig;
  isSealReady?: boolean;
}

const EMBER_PALETTE = (colors: ShapeColors) =>
  [colors.light, colors.light, colors.medium] as const;

const SEAL_READY_PALETTE = (colors: ShapeColors) =>
  [colors.light, '#fbbf24', colors.medium, '#f59e0b', '#fde68a'] as const;

export function ParticleEmbers({
  state,
  colors,
  config,
  isSealReady = false,
}: ParticleEmbersProps) {
  const sealedCount = config.stateConfig.sealed?.count ?? 0;
  const showEmbers =
    shouldShowParticles(state) || (state === 'sealed' && sealedCount > 0);
  const { stateConfig } = config;

  const idCounter = useRef(0);

  // Initial set of particles are generated on mount, and recycled throughout the lifecycle
  const [particles, setParticles] = useState<Particle[]>(
    generateParticles(state, stateConfig, (index, sizeMultiplier) => {
      const id = idCounter.current++;
      const particle = generateFloatingParticle(index);
      return {
        ...particle,
        id,
        size: particle.size * sizeMultiplier,
      };
    }),
  );

  const replaceParticle = useCallback(
    (completedId: number) => {
      setParticles((prev) =>
        prev.map((p, index) => {
          if (p.id !== completedId) return p;
          const id = idCounter.current++;
          const stateConf = stateConfig[state as keyof typeof stateConfig];
          if (!stateConf) return p;
          const particle = generateFloatingParticle(index, id);
          return {
            ...particle,
            id,
            size: particle.size * stateConf.sizeMultiplier,
            delay: 0,
          };
        }),
      );
    },
    [state, stateConfig],
  );

  const { opacity, speed } = getParticleIntensity(state, {});
  const palette = isSealReady
    ? SEAL_READY_PALETTE(colors)
    : EMBER_PALETTE(colors);

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
            opacity: [0, opacity, opacity * 0.6, 0],
            y: -RISE_HEIGHT,
            x: [0, particle.drift],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: particle.duration * speed,
            delay: particle.delay,
          }}
          onAnimationComplete={() => replaceParticle(particle.id)}
        />
      )}
    </ParticleField>
  );
}

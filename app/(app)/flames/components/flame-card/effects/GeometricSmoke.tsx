'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import type { BaseParticleProps, Particle, ParticleStateConfig } from './particles';
import {
  generateBaseParticle,
  generateHash,
  generateParticles,
  getParticleIntensity,
  shouldShowParticles,
} from './particles';
import type { SmokeEffectConfig } from './types';

interface SmokeParticle extends Particle {
  rotation: number;
  isGrey: boolean;
}

const GREY_COLORS = ['#6b7280', '#9ca3af', '#4b5563', '#d1d5db'];

const SMOKE_PARTICLE_CONFIG = {
  xRange: { min: 30, max: 70 },
  sizeRange: { min: 0.7, max: 1.3 },
  delayRange: { min: 0, max: 3 },
  durationRange: { min: 2.5, max: 4.5 },
  driftRange: { min: -15, max: 15 },
} as const;

function createSmokeParticle(
  index: number,
  sizeMultiplier: number,
  baseSize: number,
): SmokeParticle {
  const base = generateBaseParticle(index, 42, SMOKE_PARTICLE_CONFIG);
  const hash = generateHash(index);
  return {
    ...base,
    size: baseSize * base.size * sizeMultiplier,
    rotation: (hash % 90) - 45,
    isGrey: index % 3 === 0,
  };
}

interface GeometricSmokeProps extends BaseParticleProps {
  config: SmokeEffectConfig;
}

export function GeometricSmoke({ state, color, config }: GeometricSmokeProps) {
  const shouldReduceMotion = useReducedMotion();
  const showSmoke = shouldShowParticles(state) || state === 'sealed';
  const { baseSize, states } = config;

  const particles = useMemo(
    () =>
      generateParticles(state, states, (index, sizeMultiplier) =>
        createSmokeParticle(index, sizeMultiplier, baseSize),
      ),
    [state, states, baseSize],
  );

  if (shouldReduceMotion || !showSmoke) {
    return null;
  }

  const { opacity, speed } = getParticleIntensity(state);

  return (
    <div
      key={`smoke-${state}`}
      className="pointer-events-none absolute inset-0 scale-75 md:scale-100"
    >
      <AnimatePresence>
        {particles.map((particle) => {
          const particleColor = particle.isGrey
            ? GREY_COLORS[particle.id % GREY_COLORS.length]
            : color;

          return (
            <motion.div
              key={particle.id}
              className="absolute"
              style={{
                left: `${particle.x}%`,
                bottom: '35%',
                width: particle.size,
                height: particle.size,
                backgroundColor: particleColor,
                opacity,
              }}
              initial={{
                y: 0,
                x: 0,
                opacity: 0,
                rotate: 0,
                scale: 0.5,
              }}
              animate={{
                y: [-10, -80, -140],
                x: [0, particle.drift * 0.5, particle.drift],
                opacity: [0, opacity, opacity * 0.6, 0],
                rotate: [0, particle.rotation * 0.5, particle.rotation],
                scale: [0.5, 1, 1.3, 0.8],
              }}
              transition={{
                duration: particle.duration * speed,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

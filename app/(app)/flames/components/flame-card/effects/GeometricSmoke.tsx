'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  type BaseParticleProps,
  generateBaseParticle,
  generateHash,
  generateParticles,
  getParticleIntensity,
  type Particle,
  ParticleField,
  shouldShowParticles,
} from '../../particles';
import type { ShapeColors, SmokeEffectConfig } from './types';

interface SmokeParticle extends Particle {
  rotation: number;
}

const GREY_SHADES = ['#6b7280', '#9ca3af', '#4b5563', '#d1d5db'];

const SMOKE_PARTICLE_CONFIG = {
  xRange: { min: 30, max: 70 },
  sizeRange: { min: 0.7, max: 1.3 },
  delayRange: { min: 0, max: 3 },
  durationRange: { min: 2.5, max: 4.5 },
  driftRange: { min: -15, max: 15 },
} as const;

/** Mix of flame color shades and grey shades for natural-looking smoke */
const SMOKE_PALETTE = (colors: ShapeColors) =>
  [colors.medium, colors.dark, colors.medium, ...GREY_SHADES] as const;

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
  };
}

const OVERBURN_GREY_PALETTE = [
  '#6b7280',
  '#9ca3af',
  '#4b5563',
  '#78716c',
  '#a8a29e',
  '#57534e',
  '#d1d5db',
] as const;

interface GeometricSmokeProps extends BaseParticleProps {
  config: SmokeEffectConfig;
  isOverburning?: boolean;
}

export function GeometricSmoke({
  state,
  colors,
  config,
  isOverburning = false,
}: GeometricSmokeProps) {
  const showSmoke = shouldShowParticles(state) || state === 'sealed';
  const { baseSize, states } = config;

  // When overburning, boost smoke particle count and size
  const effectiveStates = useMemo(() => {
    if (!isOverburning) return states;
    return {
      ...states,
      burning: { count: 25, sizeMultiplier: 1.8 },
    };
  }, [states, isOverburning]);

  const particles = useMemo(
    () =>
      generateParticles(state, effectiveStates, (index, sizeMultiplier) =>
        createSmokeParticle(index, sizeMultiplier, baseSize),
      ),
    [state, effectiveStates, baseSize],
  );

  const { opacity, speed } = getParticleIntensity(state);
  const palette = isOverburning ? OVERBURN_GREY_PALETTE : SMOKE_PALETTE(colors);
  const effectiveSpeed = isOverburning ? speed * 0.65 : speed;

  return (
    <ParticleField
      key={`smoke-${state}`}
      particles={particles}
      active={showSmoke}
      className="pointer-events-none absolute inset-0 scale-75 md:scale-100"
    >
      {(particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            bottom: '35%',
            width: particle.size,
            height: particle.size,
            backgroundColor: palette[particle.colorIndex % palette.length],
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
            duration: particle.duration * effectiveSpeed,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </ParticleField>
  );
}

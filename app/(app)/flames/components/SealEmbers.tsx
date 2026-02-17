'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  generateBaseParticle,
  generateHash,
  type Particle,
  ParticleField,
} from './particles';

const EMBER_COUNT = 16;
const EMBER_SEED = 89;

const EMBER_CONFIG = {
  xRange: { min: 8, max: 92 },
  sizeRange: { min: 2, max: 5 },
  delayRange: { min: 0, max: 5 },
  durationRange: { min: 1.5, max: 2.8 },
  driftRange: { min: -20, max: 20 },
} as const;

interface SealEmber extends Particle {
  glowSize: number;
  peakOpacity: number;
}

function createSealEmber(index: number): SealEmber {
  const base = generateBaseParticle(index, EMBER_SEED, EMBER_CONFIG);
  const h = generateHash(index, 149);
  return {
    ...base,
    glowSize: base.size + 2 + ((h % 100) / 100) * 2,
    peakOpacity: 0.15 + ((h % 45) / 100),
  };
}

interface SealEmbersProps {
  color: string;
}

export function SealEmbers({ color }: SealEmbersProps) {
  const particles = useMemo(
    () => Array.from({ length: EMBER_COUNT }, (_, i) => createSealEmber(i)),
    [],
  );

  return (
    <ParticleField
      particles={particles}
      active
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
    >
      {(p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '12%',
            width: p.size,
            height: p.size,
            backgroundColor: color,
            boxShadow: `0 0 ${p.glowSize}px ${color}, 0 0 ${p.glowSize * 2}px ${color}`,
          }}
          animate={{
            y: -420,
            x: [0, p.drift],
            opacity: [0, p.peakOpacity, p.peakOpacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeOut',
          }}
        />
      )}
    </ParticleField>
  );
}

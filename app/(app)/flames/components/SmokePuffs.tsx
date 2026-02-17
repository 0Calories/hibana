'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  generateBaseParticle,
  generateHash,
  type Particle,
  ParticleField,
} from './particles';

const PUFF_COUNT = 9;
const PUFF_SEED = 63;

const PUFF_CONFIG = {
  xRange: { min: 0, max: 1 }, // not used for positioning (puffs are relative to parent)
  sizeRange: { min: 3, max: 6 },
  delayRange: { min: 0, max: 2 },
  durationRange: { min: 1.8, max: 2.6 },
  driftRange: { min: -6, max: 7 },
} as const;

interface SmokePuff extends Particle {
  blur: number;
  peakOpacity: number;
  yEnd: number;
  /** 4-point horizontal drift path */
  xPath: [number, number, number, number];
}

function createSmokePuff(index: number): SmokePuff {
  const base = generateBaseParticle(index, PUFF_SEED, PUFF_CONFIG);
  const h1 = generateHash(index, 101);
  const h2 = generateHash(index, 203);
  const h3 = generateHash(index, 307);

  const blur = 1.5 + ((h1 % 100) / 100) * 1.5;
  const peakOpacity = 0.2 + ((h2 % 100) / 100) * 0.2;
  const yEnd = -(20 + (h3 % 15));

  // Build a 4-point drift path from the base drift
  const driftDir = base.drift > 0 ? 1 : -1;
  const mag = Math.abs(base.drift);
  const xPath: [number, number, number, number] = [
    0,
    driftDir * mag * 0.3,
    driftDir * mag * 0.7,
    base.drift,
  ];

  return { ...base, blur, peakOpacity, yEnd, xPath };
}

interface SmokePuffsProps {
  color: string;
  /** Scale up size, opacity, and speed. Default 1. Higher = bigger, faster, more opaque. */
  intensity?: number;
}

export function SmokePuffs({ color, intensity = 1 }: SmokePuffsProps) {
  const puffs = useMemo(
    () => Array.from({ length: PUFF_COUNT }, (_, i) => createSmokePuff(i)),
    [],
  );

  return (
    <ParticleField particles={puffs} active>
      {(p) => {
        const size = p.size * intensity;
        const peakOpacity = Math.min(p.peakOpacity * intensity, 1);
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: -size / 2,
              top: '50%',
              filter: `blur(${p.blur * intensity}px)`,
              background: color,
            }}
            initial={{ opacity: 0, y: 0, x: 0, scale: 1 }}
            animate={{
              opacity: [0, peakOpacity, peakOpacity * 0.5, 0],
              y: [0, p.yEnd * 0.3, p.yEnd * 0.7, p.yEnd],
              x: p.xPath,
              scale: [0.6, 1, 1.4, 1.8],
            }}
            transition={{
              duration: p.duration / intensity,
              delay: p.delay / intensity,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeOut',
            }}
          />
        );
      }}
    </ParticleField>
  );
}

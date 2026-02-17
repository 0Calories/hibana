'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  generateBaseParticle,
  generateHash,
  type Particle,
  ParticleField,
} from './particles';

const DROPLET_COUNT = 5;
const DROPLET_SEED = 51;

const DROPLET_CONFIG = {
  xRange: { min: 0, max: 1 }, // not used for positioning
  sizeRange: { min: 2, max: 3 },
  delayRange: { min: 0, max: 1.2 },
  durationRange: { min: 1.2, max: 1.6 },
  driftRange: { min: -3, max: 2 },
} as const;

interface Droplet extends Particle {
  width: number;
  height: number;
}

function createDroplet(index: number): Droplet {
  const base = generateBaseParticle(index, DROPLET_SEED, DROPLET_CONFIG);
  const h = generateHash(index, 171);
  const width = 2 + ((h % 100) / 100) * 1;
  const height = 3 + ((h % 100) / 100) * 2;
  return { ...base, width, height };
}

interface FuelDropletsProps {
  className?: string;
}

export function FuelDroplets({ className }: FuelDropletsProps) {
  const droplets = useMemo(
    () => Array.from({ length: DROPLET_COUNT }, (_, i) => createDroplet(i)),
    [],
  );

  return (
    <ParticleField particles={droplets} active>
      {(d) => (
        <motion.div
          key={d.id}
          className={`absolute ${className ?? ''}`}
          style={{
            width: d.width,
            height: d.height,
            left: -d.width / 2,
            top: '50%',
            borderRadius: '40% 40% 50% 50%',
          }}
          initial={{ opacity: 0, y: 0, x: 0, scale: 1 }}
          animate={{
            opacity: [0, 0.7, 0.5, 0],
            y: [0, 6, 16, 24],
            x: [0, d.drift * 0.5, d.drift],
            scale: [1, 1, 0.8, 0.4],
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeIn',
          }}
        />
      )}
    </ParticleField>
  );
}

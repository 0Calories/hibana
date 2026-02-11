'use client';

import { motion } from 'framer-motion';

/**
 * Smoke puffs — each is a soft blurred circle that drifts upward.
 * Multiple overlapping puffs at staggered timings create a smoky effect
 * through accumulation rather than any single shape looking like smoke.
 */
const SMOKE_PUFFS: {
  id: string;
  size: number;
  blur: number;
  duration: number;
  delay: number;
  xPath: [number, number, number, number];
  yEnd: number;
  peakOpacity: number;
}[] = [
  // cluster 1 — drifts left
  {
    id: 'pf-0',
    size: 5,
    blur: 2,
    duration: 2.0,
    delay: 0,
    xPath: [0, -2, -4, -6],
    yEnd: -28,
    peakOpacity: 0.4,
  },
  {
    id: 'pf-1',
    size: 3,
    blur: 1.5,
    duration: 1.8,
    delay: 0.1,
    xPath: [1, -1, -3, -4],
    yEnd: -22,
    peakOpacity: 0.3,
  },
  {
    id: 'pf-2',
    size: 4,
    blur: 2.5,
    duration: 2.2,
    delay: 0.2,
    xPath: [-1, -3, -2, -5],
    yEnd: -32,
    peakOpacity: 0.25,
  },
  // cluster 2 — drifts right
  {
    id: 'pf-3',
    size: 4,
    blur: 2,
    duration: 2.2,
    delay: 0.8,
    xPath: [0, 3, 5, 4],
    yEnd: -26,
    peakOpacity: 0.35,
  },
  {
    id: 'pf-4',
    size: 6,
    blur: 3,
    duration: 2.4,
    delay: 0.9,
    xPath: [-1, 2, 4, 7],
    yEnd: -30,
    peakOpacity: 0.25,
  },
  {
    id: 'pf-5',
    size: 3,
    blur: 1.5,
    duration: 2.0,
    delay: 1.0,
    xPath: [1, 4, 3, 5],
    yEnd: -20,
    peakOpacity: 0.3,
  },
  // cluster 3 — center-ish
  {
    id: 'pf-6',
    size: 5,
    blur: 2.5,
    duration: 2.6,
    delay: 1.6,
    xPath: [0, 1, -2, 0],
    yEnd: -34,
    peakOpacity: 0.3,
  },
  {
    id: 'pf-7',
    size: 3,
    blur: 2,
    duration: 2.0,
    delay: 1.7,
    xPath: [0, -2, 1, -1],
    yEnd: -24,
    peakOpacity: 0.35,
  },
  {
    id: 'pf-8',
    size: 4,
    blur: 3,
    duration: 2.4,
    delay: 1.9,
    xPath: [1, 0, -1, 2],
    yEnd: -30,
    peakOpacity: 0.2,
  },
];

interface SmokePuffsProps {
  color: string;
  /** Scale up size, opacity, and speed. Default 1. Higher = bigger, faster, more opaque. */
  intensity?: number;
}

export function SmokePuffs({ color, intensity = 1 }: SmokePuffsProps) {
  return (
    <>
      {SMOKE_PUFFS.map((p) => {
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
      })}
    </>
  );
}

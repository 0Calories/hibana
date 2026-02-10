'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { generateHash } from './particles';

interface SealedSmokeWispsProps {
  /** Y coordinate of the wick / emission point in the 0-100 SVG viewBox */
  wickY: number;
  /** X coordinate of the emission origin (default: 50 = center) */
  wickX?: number;
}

interface SmokeWisp {
  id: number;
  /** SVG path "d" attribute – a gentle S-curve rising upward */
  path: string;
  duration: number;
  delay: number;
  strokeWidth: number;
}

const WISP_COUNT = 3;
const SMOKE_COLOR = '#94a3b8'; // slate-400, semi-transparent via opacity

/**
 * Generate a gentle S-curve path rising from the wick.
 * Each wisp drifts slightly left or right with a sinusoidal shape.
 */
function createWisps(wickX: number, wickY: number): SmokeWisp[] {
  return Array.from({ length: WISP_COUNT }, (_, i) => {
    const hash = generateHash(i, 193);
    const hash2 = generateHash(i, 311);

    // Drift direction & magnitude
    const driftDir = i % 2 === 0 ? 1 : -1;
    const driftMag = 4 + (hash % 8); // 4-12px lateral drift
    const riseHeight = 40 + (hash2 % 15); // 25-40px upward

    // Control points for a cubic bezier S-curve rising from wick
    const startX = wickX + ((hash % 5) - 2) * 0.01; // tiny origin scatter
    const startY = wickY;
    const cp1x = startX + driftDir * (driftMag * 0.4);
    const cp1y = startY - riseHeight * 0.33;
    const cp2x = startX - driftDir * (driftMag * 0.2);
    const cp2y = startY - riseHeight * 0.66;
    const endX = startX + driftDir * driftMag;
    const endY = startY - riseHeight;

    const path = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

    return {
      id: i,
      path,
      duration: 2.5 + ((hash % 100) / 100) * 1.5, // 2.5-4s
      delay: ((hash2 % 100) / 100) * 0.5, // 0-2.5s stagger
      strokeWidth: 0.8 + ((hash % 100) / 100) * 0.7, // 0.8-1.5
    };
  });
}

export function SealedSmokeWisps({ wickY, wickX = 50 }: SealedSmokeWispsProps) {
  const shouldReduceMotion = useReducedMotion();
  const wisps = useMemo(() => createWisps(wickX, wickY), [wickX, wickY]);

  if (shouldReduceMotion) {
    return (
      <g>
        {wisps.map((wisp) => (
          <path
            key={wisp.id}
            d={wisp.path}
            stroke={SMOKE_COLOR}
            strokeWidth={wisp.strokeWidth}
            fill="none"
            opacity={0.25}
            strokeLinecap="round"
          />
        ))}
      </g>
    );
  }

  return (
    <g>
      {wisps.map((wisp) => (
        <motion.path
          key={wisp.id}
          d={wisp.path}
          stroke={SMOKE_COLOR}
          strokeWidth={wisp.strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{
            opacity: [0, 0.5, 0.35, 0],
            pathLength: [0, 0.5, 0.9, 1],
          }}
          transition={{
            duration: wisp.duration,
            delay: wisp.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </g>
  );
}

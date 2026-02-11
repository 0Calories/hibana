'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { generateHash } from './particles';

interface SmolderingEmbersProps {
  color: string;
}

interface Ember {
  id: number;
  cx: number;
  cy: number;
  r: number;
  /** Per-ember phase offset so they don't all pulse in sync */
  phaseDelay: number;
  /** Pulse duration for organic variety */
  duration: number;
}

const EMBER_COUNT = 10;

/** Deterministic ember placement scattered across the ground area */
function createEmbers(): Ember[] {
  return Array.from({ length: EMBER_COUNT }, (_, i) => {
    const hash = generateHash(i, 137);
    const hash2 = generateHash(i, 251);
    const mixed = (hash * 7 + hash2 * 13) % 1000;
    return {
      id: i,
      cx: 30 + (mixed % 44), // x: 30-74, evenly spread around center
      cy: 66 + (hash2 % 18), // y: 66-84 (ground scatter)
      r: 1 + ((hash % 100) / 100) * 1.8, // radius: 1-2.8
      phaseDelay: ((hash2 % 100) / 100) * 3, // 0-3s stagger
      duration: 1.5 + ((hash % 100) / 100) * 2, // 1.5-3.5s cycle
    };
  });
}

export function SmolderingEmbers({ color }: SmolderingEmbersProps) {
  const shouldReduceMotion = useReducedMotion();
  const embers = useMemo(() => createEmbers(), []);

  if (shouldReduceMotion) {
    return (
      <g>
        {embers.map((ember) => (
          <circle
            key={ember.id}
            cx={ember.cx}
            cy={ember.cy}
            r={ember.r}
            fill={color}
            opacity={0.4}
          />
        ))}
      </g>
    );
  }

  return (
    <g>
      {embers.map((ember) => (
        <motion.circle
          key={ember.id}
          cx={ember.cx}
          cy={ember.cy}
          r={ember.r}
          fill={color}
          initial={{ opacity: 0.15 }}
          animate={{
            opacity: [0.15, 0.7, 0.15],
            // Subtle glow radius pulse
            r: [ember.r, ember.r * 1.3, ember.r],
          }}
          transition={{
            duration: ember.duration,
            delay: ember.phaseDelay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </g>
  );
}

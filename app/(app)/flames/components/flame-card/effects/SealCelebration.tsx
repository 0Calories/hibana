'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { generateHash } from './particles';

interface SealCelebrationProps {
  active: boolean;
  color: string;
  onComplete: () => void;
}

const PARTICLE_COUNT = 24;
const DURATION_MS = 800;
const GOLDEN_COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d'];

interface CelebrationParticle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
}

export function SealCelebration({
  active,
  color,
  onComplete,
}: SealCelebrationProps) {
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i): CelebrationParticle => {
      const hash = generateHash(i, 77);
      const angle = (360 / PARTICLE_COUNT) * i + ((hash % 20) - 10);
      const distance = 40 + (hash % 40);
      const size = 3 + (hash % 4);
      // Alternate between golden colors and flame color
      const particleColor =
        i % 3 === 0 ? color : GOLDEN_COLORS[hash % GOLDEN_COLORS.length];
      const delay = (hash % 100) / 1000;

      return { id: i, angle, distance, size, color: particleColor, delay };
    });
  }, [color]);

  useEffect(() => {
    if (!active) return;
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, DURATION_MS);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!visible) return null;

  // Reduced motion fallback: simple golden flash
  if (shouldReduceMotion) {
    return (
      <motion.div
        className="pointer-events-none absolute inset-0 z-30 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ duration: 0.5 }}
        style={{ backgroundColor: '#fbbf24' }}
      />
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible">
      {particles.map((particle) => {
        const rad = (particle.angle * Math.PI) / 180;
        const x = Math.cos(rad) * particle.distance;
        const y = Math.sin(rad) * particle.distance;

        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
            animate={{
              x,
              y,
              opacity: [1, 1, 0],
              scale: [0.5, 1.2, 0.3],
            }}
            transition={{
              duration: DURATION_MS / 1000,
              delay: particle.delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}

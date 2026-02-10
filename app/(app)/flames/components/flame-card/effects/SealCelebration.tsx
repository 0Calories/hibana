'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { generateHash } from './particles';

interface SealCelebrationProps {
  active: boolean;
  color: string;
  onComplete: () => void;
}

const PARTICLE_COUNT = 20;
const DURATION_MS = 600;
const GOLDEN_COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d'];
const SEAL_GOLD = '#fbbf24';

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
    return Array.from(
      { length: PARTICLE_COUNT },
      (_, i): CelebrationParticle => {
        const hash = generateHash(i, 77);
        const angle = (360 / PARTICLE_COUNT) * i + ((hash % 20) - 10);
        const distance = 50 + (hash % 50);
        const size = 3 + (hash % 3);
        // Gold is accent: only every 5th particle is golden, rest are flame color
        const isGolden = i % 5 === 0;
        const particleColor = isGolden
          ? GOLDEN_COLORS[hash % GOLDEN_COLORS.length]
          : color;
        const delay = (hash % 60) / 1000;

        return { id: i, angle, distance, size, color: particleColor, delay };
      },
    );
  }, [color]);

  useEffect(() => {
    if (!active) return;
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, DURATION_MS + 200);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!visible) return null;

  if (shouldReduceMotion) {
    return (
      <motion.div
        className="pointer-events-none absolute inset-0 z-30 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ duration: 0.5 }}
        style={{ backgroundColor: SEAL_GOLD }}
      />
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible">
      {/* Expanding golden pulse ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          border: `2px solid ${SEAL_GOLD}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0.9 }}
        animate={{ width: 160, height: 160, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      {/* Second ring, slightly delayed for layered effect */}
      <motion.div
        className="absolute rounded-full"
        style={{
          border: `1.5px solid ${SEAL_GOLD}`,
        }}
        initial={{ width: 0, height: 0, opacity: 0.6 }}
        animate={{ width: 120, height: 120, opacity: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
      />

      {/* Particle burst */}
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
              opacity: [1, 0.8, 0],
              scale: [0.5, 1, 0.2],
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

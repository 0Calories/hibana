'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { generateHash } from './particles/utils';

interface EmberBurstProps {
  show: boolean;
  flameColor: string;
  flameColorLight: string;
  onComplete?: () => void;
}

const PARTICLE_COUNT = 36;
const AMBER_COLORS = ['#fbbf24', '#f59e0b'];

interface BurstParticle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

function generateBurstParticles(
  flameColor: string,
  flameColorLight: string,
): BurstParticle[] {
  const colors = [flameColor, flameColorLight, ...AMBER_COLORS];

  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const hash = generateHash(i, 137);
    const hash2 = generateHash(i, 251);
    const hash3 = generateHash(i, 419);

    return {
      id: i,
      angle: (hash % 360),
      distance: 80 + (hash2 % 100),
      size: 3 + (hash3 % 100) / 20,
      color: colors[hash % colors.length],
      delay: (hash2 % 80) / 1000,
      duration: 0.8 + (hash3 % 100) / 140,
    };
  });
}

export function EmberBurst({
  show,
  flameColor,
  flameColorLight,
  onComplete,
}: EmberBurstProps) {
  const shouldReduceMotion = useReducedMotion();

  const particles = useMemo(
    () => generateBurstParticles(flameColor, flameColorLight),
    [flameColor, flameColorLight],
  );

  if (shouldReduceMotion) {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 rounded-xl"
            style={{ backgroundColor: '#fbbf2440' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={onComplete}
          />
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
          {particles.map((particle, index) => {
            const radians = (particle.angle * Math.PI) / 180;
            const targetX = Math.cos(radians) * particle.distance;
            const targetY = Math.sin(radians) * particle.distance;

            return (
              <motion.div
                key={particle.id}
                className="absolute left-1/2 top-1/2 rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: targetX,
                  y: targetY,
                  opacity: [1, 1, 0],
                  scale: [1, 1.2, 0.3],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: 'easeOut',
                }}
                onAnimationComplete={
                  index === PARTICLE_COUNT - 1 ? onComplete : undefined
                }
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

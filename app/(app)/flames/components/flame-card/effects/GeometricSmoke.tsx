'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import type { FlameState } from '../../hooks/useFlameTimer';

interface GeometricSmokeProps {
  state: FlameState;
  color: string;
}

interface SmokeParticle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  drift: number;
}

function generateParticles(count: number, seed: number): SmokeParticle[] {
  const particles: SmokeParticle[] = [];
  for (let i = 0; i < count; i++) {
    const hash = (seed * (i + 1) * 9973) % 10000;
    particles.push({
      id: i,
      x: 30 + (hash % 40), // 30-70% horizontal position
      size: 3 + (hash % 5), // 3-7px
      delay: (hash % 3000) / 1000, // 0-3s delay
      duration: 2.5 + (hash % 2000) / 1000, // 2.5-4.5s duration
      rotation: (hash % 90) - 45, // -45 to 45 degrees
      drift: (hash % 30) - 15, // -15 to 15px horizontal drift
    });
  }
  return particles;
}

export function GeometricSmoke({ state, color }: GeometricSmokeProps) {
  const shouldReduceMotion = useReducedMotion();

  const isActive = state === 'active';
  const isUntended = state === 'untended';
  const showSmoke = isActive || isUntended;

  // Generate different particle counts based on state
  const particles = useMemo(() => {
    if (isActive) {
      return generateParticles(10, 42); // More particles when active
    }
    if (isUntended) {
      return generateParticles(4, 42); // Fewer particles when idle
    }
    return [];
  }, [isActive, isUntended]);

  if (shouldReduceMotion || !showSmoke) {
    return null;
  }

  const baseOpacity = isActive ? 0.4 : 0.2;
  const speedMultiplier = isActive ? 1 : 1.8; // Slower when idle

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={`smoke-${particle.id}-${state}`}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              bottom: '35%',
              width: particle.size,
              height: particle.size,
              backgroundColor: color,
              opacity: baseOpacity,
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
              opacity: [0, baseOpacity, baseOpacity * 0.6, 0],
              rotate: [0, particle.rotation * 0.5, particle.rotation],
              scale: [0.5, 1, 1.3, 0.8],
            }}
            transition={{
              duration: particle.duration * speedMultiplier,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

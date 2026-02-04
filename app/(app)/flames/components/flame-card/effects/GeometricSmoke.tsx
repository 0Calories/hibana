'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import type { FlameState } from '../../hooks/useFlameTimer';

interface GeometricSmokeProps {
  state: FlameState;
  color: string;
  level: number;
}

interface SmokeParticle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  drift: number;
  isGrey: boolean;
}

// Grey smoke colors for variety
const GREY_COLORS = ['#6b7280', '#9ca3af', '#4b5563', '#d1d5db'];

function generateParticles(
  count: number,
  seed: number,
  baseSize: number,
): SmokeParticle[] {
  const particles: SmokeParticle[] = [];
  for (let i = 0; i < count; i++) {
    const hash = (seed * (i + 1) * 9973) % 10000;
    const sizeVariation = (hash % 60) / 100; // 0-0.6 variation
    particles.push({
      id: i,
      x: 30 + (hash % 40), // 30-70% horizontal position
      size: baseSize * (0.7 + sizeVariation), // Size varies around base
      delay: (hash % 3000) / 1000, // 0-3s delay
      duration: 2.5 + (hash % 2000) / 1000, // 2.5-4.5s duration
      rotation: (hash % 90) - 45, // -45 to 45 degrees
      drift: (hash % 30) - 15, // -15 to 15px horizontal drift
      isGrey: i % 3 === 0, // Every 3rd particle is grey
    });
  }
  return particles;
}

// Get particle size based on flame level (bigger flames = bigger smoke)
function getBaseSizeForLevel(level: number): number {
  // Level 1-2: small (3-4px), Level 3-4: medium (5-6px), Level 5-6: large (7-9px)
  const sizes: Record<number, number> = {
    1: 3,
    2: 4,
    3: 5,
    4: 6,
    5: 7,
    6: 9,
  };
  return sizes[level] ?? 5;
}

export function GeometricSmoke({ state, color, level }: GeometricSmokeProps) {
  const shouldReduceMotion = useReducedMotion();

  // Stars and supernovas don't have smoke
  const isCelestial = level >= 7;

  const isActive = state === 'active';
  const isUntended = state === 'untended';
  const isPaused = state === 'paused';
  const showSmoke = (isActive || isUntended || isPaused) && !isCelestial;

  const baseSize = getBaseSizeForLevel(level);

  // Size multiplier - larger when actively burning
  const sizeMultiplier = isActive ? 1.5 : 1;

  // Generate different particle counts based on state
  const particles = useMemo(() => {
    if (isCelestial) return [];
    if (isActive) {
      return generateParticles(15, 42, baseSize * sizeMultiplier); // Many large particles when active
    }
    if (isPaused) {
      return generateParticles(4, 42, baseSize); // Few particles when paused
    }
    if (isUntended) {
      return generateParticles(2, 42, baseSize); // Very few particles when untended
    }
    return [];
  }, [isActive, isUntended, isPaused, isCelestial, baseSize, sizeMultiplier]);

  if (shouldReduceMotion || !showSmoke) {
    return null;
  }

  const baseOpacity = isActive ? 0.85 : 0.45;
  // Speed: active = normal, paused = slower, untended = very slow
  const speedMultiplier = isActive ? 1 : isPaused ? 2.2 : 3;

  return (
    <div className="pointer-events-none absolute inset-0 scale-75 md:scale-100">
      <AnimatePresence>
        {particles.map((particle) => {
          const particleColor = particle.isGrey
            ? GREY_COLORS[particle.id % GREY_COLORS.length]
            : color;

          return (
            <motion.div
              key={`smoke-${particle.id}-${state}`}
              className="absolute"
              style={{
                left: `${particle.x}%`,
                bottom: '35%',
                width: particle.size,
                height: particle.size,
                backgroundColor: particleColor,
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
          );
        })}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Candle } from '@/app/(app)/flames/components/flame-card/flames/Candle';
import { Torch } from '@/app/(app)/flames/components/flame-card/flames/Torch';
import { Wisp } from '@/app/(app)/flames/components/flame-card/flames/Wisp';

interface ShowcaseFlameProps {
  level: number;
  colors: { light: string; medium: string; dark: string };
  className?: string;
}

const FLAMES = [Wisp, Candle, Torch] as const;

export function ShowcaseFlame({
  level,
  colors,
  className,
}: ShowcaseFlameProps) {
  const shouldReduceMotion = useReducedMotion();
  const def = FLAMES[level - 1];
  if (!def) return null;

  const { Base, Flame } = def;

  return (
    <div className="relative flex items-center justify-center">
      {/* Radial glow behind the flame */}
      <div
        className="absolute h-16 w-16 rounded-full blur-xl"
        style={{ backgroundColor: `${colors.medium}30` }}
      />

      <motion.svg
        viewBox="0 0 100 100"
        className={className}
        role="img"
        aria-hidden="true"
        animate={{ scale: 1.1, opacity: 1, y: -4 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {Base && <Base />}
        <motion.g
          style={{ originX: '50%', originY: '100%' }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scaleY: [1, 1.1, 0.95, 1.15, 0.9, 1.05, 1],
                  scaleX: [1, 0.95, 1.05, 0.92, 1.08, 0.97, 1],
                }
          }
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Flame colors={colors} />
        </motion.g>
      </motion.svg>
    </div>
  );
}

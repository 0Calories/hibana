'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface SealRingProgressProps {
  progress: number;
  visible: boolean;
}

const RING_SIZE = 120;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SEAL_COLOR = '#fbbf24';

export function SealRingProgress({ progress, visible }: SealRingProgressProps) {
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            className="h-24 w-24 sm:h-32 sm:w-32 md:h-36 md:w-36"
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            role="graphics-symbol"
          >
            {/* Background track */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={SEAL_COLOR}
              strokeWidth={STROKE_WIDTH}
              opacity={0.15}
            />
            {/* Progress ring */}
            <motion.circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={SEAL_COLOR}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={CIRCUMFERENCE}
              strokeLinecap="round"
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.05, ease: 'linear' }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

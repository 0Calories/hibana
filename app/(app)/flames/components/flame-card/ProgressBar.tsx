'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  /** Fueled progress, 0..1+. Capped at 1 for display. */
  fueledFraction: number;
  /** Unfueled overflow, 0..1+ (added on top of the fueled width). */
  unfueledFraction: number;
  className?: string;
}

/**
 * Two-band progress bar: solid colored fueled portion, then a striped/dim
 * portion for unfueled tend that didn't earn rewards.
 */
export function ProgressBar({
  fueledFraction,
  unfueledFraction,
  className,
}: ProgressBarProps) {
  const fueled = Math.min(1, Math.max(0, fueledFraction));
  // Cap total at 1 so the bar stays inside the track.
  const unfueled = Math.max(0, Math.min(1 - fueled, unfueledFraction));

  return (
    <div
      className={cn(
        'relative h-1.5 w-full overflow-hidden rounded-full bg-muted',
        className,
      )}
    >
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-primary"
        animate={{ width: `${fueled * 100}%` }}
        transition={{ duration: 0.4 }}
      />
      <motion.div
        className="absolute inset-y-0 rounded-full"
        style={{
          left: `${fueled * 100}%`,
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0 4px, transparent 4px 8px)',
          backgroundColor: 'rgba(255,255,255,0.08)',
        }}
        animate={{ width: `${unfueled * 100}%` }}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

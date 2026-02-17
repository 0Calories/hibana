'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Fuel } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { FuelDroplets } from '@/app/(app)/flames/components/FuelDroplets';
import { SmokePuffs } from '@/app/(app)/flames/components/SmokePuffs';

/**
 * Visual-only fuel bar for the marketing page.
 * Replicates the real FuelMeter's appearance + particle effects
 * without any data dependencies.
 */

const FILL_FRACTION = 0.68;

export function ShowcaseFuelBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations('marketing.fuel');

  const glowColor = 'rgba(245, 158, 11, 0.12)';
  const glowColorStrong = 'rgba(245, 158, 11, 0.25)';

  return (
    <div ref={ref}>
      <motion.div
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5"
        animate={
          inView && !shouldReduceMotion
            ? {
                boxShadow: [
                  `0 0 8px ${glowColor}, 0 0 16px ${glowColor}`,
                  `0 0 12px ${glowColorStrong}, 0 0 24px ${glowColor}`,
                  `0 0 8px ${glowColor}, 0 0 16px ${glowColor}`,
                ],
              }
            : { boxShadow: '0 0 0px transparent' }
        }
        transition={
          inView
            ? {
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }
            : { duration: 0.4 }
        }
      >
        <div className="flex items-center gap-2.5">
          {/* Icon + label */}
          <div className="flex shrink-0 items-center gap-1 text-amber-400">
            <Fuel className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {t('label')}
            </span>
          </div>

          {/* Bar */}
          <div className="relative h-3 flex-1 overflow-visible">
            <div className="relative h-full overflow-hidden rounded-full bg-white/10">
              {/* Segment ticks */}
              <div
                className="pointer-events-none absolute inset-0 z-10 rounded-full opacity-15"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to right, transparent 0px, transparent 30px, rgba(0,0,0,0.5) 30px, rgba(0,0,0,0.5) 32px)',
                }}
              />

              {/* Fill bar */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-amber-500 to-amber-400"
                initial={{ width: '0%' }}
                animate={inView ? { width: `${FILL_FRACTION * 100}%` } : {}}
                transition={
                  shouldReduceMotion
                    ? { duration: 0.2 }
                    : {
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                        delay: 0.3,
                      }
                }
              >
                {/* Glowing tip */}
                {!shouldReduceMotion && (
                  <motion.div
                    className="absolute top-0 right-0 bottom-0 w-3 rounded-full"
                    style={{
                      background:
                        'linear-gradient(to left, rgba(255,240,200,0.9), transparent)',
                      boxShadow:
                        '0 0 6px rgba(251,191,36,0.6), 0 0 12px rgba(251,191,36,0.3)',
                    }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {/* Consumption shimmer */}
                {!shouldReduceMotion && (
                  <motion.div
                    className="absolute inset-0 rounded-full opacity-30"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 40%, transparent 60%)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                    transition={{
                      duration: 2.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'linear',
                    }}
                  />
                )}
              </motion.div>
            </div>

            {/* Tip particles — positioned at leading edge */}
            {inView && !shouldReduceMotion && (
              <div
                className="pointer-events-none absolute top-0 h-full"
                style={{ left: `${FILL_FRACTION * 100}%` }}
              >
                <FuelDroplets className="bg-amber-300/70" />
                <SmokePuffs color="rgba(220, 180, 100, 0.7)" />
              </div>
            )}
          </div>

          {/* Time label */}
          <span className="shrink-0 text-xs font-medium tabular-nums text-white/70">
            {t('remaining')}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

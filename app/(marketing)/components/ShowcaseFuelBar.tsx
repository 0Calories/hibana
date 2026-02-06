'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Fuel } from 'lucide-react';
import { useRef } from 'react';

/**
 * Visual-only fuel bar for the marketing page.
 * Replicates the real FuelMeter's appearance + particle effects
 * without any data dependencies.
 */

const FILL_FRACTION = 0.68;

/** Fuel droplet particles — same as FuelMeter */
const DROPLETS = [
  { id: 'drop-0', duration: 1.4, delay: 0, xDrift: -2, width: 2.5, height: 4 },
  { id: 'drop-1', duration: 1.6, delay: 0.3, xDrift: 1, width: 2, height: 3.5 },
  { id: 'drop-2', duration: 1.2, delay: 0.6, xDrift: -1, width: 3, height: 5 },
  { id: 'drop-3', duration: 1.5, delay: 0.9, xDrift: 2, width: 2, height: 3 },
  { id: 'drop-4', duration: 1.3, delay: 1.2, xDrift: -3, width: 2.5, height: 4.5 },
] as const;

/** Smoke puffs — same as FuelMeter */
const SMOKE_PUFFS = [
  { id: 'pf-0', size: 5, blur: 2, duration: 2.0, delay: 0, xPath: [0, -2, -4, -6] as const, yEnd: -28, peakOpacity: 0.4 },
  { id: 'pf-1', size: 3, blur: 1.5, duration: 1.8, delay: 0.1, xPath: [1, -1, -3, -4] as const, yEnd: -22, peakOpacity: 0.3 },
  { id: 'pf-2', size: 4, blur: 2.5, duration: 2.2, delay: 0.2, xPath: [-1, -3, -2, -5] as const, yEnd: -32, peakOpacity: 0.25 },
  { id: 'pf-3', size: 4, blur: 2, duration: 2.2, delay: 0.8, xPath: [0, 3, 5, 4] as const, yEnd: -26, peakOpacity: 0.35 },
  { id: 'pf-4', size: 6, blur: 3, duration: 2.4, delay: 0.9, xPath: [-1, 2, 4, 7] as const, yEnd: -30, peakOpacity: 0.25 },
  { id: 'pf-5', size: 3, blur: 1.5, duration: 2.0, delay: 1.0, xPath: [1, 4, 3, 5] as const, yEnd: -20, peakOpacity: 0.3 },
  { id: 'pf-6', size: 5, blur: 2.5, duration: 2.6, delay: 1.6, xPath: [0, 1, -2, 0] as const, yEnd: -34, peakOpacity: 0.3 },
  { id: 'pf-7', size: 3, blur: 2, duration: 2.0, delay: 1.7, xPath: [0, -2, 1, -1] as const, yEnd: -24, peakOpacity: 0.35 },
  { id: 'pf-8', size: 4, blur: 3, duration: 2.4, delay: 1.9, xPath: [1, 0, -1, 2] as const, yEnd: -30, peakOpacity: 0.2 },
] as const;

export function ShowcaseFuelBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const shouldReduceMotion = useReducedMotion();

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
            ? { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }
            : { duration: 0.4 }
        }
      >
        <div className="flex items-center gap-2.5">
          {/* Icon + label */}
          <div className="flex shrink-0 items-center gap-1 text-amber-400">
            <Fuel className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Fuel
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
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                initial={{ width: '0%' }}
                animate={inView ? { width: `${FILL_FRACTION * 100}%` } : {}}
                transition={
                  shouldReduceMotion
                    ? { duration: 0.2 }
                    : { type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }
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
                {/* Fuel droplets */}
                {DROPLETS.map((d) => (
                  <motion.div
                    key={d.id}
                    className="absolute bg-amber-300/70"
                    style={{
                      width: d.width,
                      height: d.height,
                      left: -d.width / 2,
                      top: '50%',
                      borderRadius: '40% 40% 50% 50%',
                    }}
                    initial={{ opacity: 0, y: 0, x: 0, scale: 1 }}
                    animate={{
                      opacity: [0, 0.7, 0.5, 0],
                      y: [0, 6, 16, 24],
                      x: [0, d.xDrift * 0.5, d.xDrift],
                      scale: [1, 1, 0.8, 0.4],
                    }}
                    transition={{
                      duration: d.duration,
                      delay: d.delay,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'easeIn',
                    }}
                  />
                ))}

                {/* Smoke puffs */}
                {SMOKE_PUFFS.map((p) => (
                  <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                      width: p.size,
                      height: p.size,
                      left: -p.size / 2,
                      top: '50%',
                      filter: `blur(${p.blur}px)`,
                      background: 'rgba(220, 180, 100, 0.7)',
                    }}
                    initial={{ opacity: 0, y: 0, x: 0, scale: 1 }}
                    animate={{
                      opacity: [0, p.peakOpacity, p.peakOpacity * 0.5, 0],
                      y: [0, p.yEnd * 0.3, p.yEnd * 0.7, p.yEnd],
                      x: [...p.xPath],
                      scale: [0.6, 1, 1.4, 1.8],
                    }}
                    transition={{
                      duration: p.duration,
                      delay: p.delay,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Time label */}
          <span className="shrink-0 text-xs font-medium tabular-nums text-white/70">
            4:32:01 remaining
          </span>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { GeometricFlame } from '@/app/(app)/flames/components/flame-card/effects/GeometricFlame';
import { GeometricSmoke } from '@/app/(app)/flames/components/flame-card/effects/GeometricSmoke';
import { ParticleEmbers } from '@/app/(app)/flames/components/flame-card/effects/ParticleEmbers';
import { FLAME_HEX_COLORS } from '@/app/(app)/flames/utils/colors';
import { FLAME_LEVELS } from '@/app/(app)/flames/utils/levels';
import { ShowcaseFuelBar } from './ShowcaseFuelBar';

const EASE_OUT_EXPO = [0.21, 0.47, 0.32, 0.98] as const;

const SHOWCASE_COLORS = [
  FLAME_HEX_COLORS.rose,
  FLAME_HEX_COLORS.orange,
  FLAME_HEX_COLORS.amber,
  FLAME_HEX_COLORS.green,
  FLAME_HEX_COLORS.sky,
  FLAME_HEX_COLORS.indigo,
  FLAME_HEX_COLORS.fuchsia,
  FLAME_HEX_COLORS.blue,
] as const;

// Only reveal the first 3 flame shapes — the rest are a surprise
const REVEALED_COUNT = 3;

export function FlameShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations('marketing.progression');

  return (
    <div ref={ref} className="space-y-8">
      <div className="mx-auto max-w-md">
        <ShowcaseFuelBar />
      </div>

      {/* Desktop / tablet grid */}
      <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {FLAME_LEVELS.map((level, i) => {
          const revealed = i < REVEALED_COUNT;
          const colors = SHOWCASE_COLORS[i];

          return (
            <motion.div
              key={level.level}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.2 + i * 0.08,
                ease: EASE_OUT_EXPO,
              }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-3 flex h-28 w-20 items-center justify-center">
                {revealed ? (
                  <>
                    <GeometricFlame
                      state="active"
                      level={level.level}
                      colors={colors}
                    />
                    <ParticleEmbers state="active" color={colors.light} />
                    {level.level > 1 && (
                      <GeometricSmoke
                        state="paused"
                        color={colors.light}
                        level={1}
                      />
                    )}
                  </>
                ) : (
                  <div className="relative flex h-full w-full items-center justify-center">
                    <div
                      className="absolute h-12 w-12 rounded-full blur-xl"
                      style={{ backgroundColor: `${colors.medium}15` }}
                    />
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full border"
                      style={{
                        borderColor: `${colors.medium}20`,
                        backgroundColor: `${colors.medium}08`,
                      }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{ color: `${colors.medium}40` }}
                      >
                        {t('mysteryLabel')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{
                  color: revealed ? colors.medium : `${colors.medium}50`,
                }}
              >
                {t('levelPrefix')} {level.level}
              </span>
              <span
                className="mt-0.5 text-sm font-semibold"
                style={{
                  color: revealed
                    ? 'rgba(255,255,255,0.8)'
                    : 'rgba(255,255,255,0.25)',
                }}
              >
                {level.name}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile: scrollable row */}
      <div className="sm:hidden -my-16">
        <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-hidden px-2 py-16">
          {FLAME_LEVELS.map((level, i) => {
            const revealed = i < REVEALED_COUNT;
            const colors = SHOWCASE_COLORS[i];

            return (
              <motion.div
                key={level.level}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.06,
                  ease: EASE_OUT_EXPO,
                }}
                className="flex shrink-0 snap-center flex-col items-center"
              >
                <div className="relative mb-3 flex h-24 w-18 items-center justify-center">
                  {revealed ? (
                    <>
                      <GeometricFlame
                        state="active"
                        level={level.level}
                        colors={colors}
                      />
                      <ParticleEmbers state="active" color={colors.light} />
                      {level.level > 1 && (
                        <GeometricSmoke
                          state="active"
                          color={colors.light}
                          level={1}
                        />
                      )}
                    </>
                  ) : (
                    <div className="relative flex h-full w-full items-center justify-center">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full border"
                        style={{
                          borderColor: `${colors.medium}20`,
                          backgroundColor: `${colors.medium}08`,
                        }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{ color: `${colors.medium}40` }}
                        >
                          {t('mysteryLabel')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    color: revealed ? colors.medium : `${colors.medium}50`,
                  }}
                >
                  {t('levelPrefix')} {level.level}
                </span>
                <span
                  className="mt-0.5 text-xs font-semibold"
                  style={{
                    color: revealed
                      ? 'rgba(255,255,255,0.8)'
                      : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {level.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

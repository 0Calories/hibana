'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { ShowcaseFuelBar } from './ShowcaseFuelBar';
import {
  REVEALED_LEVEL_COUNT,
  SHOWCASE_LEVELS,
  type ShowcaseColors,
} from './showcase/colors';
import { ShowcaseFlame } from './showcase/Flames';

const EASE_OUT_EXPO = [0.21, 0.47, 0.32, 0.98] as const;

function MysteryGlyph({
  colors,
  size = 'lg',
  label,
}: {
  colors: ShowcaseColors;
  size?: 'sm' | 'lg';
  label: string;
}) {
  const dim = size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  const text = size === 'lg' ? 'text-sm' : 'text-xs';
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {size === 'lg' && (
        <div
          className="absolute h-12 w-12 rounded-full blur-xl"
          style={{ backgroundColor: `${colors.medium}15` }}
        />
      )}
      <div
        className={`flex ${dim} items-center justify-center rounded-full border`}
        style={{
          borderColor: `${colors.medium}20`,
          backgroundColor: `${colors.medium}08`,
        }}
      >
        <span
          className={`${text} font-bold`}
          style={{ color: `${colors.medium}40` }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

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
      <div className="hidden gap-4 sm:grid sm:grid-cols-4 lg:grid-cols-8">
        {SHOWCASE_LEVELS.map((level, i) => {
          const revealed = i < REVEALED_LEVEL_COUNT;
          const colors = level.colors;

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
                  <ShowcaseFlame
                    level={level.level}
                    colors={colors}
                    className="h-24 w-20"
                  />
                ) : (
                  <MysteryGlyph
                    colors={colors}
                    size="lg"
                    label={t('mysteryLabel')}
                  />
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
      <div className="-my-16 sm:hidden">
        <div className="flex snap-x snap-mandatory gap-6 overflow-x-scroll overflow-y-hidden px-2 pt-16 pb-4">
          {SHOWCASE_LEVELS.map((level, i) => {
            const revealed = i < REVEALED_LEVEL_COUNT;
            const colors = level.colors;

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
                className="w-18 flex shrink-0 snap-center flex-col items-center"
              >
                <div className="w-18 relative mb-3 flex h-24 items-center justify-center">
                  {revealed ? (
                    <ShowcaseFlame
                      level={level.level}
                      colors={colors}
                      className="h-20 w-16"
                    />
                  ) : (
                    <MysteryGlyph
                      colors={colors}
                      size="sm"
                      label={t('mysteryLabel')}
                    />
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

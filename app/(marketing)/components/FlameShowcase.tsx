'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import { GeometricFlame } from '@/app/(app)/flames/components/flame-card/effects/GeometricFlame';
import { FLAME_HEX_COLORS } from '@/app/(app)/flames/utils/colors';
import { FLAME_LEVELS } from '@/app/(app)/flames/utils/levels';

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

export function FlameShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const shouldReduceMotion = useReducedMotion();
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  return (
    <div ref={ref} className="relative">
      {/* Desktop: journey path with connecting SVG line */}
      <div className="hidden lg:block">
        {/* SVG connecting line */}
        <svg
          className="pointer-events-none absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2"
          preserveAspectRatio="none"
        >
          <motion.line
            x1="6%"
            y1="1"
            x2="94%"
            y2="1"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="2"
            strokeDasharray="800"
            initial={{ strokeDashoffset: shouldReduceMotion ? 0 : 800 }}
            animate={inView ? { strokeDashoffset: 0 } : {}}
            transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
          />
        </svg>

        <div className="relative grid grid-cols-8 gap-4">
          {FLAME_LEVELS.map((level, i) => (
            <motion.div
              key={level.level}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.4 + i * 0.1,
                ease: EASE_OUT_EXPO,
              }}
              className="group relative flex flex-col items-center"
              onMouseEnter={() => setHoveredLevel(level.level)}
              onMouseLeave={() => setHoveredLevel(null)}
            >
              <div className="relative mb-3 flex h-32 w-24 items-center justify-center">
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle, ${SHOWCASE_COLORS[i].medium}30 0%, transparent 70%)`,
                  }}
                />
                <GeometricFlame
                  state="active"
                  level={level.level}
                  colors={SHOWCASE_COLORS[i]}
                />
              </div>
              {/* Dot on the line */}
              <div
                className="mb-2 h-2 w-2 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor:
                    hoveredLevel === level.level
                      ? SHOWCASE_COLORS[i].medium
                      : 'rgba(255,255,255,0.1)',
                }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: SHOWCASE_COLORS[i].medium }}
              >
                Lv. {level.level}
              </span>
              <span className="mt-0.5 text-sm font-semibold text-white/80">
                {level.name}
              </span>
              {/* Description on hover */}
              <motion.span
                initial={{ opacity: 0, height: 0 }}
                animate={
                  hoveredLevel === level.level
                    ? { opacity: 1, height: 'auto' }
                    : { opacity: 0, height: 0 }
                }
                className="mt-1 overflow-hidden text-center text-[11px] leading-tight text-white/30"
              >
                {level.description}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile/Tablet: horizontal scrollable row */}
      <div className="lg:hidden">
        <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
          {FLAME_LEVELS.map((level, i) => (
            <motion.button
              type="button"
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
              onClick={() =>
                setHoveredLevel(
                  hoveredLevel === level.level ? null : level.level,
                )
              }
            >
              <div className="relative mb-3 flex h-28 w-20 items-center justify-center">
                <GeometricFlame
                  state="active"
                  level={level.level}
                  colors={SHOWCASE_COLORS[i]}
                />
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: SHOWCASE_COLORS[i].medium }}
              >
                Lv. {level.level}
              </span>
              <span className="mt-0.5 text-sm font-semibold text-white/80">
                {level.name}
              </span>
              {hoveredLevel === level.level && (
                <span className="mt-1 max-w-[120px] text-center text-[11px] leading-tight text-white/30">
                  {level.description}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

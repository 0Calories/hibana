'use client';

import { motion } from 'framer-motion';
import { GeometricFlame } from '@/app/(app)/flames/components/flame-card/effects/GeometricFlame';
import { FLAME_HEX_COLORS } from '@/app/(app)/flames/utils/colors';
import { FLAME_LEVELS } from '@/app/(app)/flames/utils/levels';

const EASE_OUT_EXPO = [0.21, 0.47, 0.32, 0.98] as const;

const SHOWCASE_COLORS = [
  FLAME_HEX_COLORS.blue,
  FLAME_HEX_COLORS.fuchsia,
  FLAME_HEX_COLORS.rose,
  FLAME_HEX_COLORS.green,
  FLAME_HEX_COLORS.sky,
  FLAME_HEX_COLORS.amber,
  FLAME_HEX_COLORS.indigo,
  FLAME_HEX_COLORS.orange,
] as const;

export function FlameShowcase() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8">
      {FLAME_LEVELS.map((level, i) => (
        <motion.div
          key={level.level}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: i * 0.08,
            ease: EASE_OUT_EXPO,
          }}
          className="group flex flex-col items-center"
        >
          <div className="relative mb-3 flex h-32 w-24 items-center justify-center sm:h-36 sm:w-28">
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
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: SHOWCASE_COLORS[i].medium }}
          >
            Lv. {level.level}
          </span>
          <span className="mt-0.5 text-sm font-semibold text-white/80">
            {level.name}
          </span>
          <span className="mt-1 hidden text-center text-[11px] leading-tight text-white/30 lg:block">
            {level.description}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

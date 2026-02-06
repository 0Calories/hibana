'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useRef } from 'react';

export function AnimatedFuelBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]"
    >
      {/* Fuel bar header */}
      <div className="border-b border-white/[0.06] px-5 py-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 font-semibold text-amber-400">
            <Flame className="h-3.5 w-3.5" />
            FUEL
          </span>
          <span className="font-mono text-white/30">4:32 remaining</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-orange-500"
            initial={{ width: '0%' }}
            animate={
              inView
                ? { width: shouldReduceMotion ? '68%' : '68%' }
                : { width: '0%' }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 1.4, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }
            }
          />
        </div>
      </div>

      {/* Mini flame cards */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {[
          { name: 'Japanese', level: 'Lv. 3', color: '#3b82f6', active: false },
          { name: 'Side Projects', level: 'Lv. 2', color: '#d946ef', active: true },
        ].map((card) => (
          <div
            key={card.name}
            className="rounded-xl border p-3 text-center"
            style={{
              borderColor: card.active
                ? `${card.color}60`
                : 'rgba(255,255,255,0.04)',
              backgroundColor: card.active
                ? `${card.color}08`
                : 'rgba(255,255,255,0.01)',
            }}
          >
            <div
              className="text-xs font-semibold"
              style={{ color: card.color }}
            >
              {card.name}
            </div>
            <div className="mt-0.5 text-[10px] text-white/25">{card.level}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

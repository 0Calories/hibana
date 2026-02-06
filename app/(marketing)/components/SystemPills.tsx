'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Flame,
  Fuel,
  Bot,
  Sparkles,
  ShoppingBag,
  StickyNote,
  CheckSquare,
} from 'lucide-react';

const PILLS = [
  { icon: Flame, label: 'Flames' },
  { icon: Fuel, label: 'Fuel' },
  { icon: Bot, label: 'Ember AI' },
  { icon: Sparkles, label: 'Sparks' },
  { icon: ShoppingBag, label: 'Shop' },
  { icon: StickyNote, label: 'Notes' },
  { icon: CheckSquare, label: 'Todos' },
] as const;

export function SystemPills() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {PILLS.map((pill, i) => (
        <motion.span
          key={pill.label}
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.8 + i * 0.06,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/40"
        >
          <pill.icon className="h-3 w-3 text-white/25" />
          {pill.label}
        </motion.span>
      ))}
    </div>
  );
}

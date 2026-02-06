'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { HeroFlame } from './HeroFlame';
import { NewsletterForm } from './NewsletterForm';
import { SystemPills } from './SystemPills';

const EASE_OUT_EXPO = [0.21, 0.47, 0.32, 0.98] as const;

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? {} : { opacity: 0, y: 20 };

  return (
    <div className="relative z-10 flex w-full max-w-6xl flex-col">
      {/* Main split: text left, flame right */}
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        {/* Left — text block */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Badge */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-medium text-orange-300"
          >
            <Flame className="h-3.5 w-3.5" />
            Coming soon
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={initial}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
            className="mb-4 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Your habits,
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 bg-clip-text text-transparent">
              alive
            </span>
            .
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={initial}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT_EXPO }}
            className="mb-8 max-w-md text-base leading-relaxed text-white/45 sm:text-lg"
          >
            Flames. Fuel. AI. Rewards. One system that turns consistency into
            something you can see.
          </motion.p>

          {/* Newsletter */}
          <motion.div
            initial={initial}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO }}
            className="w-full max-w-md"
          >
            <NewsletterForm />
            <p className="mt-3 text-xs text-white/20">
              Get notified when we launch. No spam, just sparks.
            </p>
          </motion.div>
        </div>

        {/* Right — flame (hidden on small, shown on mobile above text via order) */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="order-first flex-shrink-0 lg:order-last"
        >
          <HeroFlame />
        </motion.div>
      </div>

      {/* System pills strip — pulled inside the fold */}
      <motion.div
        initial={initial}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7, ease: EASE_OUT_EXPO }}
        className="mt-12 lg:mt-16"
      >
        <div className="flex items-center gap-4">
          <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent to-white/[0.06] sm:block" />
          <SystemPills />
          <div className="hidden h-px flex-1 bg-gradient-to-l from-transparent to-white/[0.06] sm:block" />
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Flame } from 'lucide-react';
import Image from 'next/image';
import { NewsletterForm } from './NewsletterForm';

const EASE_OUT_EXPO = [0.21, 0.47, 0.32, 0.98] as const;

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? {} : { opacity: 0, y: 20 };

  return (
    <div className="relative z-10 flex w-full max-w-6xl flex-col">
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
            Currently in development
          </motion.div>

          {/* Headline */}
          <motion.h1
            id="hero-heading"
            initial={initial}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
            className="mb-4 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Set your motivation
            <br />
            <span className="bg-linear-to-r from-amber-300 via-orange-400 to-rose-500 bg-clip-text text-transparent">
              ablaze
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={initial}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT_EXPO }}
            className="mb-8 max-w-lg text-base leading-relaxed text-white/45 sm:text-lg"
          >
            <span className="text-white/70">(火花) Hibana</span> is a gamified
            productivity and habit tracking app built on insights from
            behavioral psychology and neuroscience to help you build lasting
            habits and achieve your goals.
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
              Join the waitlist for early access and get notified when we launch
            </p>
          </motion.div>
        </div>

        {/* Right — Ember mascot with float */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE_OUT_EXPO }}
          className="order-first shrink-0 lg:order-last"
        >
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-0 -m-16 rounded-full blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(251,146,60,0.2) 0%, rgba(167,139,250,0.08) 50%, transparent 70%)',
              }}
            />
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            >
              <Image
                src="/ember.png"
                alt="Ember — Hibana's AI companion"
                width={240}
                height={360}
                className="relative select-none drop-shadow-[0_0_60px_rgba(251,146,60,0.3)]"
                draggable={false}
                priority
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

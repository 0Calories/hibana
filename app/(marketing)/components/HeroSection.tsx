'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Flame } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NewsletterForm } from './NewsletterForm';

const EASE_OUT_EXPO = [0.21, 0.47, 0.32, 0.98] as const;

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations('marketing');
  const initial = shouldReduceMotion ? {} : { opacity: 0, y: 20 };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        className="relative z-10 flex max-w-3xl flex-col items-center text-center"
      >
        {/* Badge */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-medium text-orange-300"
        >
          <Flame className="h-3.5 w-3.5" />
          {t('hero.badge')}
        </motion.div>

        {/* Headline */}
        <motion.h1
          id="hero-heading"
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
          className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl"
        >
          {t('hero.headlineLine1')}
          <br />
          <span className="bg-linear-to-r from-amber-300 via-orange-400 to-rose-500 bg-clip-text text-transparent">
            {t('hero.headlineAccent')}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT_EXPO }}
          className="mb-10 max-w-xl text-lg leading-relaxed text-white/45 sm:text-xl"
        >
          <span className="text-white/70">{t('hero.subtitleHighlight')}</span>{' '}
          {t('hero.subtitleBody')}
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
            {t('hero.waitlistHint')}
          </p>
        </motion.div>
      </motion.div>

      {/* Scroll indicator — hidden on short viewports to avoid overlapping the form */}
      {!shouldReduceMotion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 flex flex-col items-center gap-2"
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/20">
            {t('hero.scrollLabel')}
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <ChevronDown className="h-4 w-4 text-white/20" />
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

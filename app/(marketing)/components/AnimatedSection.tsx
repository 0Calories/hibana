'use client';

import { type HTMLMotionProps, motion } from 'framer-motion';

const EASE_OUT_EXPO = [0.21, 0.47, 0.32, 0.98] as const;

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
} & Omit<HTMLMotionProps<'section'>, 'children' | 'className'>) {
  return (
    <motion.section
      initial={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT_EXPO }}
      className={className}
      {...rest}
    >
      {children}
    </motion.section>
  );
}

export function AnimatedDiv({
  children,
  className = '',
  delay = 0,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
} & Omit<HTMLMotionProps<'div'>, 'children' | 'className'>) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT_EXPO }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

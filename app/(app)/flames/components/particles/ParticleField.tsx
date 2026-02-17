'use client';

import { AnimatePresence, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ParticleFieldProps<P> {
  /** Pre-generated particle array */
  particles: P[];
  /** Render each particle as a motion element */
  children: (particle: P) => ReactNode;
  /** Whether to render (default: true). When false, renders null. */
  active?: boolean;
  /** Container className. When provided, wraps in a div. Omit for fragment rendering. */
  className?: string;
}

export function ParticleField<P>({
  particles,
  children,
  active = true,
  className,
}: ParticleFieldProps<P>) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion || !active) {
    return null;
  }

  const content = (
    <AnimatePresence>
      {particles.map((particle) => children(particle))}
    </AnimatePresence>
  );

  if (className) {
    return <div className={className}>{content}</div>;
  }

  return content;
}

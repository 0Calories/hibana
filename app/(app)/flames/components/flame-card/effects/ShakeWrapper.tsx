'use client';

import { motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface ShakeWrapperProps {
  active: boolean;
  progress: number;
  children: React.ReactNode;
}

export function ShakeWrapper({ active, progress, children }: ShakeWrapperProps) {
  const shakeX = useMotionValue(0);
  const shakeY = useMotionValue(0);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    if (!active) {
      shakeX.set(0);
      shakeY.set(0);
      return;
    }

    let rafId: number;
    const startTime = Date.now();

    const tick = () => {
      const p = progressRef.current;
      const amp = 1 + p * 1;
      const freq = 8 + p * 2;
      const elapsed = (Date.now() - startTime) / 1000;
      shakeX.set(Math.sin(elapsed * freq * 2 * Math.PI) * amp);
      shakeY.set(Math.sin(elapsed * freq * 2 * Math.PI) * amp);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, shakeX, shakeY]);

  return <motion.div style={{ x: shakeX, y: shakeY }}>{children}</motion.div>;
}

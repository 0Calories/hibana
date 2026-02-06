'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

/** Star-shaped sparkles scattered around Ember — white/violet to contrast against orange */
const EMBER_SPARKLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: 10 + ((i * 2741) % 80),
  y: 5 + ((i * 1723) % 85),
  size: 4 + ((i * 937) % 5),
  delay: ((i * 571) % 5000) / 1000,
  duration: 2.5 + ((i * 1291) % 2000) / 1000,
  rotation: ((i * 433) % 45),
  color: i % 3 === 0 ? '#e9d5ff' : i % 2 === 0 ? '#ffffff' : '#c4b5fd',
}));

export function EmberFloat() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-0 -m-12 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(251,146,60,0.2) 0%, rgba(167,139,250,0.08) 50%, transparent 70%)',
        }}
      />

      {/* Star sparkles around Ember */}
      {!shouldReduceMotion &&
        EMBER_SPARKLES.map((s) => (
          <motion.div
            key={s.id}
            className="pointer-events-none absolute"
            style={{
              width: s.size,
              height: s.size,
              left: `${s.x}%`,
              top: `${s.y}%`,
              backgroundColor: s.color,
              transform: `rotate(45deg)`,
              boxShadow: `0 0 ${s.size * 2}px ${s.color}80`,
            }}
            animate={{
              opacity: [0, 0.9, 0],
              scale: [0.3, 1.2, 0.3],
              rotate: [45, 45 + s.rotation, 45],
            }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          />
        ))}

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
          alt="Ember — Hibana's AI flame-sprite companion"
          width={180}
          height={270}
          className="relative select-none drop-shadow-[0_0_60px_rgba(251,146,60,0.35)]"
          draggable={false}
          priority={false}
        />
      </motion.div>
    </div>
  );
}

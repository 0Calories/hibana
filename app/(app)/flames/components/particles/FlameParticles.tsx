'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FlameState } from '../../utils/types';
import type { ShapeColors } from '../flame-card/effects/types';
import { ParticleField } from './ParticleField';
import type {
  ExtendedParticle,
  FlameParticleEffect,
  ParticleConditions,
  ParticleStateConfig,
} from './types';
import {
  generateFloatingParticle,
  generateParticles,
  getParticleIntensity,
  shouldShowParticles,
} from './utils';

interface FlameParticlesProps {
  effect: FlameParticleEffect;
  state: FlameState;
  colors: ShapeColors;
  conditions: ParticleConditions;
}

export function FlameParticles({
  effect,
  state,
  colors,
  conditions,
}: FlameParticlesProps) {
  const {
    key,
    stateConfig,
    rangeConfig,
    seed = 420,
    palette: basePalette,
    animation,
    extras,
    showWhen,
    modifiers,
  } = effect;

  // Resolve active modifiers
  const activeModifiers = useMemo(
    () =>
      modifiers?.filter((m) => {
        if (m.condition === 'sealReady') return conditions.sealReady;
        if (m.condition === 'overburning') return conditions.overburning;
        return false;
      }) ?? [],
    [modifiers, conditions.sealReady, conditions.overburning],
  );

  // Merge state config with modifier overrides
  const effectiveStateConfig = useMemo(() => {
    let config = stateConfig;
    for (const mod of activeModifiers) {
      if (mod.stateOverrides) {
        config = { ...config, ...mod.stateOverrides };
      }
    }
    return config;
  }, [stateConfig, activeModifiers]);

  // Resolve palette
  const palette = useMemo(() => {
    for (const mod of activeModifiers) {
      if (mod.palette) {
        return typeof mod.palette === 'function'
          ? mod.palette(colors)
          : mod.palette;
      }
    }
    return basePalette(colors);
  }, [activeModifiers, basePalette, colors]);

  // Resolve speed multiplier
  const speedMultiplier = useMemo(() => {
    for (const mod of activeModifiers) {
      if (mod.speedMultiplier != null) return mod.speedMultiplier;
    }
    return 1;
  }, [activeModifiers]);

  // Visibility
  const sealedCount = effectiveStateConfig.sealed?.count ?? 0;
  const customVisible = showWhen ? showWhen(state) : false;
  const active =
    shouldShowParticles(state) ||
    (state === 'sealed' && sealedCount > 0) ||
    customVisible;

  const idCounter = useRef(0);

  const createParticle = useCallback(
    (
      index: number,
      sizeMultiplier: number,
      particleSeed?: number,
    ): ExtendedParticle => {
      const id = particleSeed ?? idCounter.current++;
      const base = generateFloatingParticle(index, id, rangeConfig);
      const extra = extras ? extras(id, seed) : {};
      return {
        ...base,
        ...extra,
        id,
        size: base.size * sizeMultiplier,
      };
    },
    [rangeConfig, extras, seed],
  );

  // Deterministic initial generation
  const [particles, setParticles] = useState<ExtendedParticle[]>(() =>
    generateParticles(state, effectiveStateConfig, (index, sizeMultiplier) => {
      const id = idCounter.current++;
      return createParticle(index, sizeMultiplier, id);
    }),
  );

  // Recycle individual particles on animation complete
  const removingIds = useRef(new Set<number>());

  const replaceParticle = useCallback(
    (completedId: number) => {
      // If marked for removal, drop instead of recycling
      if (removingIds.current.has(completedId)) {
        removingIds.current.delete(completedId);
        setParticles((prev) => prev.filter((p) => p.id !== completedId));
        return;
      }

      setParticles((prev) =>
        prev.map((p, index) => {
          if (p.id !== completedId) return p;
          const id = idCounter.current++;
          const stateConf =
            effectiveStateConfig[state as keyof ParticleStateConfig];
          if (!stateConf) return p;
          const base = generateFloatingParticle(index, id, rangeConfig);
          const extra = extras ? extras(id, seed) : {};
          return {
            ...base,
            ...extra,
            id,
            size: base.size * stateConf.sizeMultiplier,
            delay: 0,
          };
        }),
      );
    },
    [state, effectiveStateConfig, rangeConfig, extras, seed],
  );

  // Sync particle count when state changes
  useEffect(() => {
    const stateConf = effectiveStateConfig[state as keyof ParticleStateConfig];
    if (!stateConf) return;
    const target = stateConf.count;

    setParticles((prev) => {
      if (prev.length === target) {
        removingIds.current.clear();
        return prev;
      }

      if (prev.length < target) {
        removingIds.current.clear();
        // Append new particles
        const newParticles = Array.from(
          { length: target - prev.length },
          (_, i) => {
            const index = prev.length + i;
            const id = idCounter.current++;
            const base = generateFloatingParticle(index, id, rangeConfig);
            const extra = extras ? extras(id, seed) : {};
            return {
              ...base,
              ...extra,
              id,
              size: base.size * stateConf.sizeMultiplier,
            } as ExtendedParticle;
          },
        );
        return [...prev, ...newParticles];
      }

      // Replace stale set — only current excess should be marked
      removingIds.current = new Set(prev.slice(target).map((p) => p.id));
      return prev;
    });
  }, [state, effectiveStateConfig, rangeConfig, extras, seed]);

  const { opacity, speed } = getParticleIntensity(state);
  const effectiveSpeed = speed * speedMultiplier;

  return (
    <ParticleField
      key={`${key}-${state}`}
      particles={particles}
      active={active}
      className="pointer-events-none absolute inset-0 scale-75 md:scale-100"
    >
      {(particle) => {
        const particleOpacity = opacity * particle.opacityJitter;
        const duration =
          particle.duration * effectiveSpeed * particle.speedJitter;
        const size = particle.sSize ?? particle.size;

        return (
          <motion.div
            key={particle.id}
            className={`absolute ${animation.className}`}
            style={{
              left: `${particle.x}%`,
              bottom: animation.bottom,
              width: size,
              height: size,
              backgroundColor: palette[particle.colorIndex % palette.length],
            }}
            initial={animation.initial}
            animate={animation.animate(particle, particleOpacity)}
            transition={{
              duration,
              delay: particle.delay,
              ...(animation.ease ? { ease: animation.ease } : {}),
              ...(animation.transition
                ? animation.transition(particle, duration)
                : {}),
            }}
            onAnimationComplete={() => replaceParticle(particle.id)}
          />
        );
      }}
    </ParticleField>
  );
}

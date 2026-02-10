'use client';

import type { FlameState } from '../../../utils/types';
import { FLAME_REGISTRY } from './flames';
import { GeometricSmoke } from './GeometricSmoke';
import { ParticleEmbers } from './ParticleEmbers';
import type { ShapeColors } from './types';

interface FlameEffectsProps {
  level: number;
  state: FlameState;
  colors: ShapeColors;
}

export function FlameEffects({ level, state, colors }: FlameEffectsProps) {
  const clampedLevel = Math.max(1, Math.min(8, level));
  const def = FLAME_REGISTRY[clampedLevel];

  return (
    <>
      {def.effects.map((effect, i) => {
        switch (effect.type) {
          case 'embers':
            return (
              <ParticleEmbers
                key={i}
                state={state}
                color={colors.light}
                config={effect.states}
              />
            );
          case 'smoke':
            return (
              <GeometricSmoke
                key={i}
                state={state}
                color={colors.medium}
                config={effect}
              />
            );
        }
      })}
    </>
  );
}

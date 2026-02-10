'use client';

import type { FlameState } from '../../../utils/types';
import { GeometricSmoke } from './GeometricSmoke';
import { ParticleEmbers } from './ParticleEmbers';
import type { EffectConfig, ShapeColors } from './types';

interface EffectsRendererProps {
  effects: EffectConfig[];
  state: FlameState;
  colors: ShapeColors;
}

export function EffectsRenderer({
  effects,
  state,
  colors,
}: EffectsRendererProps) {
  return (
    <>
      {effects.map((effect) => {
        switch (effect.type) {
          case 'embers':
            return (
              <ParticleEmbers
                key={effect.type}
                state={state}
                colors={colors}
                config={effect}
              />
            );
          case 'smoke':
            return (
              <GeometricSmoke
                key={effect.type}
                state={state}
                colors={colors}
                config={effect}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}

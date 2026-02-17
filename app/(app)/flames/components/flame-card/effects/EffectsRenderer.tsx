'use client';

import type { FlameState } from '../../../utils/types';
import { GeometricSmoke } from './GeometricSmoke';
import { ParticleEmbers } from './ParticleEmbers';
import { SealedSmokeWisps } from './SealedSmokeWisps';
import type { EffectConfig, ShapeColors } from './types';

interface EffectsRendererProps {
  effects: EffectConfig[];
  state: FlameState;
  colors: ShapeColors;
  isOverburning?: boolean;
  isSealReady?: boolean;
}

export function EffectsRenderer({
  effects,
  state,
  colors,
  isOverburning = false,
  isSealReady = false,
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
                isSealReady={isSealReady}
              />
            );
          case 'smoke':
            return (
              <GeometricSmoke
                key={effect.type}
                state={state}
                colors={colors}
                config={effect}
                isOverburning={isOverburning}
              />
            );
          case 'sealedSmoke':
            if (state !== 'sealed') return null;
            return (
              <div
                key={effect.type}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <svg
                  viewBox="0 0 100 100"
                  className="h-24 w-20 sm:h-36 sm:w-28 md:h-44 md:w-36"
                  overflow="visible"
                  role="graphics-symbol"
                >
                  <SealedSmokeWisps
                    wickY={effect.wickY}
                    wickX={effect.wickX}
                    color={effect.useFlameColor ? colors.medium : undefined}
                    riseHeight={effect.riseHeight}
                    simple={effect.simple}
                  />
                </svg>
              </div>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

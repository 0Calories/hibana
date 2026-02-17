'use client';

import { useMemo } from 'react';
import type { FlameState } from '../../../utils/types';
import type { ParticleConditions } from '../../particles';
import { FlameParticles } from '../../particles';
import { SealedSmokeWisps } from './SealedSmokeWisps';
import type {
  EffectConfig,
  SealedSmokeEffectConfig,
  ShapeColors,
} from './types';

interface EffectsRendererProps {
  effects: EffectConfig[];
  state: FlameState;
  colors: ShapeColors;
  isOverburning?: boolean;
  isSealReady?: boolean;
}

function isSealedSmokeEffect(
  effect: EffectConfig,
): effect is SealedSmokeEffectConfig {
  return (
    'type' in effect &&
    (effect as SealedSmokeEffectConfig).type === 'sealedSmoke'
  );
}

export function EffectsRenderer({
  effects,
  state,
  colors,
  isOverburning = false,
  isSealReady = false,
}: EffectsRendererProps) {
  const conditions: ParticleConditions = useMemo(
    () => ({ sealReady: isSealReady, overburning: isOverburning }),
    [isSealReady, isOverburning],
  );

  return (
    <>
      {effects.map((effect) => {
        if (isSealedSmokeEffect(effect)) {
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
        }

        return (
          <FlameParticles
            key={effect.key}
            effect={effect}
            state={state}
            colors={colors}
            conditions={conditions}
          />
        );
      })}
    </>
  );
}

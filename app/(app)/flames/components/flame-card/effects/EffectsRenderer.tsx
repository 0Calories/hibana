'use client';

import { useMemo } from 'react';
import type { FlameState } from '../../../utils/types';
import type { ParticleConditions } from '../../particles';
import { FlameParticles } from '../../particles';
import { CompletedSmokeWisps } from './CompletedSmokeWisps';
import type {
  CompletedSmokeEffectConfig,
  EffectConfig,
  ShapeColors,
} from './types';

interface EffectsRendererProps {
  effects: EffectConfig[];
  state: FlameState;
  colors: ShapeColors;
  isOverburning?: boolean;
  isCompletionReady?: boolean;
}

function isCompletedSmokeEffect(
  effect: EffectConfig,
): effect is CompletedSmokeEffectConfig {
  return (
    'type' in effect &&
    (effect as CompletedSmokeEffectConfig).type === 'completedSmoke'
  );
}

export function EffectsRenderer({
  effects,
  state,
  colors,
  isOverburning = false,
  isCompletionReady = false,
}: EffectsRendererProps) {
  const conditions: ParticleConditions = useMemo(
    () => ({ completionReady: isCompletionReady, overburning: isOverburning }),
    [isCompletionReady, isOverburning],
  );

  return (
    <>
      {effects.map((effect) => {
        if (isCompletedSmokeEffect(effect)) {
          if (state !== 'completed') return null;
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
                <CompletedSmokeWisps
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

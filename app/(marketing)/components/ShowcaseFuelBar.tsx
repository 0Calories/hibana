import { Fuel } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { FuelDroplets, SmokePuffs } from './showcase/FuelBarParticles';

/**
 * Visual-only fuel bar for the marketing page. Replicates the real
 * FuelMeter's appearance + particle effects via pure CSS.
 */

const FILL_FRACTION = 0.68;

export async function ShowcaseFuelBar() {
  const t = await getTranslations('marketing.fuel');

  return (
    <div>
      <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 motion-safe:animate-marketing-fuel-glow">
        <div className="flex items-center gap-2.5">
          {/* Icon + label */}
          <div className="flex shrink-0 items-center gap-1 text-amber-400">
            <Fuel className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {t('label')}
            </span>
          </div>

          {/* Bar */}
          <div className="relative h-3 flex-1 overflow-visible">
            <div className="relative h-full overflow-hidden rounded-full bg-white/10">
              {/* Segment ticks */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 rounded-full opacity-15"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to right, transparent 0px, transparent 30px, rgba(0,0,0,0.5) 30px, rgba(0,0,0,0.5) 32px)',
                }}
              />

              {/* Fill bar */}
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-amber-500 to-amber-400 motion-safe:animate-marketing-fuel-fill"
                style={
                  {
                    width: `${FILL_FRACTION * 100}%`,
                    '--fuel-fill': `${FILL_FRACTION * 100}%`,
                  } as React.CSSProperties
                }
              >
                {/* Glowing tip */}
                <div
                  className="absolute top-0 right-0 bottom-0 w-3 rounded-full motion-safe:animate-marketing-fuel-tip motion-reduce:hidden"
                  style={{
                    background:
                      'linear-gradient(to left, rgba(255,240,200,0.9), transparent)',
                    boxShadow:
                      '0 0 6px rgba(251,191,36,0.6), 0 0 12px rgba(251,191,36,0.3)',
                  }}
                />

                {/* Consumption shimmer */}
                <div
                  className="absolute inset-0 rounded-full opacity-30 motion-safe:animate-marketing-fuel-shimmer motion-reduce:hidden"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 40%, transparent 60%)',
                    backgroundSize: '200% 100%',
                  }}
                />
              </div>
            </div>

            {/* Tip particles — positioned at leading edge */}
            <div
              className="pointer-events-none absolute top-0 h-full motion-reduce:hidden"
              style={{ left: `${FILL_FRACTION * 100}%` }}
            >
              <FuelDroplets className="bg-amber-300/70" />
              <SmokePuffs color="rgba(220, 180, 100, 0.7)" />
            </div>
          </div>

          {/* Time label */}
          <span className="shrink-0 text-xs font-medium tabular-nums text-white/70">
            {t('remaining')}
          </span>
        </div>
      </div>
    </div>
  );
}

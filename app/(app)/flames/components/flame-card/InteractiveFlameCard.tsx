'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { Flame } from '@/lib/supabase/rows';
import { cn } from '@/lib/utils';
import type { FlameCardActions, FlameEntry } from '../../hooks/useFlames';
import { getFlameColors } from '../../utils/colors';
import { FlameCard } from './FlameCard';
import { ProgressBar } from './ProgressBar';
import { TimerDisplay } from './TimerDisplay';

interface InteractiveFlameCardProps {
  flame: Flame;
  entry: FlameEntry;
  actions: FlameCardActions;
  isFuelDepleted: boolean;
}

export function InteractiveFlameCard({
  flame,
  entry,
  actions,
  isFuelDepleted,
}: InteractiveFlameCardProps) {
  const t = useTranslations('flames.card');
  const tCompletion = useTranslations('flames.completion');
  const colors = getFlameColors(flame.color);

  const state = entry.state;
  const canComplete = entry.isCompletionReady && !entry.isBlocked;
  const isOverburning = entry.isOverburning;

  // Show the needs-more-fuel hint when the flame is paused and completion is
  // gated by insufficient fueled time (user has tended but fuel was low).
  const showNeedsMoreFuelHint =
    state === 'paused' &&
    !canComplete &&
    !isFuelDepleted &&
    entry.fueledSeconds > 0 &&
    entry.targetSeconds > 0 &&
    !entry.isCompletionReady;

  const stateText = ((): string | null => {
    if (isFuelDepleted && !canComplete && state !== 'completed')
      return t('noFuel');
    if (entry.isBlocked && state !== 'completed') return null;
    switch (state) {
      case 'untended':
        return t('ready');
      case 'burning':
        return isOverburning ? t('overburning') : t('burning');
      case 'paused':
        return canComplete ? t('readyToComplete') : t('resting');
      case 'completing':
        return t('completing');
      case 'completed':
        return t('completed');
    }
  })();

  const stateTextClass =
    canComplete || state === 'completing'
      ? 'font-medium text-amber-500'
      : isOverburning
        ? 'font-medium text-red-500'
        : state === 'completed'
          ? 'font-medium'
          : 'text-muted-foreground';

  const showTimer = flame.tracking_type === 'time' && entry.targetSeconds > 0;

  const footer = (
    <div className="flex flex-col gap-1 sm:gap-1.5">
      {showTimer && (
        <div className={cn(state === 'completed' && 'opacity-40')}>
          <TimerDisplay
            elapsedSeconds={entry.elapsedSeconds}
            targetSeconds={entry.targetSeconds}
            state={state}
            color={colors.light}
            isOverburning={isOverburning}
          />
        </div>
      )}
      {showTimer && (
        <ProgressBar
          fueledFraction={entry.fueledFraction}
          unfueledFraction={entry.unfueledFraction}
        />
      )}
      <div className={cn('text-center text-[10px] sm:text-xs', stateTextClass)}>
        {state === 'completed' ? (
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(to right, #d97706, #fbbf24, #fde68a, #fbbf24, #d97706)',
            }}
          >
            {stateText}
          </span>
        ) : (
          (stateText ?? '\u00A0')
        )}
      </div>
      {showNeedsMoreFuelHint && (
        <div className="text-center text-[10px] text-muted-foreground sm:text-xs">
          {t('needsMoreFuel')}
        </div>
      )}
    </div>
  );

  return (
    <FlameCard
      flame={flame}
      entry={entry}
      actions={actions}
      isFuelDepleted={isFuelDepleted}
      footer={footer}
      isOverburning={isOverburning}
      onCompletionError={() =>
        toast.error(tCompletion('error'), { position: 'top-center' })
      }
    />
  );
}

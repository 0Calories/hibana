'use client';

import { useTranslations } from 'next-intl';
import {
  FLAME_BG_CLASSES,
  type FlameColorName,
} from '@/app/(app)/flames/utils/colors';
import { Switch } from '@/components/ui/switch';
import type { FlameWithSchedule } from '../actions';

interface FlameToggleRowProps {
  flame: FlameWithSchedule;
  isAssigned: boolean;
  isDisabled: boolean;
  disabledReason?: string;
  onToggle: (checked: boolean) => void;
}

export function FlameToggleRow({
  flame,
  isAssigned,
  isDisabled,
  disabledReason,
  onToggle,
}: FlameToggleRowProps) {
  const t = useTranslations('schedule');

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}${t('hours')} ${m}${t('minutes')}`;
    if (h > 0) return `${h}${t('hours')}`;
    return `${m}${t('minutes')}`;
  };

  const bgClass =
    FLAME_BG_CLASSES[(flame.color ?? 'orange') as FlameColorName] ??
    'bg-orange-500';

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
        isDisabled ? 'opacity-50' : ''
      }`}
    >
      {/* Color swatch */}
      <div className={`size-3 shrink-0 rounded-full ${bgClass}`} />

      {/* Name + budget */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{flame.name}</span>
        <div className="flex items-center gap-1.5">
          {flame.time_budget_minutes != null && (
            <span className="text-xs text-muted-foreground">
              {formatMinutes(flame.time_budget_minutes)}
            </span>
          )}
          {flame.is_daily && (
            <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[10px] font-medium text-amber-600">
              {t('daily')}
            </span>
          )}
        </div>
      </div>

      {/* Disabled reason */}
      {isDisabled && disabledReason && (
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {disabledReason}
        </span>
      )}

      {/* Toggle */}
      <Switch
        checked={isAssigned}
        onCheckedChange={onToggle}
        disabled={isDisabled}
      />
    </div>
  );
}

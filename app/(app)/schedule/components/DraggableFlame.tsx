'use client';

import { useDraggable } from '@dnd-kit/core';
import { useTranslations } from 'next-intl';
import { FlameRenderer } from '@/app/(app)/flames/components/flame-card/effects/FlameRenderer';
import type { FlameColorName } from '@/app/(app)/flames/utils/colors';
import { getFlameColors } from '@/app/(app)/flames/utils/colors';
import { cn } from '@/lib/utils';
import type { FlameWithSchedule } from '../actions';

interface DraggableFlameProps {
  flame: FlameWithSchedule;
  level: number;
  disabled?: boolean;
  showDaily?: boolean;
  onClick?: () => void;
}

export function DraggableFlame({
  flame,
  level,
  disabled = false,
  showDaily = false,
  onClick,
}: DraggableFlameProps) {
  const t = useTranslations('schedule');
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: flame.id,
      disabled,
      data: { flame },
    });

  const colors = getFlameColors(flame.color as FlameColorName);

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}${t('hours')} ${m}${t('minutes')}`;
    if (h > 0) return `${h}${t('hours')}`;
    return `${m}${t('minutes')}`;
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-0.5 rounded-lg p-1.5',
        isDragging && 'opacity-80 shadow-lg',
        disabled
          ? 'cursor-default opacity-70'
          : onClick
            ? 'cursor-pointer hover:bg-muted/50'
            : 'cursor-grab active:cursor-grabbing',
        showDaily &&
          'border border-amber-400/30 bg-amber-50/30 dark:border-amber-500/20 dark:bg-amber-500/5',
      )}
    >
      <FlameRenderer
        state="untended"
        level={level}
        colors={colors}
        className="h-12 w-10"
      />
      <span className="max-w-24 truncate text-center text-sm leading-tight">
        {flame.name}
      </span>
      <div className="flex items-center gap-1">
        {flame.time_budget_minutes != null && (
          <span className="text-xs text-muted-foreground">
            {formatMinutes(flame.time_budget_minutes)}
          </span>
        )}
        {showDaily && (
          <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[10px] font-medium text-amber-600">
            {t('daily')}
          </span>
        )}
      </div>
    </button>
  );
}

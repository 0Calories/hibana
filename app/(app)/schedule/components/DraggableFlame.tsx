'use client';

import { useDraggable } from '@dnd-kit/core';
import { useTranslations } from 'next-intl';
import { getFlameColors } from '@/app/(app)/flames/utils/colors';
import type { FlameColorName } from '@/app/(app)/flames/utils/colors';
import { FlameRenderer } from '@/app/(app)/flames/components/flame-card/effects/FlameRenderer';
import type { FlameWithSchedule } from '../actions';

interface DraggableFlameProps {
  flame: FlameWithSchedule;
  level: number;
  disabled?: boolean;
}

export function DraggableFlame({ flame, level, disabled = false }: DraggableFlameProps) {
  const t = useTranslations('schedule');
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
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

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex flex-col items-center gap-0.5 rounded-lg p-1.5 transition-opacity ${
        isDragging ? 'opacity-30' : ''
      } ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <FlameRenderer
        state="untended"
        level={level}
        colors={colors}
        className="h-12 w-10"
      />
      <span className="max-w-[4.5rem] truncate text-center text-xs leading-tight">
        {flame.name}
      </span>
      {flame.time_budget_minutes != null && (
        <span className="text-[10px] text-muted-foreground">
          {formatMinutes(flame.time_budget_minutes)}
        </span>
      )}
    </div>
  );
}

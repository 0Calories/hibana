'use client';

import { useDraggable } from '@dnd-kit/core';
import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { FlameRenderer } from '@/app/(app)/flames/components/flame-card/effects/FlameRenderer';
import type { FlameColorName } from '@/app/(app)/flames/utils/colors';
import { getFlameColors } from '@/app/(app)/flames/utils/colors';
import { cn } from '@/lib/utils';
import type { FlameWithSchedule } from '../../actions';

interface DraggableFlameProps {
  flame: FlameWithSchedule;
  level: number;
  disabled?: boolean;
  showDaily?: boolean;
  onClick?: () => void;
  allocatedMinutes?: number;
  onAllocationChange?: (minutes: number) => void;
}

const MIN_ALLOCATION = 15;

export function DraggableFlame({
  flame,
  level,
  disabled = false,
  showDaily = false,
  onClick,
  allocatedMinutes,
  onAllocationChange,
}: DraggableFlameProps) {
  const t = useTranslations('schedule');
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: flame.id,
      disabled,
      data: { flame },
    });

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const colors = getFlameColors(flame.color as FlameColorName);

  const displayMinutes = allocatedMinutes ?? flame.time_budget_minutes;
  const isCustomAllocation =
    allocatedMinutes != null &&
    flame.time_budget_minutes != null &&
    allocatedMinutes !== flame.time_budget_minutes;

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}${t('hours')} ${m}${t('minutes')}`;
    if (h > 0) return `${h}${t('hours')}`;
    return `${m}${t('minutes')}`;
  };

  const handleTimeClick = (e: React.MouseEvent) => {
    if (!onAllocationChange || !allocatedMinutes) return;
    e.stopPropagation();
    e.preventDefault();
    setEditValue(String(allocatedMinutes));
    setIsEditingTime(true);
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const commitTimeEdit = () => {
    const parsed = Number.parseInt(editValue, 10);
    if (!Number.isNaN(parsed) && parsed >= MIN_ALLOCATION && onAllocationChange) {
      // Snap to 15-min increments
      const snapped = Math.round(parsed / 15) * 15;
      onAllocationChange(Math.max(snapped, MIN_ALLOCATION));
    }
    setIsEditingTime(false);
  };

  const style: React.CSSProperties = {
    touchAction: disabled ? undefined : 'none',
    ...(transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          zIndex: 50,
        }
      : {}),
  };

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
        className="h-12 w-10 sm:h-16 sm:w-14 md:h-24 md:w-20"
      />
      <span className="max-w-24 truncate text-center text-sm leading-tight">
        {flame.name}
      </span>
      <div className="flex items-center gap-1">
        {displayMinutes != null && (
          isEditingTime ? (
            <input
              ref={inputRef}
              type="number"
              min={MIN_ALLOCATION}
              step={15}
              className="w-12 border-b border-amber-400 bg-transparent text-center text-xs tabular-nums outline-none"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitTimeEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTimeEdit();
                if (e.key === 'Escape') setIsEditingTime(false);
              }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              // biome-ignore lint/a11y/noAutofocus: Editing mode
              autoFocus
            />
          ) : (
            <span
              className={cn(
                'text-xs',
                isCustomAllocation
                  ? 'font-medium text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground',
                onAllocationChange && 'cursor-pointer hover:underline',
              )}
              onClick={handleTimeClick}
              onPointerDown={onAllocationChange ? (e) => e.stopPropagation() : undefined}
            >
              {formatMinutes(displayMinutes)}
              {isCustomAllocation && (
                <Pencil className="ml-0.5 inline size-2.5" />
              )}
            </span>
          )
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

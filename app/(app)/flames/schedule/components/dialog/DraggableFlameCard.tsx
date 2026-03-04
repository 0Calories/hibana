'use client';

import { useDraggable } from '@dnd-kit/core';
import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { FlameCard } from '@/app/(app)/flames/components/flame-card/FlameCard';
import type { Flame } from '@/lib/supabase/rows';
import { formatDuration } from '@/lib/time';
import { cn } from '@/lib/utils';

interface DraggableFlameCardProps {
  flame: Flame;
  level: number;
  disabled?: boolean;
  onClick?: () => void;
  allocatedMinutes?: number;
  onAllocationChange?: (minutes: number) => void;
}

const MIN_ALLOCATION = 15;

export function DraggableFlameCard({
  flame,
  level,
  disabled = false,
  onClick,
  allocatedMinutes,
  onAllocationChange,
}: DraggableFlameCardProps) {
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

  const displayMinutes = allocatedMinutes ?? flame.time_budget_minutes;
  const isCustomAllocation =
    allocatedMinutes != null &&
    flame.time_budget_minutes != null &&
    allocatedMinutes !== flame.time_budget_minutes;

  const handleTimeClick = (e: React.MouseEvent) => {
    if (!onAllocationChange || allocatedMinutes == null) return;
    e.stopPropagation();
    e.preventDefault();
    setEditValue(String(allocatedMinutes));
    setIsEditingTime(true);
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const commitTimeEdit = () => {
    const parsed = Number.parseInt(editValue, 10);
    if (
      !Number.isNaN(parsed) &&
      parsed >= MIN_ALLOCATION &&
      onAllocationChange
    ) {
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

  const tLabels = { hours: t('hours'), minutes: t('minutes') };

  const timeFooter =
    displayMinutes != null ? (
      <div className="flex items-center justify-center gap-1">
        {isEditingTime ? (
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
          // biome-ignore lint/a11y/useKeyWithClickEvents: Time edit activated by click/tap only
          // biome-ignore lint/a11y/noStaticElementInteractions: Time label click-to-edit
          <span
            className={cn(
              'text-[10px] sm:text-xs',
              isCustomAllocation
                ? 'font-medium text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground',
              onAllocationChange && 'cursor-pointer hover:underline',
            )}
            onClick={handleTimeClick}
            onPointerDown={
              onAllocationChange ? (e) => e.stopPropagation() : undefined
            }
          >
            {formatDuration(displayMinutes, tLabels)}
            {isCustomAllocation && (
              <Pencil className="ml-0.5 inline size-2.5" />
            )}
          </span>
        )}
      </div>
    ) : undefined;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: dnd-kit attributes provide role + keyboard handlers
    // biome-ignore lint/a11y/useKeyWithClickEvents: dnd-kit attributes provide keyboard handlers
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={onClick}
      className={cn(
        isDragging && 'opacity-80 shadow-lg',
        disabled
          ? 'cursor-default opacity-70'
          : onClick
            ? 'cursor-pointer'
            : 'cursor-grab active:cursor-grabbing',
      )}
    >
      <FlameCard flame={flame} level={level} size="mini" footer={timeFooter} />
    </div>
  );
}

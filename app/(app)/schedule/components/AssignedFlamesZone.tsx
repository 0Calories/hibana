'use client';

import { useDroppable } from '@dnd-kit/core';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { FlameWithSchedule } from '../actions';
import { DraggableFlame } from './DraggableFlame';

interface AssignedFlamesZoneProps {
  flames: FlameWithSchedule[];
  flameLevels: Map<string, number>;
  onRemove: (flameId: string) => void;
}

export function AssignedFlamesZone({
  flames,
  flameLevels,
  onRemove,
}: AssignedFlamesZoneProps) {
  const t = useTranslations('schedule');
  const { isOver, setNodeRef } = useDroppable({ id: 'assigned-zone' });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[5rem] rounded-lg border-2 border-dashed p-2 transition-colors',
        isOver
          ? 'border-amber-400 bg-amber-50/50 dark:border-amber-500/50 dark:bg-amber-500/5'
          : 'border-muted-foreground/20',
      )}
    >
      {flames.length === 0 ? (
        <p className="flex h-full min-h-[3rem] items-center justify-center text-sm text-muted-foreground">
          {t('dragHere')}
        </p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {flames.map((flame) => (
            <DraggableFlame
              key={flame.id}
              flame={flame}
              level={flameLevels.get(flame.id) ?? 1}
              disabled={flame.is_daily}
              showDaily={flame.is_daily}
              onClick={
                flame.is_daily ? undefined : () => onRemove(flame.id)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

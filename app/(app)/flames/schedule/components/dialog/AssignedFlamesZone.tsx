'use client';

import { useDroppable } from '@dnd-kit/core';
import { useTranslations } from 'next-intl';
import type { Flame } from '@/lib/supabase/rows';
import { cn } from '@/lib/utils';
import { ASSIGNED_FLAME_ZONE_ID } from '../constants';
import { DraggableFlameCard } from './DraggableFlameCard';

interface AssignedFlamesZoneProps {
  flames: Flame[];
  onRemove: (flameId: string) => void;
  allocations: Record<string, number>;
  onAllocationChange: (flameId: string, minutes: number) => void;
}

export function AssignedFlamesZone({
  flames,
  onRemove,
  allocations,
  onAllocationChange,
}: AssignedFlamesZoneProps) {
  const t = useTranslations('schedule');
  const { isOver, setNodeRef } = useDroppable({ id: ASSIGNED_FLAME_ZONE_ID });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-20 rounded-lg border-2 border-dashed p-2 transition-colors',
        isOver
          ? 'border-amber-400 bg-amber-50/50 dark:border-amber-500/50 dark:bg-amber-500/5'
          : 'border-muted-foreground/20',
      )}
    >
      {flames.length === 0 ? (
        <p className="flex h-full min-h-12 items-center justify-center text-sm text-muted-foreground">
          {t('dragHere')}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {flames.map((flame) => (
            <DraggableFlameCard
              key={flame.id}
              flame={flame}
              level={flame.level}
              onClick={() => onRemove(flame.id)}
              allocatedMinutes={allocations[flame.id]}
              onAllocationChange={(mins) => onAllocationChange(flame.id, mins)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

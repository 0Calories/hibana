'use client';

import { useDroppable } from '@dnd-kit/core';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { FlameWithSchedule } from '../../actions';
import { ASSIGNED_FLAME_ZONE_ID } from '../constants';
import { DraggableFlame } from './DraggableFlame';

interface AssignedFlamesZoneProps {
  flames: FlameWithSchedule[];
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
  // Map flame id → level based on index in the full flames array
  // This is only for testing purposes and must be replaced by actual levels once the data model for flames is updated
  const flameLevels = useMemo(
    () => new Map(flames.map((f, i) => [f.id, (i % 8) + 1])),
    [flames],
  );

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
        <div className="flex flex-wrap gap-1">
          {flames.map((flame) => (
            <DraggableFlame
              key={flame.id}
              flame={flame}
              level={flameLevels.get(flame.id) ?? 1}
              disabled={flame.is_daily}
              showDaily={flame.is_daily}
              onClick={flame.is_daily ? undefined : () => onRemove(flame.id)}
              allocatedMinutes={allocations[flame.id]}
              onAllocationChange={(mins) => onAllocationChange(flame.id, mins)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

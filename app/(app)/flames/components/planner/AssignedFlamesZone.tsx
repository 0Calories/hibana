'use client';

import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { Flame } from '@/lib/supabase/rows';
import { cn } from '@/lib/utils';
import { ASSIGNED_FLAME_ZONE_ID } from './constants';
import { DraggableFlameCard } from './DraggableFlameCard';

const SLIDE_TRANSITION = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 38,
  mass: 0.6,
};

interface AssignedFlamesZoneProps {
  flames: Flame[];
  onRemove: (flameId: string) => void;
  allocations: Record<string, number>;
  onAllocationChange: (flameId: string, minutes: number) => void;
  /**
   * When set, the motion.div for this flame skips its exit animation.
   * Used for drag-to-pool moves where animating the source slot is
   * visually irrelevant (the user's attention is at the cursor).
   */
  skipExitForId?: string | null;
}

export function AssignedFlamesZone({
  flames,
  onRemove,
  allocations,
  onAllocationChange,
  skipExitForId,
}: AssignedFlamesZoneProps) {
  // Map flame id → level based on index. Placeholder until per-flame leveling
  // is wired into the planner view.
  const flameLevels = useMemo(
    () => new Map(flames.map((f, i) => [f.id, (i % 8) + 1])),
    [flames],
  );

  const t = useTranslations('flames.plan');
  const { isOver, setNodeRef } = useDroppable({ id: ASSIGNED_FLAME_ZONE_ID });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-44 sm:min-h-52 rounded-lg border-2 border-dashed p-2 transition-colors',
        isOver
          ? 'border-amber-400 bg-amber-50/50 dark:border-amber-500/50 dark:bg-amber-500/5'
          : 'border-muted-foreground/20',
      )}
    >
      {flames.length === 0 ? (
        <p className="flex w-full items-center justify-center text-sm text-muted-foreground">
          {t('dragHere')}
        </p>
      ) : (
        <div className="flex w-full flex-wrap content-start gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {flames.map((flame) => (
              <motion.div
                key={flame.id}
                layout="position"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  skipExitForId === flame.id
                    ? undefined
                    : { opacity: 0, scale: 0.9 }
                }
                transition={SLIDE_TRANSITION}
                // Hide the source slot immediately during a drag-removal so
                // the layout collapses without flashing a fully-opaque card
                // between dnd-kit clearing `isDragging` and the unmount.
                style={
                  skipExitForId === flame.id ? { display: 'none' } : undefined
                }
              >
                <DraggableFlameCard
                  flame={flame}
                  level={flameLevels.get(flame.id) ?? 1}
                  onClick={() => onRemove(flame.id)}
                  allocatedMinutes={allocations[flame.id]}
                  onAllocationChange={(mins) =>
                    onAllocationChange(flame.id, mins)
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

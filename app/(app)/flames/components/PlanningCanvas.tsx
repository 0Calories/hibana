'use client';

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { Flame } from '@/lib/supabase/rows';
import { formatDuration } from '@/lib/time';
import { cn } from '@/lib/utils';
import { setDailyPlan } from '../actions';
import { CreateFlameDialog } from './CreateFlameDialog';
import { FlameCard } from './flame-card/FlameCard';
import { AssignedFlamesZone } from './planner/AssignedFlamesZone';
import { ASSIGNED_FLAME_ZONE_ID, MY_FLAMES_ZONE_ID } from './planner/constants';
import { DraggableFlameCard } from './planner/DraggableFlameCard';
import { MyFlamesZone } from './planner/MyFlamesZone';

interface PlanningCanvasProps {
  /** All non-archived flames (planned + unplanned). */
  flames: Flame[];
  /** Today's date (YYYY-MM-DD, server-resolved). */
  date: string;
  /** Pre-resolved last-used target_seconds per flame. */
  lastUsedTargetsByFlameId: Record<string, number>;
}

const DEFAULT_MINUTES = 30;

const SLIDE_TRANSITION = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 38,
  mass: 0.6,
};

export function PlanningCanvas({
  flames,
  date,
  lastUsedTargetsByFlameId,
}: PlanningCanvasProps) {
  const t = useTranslations('flames.plan');
  const locale = useLocale();

  const [assignedFlameIds, setAssignedFlameIds] = useState<string[]>([]);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeFlameId, setActiveFlameId] = useState<string | null>(null);

  // When the user moves a flame via DRAG, we skip the source-side exit
  // animation — the card is visually at the cursor (DragOverlay), so animating
  // an exit at the now-empty source slot is meaningless. The id of the flame
  // currently being drag-removed is held here for one render so the motion.div
  // exit prop becomes undefined for that child before AnimatePresence captures
  // the unmount. Click moves don't set this — they get the full exit animation.
  const [skipExitForId, setSkipExitForId] = useState<string | null>(null);

  const activeFlame = useMemo(
    () => flames.find((f) => f.id === activeFlameId) ?? null,
    [flames, activeFlameId],
  );

  const flameLevels = useMemo(
    () => new Map(flames.map((f, i) => [f.id, (i % 8) + 1])),
    [flames],
  );

  const assignedFlames = useMemo(
    () =>
      assignedFlameIds
        .map((id) => flames.find((f) => f.id === id))
        .filter(Boolean) as Flame[],
    [flames, assignedFlameIds],
  );

  const availableFlames = useMemo(
    () => flames.filter((f) => !assignedFlameIds.includes(f.id)),
    [flames, assignedFlameIds],
  );

  const totalMinutes = assignedFlames.reduce(
    (sum, f) => sum + (allocations[f.id] ?? 0),
    0,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveFlameId(String(event.active.id));
  }, []);

  // Apply a state mutation while skipping the exit animation for one flame.
  // Sequence: setSkipExitForId triggers a render where the doomed motion.div's
  // exit prop becomes undefined; on the next frame we apply the actual list
  // mutation, so AnimatePresence captures the no-exit prop before the unmount.
  const applyDragMutation = useCallback(
    (flameId: string, mutate: () => void) => {
      setSkipExitForId(flameId);
      requestAnimationFrame(() => {
        mutate();
        setSkipExitForId(null);
      });
    },
    [],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveFlameId(null);
      const { active, over } = event;
      if (!over) return;
      const flameId = String(active.id);

      if (over.id === ASSIGNED_FLAME_ZONE_ID) {
        if (assignedFlameIds.includes(flameId)) return;
        const seconds = lastUsedTargetsByFlameId[flameId];
        const minutes =
          seconds != null ? Math.round(seconds / 60) : DEFAULT_MINUTES;
        applyDragMutation(flameId, () => {
          setAssignedFlameIds((prev) => [...prev, flameId]);
          setAllocations((prev) => ({ ...prev, [flameId]: minutes }));
        });
      } else if (over.id === MY_FLAMES_ZONE_ID) {
        if (!assignedFlameIds.includes(flameId)) return;
        applyDragMutation(flameId, () => {
          setAssignedFlameIds((prev) => prev.filter((id) => id !== flameId));
          setAllocations((prev) => {
            const next = { ...prev };
            delete next[flameId];
            return next;
          });
        });
      }
    },
    [applyDragMutation, assignedFlameIds, lastUsedTargetsByFlameId],
  );

  const handleDragCancel = useCallback(() => {
    setActiveFlameId(null);
  }, []);

  // Click-to-assign on a pool flame. State updates directly (no skipExit) so
  // the source pool item plays its full exit animation as it transitions to
  // the lineup.
  const handlePoolClickAssign = useCallback(
    (flameId: string) => {
      if (assignedFlameIds.includes(flameId)) return;
      const seconds = lastUsedTargetsByFlameId[flameId];
      const minutes =
        seconds != null ? Math.round(seconds / 60) : DEFAULT_MINUTES;
      setAssignedFlameIds((prev) => [...prev, flameId]);
      setAllocations((prev) => ({ ...prev, [flameId]: minutes }));
    },
    [assignedFlameIds, lastUsedTargetsByFlameId],
  );

  const handleRemove = useCallback((flameId: string) => {
    setAssignedFlameIds((prev) => prev.filter((id) => id !== flameId));
    setAllocations((prev) => {
      const next = { ...prev };
      delete next[flameId];
      return next;
    });
  }, []);

  const handleAllocationChange = useCallback(
    (flameId: string, minutes: number) => {
      setAllocations((prev) => ({ ...prev, [flameId]: minutes }));
    },
    [],
  );

  const handleClear = () => {
    setAssignedFlameIds([]);
    setAllocations({});
  };

  const handleLockIn = async () => {
    if (assignedFlameIds.length === 0) return;
    setSubmitting(true);
    const picks = assignedFlameIds.map((id) => ({
      flameId: id,
      targetSeconds: (allocations[id] ?? DEFAULT_MINUTES) * 60,
    }));
    const result = await setDailyPlan(date, picks);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error.message, { position: 'top-center' });
    }
    // On success, page revalidates and re-renders into State 2 (tending grid).
  };

  const summary = t('summary', {
    time: formatDuration(totalMinutes, locale),
    count: assignedFlameIds.length,
  });

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-lg font-semibold">{t('heading')}</h1>
          {assignedFlameIds.length > 0 && (
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {summary}
            </span>
          )}
        </div>

        <AssignedFlamesZone
          flames={assignedFlames}
          onRemove={handleRemove}
          allocations={allocations}
          onAllocationChange={handleAllocationChange}
          skipExitForId={skipExitForId}
        />

        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            {t('availableHeading')}
          </h2>
          <MyFlamesZone>
            <AnimatePresence mode="popLayout" initial={false}>
              {availableFlames.map((flame) => (
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
                  // While skipping the exit animation, hide the source slot
                  // immediately so siblings reflow without the flash that
                  // would otherwise occur between dnd-kit clearing
                  // `isDragging` and the next state-driven render.
                  style={
                    skipExitForId === flame.id ? { display: 'none' } : undefined
                  }
                >
                  <DraggableFlameCard
                    flame={flame}
                    level={flameLevels.get(flame.id) ?? 1}
                    onClick={() => handlePoolClickAssign(flame.id)}
                  />
                </motion.div>
              ))}
              <motion.button
                key="create-new-flame"
                type="button"
                layout="position"
                transition={SLIDE_TRANSITION}
                onClick={() => setCreateOpen(true)}
                className={cn(
                  'flex w-28 shrink-0 sm:w-36 flex-col overflow-hidden',
                  'rounded-xl border border-dashed border-border bg-card/40',
                  'text-muted-foreground transition-colors',
                  'hover:border-amber-400/60 hover:bg-amber-500/5',
                  'hover:text-amber-600 dark:hover:text-amber-400',
                )}
                aria-label={t('createNewFlame')}
              >
                {/* Header spacer — mirrors mini FlameCard header (name + level) */}
                <div
                  className="px-1.5 pt-2 sm:px-2 invisible"
                  aria-hidden="true"
                >
                  <div className="text-center font-semibold leading-tight text-xs sm:text-sm">
                    .
                  </div>
                  <div className="text-center text-[10px] sm:text-xs">.</div>
                </div>

                {/* Flame area — same height as mini FlameCard, holds the affordance */}
                <div className="flex h-20 sm:h-28 flex-col items-center justify-center gap-1.5">
                  <PlusIcon className="size-6" />
                  <span className="text-xs font-medium">
                    {t('createNewFlame')}
                  </span>
                </div>

                {/* Footer spacer — mirrors mini FlameCard footer */}
                <div
                  className="bg-muted/40 px-1.5 py-1.5 sm:px-2 invisible"
                  aria-hidden="true"
                >
                  <div className="text-center text-[10px] sm:text-xs">.</div>
                </div>
              </motion.button>
            </AnimatePresence>
          </MyFlamesZone>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={assignedFlameIds.length === 0}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {t('reset')}
          </button>
          <Button
            onClick={handleLockIn}
            disabled={assignedFlameIds.length === 0 || submitting}
            size="lg"
          >
            {t('confirm')}
          </Button>
        </div>
      </div>

      <CreateFlameDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(flame) => {
          setAssignedFlameIds((prev) => [...prev, flame.id]);
          setAllocations((prev) => ({ ...prev, [flame.id]: DEFAULT_MINUTES }));
          setCreateOpen(false);
        }}
      />

      {/* DragOverlay renders a floating clone of the dragged flame at the
          cursor. The source DraggableFlameCard hides itself via opacity:0
          while isDragging, so the user sees the overlay instead. On drop,
          the overlay disappears with a snap and AnimatePresence handles the
          source removal / target insertion — no transform-release flash. */}
      <DragOverlay dropAnimation={null}>
        {activeFlame ? (
          <FlameCard
            flame={activeFlame}
            level={flameLevels.get(activeFlame.id) ?? 1}
            size="mini"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

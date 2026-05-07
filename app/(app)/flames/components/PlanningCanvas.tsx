'use client';

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { PlusIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { Flame } from '@/lib/supabase/rows';
import { formatDuration } from '@/lib/time';
import { setDailyPlan } from '../actions';
import { CreateFlameDialog } from './CreateFlameDialog';
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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const flameId = String(active.id);

      if (over.id === ASSIGNED_FLAME_ZONE_ID) {
        if (assignedFlameIds.includes(flameId)) return;
        const seconds = lastUsedTargetsByFlameId[flameId];
        const minutes =
          seconds != null ? Math.round(seconds / 60) : DEFAULT_MINUTES;
        setAssignedFlameIds((prev) => [...prev, flameId]);
        setAllocations((prev) => ({ ...prev, [flameId]: minutes }));
      } else if (over.id === MY_FLAMES_ZONE_ID) {
        setAssignedFlameIds((prev) => prev.filter((id) => id !== flameId));
        setAllocations((prev) => {
          const next = { ...prev };
          delete next[flameId];
          return next;
        });
      }
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
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
        />

        <div className="space-y-1.5">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('availableHeading')}
          </h2>
          <MyFlamesZone>
            {availableFlames.map((flame) => (
              <DraggableFlameCard
                key={flame.id}
                flame={flame}
                level={flameLevels.get(flame.id) ?? 1}
              />
            ))}
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1 self-center rounded-full border border-dashed border-border px-3 py-1.5 text-xs hover:bg-muted/40 transition-colors"
            >
              <PlusIcon className="size-3" />
              {t('createNewFlame')}
            </button>
          </MyFlamesZone>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={assignedFlameIds.length === 0}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {t('clear')}
          </button>
          <Button
            onClick={handleLockIn}
            disabled={assignedFlameIds.length === 0 || submitting}
            size="lg"
          >
            {t('lockIn')}
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
    </DndContext>
  );
}

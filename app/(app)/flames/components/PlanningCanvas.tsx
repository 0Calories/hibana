'use client';

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { Flame } from '@/lib/supabase/rows';
import { cn } from '@/lib/utils';
import { setDailyPlan } from '../actions';
import { getFlameColors } from '../utils/colors';
import { CreateFlameDialog } from './CreateFlameDialog';
import { MinutesPill } from './MinutesPill';
import { PlanSumBar } from './PlanSumBar';
import { StaticFlameIcon } from './StaticFlameIcon';

interface PlanningCanvasProps {
  /** All non-archived flames (planned + unplanned). */
  flames: Flame[];
  /** Today's date (YYYY-MM-DD, server-resolved). */
  date: string;
  /** Pre-resolved last-used target_seconds per flame, fall back to undefined. */
  lastUsedTargetsByFlameId: Record<string, number | undefined>;
}

const LINEUP_ZONE_ID = 'planning-lineup-zone';
const POOL_ZONE_ID = 'planning-pool-zone';

type Pick = { flame: Flame; targetSeconds: number };

export function PlanningCanvas({
  flames,
  date,
  lastUsedTargetsByFlameId,
}: PlanningCanvasProps) {
  const t = useTranslations('flames.plan');
  const [picks, setPicks] = useState<Pick[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingTargetForNew, _setPendingTargetForNew] = useState<number>(
    30 * 60,
  );
  const [submitting, setSubmitting] = useState(false);

  const pickedIds = new Set(picks.map((p) => p.flame.id));
  const pool = flames.filter((f) => !pickedIds.has(f.id));

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

      if (over.id === LINEUP_ZONE_ID) {
        if (pickedIds.has(flameId)) return;
        const flame = flames.find((f) => f.id === flameId);
        if (!flame) return;
        const target = lastUsedTargetsByFlameId[flameId] ?? 30 * 60; // 30 min default
        setPicks((prev) => [...prev, { flame, targetSeconds: target }]);
      } else if (over.id === POOL_ZONE_ID) {
        setPicks((prev) => prev.filter((p) => p.flame.id !== flameId));
      }
    },
    [flames, lastUsedTargetsByFlameId, pickedIds],
  );

  const handleRemove = (flameId: string) => {
    setPicks((prev) => prev.filter((p) => p.flame.id !== flameId));
  };

  const handleSetMinutes = (flameId: string, seconds: number) => {
    setPicks((prev) =>
      prev.map((p) =>
        p.flame.id === flameId ? { ...p, targetSeconds: seconds } : p,
      ),
    );
  };

  const handleLockIn = async () => {
    if (picks.length === 0) return;
    setSubmitting(true);
    const result = await setDailyPlan(
      date,
      picks.map((p) => ({
        flameId: p.flame.id,
        targetSeconds: p.targetSeconds,
      })),
    );
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error.message, { position: 'top-center' });
      return;
    }
    // Page revalidates and re-renders into State 2 (tending grid).
  };

  const handleClear = () => setPicks([]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold">{t('heading')}</h1>

        <PlanSumBar picks={picks} />

        <LineupDropZone>
          {picks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('lineupEmpty')}
            </p>
          ) : (
            picks.map((p) => (
              <LineupCard
                key={p.flame.id}
                flame={p.flame}
                targetSeconds={p.targetSeconds}
                onChangeSeconds={(s) => handleSetMinutes(p.flame.id, s)}
                onRemove={() => handleRemove(p.flame.id)}
              />
            ))
          )}
        </LineupDropZone>

        <PoolDropZone>
          {pool.map((flame) => (
            <DraggablePoolChip key={flame.id} flame={flame} />
          ))}
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs',
              'hover:bg-muted/40 transition-colors',
            )}
          >
            <PlusIcon className="size-3" />
            {t('createNewFlame')}
          </button>
        </PoolDropZone>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={picks.length === 0}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {t('clear')}
          </button>
          <Button
            onClick={handleLockIn}
            disabled={picks.length === 0 || submitting}
            size="lg"
          >
            {t('lockIn')}
          </Button>
        </div>
      </div>

      <CreateFlameDialog
        open={createOpen}
        onOpenChange={(open) => setCreateOpen(open)}
        onCreated={(flame) => {
          setPicks((prev) => [
            ...prev,
            { flame, targetSeconds: pendingTargetForNew },
          ]);
          setCreateOpen(false);
        }}
      />
    </DndContext>
  );
}

function LineupDropZone({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: LINEUP_ZONE_ID });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-2 transition-colors',
        isOver && 'bg-amber-500/10',
      )}
    >
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function PoolDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: POOL_ZONE_ID });
  return (
    <div ref={setNodeRef} className="flex flex-wrap gap-2">
      {children}
    </div>
  );
}

interface LineupCardProps {
  flame: Flame;
  targetSeconds: number;
  onChangeSeconds: (s: number) => void;
  onRemove: () => void;
}

function LineupCard({
  flame,
  targetSeconds,
  onChangeSeconds,
  onRemove,
}: LineupCardProps) {
  // Whole card is the drag handle (no visible grip).
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: flame.id });

  const colors = getFlameColors(flame.color);

  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2',
        isDragging && 'opacity-50',
      )}
      {...attributes}
      {...listeners}
    >
      <StaticFlameIcon level={1} colors={colors} className="size-7 shrink-0" />
      <span className="flex-1 truncate text-sm font-medium">{flame.name}</span>
      <MinutesPill value={targetSeconds} onChange={onChangeSeconds} />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="size-6 rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Remove from lineup"
      >
        ×
      </button>
    </div>
  );
}

function DraggablePoolChip({ flame }: { flame: Flame }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: flame.id });
  const colors = getFlameColors(flame.color);
  return (
    <button
      ref={setNodeRef}
      type="button"
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs',
        'hover:bg-muted/40 transition-colors',
        isDragging && 'opacity-50',
      )}
      {...attributes}
      {...listeners}
    >
      <span
        className="size-3 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${colors.medium}, ${colors.light})`,
        }}
      />
      {flame.name}
    </button>
  );
}

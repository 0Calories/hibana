'use client';

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, FlameIcon, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn, parseLocalDate } from '@/lib/utils';
import {
  type DayPlan,
  type FlameWithSchedule,
  setWeeklyOverride,
} from '../actions';
import { ASSIGNED_FLAME_ZONE_ID, MY_FLAMES_ZONE_ID } from './constants';
import { DayRowFuelBar } from './DayRowFuelBar';
import { AssignedFlamesZone } from './dialog/AssignedFlamesZone';
import { DraggableFlame } from './dialog/DraggableFlame';
import { FuelSlider } from './dialog/FuelSlider';
import { MyFlamesZone } from './dialog/MyFlamesZone';
import { MiniFlameCard } from './MiniFlameCard';

interface DayRowProps {
  day: DayPlan;
  flames: FlameWithSchedule[];
  isToday: boolean;
  isPast: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  weekStart: string;
  onUpdate: (day: DayPlan) => void;
}

export function DayRow({
  day,
  flames,
  isToday,
  isPast,
  isExpanded,
  onToggleExpand,
  weekStart,
  onUpdate,
}: DayRowProps) {
  const t = useTranslations('schedule');
  const date = parseLocalDate(day.date);

  // Locale-aware formatted dates — full on desktop, compact on mobile
  const dateLong = date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  const dateShort = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Fake levels — matches current behavior (i % 8 + 1)
  const flameLevels = useMemo(
    () => new Map(flames.map((f, i) => [f.id, (i % 8) + 1])),
    [flames],
  );

  const assignedFlames = useMemo(
    () =>
      day.assignedFlameIds
        .map((id) => flames.find((f) => f.id === id))
        .filter(Boolean) as FlameWithSchedule[],
    [flames, day.assignedFlameIds],
  );

  // --- Inline edit state ---
  const [fuelMinutes, setFuelMinutes] = useState(() => day.fuelMinutes ?? 0);
  const [assignedFlameIds, setAssignedFlameIds] = useState<string[]>(
    () => day.assignedFlameIds,
  );
  const [flameAllocations, setFlameAllocations] = useState<
    Record<string, number>
  >(() => day.flameAllocations);
  const [isDragging, setIsDragging] = useState(false);

  // Reset edit state when expansion changes or day data changes
  const resetState = useCallback(() => {
    setFuelMinutes(day.fuelMinutes ?? 0);
    setAssignedFlameIds(day.assignedFlameIds);
    setFlameAllocations(day.flameAllocations);
  }, [day]);

  const handleAllocationChange = useCallback(
    (flameId: string, minutes: number) => {
      setFlameAllocations((prev) => ({ ...prev, [flameId]: minutes }));
    },
    [],
  );

  // Sync edit state when day prop changes (e.g. after save)
  const editAssignedFlames = useMemo(
    () =>
      assignedFlameIds
        .map((id) => flames.find((f) => f.id === id))
        .filter(Boolean) as FlameWithSchedule[],
    [flames, assignedFlameIds],
  );

  const totalAllocatedFuel = useMemo(
    () =>
      editAssignedFlames.reduce(
        (sum, f) =>
          sum + (flameAllocations[f.id] ?? f.time_budget_minutes ?? 0),
        0,
      ),
    [editAssignedFlames, flameAllocations],
  );

  const isFuelLocked = isToday && day.fuelMinutes != null;
  const isOverCapacity = fuelMinutes > 0 && totalAllocatedFuel > fuelMinutes;

  const availableFlames = useMemo(
    () => flames.filter((f) => !f.is_daily && !assignedFlameIds.includes(f.id)),
    [flames, assignedFlameIds],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}${t('hours')} ${m}${t('minutes')}`;
    if (h > 0) return `${h}${t('hours')}`;
    return `${m}${t('minutes')}`;
  };

  const formatFuelBrief = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    if (!over) return;

    const flameId = active.id as string;

    if (over.id === ASSIGNED_FLAME_ZONE_ID) {
      if (assignedFlameIds.includes(flameId)) return;
      const flame = flames.find((f) => f.id === flameId);
      if (!flame) return;
      setAssignedFlameIds((prev) => [...prev, flameId]);
      setFlameAllocations((prev) => ({
        ...prev,
        [flameId]: flame.time_budget_minutes ?? 0,
      }));
    } else if (over.id === MY_FLAMES_ZONE_ID) {
      const flame = flames.find((f) => f.id === flameId);
      if (!flame || flame.is_daily) return;
      setAssignedFlameIds((prev) => prev.filter((id) => id !== flameId));
      setFlameAllocations((prev) => {
        const next = { ...prev };
        delete next[flameId];
        return next;
      });
    }
  };

  const handleRemoveFlame = useCallback((flameId: string) => {
    setAssignedFlameIds((prev) => prev.filter((id) => id !== flameId));
    setFlameAllocations((prev) => {
      const next = { ...prev };
      delete next[flameId];
      return next;
    });
  }, []);

  const handleSave = async () => {
    const toastId = toast.loading(t('saving'), { position: 'top-center' });

    const effectiveMinutes = isFuelLocked
      ? (day.fuelMinutes ?? 0)
      : fuelMinutes;

    const flameMinutes = assignedFlameIds.map(
      (id) => flameAllocations[id] ?? 0,
    );

    const result = await setWeeklyOverride(
      weekStart,
      day.dayOfWeek,
      effectiveMinutes,
      assignedFlameIds,
      flameMinutes,
    );

    if (!result.success) {
      toast.error(result.error.message, {
        id: toastId,
        position: 'top-center',
      });
      return;
    }

    onUpdate({
      ...day,
      fuelMinutes: effectiveMinutes,
      isOverride: true,
      assignedFlameIds: assignedFlameIds,
      flameAllocations: { ...flameAllocations },
    });

    toast.success(t('saved', { day: dateLong }), {
      id: toastId,
      position: 'top-center',
    });
    onToggleExpand(); // collapse after save
  };

  const handleResetToDefault = () => {
    const defaultFlames = flames.filter((f) => {
      if (f.is_daily) return true;
      return f.defaultSchedule.includes(day.dayOfWeek);
    });

    setAssignedFlameIds(defaultFlames.map((f) => f.id));

    const defaultAllocations: Record<string, number> = {};
    for (const f of defaultFlames) {
      if (f.time_budget_minutes != null) {
        defaultAllocations[f.id] = f.time_budget_minutes;
      }
    }
    setFlameAllocations(defaultAllocations);
  };

  const handleToggle = () => {
    if (isPast) return;
    if (isExpanded) {
      resetState();
    }
    onToggleExpand();
  };

  return (
    <div
      className={cn(
        'rounded-xl border transition-all',
        isPast && 'opacity-60',
        isToday &&
          'border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
        !isToday && 'border-border',
        day.isOverride && 'border-dashed',
        isExpanded && 'ring-1 ring-amber-500/20',
      )}
    >
      {/* Collapsed header — always visible */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPast}
        className={cn(
          'flex w-full min-h-[44px] items-center gap-3 p-3 sm:p-4 text-left transition-colors',
          isPast ? 'cursor-default' : 'cursor-pointer',
          !isPast && !isExpanded && 'hover:bg-muted/30 active:bg-muted/50',
        )}
      >
        {/* Day name + date */}
        <div className="flex items-baseline gap-2 shrink-0">
          <span
            className={cn(
              'hidden sm:inline text-base font-semibold',
              isToday && 'text-amber-500',
            )}
          >
            {dateLong}
          </span>
          <span
            className={cn(
              'sm:hidden text-base font-semibold',
              isToday && 'text-amber-500',
            )}
          >
            {dateShort}
          </span>
          {isToday && (
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold tracking-wide text-amber-500">
              {t('today')}
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Fuel budget text */}
        <span
          className={cn(
            'text-sm tabular-nums shrink-0',
            day.fuelMinutes != null
              ? 'text-muted-foreground'
              : 'text-muted-foreground/50',
          )}
        >
          {day.fuelMinutes != null
            ? formatFuelBrief(day.fuelMinutes)
            : t('noBudgetSet')}
        </span>

        {/* Expand chevron */}
        {!isPast && (
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-muted-foreground/50 transition-transform duration-200',
              isExpanded && 'rotate-180',
            )}
          />
        )}
      </button>

      {/* Fuel bar + flame cards — collapsed view (skip for past days) */}
      {!isExpanded && !isPast && (
        <div className="px-3 pb-4 sm:px-4 sm:pb-5 space-y-3">
          {day.fuelMinutes != null && day.fuelMinutes > 0 && (
            <DayRowFuelBar
              fuelMinutes={day.fuelMinutes}
              assignedFlames={assignedFlames}
              allocations={day.flameAllocations}
            />
          )}

          {assignedFlames.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {assignedFlames.map((flame) => {
                const level = flameLevels.get(flame.id) ?? 1;
                return (
                  <MiniFlameCard
                    key={flame.id}
                    flame={flame}
                    level={level}
                    budgetLabel={
                      (day.flameAllocations[flame.id] ??
                        flame.time_budget_minutes) != null
                        ? formatMinutes(
                            day.flameAllocations[flame.id] ??
                              flame.time_budget_minutes ??
                              0,
                          )
                        : undefined
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Expanded inline editor */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <DndContext
              sensors={sensors}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setIsDragging(false)}
            >
              <div
                className={cn(
                  'flex flex-col gap-5 px-3 pb-3 sm:px-4 sm:pb-4',
                  isDragging ? 'overflow-visible' : '',
                )}
              >
                {/* Fuel Budget Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {t('fuelBudget')}
                  </h3>
                  {isFuelLocked ? (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <Lock className="size-3.5 text-muted-foreground" />
                      <span className="text-sm">
                        {formatMinutes(day.fuelMinutes ?? 0)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t('fuelLocked')}
                      </span>
                    </div>
                  ) : (
                    <>
                      <FuelSlider
                        value={fuelMinutes}
                        onChange={setFuelMinutes}
                        assignedFlames={editAssignedFlames}
                        allocations={flameAllocations}
                        onAllocationChange={handleAllocationChange}
                        disabled={isFuelLocked}
                      />
                      {isToday && (
                        <p className="text-xs text-amber-500">
                          {t('fuelLockedWarning')}
                        </p>
                      )}
                    </>
                  )}
                  <p
                    className={cn(
                      'text-xs font-medium text-destructive',
                      isOverCapacity ? 'visible' : 'invisible',
                    )}
                  >
                    {t('overCapacity')}
                  </p>
                </div>

                {/* Assigned Flames */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <FlameIcon className="size-3.5 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {t('assigned')}
                    </h3>
                    <span className="text-xs text-muted-foreground/60">
                      {t('assignedHint')}
                    </span>
                  </div>
                  <AssignedFlamesZone
                    flames={editAssignedFlames}
                    onRemove={handleRemoveFlame}
                    allocations={flameAllocations}
                    onAllocationChange={handleAllocationChange}
                  />
                </div>

                {/* Available Flames Grid */}
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {t('flames')}
                  </h3>
                  <MyFlamesZone>
                    {availableFlames.map((flame) => (
                      <DraggableFlame
                        key={flame.id}
                        flame={flame}
                        level={flameLevels.get(flame.id) ?? 1}
                        disabled={false}
                      />
                    ))}
                  </MyFlamesZone>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="mr-auto cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t('resetToDefault')}
                  </button>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="cursor-pointer min-h-[44px] px-6"
                  >
                    {t('save')}
                  </Button>
                </div>
              </div>
            </DndContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

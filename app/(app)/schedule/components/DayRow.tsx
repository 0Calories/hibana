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
import { FlameIcon, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FlameRenderer } from '@/app/(app)/flames/components/flame-card/effects/FlameRenderer';
import type { FlameColorName } from '@/app/(app)/flames/utils/colors';
import { getFlameColors } from '@/app/(app)/flames/utils/colors';
import { getFlameLevel } from '@/app/(app)/flames/utils/levels';
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
  const [isDragging, setIsDragging] = useState(false);

  // Reset edit state when expansion changes or day data changes
  const resetState = useCallback(() => {
    setFuelMinutes(day.fuelMinutes ?? 0);
    setAssignedFlameIds(day.assignedFlameIds);
  }, [day]);

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
        (sum, f) => sum + (f.time_budget_minutes ?? 0),
        0,
      ),
    [editAssignedFlames],
  );

  const remainingCapacity = fuelMinutes - totalAllocatedFuel;
  const isFuelLocked = isToday && day.fuelMinutes != null;
  const isOverCapacity = fuelMinutes > 0 && totalAllocatedFuel > fuelMinutes;

  const canAddFlame = useCallback(
    (flame: FlameWithSchedule) => {
      if (fuelMinutes === 0) return true;
      return remainingCapacity >= (flame.time_budget_minutes ?? 0);
    },
    [fuelMinutes, remainingCapacity],
  );

  const availableFlames = useMemo(
    () => flames.filter((f) => !f.is_daily && !assignedFlameIds.includes(f.id)),
    [flames, assignedFlameIds],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
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
      if (!flame || !canAddFlame(flame)) return;
      setAssignedFlameIds((prev) => [...prev, flameId]);
    } else if (over.id === MY_FLAMES_ZONE_ID) {
      const flame = flames.find((f) => f.id === flameId);
      if (!flame || flame.is_daily) return;
      setAssignedFlameIds((prev) => prev.filter((id) => id !== flameId));
    }
  };

  const handleRemoveFlame = useCallback((flameId: string) => {
    setAssignedFlameIds((prev) => prev.filter((id) => id !== flameId));
  }, []);

  const handleSave = async () => {
    const toastId = toast.loading(t('saving'), { position: 'top-center' });

    const effectiveMinutes = isFuelLocked
      ? (day.fuelMinutes ?? 0)
      : fuelMinutes;

    const result = await setWeeklyOverride(
      weekStart,
      day.dayOfWeek,
      effectiveMinutes,
      assignedFlameIds,
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
    });

    toast.success(t('saved', { day: dateLong }), {
      id: toastId,
      position: 'top-center',
    });
    onToggleExpand(); // collapse after save
  };

  const handleResetToDefault = () => {
    const defaultFlameIds = flames
      .filter((f) => {
        if (f.is_daily) return true;
        return f.defaultSchedule.includes(day.dayOfWeek);
      })
      .map((f) => f.id);

    setAssignedFlameIds(defaultFlameIds);
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
          isPast
            ? 'cursor-default'
            : 'cursor-pointer',
          !isPast && !isExpanded && 'hover:bg-muted/30 active:bg-muted/50',
        )}
      >
        {/* Day name + date */}
        <div className="flex items-baseline gap-2 shrink-0">
          <span className={cn(
            'hidden sm:inline text-base font-semibold',
            isToday && 'text-amber-500',
          )}>
            {dateLong}
          </span>
          <span className={cn(
            'sm:hidden text-base font-semibold',
            isToday && 'text-amber-500',
          )}>
            {dateShort}
          </span>
          {isToday && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-500">
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
      </button>

      {/* Fuel bar + flame chips — collapsed view */}
      {!isExpanded && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-2">
          {day.fuelMinutes != null && day.fuelMinutes > 0 && (
            <DayRowFuelBar
              fuelMinutes={day.fuelMinutes}
              assignedFlames={assignedFlames}
            />
          )}

          {assignedFlames.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {assignedFlames.map((flame) => {
                const colors = getFlameColors(flame.color as FlameColorName);
                const level = flameLevels.get(flame.id) ?? 1;
                const levelInfo = getFlameLevel(level);
                return (
                  <div
                    key={flame.id}
                    className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-2 py-1"
                  >
                    <FlameRenderer
                      state="untended"
                      level={level}
                      colors={colors}
                      className="h-12 w-10 sm:h-16 sm:w-14 md:h-24 md:w-20"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate max-w-[8rem]">
                        {flame.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Lv. {level} · {levelInfo.name}
                        {flame.time_budget_minutes != null && (
                          <> · {formatMinutes(flame.time_budget_minutes)}</>
                        )}
                      </span>
                    </div>
                  </div>
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
                        disabled={!canAddFlame(flame)}
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

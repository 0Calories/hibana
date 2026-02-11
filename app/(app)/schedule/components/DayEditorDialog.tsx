'use client';

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getLocalDateString } from '@/lib/utils';
import {
  type DayPlan,
  type FlameWithSchedule,
  setWeeklyOverride,
} from '../actions';
import { AssignedFlamesZone } from './AssignedFlamesZone';
import { DraggableFlame } from './DraggableFlame';
import { FuelSlider } from './FuelSlider';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

interface DayEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: DayPlan;
  flames: FlameWithSchedule[];
  weekStart: string;
  onUpdate: (day: DayPlan) => void;
}

export function DayEditorDialog({
  open,
  onOpenChange,
  day,
  flames,
  weekStart,
  onUpdate,
}: DayEditorDialogProps) {
  const t = useTranslations('schedule');
  const today = getLocalDateString();
  const isToday = day.date === today;

  // Fuel budget state (in minutes)
  const [fuelMinutes, setFuelMinutes] = useState(() => day.fuelMinutes ?? 0);

  // Flame assignments state
  const [assignedIds, setAssignedIds] = useState<string[]>(
    () => day.assignedFlameIds,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Reset state when day changes
  const resetState = useCallback(() => {
    setFuelMinutes(day.fuelMinutes ?? 0);
    setAssignedIds(day.assignedFlameIds);
  }, [day]);

  // Track whether fuel is "locked" for today
  const isFuelLocked = isToday && day.fuelMinutes != null;

  // Capacity calculations
  const assignedFlames = useMemo(
    () => flames.filter((f) => assignedIds.includes(f.id)),
    [flames, assignedIds],
  );

  const totalAllocated = useMemo(
    () =>
      assignedFlames.reduce((sum, f) => sum + (f.time_budget_minutes ?? 0), 0),
    [assignedFlames],
  );

  const remainingCapacity = fuelMinutes - totalAllocated;

  const canAddFlame = useCallback(
    (flame: FlameWithSchedule) => {
      if (fuelMinutes === 0) return true; // No budget set = no restriction
      return remainingCapacity >= (flame.time_budget_minutes ?? 0);
    },
    [fuelMinutes, remainingCapacity],
  );

  // Map flame id → level based on index in the full flames array
  const flameLevels = useMemo(
    () => new Map(flames.map((f, i) => [f.id, (i % 8) + 1])),
    [flames],
  );

  // Flames available to drag (not assigned, not daily)
  const availableFlames = useMemo(
    () =>
      flames.filter(
        (f) => !f.is_daily && !assignedIds.includes(f.id),
      ),
    [flames, assignedIds],
  );

  const formatMinutes = (total: number) => {
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h > 0 && m > 0) return `${h}${t('hours')} ${m}${t('minutes')}`;
    if (h > 0) return `${h}${t('hours')}`;
    return `${m}${t('minutes')}`;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || over.id !== 'assigned-zone') return;

    const flameId = active.id as string;
    if (assignedIds.includes(flameId)) return;

    const flame = flames.find((f) => f.id === flameId);
    if (!flame) return;

    // Check capacity
    if (!canAddFlame(flame)) return;

    setAssignedIds((prev) => [...prev, flameId]);
  };

  const handleRemoveFlame = useCallback((flameId: string) => {
    setAssignedIds((prev) => prev.filter((id) => id !== flameId));
  }, []);

  const handleSave = async () => {
    const toastId = toast.loading(`${t('save')}...`, {
      position: 'top-center',
    });

    const effectiveMinutes = isFuelLocked
      ? (day.fuelMinutes ?? 0)
      : fuelMinutes;

    const result = await setWeeklyOverride(
      weekStart,
      day.dayOfWeek,
      effectiveMinutes,
      assignedIds,
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
      assignedFlameIds: assignedIds,
    });

    toast.success(t('save'), { id: toastId, position: 'top-center' });
    onOpenChange(false);
  };

  const handleResetToDefault = () => {
    const defaultFlameIds = flames
      .filter((f) => {
        if (f.is_daily) return true;
        return f.defaultSchedule.includes(day.dayOfWeek);
      })
      .map((f) => f.id);

    setAssignedIds(defaultFlameIds);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetState();
        onOpenChange(o);
      }}
    >
      <DialogContent className="flex max-h-[85vh] flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {DAY_NAMES[day.dayOfWeek]}
            <span className="text-xs font-normal text-muted-foreground">
              {day.date}
            </span>
            {isToday && (
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500">
                {t('today')}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
            {/* Fuel Budget Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground">
                {t('fuelBudget')}
              </h3>
              {isFuelLocked ? (
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <Lock className="size-3.5 text-muted-foreground" />
                  <span className="text-sm">
                    {formatMinutes(day.fuelMinutes ?? 0)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {t('fuelLocked')}
                  </span>
                </div>
              ) : (
                <>
                  <FuelSlider
                    value={fuelMinutes}
                    onChange={setFuelMinutes}
                    allocatedMinutes={totalAllocated}
                    disabled={isFuelLocked}
                  />
                  {isToday && (
                    <p className="text-[10px] text-amber-500">
                      {t('fuelLockedWarning')}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Assigned Flames */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-medium text-muted-foreground">
                {t('assigned')}
              </h3>
              <AssignedFlamesZone
                flames={assignedFlames}
                flameLevels={flameLevels}
                onRemove={handleRemoveFlame}
              />
            </div>

            {/* Available Flames Grid */}
            {availableFlames.length > 0 && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-medium text-muted-foreground">
                  {t('flames')}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {availableFlames.map((flame) => (
                    <DraggableFlame
                      key={flame.id}
                      flame={flame}
                      level={flameLevels.get(flame.id) ?? 1}
                      disabled={!canAddFlame(flame)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

        </DndContext>

        <DialogFooter>
          <button
            type="button"
            onClick={handleResetToDefault}
            className="mr-auto text-xs text-muted-foreground hover:text-foreground"
          >
            {t('resetToDefault')}
          </button>
          <Button onClick={handleSave} size="sm">
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

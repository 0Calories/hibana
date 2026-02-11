'use client';

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { FlameIcon, Lock } from 'lucide-react';
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
import { ASSIGNED_FLAME_ZONE_ID, MY_FLAMES_ZONE_ID } from './constants';
import { DraggableFlame } from './DraggableFlame';
import { FlamesDropZone } from './FlamesDropZone';
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
  const [fuelMinutes, setFuelMinutes] = useState(() => day.fuelMinutes ?? 0);
  const [assignedFlameIds, setAssignedFlameIds] = useState<string[]>(
    () => day.assignedFlameIds,
  );

  // Track whether a drag is active to lock scroll
  const [isDragging, setIsDragging] = useState(false);

  // Map flame id → level based on index in the full flames array
  // This is only for testing purposes and must be replaced by actual levels once the data model for flames is updated
  const flameLevels = useMemo(
    () => new Map(flames.map((f, i) => [f.id, (i % 8) + 1])),
    [flames],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Reset state when day changes
  const resetState = useCallback(() => {
    setFuelMinutes(day.fuelMinutes ?? 0);
    setAssignedFlameIds(day.assignedFlameIds);
  }, [day]);

  // Track whether fuel is "locked" for today
  const isFuelLocked = isToday && day.fuelMinutes != null;

  // Capacity calculations — preserve assignment order
  const assignedFlames = useMemo(
    () =>
      assignedFlameIds
        .map((id) => flames.find((f) => f.id === id))
        .filter(Boolean) as FlameWithSchedule[],
    [flames, assignedFlameIds],
  );

  const totalAllocatedFuel = useMemo(
    () =>
      assignedFlames.reduce((sum, f) => sum + (f.time_budget_minutes ?? 0), 0),
    [assignedFlames],
  );

  const remainingCapacity = fuelMinutes - totalAllocatedFuel;

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

  const formatMinutes = (total: number) => {
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h > 0 && m > 0) return `${h}${t('hours')} ${m}${t('minutes')}`;
    if (h > 0) return `${h}${t('hours')}`;
    return `${m}${t('minutes')}`;
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

  const isOverCapacity = fuelMinutes > 0 && totalAllocatedFuel > fuelMinutes;

  const handleSave = async () => {
    const toastId = toast.loading(t('saving'), {
      position: 'top-center',
    });

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

    toast.success(t('saved', { day: DAY_NAMES[day.dayOfWeek] }), {
      id: toastId,
      position: 'top-center',
    });
    onOpenChange(false);
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

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetState();
        onOpenChange(o);
      }}
    >
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold">
                {DAY_NAMES[day.dayOfWeek]}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {day.date}
              </span>
              {isToday && (
                <span className="relative -top-px rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-500">
                  {t('today')}
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <DndContext
          sensors={sensors}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setIsDragging(false)}
        >
          <div
            className={`flex min-h-0 flex-1 flex-col gap-5 ${isDragging ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}
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
                    assignedFlames={assignedFlames}
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
                className={`text-xs font-medium text-destructive ${isOverCapacity ? 'visible' : 'invisible'}`}
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
                flames={assignedFlames}
                onRemove={handleRemoveFlame}
              />
            </div>

            {/* Available Flames Grid — always rendered so drop target exists */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('flames')}
              </h3>
              <FlamesDropZone>
                {availableFlames.map((flame) => (
                  <DraggableFlame
                    key={flame.id}
                    flame={flame}
                    level={flameLevels.get(flame.id) ?? 1}
                    disabled={!canAddFlame(flame)}
                  />
                ))}
              </FlamesDropZone>
            </div>
          </div>
        </DndContext>

        <DialogFooter>
          <button
            type="button"
            onClick={handleResetToDefault}
            className="mr-auto cursor-pointer text-sm text-muted-foreground hover:text-foreground"
          >
            {t('resetToDefault')}
          </button>
          <Button onClick={handleSave} size="sm" className="cursor-pointer">
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

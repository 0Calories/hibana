'use client';

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
import { Input } from '@/components/ui/input';
import { getLocalDateString } from '@/lib/utils';
import {
  type DayPlan,
  type FlameWithSchedule,
  setWeeklyOverride,
} from '../actions';
import { FlameToggleRow } from './FlameToggleRow';

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

  // Fuel budget state
  const [hours, setHours] = useState(() =>
    day.fuelMinutes != null ? Math.floor(day.fuelMinutes / 60) : 0,
  );
  const [mins, setMins] = useState(() =>
    day.fuelMinutes != null ? day.fuelMinutes % 60 : 0,
  );

  // Flame assignments state
  const [assignedIds, setAssignedIds] = useState<string[]>(
    () => day.assignedFlameIds,
  );

  // Reset state when day changes
  const resetState = useCallback(() => {
    setHours(day.fuelMinutes != null ? Math.floor(day.fuelMinutes / 60) : 0);
    setMins(day.fuelMinutes != null ? day.fuelMinutes % 60 : 0);
    setAssignedIds(day.assignedFlameIds);
  }, [day]);

  // Track whether fuel is "locked" for today (already set via override or default)
  const isFuelLocked = isToday && day.fuelMinutes != null;

  const totalFuelMinutes = hours * 60 + mins;

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

  const remainingCapacity = totalFuelMinutes - totalAllocated;

  const canAddFlame = useCallback(
    (flame: FlameWithSchedule) => {
      if (totalFuelMinutes === 0) return true; // No budget set = no restriction
      return remainingCapacity >= (flame.time_budget_minutes ?? 0);
    },
    [totalFuelMinutes, remainingCapacity],
  );

  const capacityRatio =
    totalFuelMinutes > 0 ? totalAllocated / totalFuelMinutes : 0;

  const handleToggleFlame = useCallback((flameId: string, checked: boolean) => {
    setAssignedIds((prev) =>
      checked ? [...prev, flameId] : prev.filter((id) => id !== flameId),
    );
  }, []);

  const handleSave = async () => {
    const toastId = toast.loading(`${t('save')}...`, {
      position: 'top-center',
    });

    const effectiveMinutes = isFuelLocked
      ? (day.fuelMinutes ?? 0)
      : totalFuelMinutes;

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

    // Optimistic update
    onUpdate({
      ...day,
      fuelMinutes: effectiveMinutes,
      isOverride: true,
      assignedFlameIds: assignedIds,
    });

    toast.success(t('save'), { id: toastId, position: 'top-center' });
    onOpenChange(false);
  };

  const handleResetToDefault = async () => {
    // Compute default flames for this day
    const defaultFlameIds = flames
      .filter((f) => {
        if (f.is_daily) return true;
        return f.defaultSchedule.includes(day.dayOfWeek);
      })
      .map((f) => f.id);

    setAssignedIds(defaultFlameIds);
  };

  const formatMinutes = (total: number) => {
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h > 0 && m > 0) return `${h}${t('hours')} ${m}${t('minutes')}`;
    if (h > 0) return `${h}${t('hours')}`;
    return `${m}${t('minutes')}`;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetState();
        onOpenChange(o);
      }}
    >
      <DialogContent className="flex max-h-[80vh] flex-col">
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
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={hours}
                    onChange={(e) =>
                      setHours(
                        Math.max(0, Number.parseInt(e.target.value, 10) || 0),
                      )
                    }
                    className="w-16 text-center"
                  />
                  <span className="text-xs text-muted-foreground">
                    {t('hours')}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={mins}
                    onChange={(e) =>
                      setMins(
                        Math.max(0, Number.parseInt(e.target.value, 10) || 0),
                      )
                    }
                    className="w-16 text-center"
                  />
                  <span className="text-xs text-muted-foreground">
                    {t('minutes')}
                  </span>
                </div>
                {isToday && (
                  <p className="text-[10px] text-amber-500">
                    {t('fuelLockedWarning')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Capacity indicator */}
          {totalFuelMinutes > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t('capacity')}
                </span>
                <span
                  className={`text-xs font-medium ${
                    capacityRatio > 1 ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  {formatMinutes(totalAllocated)} /{' '}
                  {formatMinutes(totalFuelMinutes)}
                  {capacityRatio >= 1 && ` — ${t('full')}`}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    capacityRatio > 1
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-amber-400 to-amber-600'
                  }`}
                  style={{
                    width: `${Math.min(capacityRatio * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Flame List */}
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-muted-foreground">
              {t('flames')}
            </h3>
            <div className="space-y-0.5">
              {flames.map((flame) => {
                const isAssigned = assignedIds.includes(flame.id);
                const wouldExceed = !isAssigned && !canAddFlame(flame);

                return (
                  <FlameToggleRow
                    key={flame.id}
                    flame={flame}
                    isAssigned={isAssigned}
                    isDisabled={wouldExceed}
                    disabledReason={wouldExceed ? t('exceeds') : undefined}
                    onToggle={(checked) => handleToggleFlame(flame.id, checked)}
                  />
                );
              })}
            </div>
          </div>
        </div>

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

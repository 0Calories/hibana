'use client';

import { useCallback, useState } from 'react';
import type { Flame, FlameSession } from '@/utils/supabase/rows';
import type { FuelBudgetStatus } from '../actions';
import { endSession, getAllSessionsForDate } from '../session-actions';
import { FlamesPageActions } from './FlamesPageActions';
import { FuelMeter } from './FuelMeter';
import { FlameCard } from './flame-card/FlameCard';
import { useFuel } from './hooks/useFuel';

interface FlamesListProps {
  flames: Flame[];
  initialSessions: FlameSession[];
  date: string;
  initialFuelBudget: FuelBudgetStatus;
}

export function FlamesList({
  flames,
  initialSessions,
  date,
  initialFuelBudget,
}: FlamesListProps) {
  const [sessions, setSessions] = useState<FlameSession[]>(initialSessions);

  const handleFuelDepleted = useCallback(
    async (activeFlameId: string) => {
      await endSession(activeFlameId, date);
      const result = await getAllSessionsForDate(date);
      if (result.success && result.data) {
        setSessions(result.data);
      }
    },
    [date],
  );

  const {
    budgetSeconds,
    remainingSeconds,
    isFuelDepleted,
    hasBudget,
    refetchFuel,
  } = useFuel({
    initialFuelBudget,
    sessions,
    date,
    onFuelDepleted: handleFuelDepleted,
  });

  const refreshSessions = useCallback(async () => {
    const result = await getAllSessionsForDate(date);
    if (result.success && result.data) {
      setSessions(result.data);
    }
    await refetchFuel();
  }, [date, refetchFuel]);

  const getSessionForFlame = (flameId: string): FlameSession | null => {
    return sessions.find((s) => s.flame_id === flameId) ?? null;
  };

  // Find which flame is currently burning (has a session with started_at but no ended_at)
  const activeFlameId =
    sessions.find((s) => s.started_at && !s.ended_at)?.flame_id ?? null;

  return (
    <div>
      <div className="sticky top-12 z-20 -mx-4 mb-4 px-4 pt-2 md:top-14">
        <div className="flex items-stretch gap-2">
          <div className="min-w-0 flex-1">
            <FuelMeter
              budgetSeconds={budgetSeconds}
              remainingSeconds={remainingSeconds}
              hasBudget={hasBudget}
              isBurning={activeFlameId !== null}
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 backdrop-blur-sm">
            <FlamesPageActions />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {flames.map((flame, index) => (
          <FlameCard
            key={flame.id}
            flame={flame}
            session={getSessionForFlame(flame.id)}
            date={date}
            onSessionUpdate={refreshSessions}
            isBlocked={activeFlameId !== null && activeFlameId !== flame.id}
            isFuelDepleted={isFuelDepleted || !hasBudget}
            level={(index % 8) + 1} // Demo: cycle through levels 1-8
          />
        ))}
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Flame, FlameSession } from '@/utils/supabase/rows';
import type { FuelBudgetStatus } from '../actions/fuel-actions';
import { endSession, getAllSessionsForDate } from '../session-actions';
import { FlameCard } from './FlameCard';
import { FuelMeter } from './FuelMeter';
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
  const refetchFuelRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const handleFuelDepleted = useCallback(
    async (activeFlameId: string) => {
      await endSession(activeFlameId, date);
      const result = await getAllSessionsForDate(date);
      if (result.success && result.data) {
        setSessions(result.data);
      }
      await refetchFuelRef.current();
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

  // Keep ref in sync
  refetchFuelRef.current = refetchFuel;

  const refreshSessions = useCallback(async () => {
    const result = await getAllSessionsForDate(date);
    if (result.success && result.data) {
      setSessions(result.data);
    }
    await refetchFuel();
  }, [date, refetchFuel]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const getSessionForFlame = (flameId: string): FlameSession | null => {
    return sessions.find((s) => s.flame_id === flameId) ?? null;
  };

  // Find which flame is currently active (has a session with started_at but no ended_at)
  const activeFlameId =
    sessions.find((s) => s.started_at && !s.ended_at)?.flame_id ?? null;

  return (
    <div>
      <FuelMeter
        budgetSeconds={budgetSeconds}
        remainingSeconds={remainingSeconds}
        hasBudget={hasBudget}
        isBurning={activeFlameId !== null}
      />
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

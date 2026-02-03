'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Flame, FlameSession } from '@/utils/supabase/rows';
import { getAllSessionsForDate } from '../session-actions';
import { FlameCard } from './FlameCard';

interface FlamesListProps {
  flames: Flame[];
  initialSessions: FlameSession[];
  date: string;
}

export function FlamesList({ flames, initialSessions, date }: FlamesListProps) {
  const [sessions, setSessions] = useState<FlameSession[]>(initialSessions);

  const refreshSessions = useCallback(async () => {
    const result = await getAllSessionsForDate(date);
    if (result.success && result.data) {
      setSessions(result.data);
    }
  }, [date]);

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
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {flames.map((flame, index) => (
        <FlameCard
          key={flame.id}
          flame={flame}
          session={getSessionForFlame(flame.id)}
          date={date}
          onSessionUpdate={refreshSessions}
          isBlocked={activeFlameId !== null && activeFlameId !== flame.id}
          level={(index % 8) + 1} // Demo: cycle through levels 1-8
        />
      ))}
    </div>
  );
}

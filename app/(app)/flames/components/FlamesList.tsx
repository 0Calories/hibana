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

  // Refresh sessions when date changes
  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const getSessionForFlame = (flameId: string): FlameSession | null => {
    return sessions.find((s) => s.flame_id === flameId) ?? null;
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {flames.map((flame) => (
        <FlameCard
          key={flame.id}
          flame={flame}
          session={getSessionForFlame(flame.id)}
          date={date}
          onSessionUpdate={refreshSessions}
        />
      ))}
    </div>
  );
}

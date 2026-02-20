'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FlameSession } from '@/utils/supabase/rows';
import {
  type FuelBudgetStatus,
  getRemainingFuelBudget,
} from '../../actions/flame-actions';

interface UseFuelOptions {
  initialFuelBudget: FuelBudgetStatus;
  sessions: FlameSession[];
  date: string;
  onFuelDepleted?: (activeFlameId: string) => void;
}

interface UseFuelReturn {
  budgetSeconds: number | null;
  remainingSeconds: number;
  isFuelDepleted: boolean;
  hasBudget: boolean;
  refetchFuel: () => Promise<void>;
}

export function useFuel({
  initialFuelBudget,
  sessions,
  date,
  onFuelDepleted,
}: UseFuelOptions): UseFuelReturn {
  const [serverBudget, setServerBudget] =
    useState<FuelBudgetStatus>(initialFuelBudget);
  const [liveElapsed, setLiveElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onFuelDepletedRef = useRef(onFuelDepleted);
  const hasFiredDepletedRef = useRef(false);

  // Keep callback ref fresh
  useEffect(() => {
    onFuelDepletedRef.current = onFuelDepleted;
  }, [onFuelDepleted]);

  const hasBudget = serverBudget !== null;
  const budgetSeconds = serverBudget ? serverBudget.budgetMinutes * 60 : null;
  const serverRemainingSeconds = serverBudget
    ? serverBudget.remainingMinutes * 60
    : 0;

  // Active session can be reliably determined by checking that it has an empty end time
  const activeSession = sessions.find((s) => s.started_at && !s.ended_at);

  // Reset depletion guard when sessions change (e.g. after auto-stop resolves)
  useEffect(() => {
    if (!activeSession) {
      hasFiredDepletedRef.current = false;
    }
  }, [activeSession]);

  // Track live elapsed time for active session
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!activeSession?.started_at || !hasBudget) {
      setLiveElapsed(0);
      return;
    }

    const startTime = new Date(activeSession.started_at).getTime();

    const tick = () => {
      const elapsed = Math.max(0, (Date.now() - startTime) / 1000);
      setLiveElapsed(elapsed);
    };

    tick(); // Immediate first tick
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeSession?.started_at, hasBudget]);

  // Compute live remaining
  const remainingSeconds = hasBudget
    ? Math.max(0, serverRemainingSeconds - liveElapsed)
    : 0;

  const isFuelDepleted = hasBudget && remainingSeconds <= 0;

  // Auto-stop when fuel depleted, then refetch to sync server state
  useEffect(() => {
    if (isFuelDepleted && activeSession && !hasFiredDepletedRef.current) {
      hasFiredDepletedRef.current = true;
      const flameId = activeSession.flame_id;
      (async () => {
        await onFuelDepletedRef.current?.(flameId);
        const result = await getRemainingFuelBudget(date);
        if (result.success) {
          setServerBudget(result.data);
        }
      })();
    }
  }, [isFuelDepleted, activeSession, date]);

  const refetchFuel = useCallback(async () => {
    const result = await getRemainingFuelBudget(date);
    if (result.success) {
      setServerBudget(result.data);
    }
  }, [date]);

  return {
    budgetSeconds,
    remainingSeconds,
    isFuelDepleted,
    hasBudget,
    refetchFuel,
  };
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Flame, FlameSession } from '@/utils/supabase/rows';
import { setFlameCompletion } from '../../actions/flame-actions';
import { endSession, startSession } from '../../session-actions';

export type FlameState =
  | 'untended'
  | 'active'
  | 'paused'
  | 'sealing'
  | 'completed';

interface UseFlameTimerOptions {
  flame: Flame;
  session: FlameSession | null;
  date: string;
  onSessionUpdate?: () => void;
}

interface UseFlameTimerReturn {
  state: FlameState;
  elapsedSeconds: number;
  targetSeconds: number;
  progress: number;
  toggle: () => Promise<void>;
  isLoading: boolean;
  isSealReady: boolean;
  beginSealing: () => void;
  cancelSealing: () => void;
  completeSeal: () => Promise<boolean>;
}

export function useFlameTimer({
  flame,
  session,
  date,
  onSessionUpdate,
}: UseFlameTimerOptions): UseFlameTimerReturn {
  const [state, setState] = useState<FlameState>('untended');
  const [isLoading, setIsLoading] = useState(false);
  const [localElapsed, setLocalElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const targetSeconds = (flame.time_budget_minutes ?? 0) * 60;

  const sealThresholdSeconds =
    'seal_threshold_minutes' in flame && flame.seal_threshold_minutes
      ? (flame.seal_threshold_minutes as number) * 60
      : (flame.time_budget_minutes ?? 0) * 30; // 50% of budget as default

  const deriveState = useCallback((): FlameState => {
    if (!session) return 'untended';
    if (session.is_completed) return 'completed';
    if (session.started_at && !session.ended_at) return 'active';
    if (session.ended_at) return 'paused';
    return 'untended';
  }, [session]);

  const calculateElapsed = useCallback((): number => {
    if (!session) return 0;

    let total = session.duration_seconds;

    // If session is active, add time since start
    if (session.started_at && !session.ended_at) {
      const startTime = new Date(session.started_at).getTime();
      const now = Date.now();
      const currentSessionSeconds = Math.floor((now - startTime) / 1000);
      total += currentSessionSeconds;
    }

    return total;
  }, [session]);

  // Update state when session changes, but don't override transient 'sealing' state
  useEffect(() => {
    setState((prev) => {
      if (prev === 'sealing') return prev;
      return deriveState();
    });
    setLocalElapsed(calculateElapsed());
  }, [deriveState, calculateElapsed]);

  // Timer interval for active state
  useEffect(() => {
    if (state === 'active') {
      intervalRef.current = setInterval(() => {
        setLocalElapsed((prev) => {
          const newElapsed = prev + 1;
          // Indicates overburn (going above budgeted time)
          if (targetSeconds > 0 && newElapsed >= targetSeconds) {
            // TODO: Add overburn warning state handling here
          }
          return newElapsed;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state, targetSeconds]);

  const toggle = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      switch (state) {
        case 'untended':
          await startSession(flame.id, date);
          setState('active');
          break;

        case 'active':
          await endSession(flame.id, date);
          setState('paused');
          break;

        case 'paused':
          await startSession(flame.id, date);
          setState('active');
          break;

        case 'completed':
        case 'sealing':
          // No action
          break;
      }

      onSessionUpdate?.();
    } catch (error) {
      console.error('Failed to toggle flame timer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isSealReady =
    state === 'paused' &&
    sealThresholdSeconds > 0 &&
    localElapsed >= sealThresholdSeconds;

  const beginSealing = () => {
    if (isSealReady) {
      setState('sealing');
    }
  };

  const cancelSealing = () => {
    if (state === 'sealing') {
      setState('paused');
    }
  };

  const completeSeal = async (): Promise<boolean> => {
    try {
      const result = await setFlameCompletion(flame.id, date, true);
      if (result.success) {
        setState('completed');
        onSessionUpdate?.();
        return true;
      }
      // Fall back to paused on failure
      setState('paused');
      return false;
    } catch {
      setState('paused');
      return false;
    }
  };

  const progress =
    targetSeconds > 0 ? Math.min(localElapsed / targetSeconds, 1) : 0;

  return {
    state,
    elapsedSeconds: localElapsed,
    targetSeconds,
    progress,
    toggle,
    isLoading,
    isSealReady,
    beginSealing,
    cancelSealing,
    completeSeal,
  };
}

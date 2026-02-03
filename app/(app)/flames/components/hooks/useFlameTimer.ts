'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Flame, FlameSession } from '@/utils/supabase/rows';
import { setFlameCompletion } from '../../flame-actions';
import { endSession, startSession } from '../../session-actions';

export type FlameState = 'idle' | 'active' | 'paused' | 'completed';

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
}

export function useFlameTimer({
  flame,
  session,
  date,
  onSessionUpdate,
}: UseFlameTimerOptions): UseFlameTimerReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [localElapsed, setLocalElapsed] = useState(0);
  const [state, setState] = useState<FlameState>('idle');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completionHandledRef = useRef(false);

  const targetSeconds = (flame.time_budget_minutes ?? 0) * 60;

  // Derive state from session data
  const deriveState = useCallback((): FlameState => {
    if (!session) return 'idle';
    if (session.is_completed) return 'completed';
    if (session.started_at && !session.ended_at) return 'active';
    if (session.ended_at) return 'paused';
    return 'idle';
  }, [session]);

  // Calculate elapsed time from session
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

  // Update state when session changes
  useEffect(() => {
    setState(deriveState());
    setLocalElapsed(calculateElapsed());
    completionHandledRef.current = false;
  }, [deriveState, calculateElapsed]);

  // Handle completion
  const handleCompletion = useCallback(async () => {
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;

    setState('completed');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // End the session and mark as completed
    await endSession(flame.id, date);
    await setFlameCompletion(flame.id, date, true);
    onSessionUpdate?.();
  }, [flame.id, date, onSessionUpdate]);

  // Timer interval for active state
  useEffect(() => {
    if (state === 'active') {
      intervalRef.current = setInterval(() => {
        setLocalElapsed((prev) => {
          const newElapsed = prev + 1;
          // Check for completion
          if (targetSeconds > 0 && newElapsed >= targetSeconds) {
            handleCompletion();
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
  }, [state, targetSeconds, handleCompletion]);

  const toggle = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      switch (state) {
        case 'idle':
          // Start a new session
          await startSession(flame.id, date);
          setState('active');
          break;

        case 'active':
          // Pause the session
          await endSession(flame.id, date);
          setState('paused');
          break;

        case 'paused':
          // Resume the session
          await startSession(flame.id, date);
          setState('active');
          break;

        case 'completed':
          // Already completed, no action
          break;
      }

      onSessionUpdate?.();
    } catch (error) {
      console.error('Failed to toggle flame timer:', error);
    } finally {
      setIsLoading(false);
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
  };
}

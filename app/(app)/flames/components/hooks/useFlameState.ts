'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Flame, FlameSession } from '@/utils/supabase/rows';
import { setFlameCompletion } from '../../actions';
import { endSession, startSession } from '../../session-actions';
import type { FlameState } from '../../utils/types';

const END_SESSION_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

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
  isOverburning: boolean;
  toggle: () => Promise<void>;
  isLoading: boolean;
  isSealReady: boolean;
  beginSealing: () => void;
  cancelSealing: () => void;
  completeSeal: () => Promise<boolean>;
}

export function useFlameState({
  flame,
  session,
  date,
  onSessionUpdate,
}: UseFlameTimerOptions): UseFlameTimerReturn {
  const t = useTranslations('flames.card');
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
    if (session.is_completed) return 'sealed';
    if (session.started_at && !session.ended_at) return 'burning';
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

  // Timer interval for active state — recalculate from timestamps each tick
  // to avoid setInterval drift that desynchronises the client display from
  // the server's exact duration_seconds (which matters for the completion
  // bonus threshold in spark reward calculations).
  useEffect(() => {
    if (state === 'burning') {
      intervalRef.current = setInterval(() => {
        setLocalElapsed(calculateElapsed());
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
  }, [state, calculateElapsed]);

  const toggle = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      switch (state) {
        case 'untended':
          await startSession(flame.id, date);
          setState('burning');
          break;

        case 'burning': {
          // Capture the exact pause moment before any network latency
          const pausedAt = new Date().toISOString();

          // Freeze the timer immediately — stop the interval and lock elapsed
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setState('paused');

          // Retry in the background — the user already sees the pause,
          // so we must persist it rather than silently reverting to burning.
          let persisted = false;
          for (let attempt = 0; attempt <= END_SESSION_RETRIES; attempt++) {
            if (attempt > 0) {
              await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
            }
            try {
              const result = await endSession(flame.id, date, pausedAt);
              if (result.success) {
                persisted = true;
                break;
              }
            } catch {
              // Transient failure (network error, etc.) — continue to next retry
            }
          }
          if (!persisted) {
            toast.error(t('pauseError'), { position: 'top-center' });
          }
          break;
        }

        case 'paused':
          await startSession(flame.id, date);
          setState('burning');
          break;

        case 'sealed':
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
    // Optimistically transition to sealed state so visual effects fire immediately
    setState('sealed');
    try {
      const result = await setFlameCompletion(flame.id, date, true);
      if (result.success) {
        onSessionUpdate?.();
        return true;
      }
      setState('paused');
      return false;
    } catch {
      setState('paused');
      return false;
    }
  };

  const progress =
    targetSeconds > 0 ? Math.min(localElapsed / targetSeconds, 1) : 0;

  const isOverburning =
    state === 'burning' && targetSeconds > 0 && localElapsed > targetSeconds;

  return {
    state,
    elapsedSeconds: localElapsed,
    targetSeconds,
    progress,
    isOverburning,
    toggle,
    isLoading,
    isSealReady,
    beginSealing,
    cancelSealing,
    completeSeal,
  };
}

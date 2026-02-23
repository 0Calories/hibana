'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Flame, FlameSession } from '@/utils/supabase/rows';
import { setFlameCompletion } from '../../actions';
import { endSession, startSession } from '../../session-actions';
import type { FlameState } from '../../utils/types';

const MAX_RETRIES = 2;
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
  isCompletionReady: boolean;
  beginCompletion: () => void;
  cancelCompletion: () => void;
  completeFlame: () => Promise<boolean>;
}

/**
 * Retry an async action up to `retries` times with a delay between attempts.
 * Returns true if any attempt succeeds.
 */
async function retryAction(
  fn: () => Promise<{ success: boolean }>,
  retries = MAX_RETRIES,
  delayMs = RETRY_DELAY_MS,
): Promise<boolean> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
    try {
      const result = await fn();
      if (result.success) return true;
    } catch {
      // Transient failure — continue to next retry
    }
  }
  return false;
}

export function useFlameState({
  flame,
  session,
  date,
  onSessionUpdate,
}: UseFlameTimerOptions): UseFlameTimerReturn {
  const t = useTranslations('flames.card');

  // --- Client-owned timer state ---
  const [state, setState] = useState<FlameState>(() => {
    if (!session) return 'untended';
    if (session.is_completed) return 'sealed';
    if (session.started_at && !session.ended_at) return 'burning';
    if (session.ended_at) return 'paused';
    return 'untended';
  });

  const [baseElapsed, setBaseElapsed] = useState(() => {
    return session?.duration_seconds ?? 0;
  });

  const [startedAt, setStartedAt] = useState<number | null>(() => {
    if (session?.started_at && !session.ended_at) {
      // Hydrate: reconstruct client timestamp for an already-burning session
      return Date.now() - (Date.now() - new Date(session.started_at).getTime());
    }
    return null;
  });

  const [elapsed, setElapsed] = useState(() => {
    const base = session?.duration_seconds ?? 0;
    if (session?.started_at && !session.ended_at) {
      const running = Math.floor(
        (Date.now() - new Date(session.started_at).getTime()) / 1000,
      );
      return base + running;
    }
    return base;
  });

  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track previous session identity for narrow sync effect
  const prevSessionRef = useRef<{
    endedAt: string | null;
    isCompleted: boolean;
  }>({
    endedAt: session?.ended_at ?? null,
    isCompleted: session?.is_completed ?? false,
  });

  const targetSeconds = (flame.time_budget_minutes ?? 0) * 60;

  const completionThresholdSeconds =
    'completion_threshold_minutes' in flame &&
    flame.completion_threshold_minutes
      ? (flame.completion_threshold_minutes as number) * 60
      : (flame.time_budget_minutes ?? 0) * 30; // 50% of budget as default

  // --- Timer tick ---
  useEffect(() => {
    if (state === 'burning' && startedAt !== null) {
      const tick = () => {
        setElapsed(baseElapsed + Math.floor((Date.now() - startedAt) / 1000));
      };
      tick(); // immediate first tick
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // When not burning, elapsed is just baseElapsed (frozen)
      setElapsed(baseElapsed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state, startedAt, baseElapsed]);

  // --- Narrow sync effect for external changes ---
  // Only handles: fuel auto-stop (session ended externally) and external seal
  useEffect(() => {
    const prev = prevSessionRef.current;
    const wasActive = prev.endedAt === null;
    const wasCompleted = prev.isCompleted;

    // Update ref for next comparison
    prevSessionRef.current = {
      endedAt: session?.ended_at ?? null,
      isCompleted: session?.is_completed ?? false,
    };

    // Fuel auto-stop: session was active, now has ended_at (ended externally)
    if (wasActive && session?.ended_at && state === 'burning') {
      setState('paused');
      setStartedAt(null);
      setBaseElapsed(session.duration_seconds);
    }

    // External seal: session became completed (e.g. from another tab)
    if (!wasCompleted && session?.is_completed && state !== 'completed') {
      setState('completed');
      setStartedAt(null);
      setBaseElapsed(session.duration_seconds);
    }
  }, [session, state]);

  // --- Transitions ---
  const toggle = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      switch (state) {
        case 'untended': {
          const now = Date.now();
          setStartedAt(now);
          setBaseElapsed(0);
          setState('burning');

          const started = await retryAction(() => startSession(flame.id, date));
          if (!started) {
            setStartedAt(null);
            setState('untended');
            toast.error(t('startError'), { position: 'top-center' });
          }
          break;
        }

        case 'burning': {
          // Capture elapsed at pause moment
          const now = Date.now();
          const finalElapsed =
            startedAt !== null
              ? baseElapsed + Math.floor((now - startedAt) / 1000)
              : baseElapsed;

          // Freeze immediately
          setBaseElapsed(finalElapsed);
          setStartedAt(null);
          setState('paused');

          const persisted = await retryAction(() =>
            endSession(flame.id, date, finalElapsed),
          );
          if (!persisted) {
            toast.error(t('pauseError'), { position: 'top-center' });
          }
          break;
        }

        case 'paused': {
          const now = Date.now();
          setStartedAt(now);
          setState('burning');

          const resumed = await retryAction(() => startSession(flame.id, date));
          if (!resumed) {
            setStartedAt(null);
            setState('paused');
            toast.error(t('resumeError'), { position: 'top-center' });
          }
          break;
        }

        case 'completed':
        case 'completing':
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

  const isCompletionReady =
    state === 'paused' &&
    completionThresholdSeconds > 0 &&
    elapsed >= completionThresholdSeconds;

  const beginCompletion = () => {
    if (isCompletionReady) {
      setState('completing');
    }
  };

  const cancelCompletion = () => {
    if (state === 'completing') {
      setState('paused');
    }
  };

  const completeFlame = async (): Promise<boolean> => {
    setState('completed');
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

  const progress = targetSeconds > 0 ? Math.min(elapsed / targetSeconds, 1) : 0;

  const isOverburning =
    state === 'burning' && targetSeconds > 0 && elapsed > targetSeconds;

  return {
    state,
    elapsedSeconds: elapsed,
    targetSeconds,
    progress,
    isOverburning,
    toggle,
    isLoading,
    isCompletionReady,
    beginCompletion,
    cancelCompletion,
    completeFlame,
  };
}

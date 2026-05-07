'use client';

import { useTranslations } from 'next-intl';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import { creditCompletionReward } from '@/app/(app)/shop/actions';
import { COMPLETION_THRESHOLD } from '@/lib/sparks';
import type { Flame, FlameSession } from '@/lib/supabase/rows';
import { getDailyPlan, setFlameCompletion } from '../actions';
import {
  getAllSessionsForDate,
  pauseSession,
  toggleSession,
} from '../session-actions';
import type { FlameState } from '../utils/types';

// ─── Types ───────────────────────────────────────────────────────────

export interface FlameEntry {
  flame: Flame;
  session: FlameSession | null;
  state: FlameState;
  elapsedSeconds: number; // duration_seconds + in-flight tick
  fueledSeconds: number; // session.fueled_seconds (does not include in-flight)
  targetSeconds: number; // session.target_seconds, defaulting to flame's last-used
  fueledFraction: number; // fueledSeconds / targetSeconds, capped at 1
  unfueledFraction: number; // (elapsedSeconds - fueledSeconds) / targetSeconds, capped at 1 - fueledFraction
  progress: number; // legacy: fueledFraction (kept for callers not yet updated)
  isOverburning: boolean;
  isLoading: boolean;
  isCompletionReady: boolean; // fueledSeconds >= targetSeconds * COMPLETION_THRESHOLD
  isBlocked: boolean;
  level: number;
}

export interface FuelState {
  balanceSeconds: number;
  isEmpty: boolean;
  hasUnfueled: boolean; // true if any of today's sessions has duration_seconds > fueled_seconds
}

export interface FlameActions {
  toggle: (flameId: string) => Promise<void>;
  beginCompletion: (flameId: string) => void;
  cancelCompletion: (flameId: string) => void;
  completeFlame: (flameId: string) => Promise<boolean>;
}

export interface FlameCardActions {
  onToggle: () => Promise<void>;
  onBeginCompletion: () => void;
  onCancelCompletion: () => void;
  onCompleteFlame: () => Promise<boolean>;
}

export interface FlamesContextValue {
  entries: FlameEntry[];
  activeFlameId: string | null;
  fuel: FuelState;
  actions: FlameActions;
}

// ─── Internal types ──────────────────────────────────────────────────

interface FlameTimerState {
  state: FlameState;
  baseElapsed: number;
  startedAt: number | null;
  isLoading: boolean;
}

// ─── Context ─────────────────────────────────────────────────────────

const FlamesContext = createContext<FlamesContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────

interface FlamesProviderProps {
  flames: Flame[];
  sessions: FlameSession[];
  fuelBalanceSeconds: number;
  date: string;
  children: ReactNode;
}

export function FlamesProvider({
  flames,
  sessions,
  fuelBalanceSeconds,
  date,
  children,
}: FlamesProviderProps) {
  const value = useFlamesEngine(flames, sessions, fuelBalanceSeconds, date);
  return (
    <FlamesContext.Provider value={value}>{children}</FlamesContext.Provider>
  );
}

// ─── Consumer hooks ──────────────────────────────────────────────────

export function useFlamesContext(): FlamesContextValue {
  const ctx = useContext(FlamesContext);
  if (!ctx) {
    throw new Error('useFlamesContext must be used within FlamesProvider');
  }
  return ctx;
}

export function useFlameEntry(flameId: string): FlameEntry {
  const { entries } = useFlamesContext();
  const entry = entries.find((e) => e.flame.id === flameId);
  if (!entry) throw new Error(`No entry found for flame ${flameId}`);
  return entry;
}

export function useFuel(): FuelState {
  const { fuel } = useFlamesContext();
  return fuel;
}

export function useFlameActions(): FlameActions {
  const { actions } = useFlamesContext();
  return actions;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

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

function initTimerState(session: FlameSession | null): FlameTimerState {
  if (!session) {
    return {
      state: 'untended',
      baseElapsed: 0,
      startedAt: null,
      isLoading: false,
    };
  }
  if (session.is_completed) {
    return {
      state: 'completed',
      baseElapsed: session.duration_seconds,
      startedAt: null,
      isLoading: false,
    };
  }
  if (session.started_at && !session.ended_at) {
    return {
      state: 'burning',
      baseElapsed: session.duration_seconds,
      startedAt: new Date(session.started_at).getTime(),
      isLoading: false,
    };
  }
  if (session.ended_at) {
    return {
      state: 'paused',
      baseElapsed: session.duration_seconds,
      startedAt: null,
      isLoading: false,
    };
  }
  return {
    state: 'untended',
    baseElapsed: 0,
    startedAt: null,
    isLoading: false,
  };
}

function computeElapsed(ts: FlameTimerState): number {
  if (ts.startedAt !== null) {
    return ts.baseElapsed + Math.floor((Date.now() - ts.startedAt) / 1000);
  }
  return ts.baseElapsed;
}

function deriveActiveFlameId(map: Map<string, FlameTimerState>): string | null {
  for (const [id, ts] of map) {
    if (ts.state === 'burning') return id;
  }
  return null;
}

// ─── Engine ──────────────────────────────────────────────────────────

function useFlamesEngine(
  flames: Flame[],
  sessions: FlameSession[],
  fuelBalanceSeconds: number,
  date: string,
): FlamesContextValue {
  const t = useTranslations('flames.card');

  // Per-flame timer state in a ref (mutated directly, re-render via tickNow)
  const timerMapRef = useRef<Map<string, FlameTimerState>>(new Map());

  // Fuel balance (re-synced from server after actions)
  const [liveFuelBalance, setLiveFuelBalance] =
    useState<number>(fuelBalanceSeconds);

  // Session cache for entry.session (informational, not used for timer logic)
  const sessionsRef = useRef<FlameSession[]>(sessions);

  // Tick trigger — bumped to force re-render and recompute derived values
  const [tickNow, setTickNow] = useState(Date.now());

  // Initialize timer states from sessions (once on mount)
  const initializedRef = useRef(false);
  if (!initializedRef.current) {
    initializedRef.current = true;
    for (const flame of flames) {
      const session = sessions.find((s) => s.flame_id === flame.id) ?? null;
      timerMapRef.current.set(flame.id, initTimerState(session));
    }
  }

  // ── Single timer ────────────────────────────────────────────────
  const activeFlameId = deriveActiveFlameId(timerMapRef.current);

  useEffect(() => {
    if (!activeFlameId) return;
    const id = setInterval(() => setTickNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [activeFlameId]);

  // ── Server refresh ──────────────────────────────────────────────
  const refreshFromServer = useCallback(async () => {
    const [sessResult, planResult] = await Promise.all([
      getAllSessionsForDate(date),
      getDailyPlan(date),
    ]);
    if (sessResult.success && sessResult.data) {
      sessionsRef.current = sessResult.data;
    }
    if (planResult.success) {
      setLiveFuelBalance(planResult.data.fuelBalanceSeconds);
    }
    setTickNow(Date.now());
  }, [date]);

  // ── Fuel depletion auto-stop ────────────────────────────────────
  // Auto-pause when fuel depletes — keeps the user in the loop about refilling.
  const hasFiredDepletedRef = useRef(false);

  useEffect(() => {
    if (!activeFlameId || liveFuelBalance > 0) {
      hasFiredDepletedRef.current = false;
      return;
    }
    if (hasFiredDepletedRef.current) return;
    hasFiredDepletedRef.current = true;

    const ts = timerMapRef.current.get(activeFlameId);
    if (!ts || ts.state !== 'burning') return;

    const finalElapsed = computeElapsed(ts);
    timerMapRef.current.set(activeFlameId, {
      state: 'paused',
      baseElapsed: finalElapsed,
      startedAt: null,
      isLoading: false,
    });
    setTickNow(Date.now());

    const depletedFlameId = activeFlameId;
    void (async () => {
      await retryAction(() =>
        pauseSession(depletedFlameId, date, finalElapsed),
      );
      await refreshFromServer();
    })();
  }, [liveFuelBalance, activeFlameId, date, refreshFromServer]);

  // ── Actions ─────────────────────────────────────────────────────
  const toggle = useCallback(
    async (flameId: string) => {
      const ts = timerMapRef.current.get(flameId);
      if (!ts || ts.isLoading) return;

      timerMapRef.current.set(flameId, { ...ts, isLoading: true });
      setTickNow(Date.now());

      try {
        switch (ts.state) {
          case 'untended': {
            const now = Date.now();
            timerMapRef.current.set(flameId, {
              state: 'burning',
              baseElapsed: 0,
              startedAt: now,
              isLoading: true,
            });
            setTickNow(Date.now());

            const started = await retryAction(() =>
              toggleSession(flameId, date, 'start'),
            );
            if (!started) {
              timerMapRef.current.set(flameId, {
                state: 'untended',
                baseElapsed: 0,
                startedAt: null,
                isLoading: true,
              });
              setTickNow(Date.now());
              toast.error(t('startError'), { position: 'top-center' });
            }
            break;
          }

          case 'burning': {
            const now = Date.now();
            const finalElapsed =
              ts.startedAt !== null
                ? ts.baseElapsed + Math.floor((now - ts.startedAt) / 1000)
                : ts.baseElapsed;

            timerMapRef.current.set(flameId, {
              state: 'paused',
              baseElapsed: finalElapsed,
              startedAt: null,
              isLoading: true,
            });
            setTickNow(Date.now());

            const persisted = await retryAction(() =>
              pauseSession(flameId, date, finalElapsed),
            );
            if (!persisted) {
              toast.error(t('pauseError'), { position: 'top-center' });
            }
            break;
          }

          case 'paused': {
            const now = Date.now();
            timerMapRef.current.set(flameId, {
              state: 'burning',
              baseElapsed: ts.baseElapsed,
              startedAt: now,
              isLoading: true,
            });
            setTickNow(Date.now());

            const resumed = await retryAction(() =>
              toggleSession(flameId, date, 'start'),
            );
            if (!resumed) {
              timerMapRef.current.set(flameId, {
                state: 'paused',
                baseElapsed: ts.baseElapsed,
                startedAt: null,
                isLoading: true,
              });
              setTickNow(Date.now());
              toast.error(t('resumeError'), { position: 'top-center' });
            }
            break;
          }

          default:
            break;
        }
      } catch (error) {
        console.error('Failed to toggle flame timer:', error);
      } finally {
        const current = timerMapRef.current.get(flameId);
        if (current) {
          timerMapRef.current.set(flameId, { ...current, isLoading: false });
          setTickNow(Date.now());
        }
      }
    },
    [date, t],
  );

  const beginCompletion = useCallback((flameId: string) => {
    const ts = timerMapRef.current.get(flameId);
    if (!ts) return;

    const session = sessionsRef.current.find((s) => s.flame_id === flameId);
    const isReady =
      session != null &&
      session.target_seconds != null &&
      session.fueled_seconds >= session.target_seconds * COMPLETION_THRESHOLD;

    if (ts.state === 'paused' && isReady) {
      timerMapRef.current.set(flameId, { ...ts, state: 'completing' });
      setTickNow(Date.now());
    }
  }, []);

  const cancelCompletion = useCallback((flameId: string) => {
    const ts = timerMapRef.current.get(flameId);
    if (!ts || ts.state !== 'completing') return;
    timerMapRef.current.set(flameId, { ...ts, state: 'paused' });
    setTickNow(Date.now());
  }, []);

  const completeFlame = useCallback(
    async (flameId: string): Promise<boolean> => {
      const ts = timerMapRef.current.get(flameId);
      const session = sessionsRef.current.find((s) => s.flame_id === flameId);
      if (!ts || !session) return false;

      if (
        session.target_seconds != null &&
        session.fueled_seconds < session.target_seconds * COMPLETION_THRESHOLD
      ) {
        toast.error(t('needsMoreFuel'), { position: 'top-center' });
        return false;
      }

      timerMapRef.current.set(flameId, { ...ts, state: 'completed' });
      setTickNow(Date.now());

      try {
        const result = await setFlameCompletion(flameId, date, true);
        if (result.success) {
          creditCompletionReward(flameId, date).then((r) => {
            if (!r.success)
              console.error('Failed to credit completion reward:', r.error);
          });
          await refreshFromServer();
          return true;
        }
        timerMapRef.current.set(flameId, { ...ts, state: 'paused' });
        setTickNow(Date.now());
        return false;
      } catch {
        timerMapRef.current.set(flameId, { ...ts, state: 'paused' });
        setTickNow(Date.now());
        return false;
      }
    },
    [date, refreshFromServer, t],
  );

  // ── Build entries ───────────────────────────────────────────────
  // Suppress lint: tickNow is intentionally read to force recomputation
  void tickNow;

  const entries: FlameEntry[] = flames.map((flame, index) => {
    const ts = timerMapRef.current.get(flame.id) ?? {
      state: 'untended' as FlameState,
      baseElapsed: 0,
      startedAt: null,
      isLoading: false,
    };

    const elapsed = computeElapsed(ts);
    const session =
      sessionsRef.current.find((s) => s.flame_id === flame.id) ?? null;
    const targetSeconds = session?.target_seconds ?? 0;
    const fueledSeconds = session?.fueled_seconds ?? 0;

    const fueledFraction =
      targetSeconds > 0 ? Math.min(fueledSeconds / targetSeconds, 1) : 0;
    const unfueledFraction =
      targetSeconds > 0
        ? Math.max(
            0,
            Math.min(
              (elapsed - fueledSeconds) / targetSeconds,
              1 - fueledFraction,
            ),
          )
        : 0;

    const isOverburning =
      ts.state === 'burning' && targetSeconds > 0 && elapsed > targetSeconds;
    const isCompletionReady =
      session != null &&
      session.target_seconds != null &&
      session.fueled_seconds >= session.target_seconds * COMPLETION_THRESHOLD;
    const isBlocked = activeFlameId !== null && activeFlameId !== flame.id;

    return {
      flame,
      session,
      state: ts.state,
      elapsedSeconds: elapsed,
      fueledSeconds,
      targetSeconds,
      fueledFraction,
      unfueledFraction,
      progress: fueledFraction, // legacy alias
      isOverburning,
      isLoading: ts.isLoading,
      isCompletionReady,
      isBlocked,
      level: (index % 8) + 1, // Demo: cycle through levels
    };
  });

  const hasUnfueled = sessionsRef.current.some(
    (s) => s.duration_seconds > s.fueled_seconds,
  );

  const fuel: FuelState = {
    balanceSeconds: liveFuelBalance,
    isEmpty: liveFuelBalance <= 0,
    hasUnfueled,
  };

  const actions: FlameActions = {
    toggle,
    beginCompletion,
    cancelCompletion,
    completeFlame,
  };

  return { entries, activeFlameId, fuel, actions };
}

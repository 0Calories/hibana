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
import type { Flame, FlameSession } from '@/lib/supabase/rows';
import {
  type FuelBudgetStatus,
  getRemainingFuelBudget,
  setFlameCompletion,
} from '../actions';
import { getAllSessionsForDate, toggleSession } from '../session-actions';
import type { FlameState } from '../utils/types';

// ─── Types ───────────────────────────────────────────────────────────

export interface FlameEntry {
  flame: Flame;
  session: FlameSession | null;
  state: FlameState;
  elapsedSeconds: number;
  targetSeconds: number;
  progress: number;
  isOverburning: boolean;
  isLoading: boolean;
  isCompletionReady: boolean;
  isBlocked: boolean;
  level: number;
}

export interface FuelState {
  budgetSeconds: number | null;
  remainingSeconds: number;
  isFuelDepleted: boolean;
  hasBudget: boolean;
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
  fuelBudget: FuelBudgetStatus;
  date: string;
  children: ReactNode;
}

export function FlamesProvider({
  flames,
  sessions,
  fuelBudget,
  date,
  children,
}: FlamesProviderProps) {
  const value = useFlamesEngine(flames, sessions, fuelBudget, date);
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

function computeCompletionThreshold(flame: Flame): number {
  if (
    'completion_threshold_minutes' in flame &&
    flame.completion_threshold_minutes
  ) {
    return (flame.completion_threshold_minutes as number) * 60;
  }
  return (flame.time_budget_minutes ?? 0) * 30; // 50% of budget
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
  fuelBudget: FuelBudgetStatus,
  date: string,
): FlamesContextValue {
  const t = useTranslations('flames.card');

  // Per-flame timer state in a ref (mutated directly, re-render via tickNow)
  const timerMapRef = useRef<Map<string, FlameTimerState>>(new Map());

  // Fuel budget (re-synced from server after actions)
  const [liveFuelBudget, setLiveFuelBudget] =
    useState<FuelBudgetStatus>(fuelBudget);

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

  // ── Fuel derived ────────────────────────────────────────────────
  const hasBudget = liveFuelBudget !== null;
  const budgetSeconds = liveFuelBudget
    ? liveFuelBudget.budgetMinutes * 60
    : null;

  // Total consumed: sum of elapsed across all flames (from timer state, not sessions)
  let totalConsumed = 0;
  for (const flame of flames) {
    const ts = timerMapRef.current.get(flame.id);
    if (ts) totalConsumed += computeElapsed(ts);
  }

  const remainingSeconds = hasBudget
    ? Math.max(0, (budgetSeconds ?? 0) - totalConsumed)
    : 0;
  const isFuelDepleted = hasBudget && remainingSeconds <= 0;

  // ── Fuel depletion auto-stop ────────────────────────────────────
  const hasFiredDepletedRef = useRef(false);

  useEffect(() => {
    if (!activeFlameId) {
      hasFiredDepletedRef.current = false;
    }
  }, [activeFlameId]);

  useEffect(() => {
    if (!isFuelDepleted || !activeFlameId || hasFiredDepletedRef.current)
      return;
    hasFiredDepletedRef.current = true;

    const ts = timerMapRef.current.get(activeFlameId);
    if (!ts || ts.state !== 'burning') return;

    // Pause immediately
    const finalElapsed = computeElapsed(ts);
    timerMapRef.current.set(activeFlameId, {
      state: 'paused',
      baseElapsed: finalElapsed,
      startedAt: null,
      isLoading: false,
    });
    setTickNow(Date.now());

    // End session on server (no clientDuration — server computes)
    const depletedFlameId = activeFlameId;
    (async () => {
      await retryAction(() => toggleSession(depletedFlameId, date, 'pause'));
      const [sessResult, fuelResult] = await Promise.all([
        getAllSessionsForDate(date),
        getRemainingFuelBudget(date),
      ]);
      if (sessResult.success && sessResult.data) {
        sessionsRef.current = sessResult.data;
      }
      if (fuelResult.success) {
        setLiveFuelBudget(fuelResult.data);
      }
      setTickNow(Date.now());
    })();
  }, [isFuelDepleted, activeFlameId, date]);

  // ── Server refresh ──────────────────────────────────────────────
  const refreshFromServer = useCallback(async () => {
    const [sessResult, fuelResult] = await Promise.all([
      getAllSessionsForDate(date),
      getRemainingFuelBudget(date),
    ]);
    if (sessResult.success && sessResult.data) {
      sessionsRef.current = sessResult.data;
    }
    if (fuelResult.success) {
      setLiveFuelBudget(fuelResult.data);
    }
    setTickNow(Date.now());
  }, [date]);

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
              toggleSession(flameId, date, 'pause', finalElapsed),
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

  const beginCompletion = useCallback(
    (flameId: string) => {
      const ts = timerMapRef.current.get(flameId);
      if (!ts) return;

      const elapsed = computeElapsed(ts);
      const flame = flames.find((f) => f.id === flameId);
      if (!flame) return;

      const threshold = computeCompletionThreshold(flame);
      if (ts.state === 'paused' && elapsed >= threshold) {
        timerMapRef.current.set(flameId, { ...ts, state: 'completing' });
        setTickNow(Date.now());
      }
    },
    [flames],
  );

  const cancelCompletion = useCallback((flameId: string) => {
    const ts = timerMapRef.current.get(flameId);
    if (!ts || ts.state !== 'completing') return;
    timerMapRef.current.set(flameId, { ...ts, state: 'paused' });
    setTickNow(Date.now());
  }, []);

  const completeFlame = useCallback(
    async (flameId: string): Promise<boolean> => {
      const ts = timerMapRef.current.get(flameId);
      if (!ts) return false;

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
    [date, refreshFromServer],
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
    const targetSeconds = (flame.time_budget_minutes ?? 0) * 60;
    const progress =
      targetSeconds > 0 ? Math.min(elapsed / targetSeconds, 1) : 0;
    const isOverburning =
      ts.state === 'burning' && targetSeconds > 0 && elapsed > targetSeconds;
    const threshold = computeCompletionThreshold(flame);
    const isCompletionReady =
      ts.state === 'paused' && threshold > 0 && elapsed >= threshold;
    const isBlocked = activeFlameId !== null && activeFlameId !== flame.id;
    const session =
      sessionsRef.current.find((s) => s.flame_id === flame.id) ?? null;

    return {
      flame,
      session,
      state: ts.state,
      elapsedSeconds: elapsed,
      targetSeconds,
      progress,
      isOverburning,
      isLoading: ts.isLoading,
      isCompletionReady,
      isBlocked,
      level: (index % 8) + 1, // Demo: cycle through levels
    };
  });

  const fuel: FuelState = {
    budgetSeconds,
    remainingSeconds,
    isFuelDepleted,
    hasBudget,
  };

  const actions: FlameActions = {
    toggle,
    beginCompletion,
    cancelCompletion,
    completeFlame,
  };

  return { entries, activeFlameId, fuel, actions };
}

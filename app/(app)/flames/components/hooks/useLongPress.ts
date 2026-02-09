'use client';

import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  duration: number;
  onComplete: () => void;
  onProgress?: (progress: number) => void;
  onCancel?: () => void;
  enabled?: boolean;
}

interface UseLongPressReturn {
  progress: number;
  isPressed: boolean;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: () => void;
    onPointerLeave: () => void;
    onPointerCancel: () => void;
  };
}

export function useLongPress({
  duration,
  onComplete,
  onProgress,
  onCancel,
  enabled = true,
}: UseLongPressOptions): UseLongPressReturn {
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const isPressedRef = useRef(false);
  const completedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startTimeRef.current = null;
    isPressedRef.current = false;
    completedRef.current = false;
  }, []);

  const tick = useCallback(() => {
    if (!startTimeRef.current || completedRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const newProgress = Math.min(elapsed / duration, 1);
    progressRef.current = newProgress;
    onProgress?.(newProgress);

    if (newProgress >= 1) {
      completedRef.current = true;
      isPressedRef.current = false;
      onComplete();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [duration, onComplete, onProgress]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      // Only respond to primary pointer (left click / touch)
      if (e.button !== 0) return;

      e.preventDefault();
      startTimeRef.current = Date.now();
      isPressedRef.current = true;
      completedRef.current = false;
      progressRef.current = 0;
      onProgress?.(0);

      rafRef.current = requestAnimationFrame(tick);
    },
    [enabled, tick, onProgress],
  );

  const handleRelease = useCallback(() => {
    if (!isPressedRef.current && !completedRef.current) return;
    const wasCompleted = completedRef.current;
    cleanup();
    progressRef.current = 0;
    onProgress?.(0);
    if (!wasCompleted) {
      onCancel?.();
    }
  }, [cleanup, onCancel, onProgress]);

  return {
    progress: progressRef.current,
    isPressed: isPressedRef.current,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handleRelease,
      onPointerLeave: handleRelease,
      onPointerCancel: handleRelease,
    },
  };
}

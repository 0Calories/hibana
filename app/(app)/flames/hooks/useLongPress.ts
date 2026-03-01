'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Max distance (px) a finger can move before a long press is canceled */
const MOVE_THRESHOLD = 10;

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
  longPressTriggered: boolean;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
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
  const completedRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const longPressTriggeredRef = useRef(false);

  // Track pointer start position for movement detection
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  // Store latest callbacks in refs to avoid stale closures in rAF loop
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  const cleanup = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startTimeRef.current = null;
    startPosRef.current = null;
  }, []);

  const tick = useCallback(() => {
    if (!startTimeRef.current || completedRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const newProgress = Math.min(elapsed / duration, 1);
    setProgress(newProgress);
    onProgressRef.current?.(newProgress);

    if (newProgress >= 1) {
      completedRef.current = true;
      setIsPressed(false);
      longPressTriggeredRef.current = true;
      onCompleteRef.current();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [duration]);

  const handleRelease = useCallback(() => {
    if (!startTimeRef.current) return;
    const wasCompleted = completedRef.current;
    cleanup();
    setIsPressed(false);
    setProgress(0);
    onProgressRef.current?.(0);
    if (!wasCompleted) {
      longPressTriggeredRef.current = progress > 0.05;
      onCancelRef.current?.();
    }
  }, [cleanup, progress]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      if (e.button !== 0) return;

      startPosRef.current = { x: e.clientX, y: e.clientY };
      startTimeRef.current = Date.now();
      setIsPressed(true);
      completedRef.current = false;
      longPressTriggeredRef.current = false;
      setProgress(0);
      onProgressRef.current?.(0);

      rafRef.current = requestAnimationFrame(tick);
    },
    [enabled, tick],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startPosRef.current || !startTimeRef.current) return;

      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      if (dx * dx + dy * dy > MOVE_THRESHOLD * MOVE_THRESHOLD) {
        handleRelease();
      }
    },
    [handleRelease],
  );

  return {
    progress,
    isPressed,
    longPressTriggered: longPressTriggeredRef.current,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handleRelease,
      onPointerLeave: handleRelease,
      onPointerCancel: handleRelease,
    },
  };
}

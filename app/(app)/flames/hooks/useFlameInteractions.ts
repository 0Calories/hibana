'use client';

import { useReducedMotion } from 'framer-motion';
import { useCallback, useState } from 'react';
import {
  cancelCompletionSound,
  finishCompletionSound,
  startCompletionSound,
  updateCompletionSound,
} from '../components/completion-sounds';
import type { FlameState } from '../utils/types';
import type { FlameCardActions } from './useFlames';
import { useLongPress } from './useLongPress';

const COMPLETION_DURATION_MS = 2000;
const COMPLETION_INTENT_THRESHOLD = 0.05;

interface UseFlameInteractionsOptions {
  actions: FlameCardActions | undefined;
  state: FlameState;
  canComplete: boolean;
  onCompletionError?: () => void;
}

export function useFlameInteractions({
  actions,
  state,
  canComplete,
  onCompletionError,
}: UseFlameInteractionsOptions) {
  const shouldReduceMotion = useReducedMotion();

  // Celebration state
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleCompletionFinish = useCallback(async () => {
    if (!shouldReduceMotion) finishCompletionSound();
    setCelebrationActive(true);

    try {
      const success = await actions?.onCompleteFlame();
      if (!success) onCompletionError?.();
    } catch {
      onCompletionError?.();
    }
  }, [actions, onCompletionError, shouldReduceMotion]);

  const handleCelebrationComplete = useCallback(() => {
    setCelebrationActive(false);
    setShowSummary(true);
  }, []);

  // Long press
  const longPress = useLongPress({
    duration: COMPLETION_DURATION_MS,
    enabled: canComplete,
    onProgress: (p) => {
      if (p > COMPLETION_INTENT_THRESHOLD && state !== 'completing') {
        actions?.onBeginCompletion();
        if (!shouldReduceMotion) startCompletionSound();
      }
      if (state === 'completing' && !shouldReduceMotion) {
        updateCompletionSound(p);
      }
    },
    onComplete: handleCompletionFinish,
    onCancel: () => {
      if (!shouldReduceMotion) cancelCompletionSound();
      actions?.onCancelCompletion();
    },
  });

  // Click handler (suppressed when long press was triggered)
  const handleClick = useCallback(() => {
    if (longPress.longPressTriggered) return;
    actions?.onToggle();
  }, [actions, longPress.longPressTriggered]);

  return {
    handleClick,
    longPress,
    celebration: {
      active: celebrationActive,
      showSummary,
      setShowSummary,
      onComplete: handleCelebrationComplete,
    },
  };
}

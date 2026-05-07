'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface MinutesPillProps {
  /** Current value, in seconds. */
  value: number;
  /** Called with the new value in seconds. */
  onChange: (seconds: number) => void;
  /** Disable both editing affordances. */
  disabled?: boolean;
  /** Min/max minutes (slider clamp). */
  minMinutes?: number;
  maxMinutes?: number;
}

/**
 * Tap to enter edit mode → either type the value directly or drag horizontally
 * to scrub. Value is stored in seconds; UI works in minutes.
 *
 * Drag gesture: while in edit mode, click-and-drag horizontally to scrub the
 * value by 1 min per 6px. Release to commit.
 */
export function MinutesPill({
  value,
  onChange,
  disabled = false,
  minMinutes = 1,
  maxMinutes = 720,
}: MinutesPillProps) {
  const minutes = Math.max(minMinutes, Math.round(value / 60));
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState<string>(String(minutes));
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStartXRef = useRef<number | null>(null);
  const dragStartMinsRef = useRef<number>(minutes);

  useEffect(() => {
    if (!editing) {
      setDraftText(String(minutes));
    }
  }, [editing, minutes]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = (mins: number) => {
    const clamped = Math.max(minMinutes, Math.min(maxMinutes, mins));
    onChange(clamped * 60);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || !editing) return;
    dragStartXRef.current = e.clientX;
    dragStartMinsRef.current = minutes;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartXRef.current == null) return;
    const dx = e.clientX - dragStartXRef.current;
    const minutesDelta = Math.round(dx / 6);
    const next = dragStartMinsRef.current + minutesDelta;
    setDraftText(String(Math.max(minMinutes, Math.min(maxMinutes, next))));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartXRef.current == null) return;
    dragStartXRef.current = null;
    const parsed = Number.parseInt(draftText, 10);
    if (Number.isFinite(parsed)) commit(parsed);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  if (!editing) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setEditing(true)}
        className={cn(
          'rounded-md border border-border bg-muted/40 px-2 py-1 text-xs tabular-nums',
          'hover:bg-muted/60 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        {minutes} min
      </button>
    );
  }

  return (
    <div
      className="flex items-center gap-1 rounded-md border border-primary/40 bg-card px-2 py-1"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        min={minMinutes}
        max={maxMinutes}
        value={draftText}
        onChange={(e) => setDraftText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const parsed = Number.parseInt(draftText, 10);
            if (Number.isFinite(parsed)) commit(parsed);
            setEditing(false);
          } else if (e.key === 'Escape') {
            setEditing(false);
          }
        }}
        onBlur={() => {
          const parsed = Number.parseInt(draftText, 10);
          if (Number.isFinite(parsed)) commit(parsed);
          setEditing(false);
        }}
        className="w-12 bg-transparent text-xs tabular-nums outline-none"
      />
      <span className="text-xs text-muted-foreground">min</span>
    </div>
  );
}

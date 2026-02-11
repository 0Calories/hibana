'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface FlamesDropZoneProps {
  hasFlames: boolean;
  children: React.ReactNode;
}

export function FlamesDropZone({ hasFlames, children }: FlamesDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id: 'flames-zone' });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[3rem] rounded-lg p-1 transition-colors',
        isOver && 'bg-muted/40',
      )}
    >
      {hasFlames ? (
        <div className="flex flex-wrap gap-1">{children}</div>
      ) : (
        <p className="flex min-h-[3rem] items-center justify-center text-xs text-muted-foreground">
          —
        </p>
      )}
    </div>
  );
}

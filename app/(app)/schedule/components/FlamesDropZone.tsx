'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface FlamesDropZoneProps {
  children: React.ReactNode;
}

export function FlamesDropZone({ children }: FlamesDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id: 'flames-zone' });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[6.5rem] rounded-lg p-1 transition-colors',
        isOver && 'bg-muted/40',
      )}
    >
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

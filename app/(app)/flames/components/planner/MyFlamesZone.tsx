'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { MY_FLAMES_ZONE_ID } from './constants';

interface MyFlamesZoneProps {
  children: React.ReactNode;
}

export function MyFlamesZone({ children }: MyFlamesZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id: MY_FLAMES_ZONE_ID });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-26 rounded-lg p-1 transition-colors',
        isOver && 'bg-muted/40',
      )}
    >
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

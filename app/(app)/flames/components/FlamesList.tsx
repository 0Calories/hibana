'use client';

import { useEffect, useRef, useState } from 'react';
import type { Flame, FlameSession } from '@/lib/supabase/rows';
import { cn } from '@/lib/utils';
import type { FuelBudgetStatus } from '../actions';
import { FlamesProvider, useFlamesContext } from '../hooks/useFlames';
import { FlamesPageActions } from './FlamesPageActions';
import { FuelBarStickyContainer } from './FuelBarStickyContainer';
import { FuelMeter } from './FuelMeter';
import { InteractiveFlameCard } from './flame-card/InteractiveFlameCard';

interface FlamesListProps {
  flames: Flame[];
  sessions: FlameSession[];
  date: string;
  fuelBudget: FuelBudgetStatus;
}

export function FlamesList({
  flames,
  sessions,
  date,
  fuelBudget,
}: FlamesListProps) {
  return (
    <FlamesProvider
      flames={flames}
      sessions={sessions}
      fuelBudget={fuelBudget}
      date={date}
    >
      <FlamesListContent />
    </FlamesProvider>
  );
}

function FlamesListContent() {
  const { entries, activeFlameId, fuel, actions } = useFlamesContext();

  // Detect when the fuel bar becomes sticky
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { rootMargin: '-48px 0px 0px 0px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <div ref={sentinelRef} className="h-0" />
      <FuelBarStickyContainer>
        <div className="flex items-stretch gap-2">
          <div className="min-w-0 flex-1">
            <FuelMeter
              budgetSeconds={fuel.budgetSeconds}
              remainingSeconds={fuel.remainingSeconds}
              hasBudget={fuel.hasBudget}
              isBurning={activeFlameId !== null}
              isStuck={isStuck}
            />
          </div>
          <div
            className={cn(
              'flex items-center gap-1 rounded-lg border border-border px-2 backdrop-blur-sm transition-[colors,opacity] duration-1000',
              isStuck ? 'bg-card/50 opacity-90' : 'bg-card',
            )}
          >
            <FlamesPageActions />
          </div>
        </div>
      </FuelBarStickyContainer>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {entries.map((entry) => (
          <InteractiveFlameCard
            key={entry.flame.id}
            flame={entry.flame}
            entry={entry}
            actions={{
              onToggle: () => actions.toggle(entry.flame.id),
              onBeginCompletion: () => actions.beginCompletion(entry.flame.id),
              onCancelCompletion: () =>
                actions.cancelCompletion(entry.flame.id),
              onCompleteFlame: () => actions.completeFlame(entry.flame.id),
            }}
            isFuelDepleted={fuel.isFuelDepleted || !fuel.hasBudget}
          />
        ))}
      </div>
    </div>
  );
}

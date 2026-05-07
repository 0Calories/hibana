'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import {
  getFuelCanisterCatalog,
  getUserItems,
  getUserState,
} from '@/app/(app)/shop/actions';
import type { Flame, Item, UserItem } from '@/lib/supabase/rows';
import { cn } from '@/lib/utils';
import type { DailyPlanEntry } from '../actions';
import { FlamesProvider, useFlamesContext } from '../hooks/useFlames';
import { EditLineupSheet } from './EditLineupSheet';
import { FlamesPageActions } from './FlamesPageActions';
import { FuelBarStickyContainer } from './FuelBarStickyContainer';
import { FuelMeter } from './FuelMeter';
import { InteractiveFlameCard } from './flame-card/InteractiveFlameCard';
import { RefillModal } from './RefillModal';

interface FlamesListProps {
  entries: DailyPlanEntry[];
  date: string;
  fuelBalanceSeconds: number;
  allFlames: Flame[];
  lastUsedTargetsByFlameId: Record<string, number>;
}

export function FlamesList({
  entries,
  date,
  fuelBalanceSeconds,
  allFlames,
  lastUsedTargetsByFlameId,
}: FlamesListProps) {
  // Derive flames and sessions arrays for the FlamesProvider
  const flames = entries.map((e) => e.flame);
  const sessions = entries.map((e) => e.session);

  return (
    <FlamesProvider
      flames={flames}
      sessions={sessions}
      fuelBalanceSeconds={fuelBalanceSeconds}
      date={date}
    >
      <FlamesListContent
        entries={entries}
        date={date}
        allFlames={allFlames}
        lastUsedTargetsByFlameId={lastUsedTargetsByFlameId}
      />
    </FlamesProvider>
  );
}

interface FlamesListContentProps {
  entries: DailyPlanEntry[];
  date: string;
  allFlames: Flame[];
  lastUsedTargetsByFlameId: Record<string, number>;
}

function FlamesListContent({
  entries,
  date,
  allFlames,
  lastUsedTargetsByFlameId,
}: FlamesListContentProps) {
  const t = useTranslations('flames');
  const { entries: flameEntries, fuel, actions } = useFlamesContext();

  // Detect when the fuel bar becomes sticky
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  // Modal state
  const [editOpen, setEditOpen] = useState(false);
  const [refillOpen, setRefillOpen] = useState(false);

  // Shop catalog + inventory for the refill modal
  const [canisters, setCanisters] = useState<Item[]>([]);
  const [canisterInventory, setCanisterInventory] = useState<UserItem[]>([]);
  const [sparks, setSparks] = useState(0);

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

  useEffect(() => {
    void (async () => {
      const [catalogResult, itemsResult, stateResult] = await Promise.all([
        getFuelCanisterCatalog(),
        getUserItems(),
        getUserState(),
      ]);
      if (catalogResult.success) setCanisters(catalogResult.data);
      if (itemsResult.success) {
        setCanisterInventory(
          itemsResult.data
            .filter((ui) => ui.items.type === 'fuel_canister')
            .map(({ items: _items, ...ui }) => ui),
        );
      }
      if (stateResult.success) setSparks(stateResult.data.sparks_balance);
    })();
  }, []);

  const unscheduledFlames = allFlames.filter(
    (f) => !entries.some((e) => e.flame.id === f.id),
  );

  return (
    <div>
      <div ref={sentinelRef} className="h-0" />
      <FuelBarStickyContainer>
        <div className="flex items-stretch gap-2">
          <div className="min-w-0 flex-1">
            <FuelMeter
              balanceSeconds={fuel.balanceSeconds}
              hasUnfueled={fuel.hasUnfueled}
              onRefillClick={() => setRefillOpen(true)}
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
        {flameEntries.map((entry) => (
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
            isFuelDepleted={fuel.isEmpty}
          />
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('editLineup')}
        </button>
      </div>

      <EditLineupSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        date={date}
        entries={entries}
        unscheduledFlames={unscheduledFlames}
        lastUsedTargetsByFlameId={lastUsedTargetsByFlameId}
      />

      <RefillModal
        open={refillOpen}
        onOpenChange={setRefillOpen}
        date={date}
        catalog={canisters}
        inventory={canisterInventory}
        sparksBalance={sparks}
        flameNamesById={Object.fromEntries(
          entries.map((e) => [e.flame.id, e.flame.name]),
        )}
      />
    </div>
  );
}

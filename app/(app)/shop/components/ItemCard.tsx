'use client';

import { SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Item } from '@/lib/supabase/rows';
import { ItemVisual } from './ItemVisual';
import { PurchaseDialog } from './PurchaseDialog';

interface ItemCardProps {
  item: Item;
  balance: number;
  ownedQuantity: number;
  onPurchase: (itemId: string, cost: number) => void;
}

export function ItemCard({
  item,
  balance,
  ownedQuantity,
  onPurchase,
}: ItemCardProps) {
  const t = useTranslations('shop');
  const [dialogOpen, setDialogOpen] = useState(false);
  const canAfford = balance >= item.cost_sparks;

  return (
    <>
      <div className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-foreground transition-colors hover:border-primary/50">
        {/* Header — Name + type */}
        <div className="px-3 pt-3">
          <h3 className="truncate text-center text-sm font-semibold leading-tight">
            {item.name}
          </h3>
          <div className="text-center text-[10px] font-medium text-muted-foreground">
            {item.type}
          </div>
        </div>

        {/* Visual area */}
        <div className="flex h-32 items-center justify-center sm:h-44">
          <div className="h-24 w-24 sm:h-32 sm:w-32">
            <ItemVisual itemName={item.name} />
          </div>
        </div>

        {/* Footer — Price + buy */}
        <div className="flex items-center justify-between bg-muted px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-background px-2 py-0.5 text-xs font-semibold">
              <SparklesIcon className="size-3 text-primary" />
              <span>{item.cost_sparks}</span>
            </div>
            {ownedQuantity > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {t('owned')} {t('quantity', { count: String(ownedQuantity) })}
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={!canAfford}
            onClick={() => setDialogOpen(true)}
            className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canAfford ? t('buy') : t('insufficientSparks')}
          </button>
        </div>
      </div>

      <PurchaseDialog
        item={item}
        balance={balance}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onPurchase={onPurchase}
      />
    </>
  );
}

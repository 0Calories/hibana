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
      <div className="relative flex w-40 flex-col overflow-hidden rounded-xl border border-border bg-card text-foreground transition-colors hover:border-primary/50 sm:w-48 md:w-56">
        {/* Header — Name + type */}
        <div className="px-2 pt-2 sm:px-3 sm:pt-3">
          <h3 className="truncate text-center text-xs font-semibold leading-tight sm:text-sm md:text-base">
            {item.name}
          </h3>
          <div className="text-center text-[10px] font-medium text-muted-foreground sm:text-xs">
            {item.type}
          </div>
        </div>

        {/* Visual area */}
        <div className="flex h-24 items-center justify-center sm:h-32 md:h-40">
          <div className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32">
            <ItemVisual itemName={item.name} />
          </div>
        </div>

        {/* Footer — Price + buy */}
        <div className="flex items-center justify-between bg-muted px-2 py-2 sm:px-3 sm:py-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-background px-1.5 py-0.5 text-[10px] font-semibold sm:px-2 sm:text-xs">
              <SparklesIcon className="size-2.5 text-primary sm:size-3" />
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
            className="rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-xs"
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

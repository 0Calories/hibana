'use client';

import { SparklesIcon } from 'lucide-react';
import { useState } from 'react';
import type { Item } from '@/lib/supabase/rows';
import { ItemDetailDialog } from './ItemDetailDialog';
import { ItemVisual } from './ItemVisual';

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
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="relative flex w-40 cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card text-left sm:w-48 md:w-56"
      >
        {/* Header — Name + price */}
        <div className="px-2 pt-2 sm:px-3 sm:pt-3">
          <div className="flex items-center justify-between gap-1">
            <h3 className="truncate text-xs font-semibold leading-tight text-foreground sm:text-sm md:text-base">
              {item.name}
            </h3>
            <div className="flex shrink-0 items-center gap-0.5">
              <SparklesIcon className="size-2.5 text-primary sm:size-3" />
              <span className="text-[10px] font-semibold text-foreground sm:text-xs">
                {item.cost_sparks}
              </span>
            </div>
          </div>
        </div>

        {/* Visual area */}
        <div className="flex min-h-28 flex-1 items-center justify-center px-2 pb-2 sm:min-h-0 sm:px-3 sm:pb-3">
          <div className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32">
            <ItemVisual itemName={item.name} />
          </div>
        </div>
      </button>

      <ItemDetailDialog
        item={item}
        balance={balance}
        ownedQuantity={ownedQuantity}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onPurchase={onPurchase}
      />
    </>
  );
}

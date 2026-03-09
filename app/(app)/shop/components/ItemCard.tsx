'use client';

import { SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Item } from '@/lib/supabase/rows';
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
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base">{item.name}</CardTitle>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {item.type}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {item.description && (
            <p className="mb-3 text-sm text-muted-foreground">
              {item.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm font-semibold">
              <SparklesIcon className="size-3.5 text-amber-500" />
              <span>{item.cost_sparks}</span>
            </div>

            <div className="flex items-center gap-2">
              {ownedQuantity > 0 && (
                <span className="text-xs text-muted-foreground">
                  {t('quantity', { count: String(ownedQuantity) })}
                </span>
              )}
              <button
                type="button"
                disabled={!canAfford}
                onClick={() => setDialogOpen(true)}
                className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canAfford ? t('buy') : t('insufficientSparks')}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

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

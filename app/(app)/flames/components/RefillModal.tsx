'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Item, UserItem } from '@/lib/supabase/rows';
import {
  openCanister,
  purchaseAndOpenCanister,
  type RefillResult,
} from '../actions';
import { formatFuelBalance } from '../utils/format';

interface RefillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Today's date (YYYY-MM-DD). */
  date: string;
  /** All canister items in the catalog. */
  catalog: Item[];
  /** User's owned canister inventory rows (joined items not needed; we cross-ref by item_id). */
  inventory: Array<UserItem>;
  /** User's current spark balance — used to enable/disable buy buttons. */
  sparksBalance: number;
  /** Map of flame_id → display name, for the catch-up toast. */
  flameNamesById: Record<string, string>;
}

export function RefillModal({
  open,
  onOpenChange,
  date,
  catalog,
  inventory,
  sparksBalance,
  flameNamesById,
}: RefillModalProps) {
  const t = useTranslations('flames.refill');
  const [busy, setBusy] = useState(false);

  const inventoryByItemId = new Map(
    inventory.map((u) => [u.item_id, u.quantity]),
  );

  const surfaceResult = (result: RefillResult) => {
    const appliedNames = result.applied.map((a) => {
      const name = flameNamesById[a.flameId] ?? '(flame)';
      const mins = Math.round(a.secondsApplied / 60);
      return `${mins}m on ${name}`;
    });
    const remainder = formatFuelBalance(result.remainderSecondsAdded);
    const parts = [...appliedNames.map((s) => t('appliedItem', { detail: s }))];
    if (result.remainderSecondsAdded > 0) {
      parts.push(t('addedToBalance', { amount: remainder }));
    }
    toast.success(
      parts.length > 0
        ? parts.join(' · ')
        : t('simpleRefilled', {
            amount: formatFuelBalance(result.canisterSeconds),
          }),
      {
        position: 'top-center',
      },
    );
  };

  const handleOpen = async (itemId: string) => {
    setBusy(true);
    const result = await openCanister(itemId, date);
    setBusy(false);
    if (!result.success) {
      toast.error(result.error.message, { position: 'top-center' });
      return;
    }
    surfaceResult(result.data);
    onOpenChange(false);
  };

  const handleBuyAndOpen = async (itemId: string) => {
    setBusy(true);
    const requestId = crypto.randomUUID();
    const result = await purchaseAndOpenCanister(itemId, date, requestId);
    setBusy(false);
    if (!result.success) {
      toast.error(result.error.message, { position: 'top-center' });
      return;
    }
    surfaceResult(result.data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {catalog.map((item) => {
            const qty = inventoryByItemId.get(item.id) ?? 0;
            const seconds =
              (item.metadata as { seconds?: number })?.seconds ?? 0;
            const canBuy = sparksBalance >= item.cost_sparks;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatFuelBalance(seconds)} · {item.cost_sparks} sparks
                  </div>
                </div>
                {qty > 0 ? (
                  <Button
                    size="sm"
                    onClick={() => handleOpen(item.id)}
                    disabled={busy}
                  >
                    {t('open', { qty: String(qty) })}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBuyAndOpen(item.id)}
                    disabled={busy || !canBuy}
                  >
                    {canBuy ? t('buyAndOpen') : t('insufficientSparks')}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

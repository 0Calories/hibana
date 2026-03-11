'use client';

import { SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Item } from '@/lib/supabase/rows';
import { purchaseItem } from '../actions';
import { ItemVisual } from './ItemVisual';

interface ItemDetailDialogProps {
  item: Item;
  balance: number;
  ownedQuantity: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: (itemId: string, cost: number) => void;
}

export function ItemDetailDialog({
  item,
  balance,
  ownedQuantity,
  open,
  onOpenChange,
  onPurchase,
}: ItemDetailDialogProps) {
  const t = useTranslations('shop');
  const [view, setView] = useState<'detail' | 'confirm'>('detail');
  const [pending, setPending] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const canAfford = balance >= item.cost_sparks;
  const balanceAfter = balance - item.cost_sparks;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setView('detail');
      setTooltipOpen(false);
    }
    onOpenChange(open);
  };

  const handleConfirm = async () => {
    if (pending) return;
    setPending(true);

    const result = await purchaseItem(item.id);
    if (result.success) {
      toast.success(t('purchaseSuccess'), { position: 'top-center' });
      onPurchase(item.id, result.data.cost);
    } else {
      toast.error(t('purchaseError'), { position: 'top-center' });
    }

    setPending(false);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {view === 'detail' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-base">{item.name}</DialogTitle>

              {/* Type pill */}
              <div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {item.type}
                </span>
              </div>
            </DialogHeader>

            {/* Visual */}
            <div className="flex justify-center py-2">
              <div className="h-32 w-32 sm:h-40 sm:w-40">
                <ItemVisual itemName={item.name} />
              </div>
            </div>

            {/* Description + owned */}
            <div className="space-y-1.5">
              {item.description && (
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
              {ownedQuantity > 0 && (
                <p className="text-sm text-muted-foreground">
                  {t('owned')}:{' '}
                  {t('quantity', { count: String(ownedQuantity) })}
                </p>
              )}
            </div>

            <DialogFooter className="justify-center sm:justify-center">
              {canAfford ? (
                <Button onClick={() => setView('confirm')}>
                  <SparklesIcon className="size-3.5" /> {item.cost_sparks}
                </Button>
              ) : (
                <TooltipProvider delayDuration={300}>
                  <Tooltip onOpenChange={(o) => o && setTooltipOpen(true)}>
                    <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                      <button
                        type="button"
                        className="cursor-not-allowed opacity-50"
                      >
                        <Button disabled asChild>
                          <span>
                            <SparklesIcon className="size-3.5" />{' '}
                            {item.cost_sparks}
                          </span>
                        </Button>
                      </button>
                    </TooltipTrigger>
                    {tooltipOpen && (
                      <TooltipContent side="top">
                        {t('insufficientSparks')}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {t('purchaseTitle', { name: item.name })}
              </DialogTitle>

              {/* Cost breakdown */}
              <div className="flex flex-col gap-1 rounded-md bg-muted p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('cost')}</span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <SparklesIcon className="size-3.5 text-primary" />
                    {item.cost_sparks}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t('balanceCurrent')}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <SparklesIcon className="size-3.5 text-primary" />
                    {balance}
                  </span>
                </div>
                <div className="border-t border-border pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t('balanceAfter')}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <SparklesIcon className="size-3.5 text-primary" />
                      {balanceAfter}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => setView('detail')}
              >
                {t('back')}
              </Button>
              <Button disabled={pending} onClick={handleConfirm}>
                {pending ? t('purchasing') : t('purchaseConfirm')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

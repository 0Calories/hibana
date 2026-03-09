'use client';

import { SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Item } from '@/lib/supabase/rows';
import { purchaseItem } from '../actions';

interface PurchaseDialogProps {
  item: Item;
  balance: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: (itemId: string, cost: number) => void;
}

export function PurchaseDialog({
  item,
  balance,
  open,
  onOpenChange,
  onPurchase,
}: PurchaseDialogProps) {
  const t = useTranslations('shop');
  const tCommon = useTranslations('common');
  const [pending, setPending] = useState(false);
  const balanceAfter = balance - item.cost_sparks;

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
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('purchaseTitle', { name: item.name })}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>{t('purchaseDescription', { name: item.name })}</p>
              <div className="flex flex-col gap-1 rounded-md bg-muted p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('cost')}</span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <SparklesIcon className="size-3.5 text-amber-500" />
                    {item.cost_sparks}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t('balanceCurrent')}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <SparklesIcon className="size-3.5 text-amber-500" />
                    {balance}
                  </span>
                </div>
                <div className="border-t border-border pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t('balanceAfter')}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <SparklesIcon className="size-3.5 text-amber-500" />
                      {balanceAfter}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            {tCommon('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={pending}>
            {pending ? t('purchasing') : t('purchaseConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

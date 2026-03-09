'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { InventoryItemWithDetails } from '../actions';
import { toggleEquipItem } from '../actions';

interface InventoryItemProps {
  inventoryItem: InventoryItemWithDetails;
  onEquipToggle: (inventoryId: string, equipped: boolean) => void;
}

export function InventoryItem({
  inventoryItem,
  onEquipToggle,
}: InventoryItemProps) {
  const t = useTranslations('shop');
  const inv = inventoryItem;

  const handleToggle = async (checked: boolean) => {
    onEquipToggle(inv.id, checked);

    const result = await toggleEquipItem(inv.id, checked);
    if (!result.success) {
      // Revert on failure
      onEquipToggle(inv.id, !checked);
      toast.error(t('equipError'), { position: 'top-center' });
    }
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{inv.items.name}</span>
            {inv.quantity > 1 && (
              <span className="text-xs text-muted-foreground">
                {t('quantity', { count: String(inv.quantity) })}
              </span>
            )}
            {inv.is_equipped && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {t('equipped')}
              </span>
            )}
          </div>
          {inv.items.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {inv.items.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {inv.is_equipped ? t('unequip') : t('equip')}
          </span>
          <Switch checked={inv.is_equipped} onCheckedChange={handleToggle} />
        </div>
      </CardContent>
    </Card>
  );
}

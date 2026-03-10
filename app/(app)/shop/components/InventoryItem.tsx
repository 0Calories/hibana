'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import type { InventoryItemWithDetails } from '../actions';
import { toggleEquipItem } from '../actions';
import { ItemVisual } from './ItemVisual';

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
      onEquipToggle(inv.id, !checked);
      toast.error(t('equipError'), { position: 'top-center' });
    }
  };

  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-foreground">
      {/* Visual area */}
      <div className="flex h-28 items-center justify-center sm:h-36">
        <div className="h-20 w-20 sm:h-24 sm:w-24">
          <ItemVisual itemName={inv.items.name} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between bg-muted px-3 py-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{inv.items.name}</span>
            {inv.quantity > 1 && (
              <span className="text-[10px] text-muted-foreground">
                {t('quantity', { count: String(inv.quantity) })}
              </span>
            )}
          </div>
          {inv.is_equipped && (
            <span className="text-[10px] font-medium text-primary">
              {t('equipped')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {inv.is_equipped ? t('unequip') : t('equip')}
          </span>
          <Switch checked={inv.is_equipped} onCheckedChange={handleToggle} />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import type { InventoryItemWithDetails } from '../actions';
import { toggleEquipItem } from '../actions';
import { ItemRenderer } from './ItemRenderer';

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
    <div className="relative flex w-40 flex-col overflow-hidden rounded-xl border border-border bg-card text-foreground sm:w-48 md:w-56">
      {/* Visual area */}
      <div className="flex h-24 items-center justify-center sm:h-32 md:h-40">
        <div className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32">
          <ItemRenderer itemName={inv.items.name} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between bg-muted px-2 py-2 sm:px-3 sm:py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium sm:text-sm md:text-base">
              {inv.items.name}
            </span>
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

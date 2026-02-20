'use client';

import { useTranslations } from 'next-intl';
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
import type { Flame } from '@/utils/supabase/rows';
import { deleteFlame } from '../../actions';

interface DeleteFlameDialogProps {
  flame: Flame | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteFlameDialog({
  flame,
  open,
  onOpenChange,
}: DeleteFlameDialogProps) {
  const t = useTranslations('flames.manage');
  const tCommon = useTranslations('common');

  const handleDelete = async () => {
    if (!flame) return;

    const result = await deleteFlame(flame.id);
    if (result.success) {
      toast.success(t('deleteSuccess'), { position: 'top-center' });
    } else {
      toast.error(t('deleteError'), { position: 'top-center' });
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteDescription', { name: flame?.name ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>
            {t('deleteConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

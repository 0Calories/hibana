'use client';

import { LockIcon, PlusIcon } from 'lucide-react';
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
import type { Flame, FlameSession } from '@/lib/supabase/rows';
import { addToDailyPlan, removeFromDailyPlan } from '../actions';
import { getFlameColors } from '../utils/colors';
import { CreateFlameDialog } from './CreateFlameDialog';
import { MinutesPill } from './MinutesPill';
import { StaticFlameIcon } from './StaticFlameIcon';

interface EditLineupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  /** Currently in-lineup session rows + flames. */
  entries: Array<{ flame: Flame; session: FlameSession }>;
  /** Non-archived flames not yet in the lineup. */
  unscheduledFlames: Flame[];
  /** Last-used targets for default values when adding. */
  lastUsedTargetsByFlameId: Record<string, number | undefined>;
}

const GRACE_SECONDS = 300;

export function EditLineupSheet({
  open,
  onOpenChange,
  date,
  entries,
  unscheduledFlames,
  lastUsedTargetsByFlameId,
}: EditLineupSheetProps) {
  const t = useTranslations('flames.edit');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const isLocked = (s: FlameSession) =>
    s.is_completed || s.duration_seconds > GRACE_SECONDS;

  const handleRemove = async (flameId: string) => {
    setBusy(true);
    const result = await removeFromDailyPlan(date, flameId);
    setBusy(false);
    if (!result.success) {
      toast.error(result.error.message, { position: 'top-center' });
      return;
    }
    toast.success(t('removed'), { position: 'top-center' });
  };

  const handleAdd = async (flameId: string) => {
    const target = lastUsedTargetsByFlameId[flameId] ?? 30 * 60;
    setBusy(true);
    const result = await addToDailyPlan(date, flameId, target);
    setBusy(false);
    if (!result.success) {
      toast.error(result.error.message, { position: 'top-center' });
      return;
    }
    toast.success(t('added'), { position: 'top-center' });
    setPickerOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          {entries.map(({ flame, session }) => {
            const colors = getFlameColors(flame.color);
            const locked = isLocked(session);
            return (
              <div
                key={flame.id}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
              >
                <StaticFlameIcon
                  level={1}
                  colors={colors}
                  className="size-6 shrink-0"
                />
                <span className="flex-1 truncate text-sm">{flame.name}</span>
                <MinutesPill
                  value={session.target_seconds ?? 0}
                  onChange={() => {}}
                  disabled
                />
                {locked ? (
                  <LockIcon
                    className="size-4 text-muted-foreground"
                    aria-label={t('locked')}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRemove(flame.id)}
                    disabled={busy}
                    className="size-6 rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={t('remove')}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setPickerOpen(true)}
          className="w-full"
        >
          <PlusIcon className="size-4" />
          {t('addFlame')}
        </Button>

        {pickerOpen && (
          <div className="rounded-lg border border-border bg-muted/20 p-2">
            <div className="flex flex-wrap gap-1.5">
              {unscheduledFlames.map((flame) => {
                const colors = getFlameColors(flame.color);
                return (
                  <button
                    key={flame.id}
                    type="button"
                    onClick={() => handleAdd(flame.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs hover:bg-muted/40"
                  >
                    <span
                      className="size-3 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${colors.medium}, ${colors.light})`,
                      }}
                    />
                    {flame.name}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-xs"
              >
                <PlusIcon className="size-3" />
                {t('createNewFlame')}
              </button>
            </div>
          </div>
        )}

        <CreateFlameDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={(flame) => {
            handleAdd(flame.id);
            setCreateOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

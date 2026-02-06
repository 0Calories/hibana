'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface CompletionStats {
  flameName: string;
  flameColor: string;
  elapsedSeconds: number;
  targetSeconds: number;
  progress: number;
}

interface CompletionSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: CompletionStats | null;
}

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function CompletionSummaryDialog({
  open,
  onOpenChange,
  stats,
}: CompletionSummaryDialogProps) {
  const t = useTranslations('flames.completion');

  if (!stats) return null;

  const progressPercent = Math.round(stats.progress * 100);
  const isOverburned = stats.progress > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            {t('title')}
          </DialogTitle>
          <DialogDescription className="text-center">
            <span style={{ color: stats.flameColor, fontWeight: 600 }}>
              {stats.flameName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('timeSpent')}</span>
            <span className="font-mono font-medium">
              {formatTime(stats.elapsedSeconds)}
            </span>
          </div>

          {stats.targetSeconds > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('target')}</span>
              <span className="font-mono font-medium">
                {formatTime(stats.targetSeconds)}
              </span>
            </div>
          )}

          {stats.targetSeconds > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {isOverburned ? t('overburned') : t('progress')}
              </span>
              <span
                className="font-medium"
                style={isOverburned ? { color: stats.flameColor } : undefined}
              >
                {progressPercent}%
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('xpEarned')}</span>
            <span className="text-muted-foreground text-xs italic">
              {t('xpComingSoon')}
            </span>
          </div>
        </div>

        <DialogFooter showCloseButton>
          {/* Close button is provided by DialogFooter */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { CalendarDaysIcon, SlidersHorizontalIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function FlamesPageActions() {
  const t = useTranslations('flames');

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/schedule"
              className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
              aria-label={t('scheduleLink')}
            >
              <CalendarDaysIcon className="size-4.5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('scheduleLink')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/flames/manage"
              className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
              aria-label={t('manageLink')}
            >
              <SlidersHorizontalIcon className="size-4.5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('manageLink')}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CompleteButtonProps {
  color: string;
  onClick: (e: React.MouseEvent) => void;
}

export function CompleteButton({ color, onClick }: CompleteButtonProps) {
  const t = useTranslations('flames.card');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            type="button"
            aria-label={t('markComplete')}
            onClick={(e) => {
              e.stopPropagation();
              onClick(e);
            }}
            className="absolute right-1.5 top-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full border sm:right-2 sm:top-2 sm:h-6 sm:w-6"
            style={{
              backgroundColor: `${color}18`,
              borderColor: `${color}50`,
              color,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t('markComplete')}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

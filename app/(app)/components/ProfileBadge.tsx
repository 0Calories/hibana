'use client';

import { motion } from 'framer-motion';
import { SparklesIcon, UserIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { getFlameLevel } from '@/app/(app)/flames/utils/levels';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';

interface ProfileBadgeProps {
  username?: string;
  sparks?: number;
  level?: number;
  xp?: number;
  xpToNext?: number;
}

const MOCK_DATA = {
  username: 'Explorer',
  sparks: 128,
  level: 3,
  xp: 450,
  xpToNext: 1000,
};

export function ProfileBadge({
  username = MOCK_DATA.username,
  sparks = MOCK_DATA.sparks,
  level = MOCK_DATA.level,
  xp = MOCK_DATA.xp,
  xpToNext = MOCK_DATA.xpToNext,
}: ProfileBadgeProps) {
  const flameLevel = getFlameLevel(level);
  const xpProgress = xpToNext > 0 ? xp / xpToNext : 0;

  return (
    <>
      {/* Desktop: Full variant */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-amber-400">
            <SparklesIcon className="size-4" />
            <span className="font-medium">{sparks}</span>
          </div>
          <Badge
            variant="outline"
            className="text-xs"
            style={{ borderColor: flameLevel.color, color: flameLevel.color }}
          >
            Lv.{level} {flameLevel.name}
          </Badge>
        </div>
        <div className="relative flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-muted">
            <UserIcon className="size-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium">{username}</span>
          {/* XP progress bar beneath */}
          <motion.div
            className="absolute -bottom-1.5 left-0 h-0.5 rounded-full"
            style={{ backgroundColor: flameLevel.color }}
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Mobile: Compact variant */}
      <CompactProfileBadge
        username={username}
        sparks={sparks}
        level={level}
        xp={xp}
        xpToNext={xpToNext}
        flameLevel={flameLevel}
        xpProgress={xpProgress}
      />
    </>
  );
}

function CompactProfileBadge({
  username,
  sparks,
  level,
  xp,
  xpToNext,
  flameLevel,
  xpProgress,
}: ProfileBadgeProps & {
  flameLevel: ReturnType<typeof getFlameLevel>;
  xpProgress: number;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('profile');

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <div className="flex items-center gap-1 text-xs text-amber-400">
          <SparklesIcon className="size-3.5" />
          <span className="font-medium">{sparks}</span>
        </div>
        <div className="flex size-7 items-center justify-center rounded-full bg-muted">
          <UserIcon className="size-3.5 text-muted-foreground" />
        </div>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom">
          <SheetTitle>{t('title')}</SheetTitle>
          <SheetDescription className="sr-only">
            {t('description')}
          </SheetDescription>

          <div className="flex flex-col gap-5 pt-2">
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <UserIcon className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">{username}</p>
                <Badge
                  variant="outline"
                  className="mt-1 text-xs"
                  style={{
                    borderColor: flameLevel.color,
                    color: flameLevel.color,
                  }}
                >
                  Lv.{level} {flameLevel.name}
                </Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <SparklesIcon className="size-4" />
                  <span className="text-lg font-bold">{sparks}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('sparks')}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <span className="text-lg font-bold">{level}</span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('level')}
                </p>
              </div>
            </div>

            {/* XP progress */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>{t('xpProgress')}</span>
                <span>
                  {xp} / {xpToNext} XP
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: flameLevel.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

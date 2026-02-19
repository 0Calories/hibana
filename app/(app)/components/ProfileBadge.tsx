'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SparklesIcon, UserIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { type LandingState, useSparkFlyover } from './SparkFlyover';
import { useUserState } from './UserStateProvider';

interface ProfileBadgeProps {
  username?: string;
  sparks?: number;
  level?: number;
  xp?: number;
  xpToNext?: number;
}

const MOCK_DATA = {
  username: 'Explorer',
  level: 3,
  xp: 450,
  xpToNext: 1000,
};

/** Compute displayed spark count during flyover: increments as particles land */
function getDisplayedSparks(
  baseSparks: number,
  landing: LandingState | null,
): number {
  if (!landing || landing.totalParticles === 0) return baseSparks;
  const fraction = landing.landedCount / landing.totalParticles;
  return baseSparks + Math.floor(landing.totalSparks * fraction);
}

export function ProfileBadge({
  username = MOCK_DATA.username,
  level = MOCK_DATA.level,
  xp = MOCK_DATA.xp,
  xpToNext = MOCK_DATA.xpToNext,
}: ProfileBadgeProps) {
  const { sparks_balance: sparks } = useUserState();
  const xpProgress = xpToNext > 0 ? Math.min(1, Math.max(0, xp / xpToNext)) : 0;
  const { registerTarget, landingState } = useSparkFlyover();

  return (
    <>
      {/* Desktop: Compact pill */}
      <DesktopProfilePill
        username={username}
        sparks={sparks}
        level={level}
        registerTarget={registerTarget}
        landingState={landingState}
      />

      {/* Mobile: Compact badge */}
      <MobileProfileBadge
        username={username}
        sparks={sparks}
        level={level}
        xp={xp}
        xpToNext={xpToNext}
        xpProgress={xpProgress}
        registerTarget={registerTarget}
        landingState={landingState}
      />
    </>
  );
}

function DesktopProfilePill({
  username,
  sparks,
  level,
  registerTarget,
  landingState,
}: ProfileBadgeProps & {
  registerTarget: (el: HTMLElement | null) => void;
  landingState: LandingState | null;
}) {
  const sparkRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [landPulse, setLandPulse] = useState(false);
  const prevLanded = useRef(0);

  // Register as flyover target
  useEffect(() => {
    registerTarget(sparkRef.current);
  }, [registerTarget]);

  // Per-particle landing pulse
  const landedCount = landingState?.landedCount ?? 0;
  useEffect(() => {
    if (landedCount > prevLanded.current) {
      setLandPulse(true);
      const timer = setTimeout(() => setLandPulse(false), 150);
      prevLanded.current = landedCount;
      return () => clearTimeout(timer);
    }
    if (landedCount === 0) prevLanded.current = 0;
  }, [landedCount]);

  const displayedSparks = getDisplayedSparks(sparks ?? 0, landingState);

  return (
    <div className="hidden md:flex items-center gap-0 rounded-full border border-border bg-muted/50 py-1 pl-1 pr-3">
      <div className="relative mr-2">
        <div className="flex size-7 items-center justify-center rounded-full bg-background">
          <UserIcon className="size-3.5 text-muted-foreground" />
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-muted text-[8px] font-bold leading-none ring-1 ring-border">
          {level}
        </span>
      </div>
      <span className="text-sm font-medium">{username}</span>
      <span className="mx-1.5 text-border">·</span>
      <motion.div
        ref={sparkRef}
        className="flex items-center gap-1 text-sm text-primary"
        animate={
          landPulse && !shouldReduceMotion
            ? {
                scale: [1, 1.25, 1],
                filter: [
                  'drop-shadow(0 0 0px #E60076)',
                  'drop-shadow(0 0 8px #E60076)',
                  'drop-shadow(0 0 0px #E60076)',
                ],
              }
            : {}
        }
        transition={{ duration: 0.25 }}
      >
        <SparklesIcon className="size-3.5" />
        <span className="font-medium tabular-nums">{displayedSparks}</span>
      </motion.div>
    </div>
  );
}

function MobileProfileBadge({
  username,
  sparks,
  level,
  xp,
  xpToNext,
  xpProgress,
  registerTarget,
  landingState,
}: ProfileBadgeProps & {
  xpProgress: number;
  registerTarget: (el: HTMLElement | null) => void;
  landingState: LandingState | null;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('profile');
  const sparkRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [landPulse, setLandPulse] = useState(false);
  const prevLanded = useRef(0);

  // Register as flyover target (mobile takes priority when visible)
  useEffect(() => {
    registerTarget(sparkRef.current);
  }, [registerTarget]);

  // Per-particle landing pulse
  const landedCount = landingState?.landedCount ?? 0;
  useEffect(() => {
    if (landedCount > prevLanded.current) {
      setLandPulse(true);
      const timer = setTimeout(() => setLandPulse(false), 150);
      prevLanded.current = landedCount;
      return () => clearTimeout(timer);
    }
    if (landedCount === 0) prevLanded.current = 0;
  }, [landedCount]);

  const displayedSparks = getDisplayedSparks(sparks ?? 0, landingState);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('title')}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex items-center gap-2"
      >
        <motion.div
          ref={sparkRef}
          className="flex items-center gap-1 text-xs text-primary"
          animate={
            landPulse && !shouldReduceMotion
              ? {
                  scale: [1, 1.25, 1],
                  filter: [
                    'drop-shadow(0 0 0px #E60076)',
                    'drop-shadow(0 0 8px #E60076)',
                    'drop-shadow(0 0 0px #E60076)',
                  ],
                }
              : {}
          }
          transition={{ duration: 0.25 }}
        >
          <SparklesIcon className="size-3.5" />
          <span className="font-semibold tabular-nums">{displayedSparks}</span>
        </motion.div>
        <div className="relative">
          <div className="flex size-7 items-center justify-center rounded-full bg-muted">
            <UserIcon className="size-3.5 text-muted-foreground" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-muted text-[8px] font-bold leading-none ring-1 ring-background">
            {level}
          </span>
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
                <Badge variant="secondary" className="mt-1 text-xs">
                  Lv.{level}
                </Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-1.5 text-primary">
                  <SparklesIcon className="size-4" />
                  <span className="text-lg font-bold">{displayedSparks}</span>
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
                  className="h-full rounded-full bg-primary"
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

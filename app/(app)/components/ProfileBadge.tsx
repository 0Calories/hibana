'use client';

import {
  type AnimationPlaybackControls,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion';
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
  username: 'Smokesniffer',
  level: 3,
  xp: 450,
  xpToNext: 1000,
};

// ─── Inflation/deflation pulse hook ─────────────────────────────────
const SCALE_BUMP = 0.08;
const MAX_SCALE = 1.2;
const DECAY_DURATION = 0.5;

function useInflatingPulse(landingState: LandingState | null) {
  const scale = useMotionValue(1);
  const [flashActive, setFlashActive] = useState(false);
  const decayRef = useRef<AnimationPlaybackControls | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevLanded = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  const landedCount = landingState?.landedCount ?? 0;

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (landedCount > prevLanded.current) {
      // Scale inflation
      decayRef.current?.stop();
      const bumped = Math.min(scale.get() + SCALE_BUMP, MAX_SCALE);
      scale.set(bumped);
      decayRef.current = animate(scale, 1, {
        duration: DECAY_DURATION,
        ease: 'easeOut',
      });

      // Color flash — snap to gold, CSS transition handles fade-out
      setFlashActive(true);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlashActive(false), 400);
      prevLanded.current = landedCount;
    }

    if (landedCount === 0) prevLanded.current = 0;

    return () => {
      decayRef.current?.stop();
      if (flashTimer.current) {
        clearTimeout(flashTimer.current);
      }
    };
  }, [landedCount, scale, shouldReduceMotion]);

  return { scale, flashActive };
}

/** Compute displayed spark count during flyover: increments as particles land */
function getDisplayedSparks(
  baseSparks: number,
  landing: LandingState | null,
): number {
  if (!landing || landing.totalParticles === 0) return baseSparks;
  const fraction = landing.landedCount / landing.totalParticles;
  return baseSparks + Math.floor(landing.totalSparks * fraction);
}

// ─── Main component ─────────────────────────────────────────────────
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

// ─── Desktop ────────────────────────────────────────────────────────
type DesktopProfilePillProps = ProfileBadgeProps & {
  registerTarget: (el: HTMLElement | null) => void;
  landingState: LandingState | null;
};

function DesktopProfilePill({
  username,
  sparks,
  level,
  registerTarget,
  landingState,
}: DesktopProfilePillProps) {
  const sparkRef = useRef<HTMLDivElement>(null);
  const { scale, flashActive } = useInflatingPulse(landingState);

  useEffect(() => {
    registerTarget(sparkRef.current);
  }, [registerTarget]);

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
        className={`flex items-center gap-1 text-sm transition-colors duration-300 ease-out ${flashActive ? 'text-amber-400' : 'text-primary'}`}
        style={{ scale }}
      >
        <SparklesIcon className="size-3.5" />
        <span className="font-medium tabular-nums">{displayedSparks}</span>
      </motion.div>
    </div>
  );
}

// ─── Mobile ─────────────────────────────────────────────────────────
type MobileProfileBadgeProps = ProfileBadgeProps & {
  xpProgress: number;
  registerTarget: (el: HTMLElement | null) => void;
  landingState: LandingState | null;
};

function MobileProfileBadge({
  username,
  sparks,
  level,
  xp,
  xpToNext,
  xpProgress,
  registerTarget,
  landingState,
}: MobileProfileBadgeProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('profile');
  const sparkRef = useRef<HTMLDivElement>(null);
  const { scale, flashActive } = useInflatingPulse(landingState);

  useEffect(() => {
    registerTarget(sparkRef.current);
  }, [registerTarget]);

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
          className={`flex items-center gap-1 text-xs transition-colors duration-300 ease-out ${flashActive ? 'text-amber-400' : 'text-primary'}`}
          style={{ scale }}
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

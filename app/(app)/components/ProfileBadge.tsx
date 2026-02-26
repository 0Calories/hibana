'use client';

import {
  type AnimationPlaybackControls,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import {
  LogOutIcon,
  SettingsIcon,
  SparklesIcon,
  UserCircleIcon,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { type LandingState, useSparkFlyover } from './SparkFlyover';
import { useUserState } from './UserStateProvider';

interface ProfileBadgeProps {
  username?: string;
  rankName?: string;
  sparks?: number;
  level?: number;
  xp?: number;
  xpToNext?: number;
}

const MOCK_DATA = {
  username: 'Ash',
  rankName: 'Smokesniffer',
  level: 3,
  xp: 690,
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
      decayRef.current?.stop();
      const bumped = Math.min(scale.get() + SCALE_BUMP, MAX_SCALE);
      scale.set(bumped);
      decayRef.current = animate(scale, 1, {
        duration: DECAY_DURATION,
        ease: 'easeOut',
      });

      setFlashActive(true);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlashActive(false), 400);
      prevLanded.current = landedCount;
    }

    if (landedCount === 0) {
      prevLanded.current = 0;
      setFlashActive(false);
    }

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

// ─── XP Ring (CSS conic-gradient) ───────────────────────────────────
// Ring dimensions for the 28px (size-7) container
const RING_INNER = 10; // px from center
const RING_OUTER = 12; // px from center → 2px stroke
const RING_MASK = `radial-gradient(circle at center, transparent ${RING_INNER}px, black ${RING_INNER}px, black ${RING_OUTER}px, transparent ${RING_OUTER}px)`;

function XPRing({ progress }: { progress: number }) {
  const angle = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const target = progress * 270;
    if (shouldReduceMotion) {
      angle.set(target);
      return;
    }
    const controls = animate(angle, target, {
      duration: 0.8,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [progress, angle, shouldReduceMotion]);

  // Gradient follows the arc: primary at start (7:30) → amber at end (4:30)
  const progressBg = useTransform(
    angle,
    (a) =>
      `conic-gradient(from 225deg, #fbbf24, var(--primary) ${a}deg, transparent ${a}deg)`,
  );

  const maskStyle = {
    mask: RING_MASK,
    WebkitMask: RING_MASK,
  } as React.CSSProperties;

  return (
    <>
      {/* Track — 270° muted arc */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'conic-gradient(from 225deg, var(--muted) 270deg, transparent 270deg)',
          ...maskStyle,
        }}
      />
      {/* Progress — animated gradient arc */}
      <div className="absolute inset-0 rounded-full" style={maskStyle}>
        <motion.div className="size-full" style={{ background: progressBg }} />
      </div>
    </>
  );
}

// ─── Main component ─────────────────────────────────────────────────
export function ProfileBadge({
  username = MOCK_DATA.username,
  rankName = MOCK_DATA.rankName,
  level = MOCK_DATA.level,
  xp = MOCK_DATA.xp,
  xpToNext = MOCK_DATA.xpToNext,
}: ProfileBadgeProps) {
  const { sparks_balance: sparks } = useUserState();
  const xpProgress = xpToNext > 0 ? Math.min(1, Math.max(0, xp / xpToNext)) : 0;
  const { registerTarget, landingState, sparksBoost, resetBoost } =
    useSparkFlyover();
  const t = useTranslations('profile');
  const sparkRef = useRef<HTMLDivElement>(null);
  const { scale, flashActive } = useInflatingPulse(landingState);

  const prevServerSparks = useRef(sparks);
  useEffect(() => {
    if (sparks !== prevServerSparks.current) {
      prevServerSparks.current = sparks;
      resetBoost();
    }
  }, [sparks, resetBoost]);

  const effectiveSparks = sparks + sparksBoost;

  useEffect(() => {
    registerTarget(sparkRef.current);
  }, [registerTarget]);

  const displayedSparks = getDisplayedSparks(effectiveSparks, landingState);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('title')}
          className="flex items-center rounded-full border border-border bg-muted/50 py-0.5 pl-0.5 pr-2.5"
        >
          {/* Avatar with XP ring + level badge */}
          <div className="relative mr-1.5 flex size-7 items-center justify-center">
            <XPRing progress={xpProgress} />
            <div className="flex size-5 items-center justify-center rounded-full bg-background">
              <UserIcon className="size-2.5 text-muted-foreground" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-muted text-[8px] font-bold leading-none ring-1 ring-border">
              {level}
            </span>
          </div>
          {/* Username */}
          <span className="max-w-24 truncate text-sm font-medium">
            {username}
          </span>
          {/* Separator */}
          <span className="mx-1.5 text-border">&middot;</span>
          {/* Sparks */}
          <motion.div
            ref={sparkRef}
            className={`flex items-center gap-1 text-sm transition-colors duration-300 ease-out ${flashActive ? 'text-amber-400' : 'text-primary'}`}
            style={{ scale }}
          >
            <SparklesIcon className="size-3.5" />
            <span className="inline-block min-w-5 text-right font-medium tabular-nums">
              {displayedSparks}
            </span>
          </motion.div>
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-72 gap-0 p-0">
        {/* Profile header */}
        <div className="p-4">
          <p className="truncate text-sm font-semibold">{username}</p>
          <p className="text-xs text-muted-foreground">
            Lv.{level} · {rankName}
          </p>

          {/* Heat bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t('xpProgress')}</span>
              <span>
                {xp}/{xpToNext}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${xpProgress * 100}%`,
                  background:
                    'linear-gradient(to right, #fbbf24, var(--primary))',
                }}
              />
            </div>
          </div>
        </div>

        {/* Nav links */}
        <div className="border-t border-border px-1 py-1">
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <UserCircleIcon className="size-4" />
            {t('viewProfile')}
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <SettingsIcon className="size-4" />
            {t('settings')}
          </Link>
        </div>

        {/* Sign out */}
        <div className="border-t border-border px-1 py-1">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent"
          >
            <LogOutIcon className="size-4" />
            {t('signOut')}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

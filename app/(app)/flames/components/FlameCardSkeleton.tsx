import { Fuel } from 'lucide-react';

export function FlameCardSkeleton() {
  return (
    <div className="relative flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-linear-to-b from-white to-slate-50 dark:border-white/10 dark:from-slate-900 dark:to-slate-950">
      {/* Header - Name and Level placeholders */}
      <div className="flex flex-col items-center gap-1 px-2 pt-2 sm:px-3 sm:pt-3">
        <div className="h-3.5 w-3/5 animate-pulse rounded-md bg-slate-200 dark:bg-white/10 sm:h-4 md:h-5" />
        <div className="h-2.5 w-2/5 animate-pulse rounded-md bg-slate-200/70 dark:bg-white/[0.06] sm:h-3" />
      </div>

      {/* Flame visual area - organic pulsing shape */}
      <div className="relative flex h-28 items-center justify-center sm:h-40 md:h-52">
        <div className="relative flex items-center justify-center">
          {/* Soft glow behind the shape */}
          <div className="absolute h-16 w-14 animate-pulse rounded-full bg-slate-200/50 blur-lg dark:bg-white/[0.04] sm:h-24 sm:w-20 md:h-32 md:w-28" />
          {/* Flame-shaped skeleton */}
          <svg
            viewBox="0 0 60 80"
            className="relative h-16 w-12 sm:h-24 sm:w-[4.5rem] md:h-32 md:w-24"
            aria-hidden="true"
          >
            <path
              d="M30 4 C18 20, 6 35, 6 52 C6 66, 16 76, 30 76 C44 76, 54 66, 54 52 C54 35, 42 20, 30 4Z"
              className="animate-pulse fill-slate-200 dark:fill-white/10"
            />
            <path
              d="M30 24 C24 34, 16 42, 16 52 C16 60, 22 66, 30 66 C38 66, 44 60, 44 52 C44 42, 36 34, 30 24Z"
              className="animate-pulse fill-slate-100 dark:fill-white/[0.06]"
              style={{ animationDelay: '150ms' }}
            />
          </svg>
        </div>
      </div>

      {/* Footer - Timer, Progress, State placeholders */}
      <div className="flex flex-col gap-1 bg-slate-200/70 px-2 py-2 dark:bg-black/30 sm:gap-1.5 sm:px-3 sm:py-3">
        {/* Timer placeholder */}
        <div className="flex justify-center">
          <div className="h-3 w-16 animate-pulse rounded bg-slate-300/60 dark:bg-white/10 sm:h-3.5 sm:w-20" />
        </div>
        {/* Progress bar placeholder */}
        <div className="h-1.5 w-full animate-pulse rounded-full bg-slate-300/50 dark:bg-white/10 sm:h-2" />
        {/* State text placeholder */}
        <div className="flex justify-center">
          <div className="h-2.5 w-10 animate-pulse rounded bg-slate-300/40 dark:bg-white/[0.06] sm:h-3 sm:w-12" />
        </div>
      </div>
    </div>
  );
}

export function FuelMeterSkeleton({ label }: { label: string }) {
  return (
    <div className="sticky top-0 z-20 -mx-4 mb-4 bg-white/80 px-4 pt-4 pb-0 backdrop-blur-sm dark:bg-slate-950/80">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center gap-2.5">
          {/* Icon + label — static, no skeleton needed */}
          <div className="flex shrink-0 items-center gap-1 text-amber-600 dark:text-amber-400">
            <Fuel className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {label}
            </span>
          </div>
          {/* Bar placeholder */}
          <div className="h-3 flex-1 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
          {/* Time label placeholder */}
          <div className="h-3 w-14 shrink-0 animate-pulse rounded bg-slate-300/60 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

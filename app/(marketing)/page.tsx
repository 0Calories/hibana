import {
  Bot,
  CheckSquare,
  Flame,
  ShoppingBag,
  Sparkles,
  StickyNote,
} from 'lucide-react';
import Image from 'next/image';
import { AnimatedDiv, AnimatedSection } from './components/AnimatedSection';
import { FlameShowcase } from './components/FlameShowcase';
import { HeroEmbers } from './components/HeroEmbers';
import { HeroSection } from './components/HeroSection';
import { NewsletterForm } from './components/NewsletterForm';

// ─── Pillar data ────────────────────────────────────────────────────
const PILLARS = [
  { icon: Flame, label: 'Flames', color: '#f97316' },
  { icon: StickyNote, label: 'Notes', color: '#facc15' },
  { icon: CheckSquare, label: 'Todos', color: '#22c55e' },
  { icon: Bot, label: 'Ember AI', color: '#a78bfa' },
  { icon: Sparkles, label: 'Sparks', color: '#fb923c' },
] as const;

// ─── Page ───────────────────────────────────────────────────────────
export default function MarketingPage() {
  return (
    <div className="relative overflow-x-hidden">
      {/* ═══ JSON-LD Structured Data ═══ */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD for SEO
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Hibana',
            applicationCategory: 'LifestyleApplication',
            operatingSystem: 'Web',
            description:
              'A gamified habit tracker where your habits are living flames. Track time, earn rewards, and grow with AI companion Ember.',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-svh flex-col items-center justify-center px-6 pt-20">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '900px',
            height: '700px',
            background:
              'radial-gradient(ellipse at center, rgba(249,115,22,0.07) 0%, rgba(249,115,22,0.02) 40%, transparent 70%)',
          }}
        />

        <HeroEmbers />
        <HeroSection />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ECOSYSTEM OVERVIEW
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-10 text-center text-sm uppercase tracking-[0.2em] text-white/20">
            One app. Everything you need.
          </p>
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            {PILLARS.map((pillar, i) => (
              <AnimatedDiv
                key={pillar.label}
                delay={i * 0.08}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14"
                  style={{
                    backgroundColor: `${pillar.color}15`,
                    border: `1px solid ${pillar.color}25`,
                  }}
                >
                  <pillar.icon
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    style={{ color: pillar.color }}
                  />
                </div>
                <span className="text-xs font-medium text-white/45 sm:text-sm">
                  {pillar.label}
                </span>
              </AnimatedDiv>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════════
          FLAME PROGRESSION
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="relative px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Habits that{' '}
              <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                grow with you
              </span>
            </h2>
            <p className="mx-auto max-w-xl text-white/35">
              Every flame starts as a Wisp. Put in the work consistently and
              watch it evolve through eight stages — each more striking than
              the last. Neglect it, and it fades.
            </p>
          </div>

          <FlameShowcase />

          {/* Journey line */}
          <div className="mx-auto mt-8 hidden max-w-4xl items-center gap-1 lg:flex">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-[10px] uppercase tracking-widest text-white/15">
              Your journey
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════════
          HOW FLAMES WORK
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Time is fuel
            </h2>
            <p className="mx-auto max-w-lg text-white/35">
              Set a daily fuel budget — the hours you want to dedicate across
              your habits. Start a flame to begin burning fuel. The time you
              invest is tracked and fed into your flames, making them grow
              stronger.
            </p>
          </div>

          {/* Fuel mechanic visual */}
          <AnimatedDiv className="mx-auto max-w-2xl">
            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              {/* Fuel bar mockup */}
              <div className="border-b border-white/[0.06] px-6 py-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-semibold text-amber-400">
                    <Flame className="h-3.5 w-3.5" />
                    FUEL
                  </span>
                  <span className="text-white/30">4:32:01 remaining</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-orange-500"
                    style={{ width: '68%' }}
                  />
                </div>
              </div>

              {/* Flame cards mockup */}
              <div className="grid grid-cols-3 gap-3 p-4">
                {[
                  {
                    name: 'Japanese',
                    level: 'Lv. 3',
                    time: '48:40 / 45:00',
                    pct: '95%',
                    color: '#3b82f6',
                  },
                  {
                    name: 'Side Projects',
                    level: 'Lv. 2',
                    time: '15:20 / 2:00:00',
                    pct: '12%',
                    color: '#d946ef',
                    active: true,
                  },
                  {
                    name: 'Reading',
                    level: 'Lv. 5',
                    time: '0:00 / 1:00:00',
                    pct: '0%',
                    color: '#22c55e',
                  },
                ].map((card) => (
                  <div
                    key={card.name}
                    className="rounded-xl border p-3 text-center transition-colors"
                    style={{
                      borderColor: card.active
                        ? `${card.color}60`
                        : 'rgba(255,255,255,0.04)',
                      backgroundColor: card.active
                        ? `${card.color}08`
                        : 'rgba(255,255,255,0.01)',
                      boxShadow: card.active
                        ? `0 0 20px ${card.color}15`
                        : 'none',
                    }}
                  >
                    <div
                      className="text-xs font-semibold"
                      style={{ color: card.color }}
                    >
                      {card.name}
                    </div>
                    <div className="mt-0.5 text-[10px] text-white/25">
                      {card.level}
                    </div>
                    <div className="mt-3 text-[10px] text-white/30">
                      {card.time}
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: card.pct,
                          backgroundColor: card.color,
                          opacity: 0.6,
                        }}
                      />
                    </div>
                    {card.active && (
                      <div className="mt-2 text-[10px] text-white/25">
                        Burning ...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════════
          MEET EMBER — Teaser, not a mockup
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        {/* Warm ambient glow behind Ember */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '700px',
            height: '500px',
            background:
              'radial-gradient(ellipse at center, rgba(251,146,60,0.08) 0%, rgba(167,139,250,0.04) 40%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-3xl">
          <AnimatedSection className="flex flex-col items-center text-center">
            {/* Ember mascot — large and central */}
            <div className="relative mb-10">
              <div
                className="pointer-events-none absolute inset-0 -m-12 rounded-full blur-3xl"
                style={{
                  background:
                    'radial-gradient(circle, rgba(251,146,60,0.2) 0%, rgba(167,139,250,0.08) 50%, transparent 70%)',
                }}
              />
              <Image
                src="/ember.png"
                alt="Ember — Hibana's friendly AI flame-sprite companion"
                width={220}
                height={330}
                className="relative drop-shadow-[0_0_60px_rgba(251,146,60,0.35)]"
                priority={false}
              />
            </div>

            <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              This is{' '}
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-violet-400 bg-clip-text text-transparent">
                Ember
              </span>
            </h2>
            <p className="mx-auto max-w-lg text-lg leading-relaxed text-white/40">
              Your personal flame-sprite. Ember is an AI companion built into
              every corner of Hibana — talk to her like you&apos;d talk to a
              friend. She helps you create flames, organize your thoughts,
              and keep your momentum going.
            </p>

            {/* Capability tags */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {[
                { label: 'Create flames', color: '#f97316' },
                { label: 'Take notes', color: '#facc15' },
                { label: 'Manage todos', color: '#22c55e' },
                { label: 'Plan your day', color: '#0ea5e9' },
                { label: 'Track habits', color: '#f43f5e' },
                { label: 'Just chat', color: '#a78bfa' },
              ].map((tag) => (
                <span
                  key={tag.label}
                  className="rounded-full px-3.5 py-1.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${tag.color}12`,
                    border: `1px solid ${tag.color}25`,
                    color: `${tag.color}cc`,
                  }}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BENTO FEATURES — Gamification & ecosystem
      ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              More than a habit tracker
            </h2>
            <p className="mx-auto max-w-lg text-white/35">
              Every feature feeds into the same loop: put in the work, see
              it reflected, get rewarded, keep going.
            </p>
          </AnimatedSection>

          {/* Bento grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Sparks — tall card */}
            <AnimatedDiv
              delay={0}
              className="group relative row-span-2 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-orange-500/20 hover:bg-white/[0.04]"
            >
              <div className="absolute -right-6 -top-6 opacity-[0.04] transition-opacity group-hover:opacity-[0.08]">
                <Sparkles className="h-40 w-40 text-orange-400" strokeWidth={1} />
              </div>
              <div className="relative">
                <div className="mb-3 inline-flex rounded-xl bg-gradient-to-br from-orange-500/80 to-amber-600/80 p-2.5">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">Sparks</h3>
                <p className="mb-6 text-sm leading-relaxed text-white/40">
                  The currency of effort. Every flame session, every completed
                  todo, every streak maintained earns you sparks. They&apos;re
                  not just numbers — they&apos;re proof of work.
                </p>
                {/* Mini spark counter visual */}
                <div className="mt-auto flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-orange-400">
                    2,847
                  </span>
                  <span className="text-xs text-white/25">sparks earned</span>
                </div>
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={`spark-bar-${i}`}
                      className="flex-1 rounded-sm bg-gradient-to-t from-orange-500/40 to-orange-400/60"
                      style={{
                        height: `${16 + ((i * 37 + 11) % 28)}px`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </AnimatedDiv>

            {/* Shop */}
            <AnimatedDiv
              delay={0.06}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-sky-500/20 hover:bg-white/[0.04]"
            >
              <div className="absolute -right-4 -bottom-4 opacity-[0.04] transition-opacity group-hover:opacity-[0.08]">
                <ShoppingBag className="h-28 w-28 text-sky-400" strokeWidth={1} />
              </div>
              <div className="relative">
                <div className="mb-3 inline-flex rounded-xl bg-gradient-to-br from-sky-500/80 to-blue-600/80 p-2.5">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">The Shop</h3>
                <p className="text-sm leading-relaxed text-white/40">
                  Spend your sparks on new flame colors, card themes, dashboard
                  widgets, and productivity tools. Your effort unlocks
                  real upgrades.
                </p>
              </div>
            </AnimatedDiv>

            {/* Science */}
            <AnimatedDiv
              delay={0.12}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-violet-500/20 hover:bg-white/[0.04]"
            >
              <div className="relative">
                <div className="mb-3 text-3xl">🧠</div>
                <h3 className="mb-2 text-lg font-bold text-white">
                  Research-grounded
                </h3>
                <p className="text-sm leading-relaxed text-white/40">
                  Features aren&apos;t just gamification for the sake of it.
                  Every mechanic — streaks, progression, variable rewards — is
                  informed by behavioral psychology.
                </p>
              </div>
            </AnimatedDiv>

            {/* Color strip — wide card */}
            <AnimatedDiv
              delay={0.18}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04] sm:col-span-2"
            >
              <div className="relative">
                <h3 className="mb-2 text-lg font-bold text-white">
                  9 flame palettes. 3 families.
                </h3>
                <p className="mb-5 text-sm text-white/40">
                  Earthly, Chemical, and Cosmic. Pick the color that
                  matches the energy of each habit.
                </p>
                {/* Color swatches */}
                <div className="flex gap-2">
                  {[
                    { label: 'Rose', colors: ['#fda4af', '#f43f5e', '#e11d48'] },
                    { label: 'Orange', colors: ['#fdba74', '#f97316', '#ea580c'] },
                    { label: 'Amber', colors: ['#fcd34d', '#f59e0b', '#d97706'] },
                    { label: 'Indigo', colors: ['#a5b4fc', '#6366f1', '#4f46e5'] },
                    { label: 'Teal', colors: ['#5eead4', '#14b8a6', '#0d9488'] },
                    { label: 'Green', colors: ['#86efac', '#22c55e', '#16a34a'] },
                    { label: 'Blue', colors: ['#93c5fd', '#3b82f6', '#2563eb'] },
                    { label: 'Sky', colors: ['#7dd3fc', '#0ea5e9', '#0284c7'] },
                    { label: 'Fuchsia', colors: ['#f0abfc', '#d946ef', '#c026d3'] },
                  ].map((swatch) => (
                    <div key={swatch.label} className="flex flex-1 flex-col gap-0.5">
                      {swatch.colors.map((c, ci) => (
                        <div
                          key={`${swatch.label}-${ci}`}
                          className="h-6 rounded-sm transition-transform group-hover:scale-y-110 sm:h-8"
                          style={{
                            backgroundColor: c,
                            transitionDelay: `${ci * 30}ms`,
                          }}
                        />
                      ))}
                      <span className="mt-1 hidden text-center text-[9px] text-white/20 sm:block">
                        {swatch.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedDiv>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          WHY HIBANA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <AnimatedSection>
            <h2 className="mb-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Why{' '}
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                Hibana
              </span>
              ?
            </h2>
            <p className="mb-4 text-5xl">火花</p>
            <p className="text-lg leading-relaxed text-white/40">
              <span className="text-white/70">Hibana</span> is the Japanese
              word for <span className="text-white/70">spark</span>. Every
              fire — no matter how massive — began as one. This app is built
              on that idea: start small, stay consistent, and watch something
              real grow from the effort you put in.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="relative px-6 py-24 sm:py-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(249,115,22,0.06) 0%, transparent 60%)',
          }}
        />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to light your first flame?
          </h2>
          <p className="mb-8 max-w-md text-white/35">
            Join the waitlist and be the first to know when Hibana launches.
            Your Wisp is waiting.
          </p>
          <div className="w-full max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}

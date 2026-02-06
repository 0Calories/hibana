import {
  Brain,
  ShoppingBag,
  Sparkles,
  StickyNote,
} from 'lucide-react';
import { AnimatedDiv, AnimatedSection } from './components/AnimatedSection';
import { AnimatedFuelBar } from './components/AnimatedFuelBar';
import { EmberFloat } from './components/EmberFloat';
import { FlameShowcase } from './components/FlameShowcase';
import { HeroEmbers } from './components/HeroEmbers';
import { HeroSection } from './components/HeroSection';
import { NewsletterForm } from './components/NewsletterForm';

const FLAME_SWATCHES = [
  { label: 'Rose', colors: ['#fda4af', '#f43f5e', '#e11d48'] },
  { label: 'Orange', colors: ['#fdba74', '#f97316', '#ea580c'] },
  { label: 'Amber', colors: ['#fcd34d', '#f59e0b', '#d97706'] },
  { label: 'Indigo', colors: ['#a5b4fc', '#6366f1', '#4f46e5'] },
  { label: 'Teal', colors: ['#5eead4', '#14b8a6', '#0d9488'] },
  { label: 'Green', colors: ['#86efac', '#22c55e', '#16a34a'] },
  { label: 'Blue', colors: ['#93c5fd', '#3b82f6', '#2563eb'] },
  { label: 'Sky', colors: ['#7dd3fc', '#0ea5e9', '#0284c7'] },
  { label: 'Fuchsia', colors: ['#f0abfc', '#d946ef', '#c026d3'] },
] as const;

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
          1. HERO — Above the Fold Power Block
      ═══════════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="hero-heading"
        className="relative flex min-h-svh flex-col items-center justify-center px-6 pt-20"
      >
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
          2. FLAME PROGRESSION — The Journey
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatedSection
        aria-labelledby="progression-heading"
        className="relative px-6 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2
              id="progression-heading"
              className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
            >
              Habits that{' '}
              <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                grow with you
              </span>
            </h2>
            <p className="mx-auto max-w-lg text-white/35">
              Eight stages. Wisp to Supernova. Every flame earns its evolution.
            </p>
          </div>

          <FlameShowcase />
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════════
          3. TIME IS FUEL — The Mechanic
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatedSection
        aria-labelledby="fuel-heading"
        className="px-6 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
            {/* Left — copy */}
            <div className="lg:flex-1">
              <h2
                id="fuel-heading"
                className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                Time is fuel
              </h2>
              <p className="mb-2 text-white/45">Set a daily fuel budget.</p>
              <p className="mb-2 text-white/45">
                Start a flame. Watch it burn.
              </p>
              <p className="mb-8 text-white/45">
                Your hours become visible progress.
              </p>

              {/* Stat callouts */}
              <div className="flex gap-4">
                {[
                  { value: '8', label: 'levels' },
                  { value: '24h', label: 'daily fuel' },
                  { value: 'Live', label: 'real-time' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <div className="font-mono text-lg font-bold text-orange-400">
                      {stat.value}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-white/25">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — fuel bar mockup */}
            <div className="lg:flex-1">
              <AnimatedFuelBar />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════════
          4. MEET EMBER — The Companion
      ═══════════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="ember-heading"
        className="relative overflow-hidden"
      >
        {/* Full-width warm gradient band */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(251,146,60,0.04) 20%, rgba(251,146,60,0.06) 50%, rgba(251,146,60,0.04) 80%, transparent 100%)',
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <AnimatedSection className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
            {/* Left — Ember image */}
            <div className="flex-shrink-0">
              <EmberFloat />
            </div>

            {/* Right — text + tags */}
            <div className="text-center lg:text-left">
              <h2
                id="ember-heading"
                className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                This is{' '}
                <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-violet-400 bg-clip-text text-transparent">
                  Ember
                </span>
              </h2>
              <p className="mb-6 max-w-md text-lg leading-relaxed text-white/40">
                Your flame-sprite. She creates flames, organizes thoughts, and
                keeps you going.
              </p>

              {/* Capability tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                {[
                  { label: 'Create flames', color: '#f97316' },
                  { label: 'Take notes', color: '#facc15' },
                  { label: 'Manage todos', color: '#22c55e' },
                  { label: 'Plan your day', color: '#0ea5e9' },
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
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. THE ECOSYSTEM — Dense Feature Strip
      ═══════════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="ecosystem-heading"
        className="px-6 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="mb-12 text-center">
            <h2
              id="ecosystem-heading"
              className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              More than a habit tracker
            </h2>
          </AnimatedSection>

          {/* 4 columns */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                icon: Sparkles,
                title: 'Sparks',
                body: 'The currency of effort. Sessions, streaks, and completed todos earn sparks — proof of work you can spend.',
                color: '#f97316',
              },
              {
                icon: ShoppingBag,
                title: 'Shop',
                body: 'Spend sparks on flame colors, card themes, and dashboard widgets. Effort unlocks upgrades.',
                color: '#0ea5e9',
              },
              {
                icon: StickyNote,
                title: 'Notes & Todos',
                body: 'Capture thoughts and track tasks without leaving. Everything feeds back into your flames.',
                color: '#22c55e',
              },
              {
                icon: Brain,
                title: 'Science',
                body: 'Every mechanic — streaks, progression, variable rewards — is informed by behavioral psychology.',
                color: '#a78bfa',
              },
            ].map((feature, i) => (
              <AnimatedDiv
                key={feature.title}
                delay={i * 0.08}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <feature.icon
                  className="mb-3 h-5 w-5"
                  style={{ color: feature.color }}
                />
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-white/90">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed text-white/35">
                  {feature.body}
                </p>
              </AnimatedDiv>
            ))}
          </div>

          {/* Color swatch strip */}
          <AnimatedDiv delay={0.3} className="mt-6">
            <div className="flex gap-1.5 sm:gap-2">
              {FLAME_SWATCHES.map((swatch) => (
                <div key={swatch.label} className="flex flex-1 flex-col gap-0.5">
                  {swatch.colors.map((c, ci) => (
                    <div
                      key={`${swatch.label}-${ci}`}
                      className="h-5 rounded-sm sm:h-6"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </AnimatedDiv>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. WHY HIBANA — The Name
      ═══════════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="why-heading"
        className="px-6 py-20 sm:py-24"
      >
        <AnimatedSection className="mx-auto max-w-2xl text-center">
          <p
            className="mb-6 text-8xl font-light text-white/10 sm:text-9xl"
            aria-hidden="true"
          >
            火花
          </p>
          <h2
            id="why-heading"
            className="mb-6 text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            Why{' '}
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              Hibana
            </span>
            ?
          </h2>
          <p className="text-lg leading-relaxed text-white/40">
            <span className="text-white/70">Spark.</span> In Japanese, hibana
            means spark.
          </p>
          <p className="text-lg leading-relaxed text-white/40">
            Every fire started as one.
          </p>
        </AnimatedSection>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7. FINAL CTA
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatedSection
        aria-labelledby="cta-heading"
        className="relative px-6 py-16"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(249,115,22,0.06) 0%, transparent 60%)',
          }}
        />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2
            id="cta-heading"
            className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            Ready to light your first flame?
          </h2>
          <p className="mb-6 max-w-md text-white/35">
            Join the waitlist. Your Wisp is waiting.
          </p>
          <div className="w-full max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}

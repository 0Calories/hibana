import { Brain, Sparkles, StickyNote } from 'lucide-react';
import { AnimatedDiv, AnimatedSection } from './components/AnimatedSection';
import { EmberFloat } from './components/EmberFloat';
import { FlameShowcase } from './components/FlameShowcase';
import { HeroEmbers } from './components/HeroEmbers';
import { HeroSection } from './components/HeroSection';
import { NewsletterForm } from './components/NewsletterForm';
import { SparkleEffect } from './components/SparkleEffect';

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
          1. HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="hero-heading"
        className="relative flex min-h-svh flex-col items-center justify-center px-6 pt-20"
      >
        <HeroEmbers />
        <HeroSection />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. FLAME PROGRESSION + FUEL
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
              <span className="bg-linear-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                grow with you
              </span>
            </h2>
            <p className="mx-auto max-w-lg text-white/35">
              Your time and energy is the fuel to your Flames. Even a meager
              Wisp can grow all the way to a stunningly radiant Supernova
            </p>
          </div>

          <FlameShowcase />
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════════
          3. MEET EMBER
      ═══════════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="ember-heading"
        className="relative overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(251,146,60,0.04) 20%, rgba(251,146,60,0.06) 50%, rgba(251,146,60,0.04) 80%, transparent 100%)',
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <AnimatedSection className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
            <div className="shrink-0">
              <EmberFloat />
            </div>

            <div className="text-center lg:text-left">
              <h2
                id="ember-heading"
                className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                Meet{' '}
                <SparkleEffect>
                  <span className="bg-linear-to-r from-amber-300 via-orange-400 to-violet-400 bg-clip-text text-transparent">
                    Ember
                  </span>
                </SparkleEffect>
              </h2>
              <p className="mb-6 max-w-md text-lg leading-relaxed text-white/40">
                Your bright and cheery flame-sprite companion. She&apos;ll help
                you organize your thoughts and can perform any action available
                in the app on your behalf; All through natural conversation.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                {[
                  { label: 'Plan your day', color: '#0ea5e9' },
                  { label: 'Take notes', color: '#facc15' },
                  { label: 'Manage todos', color: '#22c55e' },
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
          4. THE ECOSYSTEM
      ═══════════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="ecosystem-heading"
        className="px-6 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-4xl">
          <AnimatedSection className="mb-12 text-center">
            <h2
              id="ecosystem-heading"
              className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              More than just a{' '}
              <span className="bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                habit tracker
              </span>
            </h2>
          </AnimatedSection>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Brain,
                title: 'Science',
                body: 'Leverages concepts based on behavioral psychology and neuroscience research to keep you motivated towards your goals.',
                color: '#a78bfa',
              },
              {
                icon: Sparkles,
                title: 'Sparks',
                body: 'The currency of effort. Sessions, streaks, and completed todos earn Sparks. Spend them on dashboard widgets, cosmetics, and upgrades.',
                color: '#f97316',
              },
              {
                icon: StickyNote,
                title: 'Sticky Notes & Todos',
                body: 'Capture thoughts and track tasks without leaving. Everything feeds back into your flames.',
                color: '#22c55e',
              },
            ].map((feature, i) => (
              <AnimatedDiv
                key={feature.title}
                delay={i * 0.08}
                className="group relative overflow-hidden rounded-2xl border border-white/6 bg-white/2 p-6 transition-colors hover:border-white/12 hover:bg-white/4"
              >
                {/* Colored top accent line */}
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${feature.color}60, transparent)`,
                  }}
                />
                {/* Subtle glow on hover */}
                <div
                  className="pointer-events-none absolute -top-20 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{ backgroundColor: `${feature.color}15` }}
                />
                <div
                  className="relative mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${feature.color}12`,
                    border: `1px solid ${feature.color}20`,
                  }}
                >
                  <feature.icon
                    className="h-5 w-5"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="relative mb-2 text-sm font-bold uppercase tracking-wider text-white/90">
                  {feature.title}
                </h3>
                <p className="relative text-sm leading-relaxed text-white/35">
                  {feature.body}
                </p>
              </AnimatedDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. FINAL CTA
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
            Sign up to get notified when we launch!
          </p>
          <div className="w-full max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}

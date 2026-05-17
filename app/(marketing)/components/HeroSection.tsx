import { ChevronDown, Flame } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { NewsletterForm } from './NewsletterForm';

export async function HeroSection() {
  const t = await getTranslations('marketing');

  return (
    <>
      <div className="relative z-10 flex max-w-3xl flex-col items-center text-center motion-safe:animate-marketing-fade-in-up">
        {/* Badge */}
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-1.5 text-xs font-medium text-pink-300 motion-safe:animate-marketing-fade-in-scale"
          style={{ animationDelay: '0.2s' }}
        >
          <Flame className="h-3.5 w-3.5" />
          {t('hero.badge')}
        </div>

        {/* Headline */}
        <h1
          id="hero-heading"
          className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight motion-safe:animate-marketing-fade-in-up sm:text-6xl md:text-7xl"
        >
          {t('hero.headlineLine1')}
          <br />
          <span className="bg-linear-to-r from-rose-400 via-pink-500 to-rose-600 bg-clip-text text-transparent">
            {t('hero.headlineAccent')}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="mb-10 max-w-xl text-lg leading-relaxed text-white/45 motion-safe:animate-marketing-fade-in-up sm:text-xl"
          style={{ animationDelay: '0.15s' }}
        >
          <span className="text-white/70">{t('hero.subtitleHighlight')}</span>{' '}
          {t('hero.subtitleBody')}
        </p>

        {/* Newsletter */}
        <div
          className="w-full max-w-md motion-safe:animate-marketing-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <NewsletterForm />
          <p className="mt-3 text-xs text-white/20">{t('hero.waitlistHint')}</p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 flex flex-col items-center gap-2 motion-safe:animate-marketing-fade-in motion-reduce:hidden"
        style={{ animationDelay: '1.5s' }}
      >
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/20">
          {t('hero.scrollLabel')}
        </span>
        <div className="motion-safe:animate-marketing-chevron">
          <ChevronDown className="h-4 w-4 text-white/20" />
        </div>
      </div>
    </>
  );
}

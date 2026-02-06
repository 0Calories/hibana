'use client';

import { useTranslations } from 'next-intl';

export function NewsletterForm() {
  const t = useTranslations('marketing.newsletter');

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex w-full gap-2">
      <input
        type="email"
        placeholder={t('placeholder')}
        aria-label={t('ariaLabel')}
        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none backdrop-blur-sm transition-colors focus:border-orange-500/50 focus:bg-white/8"
      />
      <button
        type="submit"
        className="group relative cursor-pointer overflow-hidden rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-400 hover:shadow-[0_0_30px_rgba(249,115,22,0.35)]"
      >
        <span className="relative z-10">{t('submit')}</span>
        <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
      </button>
    </form>
  );
}

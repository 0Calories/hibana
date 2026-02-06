import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Hibana — Set your motivation ablaze',
  description:
    'Hibana is a gamified productivity and habit tracking app built on insights from behavioral psychology and neuroscience to help you build lasting habits and achieve your goals.',
  keywords: [
    'habit tracker',
    'gamified productivity',
    'habit building app',
    'productivity gamification',
    'AI habit assistant',
    'flame habit tracker',
    'personal improvement app',
  ],
  openGraph: {
    title: 'Hibana — Set your motivation ablaze',
    description:
      'Hibana is a gamified productivity and habit tracking app built on insights from behavioral psychology and neuroscience to help you build lasting habits and achieve your goals.',
    type: 'website',
    siteName: 'Hibana',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hibana — Set your motivation ablaze',
    description:
      'Hibana is a gamified productivity and habit tracking app built on insights from behavioral psychology and neuroscience to help you build lasting habits and achieve your goals.',
  },
};

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations('navigation');
  const m = await getTranslations('marketing');

  return (
    <div className="dark relative min-h-svh bg-[#090b14] text-white">
      {/* Match html/body bg to prevent overscroll color mismatch on Mac */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <style>{`html, body { background-color: #090b14; }`}</style>

      {/* ── Fixed nav ── */}
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between bg-[#090b14]/80 px-6 py-4 backdrop-blur-md">
        <Link href="/" className="group text-lg font-bold tracking-tight">
          <span className="bg-linear-to-r from-amber-300 via-orange-400 to-rose-500 bg-clip-text text-transparent transition-opacity group-hover:opacity-80">
            火花
          </span>{' '}
          <span className="font-extrabold text-white">Hibana</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/5"
            asChild
          >
            <Link href="/login">{t('logIn')}</Link>
          </Button>
        </div>
      </nav>

      {/* ── Page content ── */}
      <main>{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/4 px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-white/30">
            <span className="font-medium text-white/50">火花 Hibana</span>
            {' · '}
            {m('footer.tagline')}
          </div>
          <div className="text-xs text-white/20">
            {m('footer.copyright', { year: String(new Date().getFullYear()) })}
          </div>
        </div>
      </footer>
    </div>
  );
}

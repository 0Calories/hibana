'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { NAV_ITEMS } from './nav-items';

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('navigation');

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl">
        <div className="grid h-16 grid-cols-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              ('matchPrefix' in item &&
                item.matchPrefix &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-0.5"
              >
                <span
                  className={`relative z-10 text-xl leading-none transition-colors duration-200 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground active:scale-95'
                  }`}
                >
                  <item.icon className="size-5" />
                </span>
                <span
                  className={`relative z-10 text-xs transition-colors duration-200 ${
                    isActive
                      ? 'font-semibold text-primary'
                      : 'font-medium text-muted-foreground'
                  }`}
                >
                  {t(item.key)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

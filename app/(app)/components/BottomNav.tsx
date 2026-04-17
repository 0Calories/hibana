'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { NAV_ITEMS } from './nav-items';

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('navigation');

  return (
    <nav className="md:hidden w-full fixed bottom-0 left-0 border-t backdrop-blur-lg dark:backdrop-blur-lg z-40">
      <div className="grid h-16 grid-cols-5">
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
              className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:scale-95'
              }`}
            >
              <span className="text-xl leading-none">
                <item.icon className="size-5" />
              </span>
              <span
                className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}
              >
                {t(item.key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

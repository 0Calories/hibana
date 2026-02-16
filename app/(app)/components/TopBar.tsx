'use client';

import {
  CalendarRangeIcon,
  FlameIcon,
  LayoutDashboardIcon,
  LayoutListIcon,
  SparklesIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CreateButton } from '@/app/(app)/dashboard/components/CreateButton';
import { ProfileBadge } from './ProfileBadge';

const NAV_ITEMS = [
  { key: 'home', href: '/dashboard', icon: LayoutDashboardIcon },
  { key: 'flames', href: '/flames', icon: FlameIcon },
  { key: 'schedule', href: '/schedule', icon: CalendarRangeIcon },
  { key: 'habits', href: '/habits', icon: SparklesIcon },
  { key: 'tasks', href: '/tasks', icon: LayoutListIcon },
] as const;

export function TopBar() {
  const pathname = usePathname();
  const t = useTranslations('navigation');

  const pageTitles: Record<string, string> = {
    '/dashboard': t('home'),
    '/flames': t('flames'),
    '/schedule': t('schedule'),
    '/habits': t('habits'),
    '/tasks': t('tasks'),
  };
  const currentPageTitle = pageTitles[pathname] ?? t('home');

  return (
    <header className="fixed top-0 left-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      {/* Desktop */}
      <div className="hidden md:flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-extrabold tracking-tight"
          >
            <Image src="/logo.svg" alt="" width={24} height={24} />
            <span>Hibana</span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-muted text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <item.icon className="size-4" />
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <CreateButton />
          <ProfileBadge />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden h-12 items-center justify-between px-4">
        <h1 className="text-base font-semibold">{currentPageTitle}</h1>
        <ProfileBadge />
      </div>
    </header>
  );
}

'use client';

import {
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
  { key: 'flames', href: '/flames', icon: FlameIcon, matchPrefix: true },
  { key: 'habits', href: '/habits', icon: SparklesIcon },
  { key: 'tasks', href: '/tasks', icon: LayoutListIcon },
] as const;

export function TopBar() {
  const pathname = usePathname();
  const t = useTranslations('navigation');

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
              const isActive =
                pathname === item.href ||
                ('matchPrefix' in item &&
                  item.matchPrefix &&
                  (pathname.startsWith(item.href) ||
                    pathname.startsWith('/schedule')));
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

        <div className="flex items-center gap-2">
          <CreateButton />
          <div className="mx-1 h-5 w-px bg-border" />
          <ProfileBadge />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden h-12 items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-extrabold tracking-tight"
        >
          <Image src="/logo.svg" alt="" width={20} height={20} />
          <span className="text-sm">Hibana</span>
        </Link>
        <ProfileBadge />
      </div>
    </header>
  );
}

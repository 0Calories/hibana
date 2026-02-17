'use client';

import { Flame, LayoutList, LucideHome, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('navigation');

  const navItems = [
    { icon: <LucideHome />, label: t('home'), href: '/dashboard' },
    {
      icon: <Flame />,
      label: t('flames'),
      href: '/flames',
      isActive: pathname.startsWith('/flames'),
    },
    { icon: <Sparkles />, label: t('habits'), href: '/habits' },
    { icon: <LayoutList />, label: t('tasks'), href: '/tasks' },
  ];

  return (
    <nav className="md:hidden w-full fixed bottom-0 left-0 border-t backdrop-blur-lg dark:backdrop-blur-lg z-40">
      <div className="grid h-16 grid-cols-4">
        {navItems.map((item) => {
          const isActive = item.isActive ?? pathname === item.href;

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
              <span className="text-xl leading-none">{item.icon}</span>
              <span
                className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

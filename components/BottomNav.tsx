'use client';

import { CalendarCheck, LayoutList, LucideHome, Sparkle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: <LucideHome />, label: 'Home', href: '/dashboard' },
    { icon: <LayoutList />, label: 'Todos', href: '/todos' },
    { icon: <Sparkle />, label: 'Habits', href: '/habits' },
    { icon: <CalendarCheck />, label: 'Schedule', href: '/schedule' },
  ];

  return (
    <nav className="md:hidden w-full fixed bottom-0 left-0 border-t backdrop-blur-lg dark:backdrop-blur-lg z-40">
      <div className="grid h-16 grid-cols-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-gray-400 active:scale-95'
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

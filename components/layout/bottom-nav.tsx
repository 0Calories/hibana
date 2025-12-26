import { CalendarCheck, LayoutList, LucideHome, Sparkle } from 'lucide-react';
import Link from 'next/link';

export function BottomNav() {
  const navItems = [
    { icon: <LucideHome />, label: 'Home', href: '/', active: true },
    { icon: <LayoutList />, label: 'Todos', href: '/todos', active: false },
    { icon: <Sparkle />, label: 'Habits', href: '/habits', active: false },
    {
      icon: <CalendarCheck />,
      label: 'Schedule',
      href: '/schedule',
      active: false,
    },
  ];

  return (
    <nav className="md:hidden w-full fixed bottom-0 left-0 border-t backdrop-blur-lg dark:backdrop-blur-lg">
      <div className="grid h-16 grid-cols-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
              item.active ? 'text-primary' : 'text-gray-400 active:scale-95'
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span
              className={`text-xs font-medium ${item.active ? 'font-semibold' : ''}`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

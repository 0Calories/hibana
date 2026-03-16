import {
  FlameIcon,
  LayoutDashboardIcon,
  LayoutListIcon,
  SparklesIcon,
} from 'lucide-react';

export const NAV_ITEMS = [
  { key: 'home', href: '/dashboard', icon: LayoutDashboardIcon },
  { key: 'flames', href: '/flames', icon: FlameIcon, matchPrefix: true },
  { key: 'habits', href: '/habits', icon: SparklesIcon },
  { key: 'tasks', href: '/tasks', icon: LayoutListIcon },
] as const;

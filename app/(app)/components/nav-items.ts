import {
  FlameIcon,
  LayoutDashboardIcon,
  LayoutListIcon,
  StoreIcon,
} from 'lucide-react';

export const NAV_ITEMS = [
  { key: 'home', href: '/dashboard', icon: LayoutDashboardIcon },
  { key: 'flames', href: '/flames', icon: FlameIcon, matchPrefix: true },
  { key: 'tasks', href: '/tasks', icon: LayoutListIcon },
  { key: 'shop', href: '/shop', icon: StoreIcon },
] as const;

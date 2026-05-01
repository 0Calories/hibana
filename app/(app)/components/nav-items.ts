import { FlameIcon, LayoutDashboardIcon } from 'lucide-react';

export const NAV_ITEMS = [
  { key: 'home', href: '/dashboard', icon: LayoutDashboardIcon },
  { key: 'flames', href: '/flames', icon: FlameIcon, matchPrefix: true },
] as const;

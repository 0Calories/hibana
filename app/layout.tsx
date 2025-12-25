import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Hibana',
  description: 'Ignite your good habits and extinguish the bad',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <AppShell>{children}</AppShell>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <TopBar />
      <Sidebar />

      {/* Main content with proper spacing for nav */}
      <main className="pb-20 pt-16 md:ml-64 md:pb-6">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

// Mobile-only
function TopBar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-orange-200 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80 md:left-64 md:hidden">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Mobile: Logo + Ember */}
        <div className="flex items-center gap-2 md:hidden">
          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-xl font-bold text-transparent">
            Hibana
          </span>
        </div>

        {/* Desktop: Page title / breadcrumb */}
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
        </div>

        {/* Right side: Quick add + User menu */}
        <div className="flex items-center gap-3">
          {/* Quick add button */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:scale-105 hover:from-orange-600 hover:to-red-600 hover:shadow-xl hover:shadow-orange-500/40 active:scale-95 dark:shadow-orange-500/20 dark:hover:shadow-orange-500/30"
            aria-label="Quick add"
          >
            <span className="text-xl font-light leading-none">+</span>
          </button>

          {/* User avatar */}
          <button
            type="button"
            className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-red-400 ring-2 ring-orange-200 transition-all duration-200 hover:ring-orange-400 dark:from-orange-500 dark:to-red-500 dark:ring-zinc-700 dark:hover:ring-orange-500"
            aria-label="User menu"
          />
        </div>
      </div>
    </header>
  );
}

// Mobile-only
function BottomNav() {
  const navItems = [
    { icon: '', label: 'Home', href: '/', active: true },
    { icon: '', label: 'Todos', href: '/todos', active: false },
    { icon: '', label: 'Habits', href: '/habits', active: false },
    { icon: '', label: 'Schedule', href: '/schedule', active: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-orange-200 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/90 dark:backdrop-blur-xl md:hidden">
      <div className="grid h-16 grid-cols-4">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
              item.active
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-zinc-500 hover:text-orange-600 active:scale-95 dark:text-zinc-400 dark:hover:text-orange-400'
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span
              className={`text-xs font-medium ${item.active ? 'font-semibold' : ''}`}
            >
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}

// Desktop-only
function Sidebar() {
  const navItems = [
    { icon: '', label: 'Dashboard', href: '/', active: true },
    { icon: '', label: 'Todos', href: '/todos', active: false },
    { icon: '', label: 'Habits', href: '/habits', active: false },
    { icon: '', label: 'Schedule', href: '/schedule', active: false },
    { icon: '', label: 'Ask Ember', href: '/chat', active: false },
  ];

  return (
    <nav className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-orange-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex">
      {/* Logo section */}
      <div className="flex h-16 items-center gap-2 border-b border-orange-200 px-6 dark:border-slate-800">
        <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-xl font-bold text-transparent">
          Hibana
        </span>
      </div>

      {/* Navigation items */}
      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              item.active
                ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 shadow-sm dark:from-orange-950/50 dark:to-red-950/50 dark:text-orange-400 dark:shadow-orange-500/10'
                : 'text-zinc-700 hover:bg-orange-100 hover:text-orange-600 active:scale-95 dark:text-zinc-300 dark:hover:bg-slate-800/80 dark:hover:text-orange-400'
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </div>

      {/* User section at bottom */}
      <div className="border-t border-orange-200 p-3 dark:border-slate-800">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-orange-100 active:scale-95 dark:hover:bg-slate-800/80"
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-red-400 ring-2 ring-orange-200 dark:from-orange-500 dark:to-red-500 dark:ring-zinc-700" />
          <div className="flex-1 text-left text-sm">
            <div className="font-semibold text-zinc-900 dark:text-zinc-50">
              Username
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span>Level 69</span>
              <span className="text-orange-500 dark:text-amber-500">🔥</span>
              <span className="font-medium">420 XP</span>
            </div>
          </div>
        </button>
      </div>
    </nav>
  );
}

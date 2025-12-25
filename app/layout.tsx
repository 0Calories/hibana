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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main>
          <AppShell>{children}</AppShell>

          <SpeedInsights />
          <Analytics />
        </main>
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
    <div>
      <TopBar />
      <Sidebar />
      {children}
      <BottomNav />
    </div>
  );
}

function TopBar() {
  return (
    <div>
      <nav className="fixed top-0 left-0 right-0">Top Bar</nav>
    </div>
  );
}

// Mobile only
function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden">
      <div>Bottom tabs go here</div>
    </nav>
  );
}

// Desktop only
function Sidebar() {
  return (
    <nav className="hidden top-4 md:flex md:w-64 md:flex-col">
      <div>Left sidebar</div>
    </nav>
  );
}

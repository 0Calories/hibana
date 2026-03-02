import { BottomNav } from '@/app/(app)/components/BottomNav';
import { SparkFlyoverProvider } from '@/app/(app)/components/SparkFlyover';
import { TimezoneSync } from '@/app/(app)/components/TimezoneSync';
import { TopBar } from '@/app/(app)/components/TopBar';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-screen w-full">
      <SparkFlyoverProvider>
        <TopBar />
        <section className="h-full w-full pt-12 md:pt-14">{children}</section>
        <BottomNav />
        <TimezoneSync />
      </SparkFlyoverProvider>
    </main>
  );
}

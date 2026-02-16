import { BottomNav } from '@/app/(app)/components/BottomNav';
import { TopBar } from '@/app/(app)/components/TopBar';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-screen w-full">
      <TopBar />
      <section className="h-full w-full pt-12 md:pt-14">{children}</section>

      <BottomNav />
    </main>
  );
}

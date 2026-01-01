import { BottomNav } from '@/app/(app)/components/BottomNav';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-screen w-full">
      {/* <TopNav /> */}
      <section className="h-full w-full">{children}</section>

      <BottomNav />
    </main>
  );
}

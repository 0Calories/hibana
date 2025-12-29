import { BottomNav } from '@/components/BottomNav';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      {/* <TopNav /> */}
      <section>{children}</section>
      <BottomNav />
    </main>
  );
}

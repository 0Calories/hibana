import { BottomNav } from '@/app/(app)/components/BottomNav';
import { TopBar } from '@/app/(app)/components/TopBar';
import { UserStateProvider } from '@/app/(app)/components/UserStateProvider';
import { getOrCreateUserState } from '@/app/(app)/shop/actions';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const result = await getOrCreateUserState();
  const userState = result.success ? result.data : null;

  return (
    <main className="h-screen w-full">
      {userState ? (
        <UserStateProvider userState={userState}>
          <TopBar />
          <section className="h-full w-full pt-12 md:pt-14">{children}</section>
          <BottomNav />
        </UserStateProvider>
      ) : (
        <>
          <TopBar />
          <section className="h-full w-full pt-12 md:pt-14">{children}</section>
          <BottomNav />
        </>
      )}
    </main>
  );
}

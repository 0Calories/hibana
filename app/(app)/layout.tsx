import { BottomNav } from '@/app/(app)/components/BottomNav';
import { SparkFlyoverProvider } from '@/app/(app)/components/SparkFlyover';
import { TopBar } from '@/app/(app)/components/TopBar';
import { UserStateProvider } from '@/app/(app)/components/UserStateProvider';
import { getOrCreateUserState } from '@/app/(app)/shop/actions';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const result = await getOrCreateUserState();
  const userState = result.success
    ? result.data
    : { user_id: '', sparks_balance: 0, created_at: '', updated_at: '' };

  return (
    <main className="h-screen w-full">
      <UserStateProvider userState={userState}>
        <SparkFlyoverProvider>
          <TopBar />
          <section className="h-full w-full pt-12 md:pt-14">{children}</section>
          <BottomNav />
        </SparkFlyoverProvider>
      </UserStateProvider>
    </main>
  );
}

import { BottomNav } from '@/app/(app)/components/BottomNav';
import { SparkFlyoverProvider } from '@/app/(app)/components/SparkFlyover';
import { TimezoneSync } from '@/app/(app)/components/TimezoneSync';
import { TopBar } from '@/app/(app)/components/TopBar';
import { createClientWithAuth } from '@/lib/supabase/server';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { supabase, user } = await createClientWithAuth();

  const [profileResult, stateResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('username')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_states')
      .select('sparks_balance')
      .eq('user_id', user.id)
      .single(),
  ]);

  if (profileResult.error)
    console.error(
      '[AppLayout] user_profiles query failed',
      profileResult.error,
    );
  if (stateResult.error)
    console.error('[AppLayout] user_states query failed', stateResult.error);

  const username = profileResult.data?.username ?? 'User';
  const sparks = stateResult.data?.sparks_balance ?? 0;

  return (
    <main className="h-screen w-full">
      <SparkFlyoverProvider>
        <TopBar username={username} sparks={sparks} />
        <section className="h-full w-full pt-12 pb-24 md:pt-14 md:pb-0">
          {children}
        </section>
        <BottomNav />
        <TimezoneSync />
      </SparkFlyoverProvider>
    </main>
  );
}

'use client';

import { createContext, use } from 'react';
import type { UserState } from '@/utils/supabase/rows';

const UserStateContext = createContext<UserState | null>(null);

export function UserStateProvider({
  userState,
  children,
}: {
  userState: UserState;
  children: React.ReactNode;
}) {
  return <UserStateContext value={userState}>{children}</UserStateContext>;
}

export function useUserState(): UserState {
  const ctx = use(UserStateContext);
  if (!ctx) {
    throw new Error('useUserState must be used within a UserStateProvider');
  }
  return ctx;
}

'use client';

import { useEffect } from 'react';

export function TimezoneSync() {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    cookieStore.get('timezone').then((cookie) => {
      if (cookie?.value !== tz) {
        cookieStore.set({
          name: 'timezone',
          value: tz,
          path: '/',
          sameSite: 'lax',
        });
      }
    });
  }, []);

  return null;
}

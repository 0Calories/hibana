'use client';

import { useEffect } from 'react';

export function TimezoneSync() {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const current = document.cookie
      .split('; ')
      .find((c) => c.startsWith('timezone='))
      ?.split('=')[1];
    if (current !== tz) {
      document.cookie = `timezone=${tz}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []);

  return null;
}

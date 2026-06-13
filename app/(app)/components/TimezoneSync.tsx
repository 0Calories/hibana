'use client';

import { useEffect } from 'react';

export function TimezoneSync() {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const current = document.cookie
      .split('; ')
      .find((c) => c.startsWith('timezone='))
      ?.slice('timezone='.length);
    if (current !== tz) {
      // IANA names only contain cookie-safe characters; written raw on purpose
      // because the server reads the value without decoding (lib/timezone.ts).
      // biome-ignore lint/suspicious/noDocumentCookie: intentional fallback for browsers without Cookie Store API
      document.cookie = `timezone=${tz}; path=/; max-age=31536000; samesite=lax`;
    }
  }, []);

  return null;
}

import { cookies, headers } from 'next/headers';

function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export async function getUserTimezone(): Promise<string> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('timezone')?.value;
  if (cookie && isValidTimezone(cookie)) return cookie;

  const headerStore = await headers();
  const vercel = headerStore.get('x-vercel-ip-timezone');
  if (vercel && isValidTimezone(vercel)) return vercel;

  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export async function getServerToday(): Promise<string> {
  const tz = await getUserTimezone();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

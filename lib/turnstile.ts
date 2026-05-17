const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function getTurnstileSecret() {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error(
      'TURNSTILE_SECRET_KEY is missing from environment variables',
    );
  }
  return secret;
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  if (!token) return false;

  const body = new URLSearchParams({
    secret: getTurnstileSecret(),
    response: token,
  });
  if (remoteIp) body.append('remoteip', remoteIp);

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

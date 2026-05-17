const RESEND_API_BASE = 'https://api.resend.com';

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_WAITLIST_AUDIENCE_ID;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is missing from environment variables');
  }
  if (!audienceId) {
    throw new Error(
      'RESEND_WAITLIST_AUDIENCE_ID is missing from environment variables',
    );
  }

  return { apiKey, audienceId };
}

export type AddContactResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export async function addContactToWaitlist(
  email: string,
): Promise<AddContactResult> {
  const { apiKey, audienceId } = getResendConfig();

  const res = await fetch(
    `${RESEND_API_BASE}/audiences/${audienceId}/contacts`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    },
  );

  if (res.ok) return { ok: true };

  // Resend returns 409 when the contact already exists in the audience.
  if (res.status === 409) return { ok: true };

  let message = `Resend request failed (${res.status})`;
  try {
    const body = (await res.json()) as { message?: string; name?: string };
    if (body?.message) message = body.message;
    // Treat duplicate errors surfaced as 422/validation as success.
    if (
      body?.name === 'validation_error' &&
      /already/i.test(body.message ?? '')
    ) {
      return { ok: true };
    }
  } catch {
    // ignore body parse errors
  }

  return { ok: false, status: res.status, message };
}

'use server';

import { headers } from 'next/headers';
import { Resend } from 'resend';
import { verifyTurnstileToken } from '@/lib/turnstile';

const resend = new Resend(process.env.RESEND_API_KEY);

export type JoinWaitlistResult =
  | { success: true }
  | { success: false; error: string };

export async function joinWaitlist(
  formData: FormData,
): Promise<JoinWaitlistResult> {
  // Honeypot — bots fill hidden fields. Silently report success so they don't retry.
  const honeypot = formData.get('company');
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return { success: true };
  }

  const email = formData.get('email');
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const turnstileToken = formData.get('cf-turnstile-response');
  if (typeof turnstileToken !== 'string' || !turnstileToken) {
    return {
      success: false,
      error: 'Please complete the verification challenge.',
    };
  }

  const audienceSegmentId = process.env.RESEND_WAITLIST_SEGMENT_ID;
  if (!audienceSegmentId) {
    return {
      success: false,
      error: 'RESEND_WAITLIST_SEGMENT_ID is not configured',
    };
  }

  const headerList = await headers();
  const remoteIp =
    headerList.get('cf-connecting-ip') ??
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    undefined;

  try {
    const verified = await verifyTurnstileToken(turnstileToken, remoteIp);
    if (!verified) {
      return {
        success: false,
        error: 'Verification failed. Please try again.',
      };
    }

    const { error } = await resend.contacts.create({
      email,
      segments: [{ id: audienceSegmentId }],
    });

    if (error) {
      return {
        success: false,
        error: `Resend API error: ${error.message}`,
      };
    }
  } catch {
    return { success: false, error: 'Something went wrong. Please try again.' };
  }

  return { success: true };
}

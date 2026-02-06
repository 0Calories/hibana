import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

const SUPPORTED_LOCALES = ['en', 'ja'];

function getPreferredLocale(acceptLanguage: string): string {
  for (const part of acceptLanguage.split(',')) {
    const lang = part.split(';')[0].trim();
    const base = lang.split('-')[0];
    if (SUPPORTED_LOCALES.includes(base)) return base;
  }
  return 'en';
}

export default getRequestConfig(async () => {
  const store = await cookies();
  let locale = store.get('locale')?.value;

  if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
    const acceptLanguage = (await headers()).get('accept-language') ?? '';
    locale = getPreferredLocale(acceptLanguage);
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});

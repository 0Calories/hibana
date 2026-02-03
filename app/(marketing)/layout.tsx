import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations('navigation');

  return (
    <>
      <nav className="w-full fixed top-0 flex justify-end p-2">
        <Button>
          <Link href={'/signup'}>{t('signUp')}</Link>
        </Button>
        <Button variant={'link'}>
          <Link href={'/login'}>{t('logIn')}</Link>
        </Button>
      </nav>
      <main className="pt-10 flex min-h-svh w-full items-center justify-center">
        {children}
      </main>
    </>
  );
}

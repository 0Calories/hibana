import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SignupForm } from './form';

export default async function SignupPage() {
  const t = await getTranslations('metadata');

  return (
    <div className="flex flex-col items-center gap-8">
      <Link href="/" className="flex flex-col items-center gap-3">
        <Image src="/logo.svg" alt="" width={48} height={48} />
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Hibana</h1>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
      </Link>
      <SignupForm />
    </div>
  );
}

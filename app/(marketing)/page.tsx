import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('MarketingPage');
  return (
    <div className="">
      <span>{t('u')}</span>
    </div>
  );
}

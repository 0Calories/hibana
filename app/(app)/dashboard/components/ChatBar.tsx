'use client';

import { useTranslations } from 'next-intl';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';

export function ChatBar() {
  const t = useTranslations('dashboard');

  return (
    <InputGroup
      id="ember-chat"
      className="rounded-lg p-5 pl-2 pr-2 mr-2 backdrop-blur"
    >
      <InputGroupInput
        placeholder={t('chatPlaceholder')}
        className="placeholder:text-secondary-foreground"
      />
    </InputGroup>
  );
}

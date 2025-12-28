import { BadgeCheckIcon } from 'lucide-react';
import Image from 'next/image';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import ember from './ember.png';

export default function Page() {
  return (
    <div className="flex-col min-h-svh w-full items-center justify-center align-center p-4">
      <Item variant="outline" size="sm" asChild>
        <ItemContent>
          <ItemTitle>
            <ItemMedia>
              <BadgeCheckIcon className="size-5" />
            </ItemMedia>
            You're logged in!
          </ItemTitle>
          <ItemDescription>Good to have you back, Ash</ItemDescription>
        </ItemContent>
      </Item>
      <Image src={ember} alt={'Ember'} className="w-32" />
    </div>
  );
}

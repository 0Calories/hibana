import Image from 'next/image';

import ember from './ember.png';

export default function Page() {
  return (
    <div className="flex-col min-h-svh w-full items-center justify-center align-center p-4">
      <Image src={ember} alt={'Ember'} className="w-32" />
    </div>
  );
}

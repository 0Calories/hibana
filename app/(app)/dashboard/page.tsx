import Image from 'next/image';

export default function DashboardPage() {
  return (
    <div className="flex-col min-h-svh w-full items-center justify-center align-center p-4">
      <Image src={'/ember.png'} alt={'Ember'} width={64} height={64} />
    </div>
  );
}

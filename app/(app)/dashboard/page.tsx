import Image from 'next/image';

export default function DashboardPage() {
  return (
    <div className="size-full p-4">
      <Image src={'/ember.png'} alt={'Ember'} width={64} height={64} />
    </div>
  );
}

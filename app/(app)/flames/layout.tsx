import { CreateFlameButton } from './components/CreateFlameButton';

export default function FlamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center">
      {children}
      <div className="md:hidden fixed bottom-18 right-4 pb-4">
        <CreateFlameButton />
      </div>
    </div>
  );
}

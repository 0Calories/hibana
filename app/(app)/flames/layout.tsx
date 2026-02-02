import { CreateFlameButton } from './components/CreateFlameButton';

export default function FlamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // "w-full md:w-7/10 fixed bottom-18 md:bottom-0 p-4 flex flex-row justify-center items-center
  return (
    <div className="flex justify-center">
      {children}
      <div className="fixed bottom-18 md:bottom-4 right-4 pb-4">
        <CreateFlameButton />
      </div>
    </div>
  );
}

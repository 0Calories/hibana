import { ChatBar } from '@/app/(app)/dashboard/components/ChatBar';
import { CreateButton } from '@/app/(app)/dashboard/components/CreateButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center">
      {children}
      <div className="w-full md:w-7/10 fixed bottom-18 md:bottom-0 p-4 flex flex-row justify-center items-center">
        <ChatBar />
        <CreateButton />
      </div>
    </div>
  );
}

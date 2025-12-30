import { ChatBar } from '@/components/ChatBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center">
      {children}
      <div className="w-full md:w-7/10 fixed bottom-18 md:bottom-8 p-4">
        <ChatBar />
      </div>
    </div>
  );
}

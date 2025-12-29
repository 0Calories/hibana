import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
      {/* Floating Action Button */}
      <Button
        size={'icon-lg'}
        className="fixed bottom-20 right-4 md:bottom-8 size-12 rounded-full"
      >
        <Plus className="size-6" />
      </Button>
    </div>
  );
}

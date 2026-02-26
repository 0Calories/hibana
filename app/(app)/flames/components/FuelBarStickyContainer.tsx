import { cn } from '@/lib/utils';

interface FuelBarStickyContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function FuelBarStickyContainer({
  children,
  className,
}: FuelBarStickyContainerProps) {
  return (
    <div
      className={cn(
        'sticky top-12 z-20 -mx-4 mb-4 px-4 pt-2 md:top-14',
        className,
      )}
    >
      {children}
    </div>
  );
}

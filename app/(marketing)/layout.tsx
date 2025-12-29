import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <nav className="w-full fixed top-0 flex justify-end p-2">
        <Button>
          <Link href={'/signup'}>Sign Up</Link>
        </Button>
        <Button variant={'link'}>
          <Link href={'/login'}>Log In</Link>
        </Button>
      </nav>
      <main className="pt-10 flex min-h-svh w-full items-center justify-center">
        {children}
      </main>
    </>
  );
}

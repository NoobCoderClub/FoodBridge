'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useLogout } from '@/features/auth/hooks/use-logout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  if (isLoading) return <p className="p-8">Loading...</p>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="flex items-center gap-4 border-b border-gray-200 px-6 py-4">
        <Link href="/accounts" className="font-semibold">
          FoodBridge Admin
        </Link>
        <Link href="/accounts" className="text-sm">
          Accounts
        </Link>
        <Link href="/stats" className="text-sm">
          Stats
        </Link>
        <Link href="/disputes" className="text-sm">
          Disputes
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          Log out
        </Button>
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

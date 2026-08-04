'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { authKeys } from '@/lib/query-keys';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  if (isLoading) return <p className="p-8">Loading...</p>;
  if (!user) return null;

  if (user.status === 'pending') {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-start justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold">Awaiting approval</h1>
        <p className="text-sm text-gray-600">
          Your account is pending review by an admin. You&apos;ll be able to use FoodBridge as soon
          as it&apos;s approved.
        </p>
        <Button
          variant="outline"
          onClick={() => void queryClient.invalidateQueries({ queryKey: authKeys.currentUser })}
        >
          Check again
        </Button>
      </main>
    );
  }

  if (user.status === 'rejected') {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-start justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold">Application not approved</h1>
        <p className="text-sm text-gray-600">
          Your application wasn&apos;t approved. Contact support for details.
        </p>
      </main>
    );
  }

  if (user.status === 'suspended') {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-start justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold">Account suspended</h1>
        <p className="text-sm text-gray-600">
          Your account has been suspended. Contact support for details.
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="flex items-center gap-4 border-b border-gray-200 px-6 py-4">
        <Link href="/listings" className="font-semibold">
          FoodBridge
        </Link>
        {user.role === 'poster' ? (
          <Link href="/listings/new" className="text-sm">
            Post a listing
          </Link>
        ) : (
          <>
            <Link href="/listings" className="text-sm">
              Browse
            </Link>
            <Link href="/my-claims" className="text-sm">
              My claims
            </Link>
          </>
        )}
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
      <div className="flex-1">{children}</div>
    </div>
  );
}

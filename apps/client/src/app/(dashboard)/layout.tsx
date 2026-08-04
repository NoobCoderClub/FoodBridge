'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { authKeys } from '@/lib/query-keys';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();

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

  return <>{children}</>;
}

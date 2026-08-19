'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { Sprout } from 'lucide-react';
import type { AccountStatus } from '@repo/types';
import { AppNav } from '@/components/app-nav';
import { AccountStatusScreen } from '@/components/account-status-screen';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { authKeys } from '@/lib/query-keys';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  const rechecking = useIsFetching({ queryKey: authKeys.currentUser }) > 0;

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3">
        <span className="flex size-10 animate-pulse items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sprout className="size-5" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground">Loading FoodBridge…</p>
      </div>
    );
  }

  if (!user) return null;

  // better-auth's inferAdditionalFields types this as a loose string, so narrow
  // it once here rather than widening every component that consumes it.
  const status = user.status as AccountStatus | null | undefined;

  if (status !== 'approved') {
    const gated: Exclude<AccountStatus, 'approved'> =
      status === 'rejected' || status === 'suspended' ? status : 'pending';

    return (
      <AccountStatusScreen
        status={gated}
        rechecking={rechecking}
        onRecheck={
          gated === 'pending'
            ? () => void queryClient.invalidateQueries({ queryKey: authKeys.currentUser })
            : undefined
        }
      />
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <AppNav userName={user.name} onLogout={() => logout.mutate()} loggingOut={logout.isPending} />
      <div className="flex-1">{children}</div>
    </div>
  );
}

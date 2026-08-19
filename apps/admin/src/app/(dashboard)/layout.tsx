'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useLogout } from '@/features/auth/hooks/use-logout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  // A signed-in member is not an admin. Without the role check the whole shell
  // renders for them and only the API's @Roles('admin') stops the data, leaving
  // a back-office full of 403s instead of a redirect.
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isLoading && !isAdmin) router.replace('/login');
  }, [isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3">
        <span className="flex size-10 animate-pulse items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground">Loading admin…</p>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <AdminSidebar
      userName={user.name}
      onLogout={() => logout.mutate()}
      loggingOut={logout.isPending}
    >
      {children}
    </AdminSidebar>
  );
}

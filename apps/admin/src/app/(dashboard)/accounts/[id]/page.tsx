'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, AtSign, CalendarDays, Phone, UserX } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { EmptyState } from '@repo/ui/empty-state';
import { ErrorState } from '@repo/ui/error-state';
import { Skeleton } from '@repo/ui/skeleton';
import { StatusBadge } from '@repo/ui/status-badge';
import { formatDate } from '@repo/ui/lib/format';
import { useAccount } from '@/features/accounts/hooks/use-account';
import { AccountActions } from '@/features/accounts/components/account-actions';

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: account, isLoading, error, refetch } = useAccount(id);

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl">
        <ErrorState
          title="Couldn’t load this account"
          description={error.message}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="max-w-3xl">
        <EmptyState
          icon={<UserX aria-hidden="true" />}
          title="Account not found"
          description="This account may have been removed."
          action={
            <Button variant="outline" render={<Link href="/accounts" />}>
              Back to accounts
            </Button>
          }
        />
      </div>
    );
  }

  // The API stores the rejection reason inside verification_info.
  const verification = account.verification_info ?? {};
  const rejectionReason =
    typeof verification.rejectionReason === 'string' ? verification.rejectionReason : null;
  const otherVerification = Object.entries(verification).filter(
    ([key]) => key !== 'rejectionReason',
  );

  const fields = [
    { icon: AtSign, label: 'Email', value: account.email },
    { icon: Phone, label: 'Phone', value: account.phone ?? '—' },
    { icon: CalendarDays, label: 'Joined', value: formatDate(account.created_at) },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" render={<Link href="/accounts" />}>
        <ArrowLeft aria-hidden="true" />
        Back to accounts
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
            {initials(account.name)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold">{account.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={account.status} />
              <span className="text-sm text-muted-foreground capitalize">{account.role}</span>
            </div>
          </div>
        </div>

        <AccountActions account={account} size="default" />
      </div>

      <Card className="divide-y divide-border p-0">
        {fields.map((field) => (
          <div key={field.label} className="flex items-center gap-3 px-5 py-4">
            <field.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">{field.label}</span>
            <span className="ml-auto text-right text-sm font-medium break-words">
              {field.value}
            </span>
          </div>
        ))}
      </Card>

      {rejectionReason ? (
        <Card className="border-destructive/25 bg-destructive/5 p-5">
          <h2 className="text-sm font-semibold text-destructive">Rejection reason</h2>
          <p className="mt-1.5 text-sm">{rejectionReason}</p>
        </Card>
      ) : null}

      {otherVerification.length > 0 ? (
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Verification details</h2>
          <dl className="mt-3 space-y-2">
            {otherVerification.map(([key, value]) => (
              <div
                key={key}
                className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4"
              >
                <dt className="text-sm text-muted-foreground">{key}</dt>
                <dd className="text-sm font-medium break-words sm:text-right">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </Card>
      ) : null}
    </div>
  );
}

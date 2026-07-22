'use client';

import { use } from 'react';
import { useAccount } from '@/features/accounts/hooks/use-account';
import { ApproveButton } from '@/features/accounts/components/approve-button';
import { RejectDialog } from '@/features/accounts/components/reject-dialog';
import { SuspendButton } from '@/features/accounts/components/suspend-button';

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: account, isLoading, error } = useAccount(id);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;
  if (!account) return <p>Account not found.</p>;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{account.name}</h1>
      <dl className="grid grid-cols-[8rem_1fr] gap-y-1 text-sm">
        <dt className="text-gray-500">Email</dt>
        <dd>{account.email}</dd>
        <dt className="text-gray-500">Role</dt>
        <dd className="capitalize">{account.role}</dd>
        <dt className="text-gray-500">Status</dt>
        <dd className="capitalize">{account.status}</dd>
      </dl>
      <div className="flex items-center gap-2">
        {account.status === 'pending' ? (
          <>
            <ApproveButton accountId={account.id} />
            <RejectDialog accountId={account.id} />
          </>
        ) : null}
        {account.status === 'approved' ? <SuspendButton accountId={account.id} /> : null}
      </div>
    </div>
  );
}

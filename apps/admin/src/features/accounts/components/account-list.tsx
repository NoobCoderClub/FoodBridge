'use client';

import { usePendingAccounts } from '../hooks/use-pending-accounts';
import { AccountRow } from './account-row';

export function AccountList() {
  const { data, isLoading, error } = usePendingAccounts();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;
  if (!data || data.length === 0) return <p>No pending accounts.</p>;

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-300 font-medium">
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Email</th>
          <th className="px-4 py-2">Role</th>
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((account) => (
          <AccountRow key={account.id} account={account} />
        ))}
      </tbody>
    </table>
  );
}

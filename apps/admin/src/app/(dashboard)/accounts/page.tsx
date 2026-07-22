import { AccountList } from '@/features/accounts/components/account-list';

export default function AccountsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Pending accounts</h1>
      <AccountList />
    </div>
  );
}

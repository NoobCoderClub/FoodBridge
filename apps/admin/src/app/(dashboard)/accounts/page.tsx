import type { Metadata } from 'next';
import { PageHeader } from '@repo/ui/page-header';
import { AccountList } from '@/features/accounts/components/account-list';

export const metadata: Metadata = { title: 'Accounts' };

export default function AccountsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Accounts"
        description="Approve the posters and takers who should be on the platform, and suspend the ones who shouldn’t."
      />
      <AccountList />
    </div>
  );
}

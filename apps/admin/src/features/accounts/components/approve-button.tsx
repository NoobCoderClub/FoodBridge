'use client';

import { Button } from '@/components/ui/button';
import { useApproveAccount } from '../hooks/use-approve-account';

export function ApproveButton({ accountId }: { accountId: string }) {
  const approve = useApproveAccount();
  return (
    <Button onClick={() => approve.mutate(accountId)} disabled={approve.isPending}>
      {approve.isPending ? 'Approving...' : 'Approve'}
    </Button>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { useSuspendAccount } from '../hooks/use-suspend-account';

export function SuspendButton({ accountId }: { accountId: string }) {
  const suspend = useSuspendAccount();
  return (
    <Button
      onClick={() => suspend.mutate(accountId)}
      disabled={suspend.isPending}
      variant="destructive"
    >
      {suspend.isPending ? 'Suspending...' : 'Suspend'}
    </Button>
  );
}

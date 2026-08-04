'use client';

import { Button } from '@/components/ui/button';
import { useCompleteClaim } from '../hooks/use-complete-claim';

export function CompleteButton({ claimId }: { claimId: string }) {
  const complete = useCompleteClaim();

  return (
    <div>
      <Button onClick={() => complete.mutate(claimId)} disabled={complete.isPending}>
        {complete.isPending ? 'Marking completed...' : 'Mark completed'}
      </Button>
      {complete.error ? (
        <p className="mt-2 text-sm text-red-600">{complete.error.message}</p>
      ) : null}
    </div>
  );
}

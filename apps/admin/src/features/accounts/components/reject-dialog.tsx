'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRejectAccount } from '../hooks/use-reject-account';

export function RejectDialog({ accountId }: { accountId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const reject = useRejectAccount();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="destructive">
        Reject
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Reason for rejection"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <Button
        onClick={() =>
          reject.mutate({ id: accountId, reason }, { onSuccess: () => setOpen(false) })
        }
        disabled={reject.isPending || reason.trim().length === 0}
        variant="destructive"
      >
        {reject.isPending ? 'Rejecting...' : 'Confirm reject'}
      </Button>
      <Button onClick={() => setOpen(false)} variant="outline">
        Cancel
      </Button>
    </div>
  );
}

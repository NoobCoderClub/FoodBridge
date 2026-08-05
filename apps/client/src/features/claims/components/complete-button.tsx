'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { ConfirmDialog } from '@repo/ui/confirm-dialog';
import { toast } from '@repo/ui/toast';
import { useCompleteClaim } from '../hooks/use-complete-claim';

export function CompleteButton({ claimId }: { claimId: string }) {
  const complete = useCompleteClaim();
  const [open, setOpen] = useState(false);

  function confirm() {
    complete.mutate(claimId, {
      onSuccess: () => {
        setOpen(false);
        toast.success({
          title: 'Marked as collected',
          description: 'Thanks — this food was rescued instead of wasted.',
        });
      },
      onError: (error) => {
        setOpen(false);
        toast.error({ title: 'Couldn’t complete this claim', description: error.message });
      },
    });
  }

  return (
    <>
      <Button variant="outline" size="lg" block onClick={() => setOpen(true)}>
        <CheckCircle2 aria-hidden="true" />
        Mark as collected
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Mark this pickup as collected?"
        description="Confirm only once the food has actually changed hands. This closes the claim and credits both parties’ reputation."
        confirmLabel="Yes, it’s collected"
        loading={complete.isPending}
        onConfirm={confirm}
      />
    </>
  );
}

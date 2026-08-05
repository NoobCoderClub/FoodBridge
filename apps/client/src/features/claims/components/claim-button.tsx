'use client';

import { useState } from 'react';
import { HandHeart } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { ConfirmDialog } from '@repo/ui/confirm-dialog';
import { toast } from '@repo/ui/toast';
import { useClaimListing } from '../hooks/use-claim-listing';

export function ClaimButton({ listingId, foodType }: { listingId: string; foodType?: string }) {
  const claim = useClaimListing();
  const [open, setOpen] = useState(false);

  function confirm() {
    claim.mutate(listingId, {
      onSuccess: () => {
        setOpen(false);
        toast.success({
          title: 'Claimed — it’s yours',
          description: 'You have 60 minutes to collect it. The pickup address is now visible.',
        });
      },
      onError: (error) => {
        setOpen(false);
        toast.error({ title: 'Couldn’t claim this listing', description: error.message });
      },
    });
  }

  return (
    <>
      <Button size="lg" block onClick={() => setOpen(true)}>
        <HandHeart aria-hidden="true" />
        Claim this listing
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Claim this food?"
        description={
          <>
            Claiming locks {foodType ? <strong>{foodType}</strong> : 'this listing'} to you and
            starts a <strong>60-minute</strong> pickup window. Only claim it if you can collect it
            in time — missing the window counts as a no-show against your reputation.
          </>
        }
        confirmLabel="Yes, claim it"
        loading={claim.isPending}
        onConfirm={confirm}
      />
    </>
  );
}

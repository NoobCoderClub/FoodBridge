'use client';

import { useState } from 'react';
import { HandHeart } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { ConfirmDialog } from '@repo/ui/confirm-dialog';
import { toast } from '@repo/ui/toast';
import { useClaimListing } from '../hooks/use-claim-listing';
import { CollectionTimePicker, formatDateTime24h } from './collection-time-picker';

export function ClaimButton({
  listingId,
  foodType,
  listingExpiryTime,
}: {
  listingId: string;
  foodType?: string;
  /** ISO timestamp from the API — bounds the collection-time picker. */
  listingExpiryTime: string;
}) {
  const claim = useClaimListing();
  const [open, setOpen] = useState(false);

  // The chosen collection time and whether it passes the expiry check.
  // Both are surfaced by CollectionTimePicker via onCollectionTimeChange.
  const [selectedCollectionTime, setSelectedCollectionTime] = useState<Date | null>(null);
  const [isSelectedTimeValid, setIsSelectedTimeValid] = useState(false);

  function handleCollectionTimeChange(time: Date | null, isValid: boolean) {
    setSelectedCollectionTime(time);
    setIsSelectedTimeValid(isValid);
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    // Re-arm the validity gate each time the dialog closes.
    if (!nextOpen) {
      setSelectedCollectionTime(null);
      setIsSelectedTimeValid(false);
    }
  }

  function confirm() {
    if (!isSelectedTimeValid || !selectedCollectionTime) return;
    const pickupDeadline = selectedCollectionTime.toISOString();

    claim.mutate(
      { listingId, pickupDeadline },
      {
        onSuccess: () => {
          setOpen(false);
          const timeText = selectedCollectionTime
            ? formatDateTime24h(selectedCollectionTime)
            : 'your chosen time';
          toast.success({
            title: "Claimed — it's yours",
            description: `Pickup deadline set for ${timeText}. The address is now visible.`,
          });
        },
        onError: (error) => {
          setOpen(false);
          toast.error({ title: "Couldn't claim this listing", description: error.message });
        },
      },
    );
  }

  return (
    <>
      <Button size="lg" block onClick={() => setOpen(true)}>
        <HandHeart aria-hidden="true" />
        Claim this listing
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={handleDialogOpenChange}
        title="Claim this food?"
        description={
          <>
            Claiming locks {foodType ? <strong>{foodType}</strong> : 'this listing'} to you. Choose
            your collection time below — missing your window counts as a no-show against your
            reputation.
          </>
        }
        confirmLabel="Yes, claim it"
        loading={claim.isPending}
        confirmDisabled={!isSelectedTimeValid}
        onConfirm={confirm}
      >
        {/*
          CollectionTimePicker slots into ConfirmDialog's `children` prop,
          which renders between the description and the Cancel / Confirm buttons.
        */}
        <CollectionTimePicker
          listingExpiryTime={listingExpiryTime}
          onCollectionTimeChange={handleCollectionTimeChange}
        />
      </ConfirmDialog>
    </>
  );
}

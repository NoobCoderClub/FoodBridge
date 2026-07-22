'use client';

import { Button } from '@/components/ui/button';
import { useClaimListing } from '../hooks/use-claim-listing';

export function ClaimButton({ listingId }: { listingId: string }) {
  const claim = useClaimListing();

  return (
    <div>
      <Button onClick={() => claim.mutate(listingId)} disabled={claim.isPending}>
        {claim.isPending ? 'Claiming...' : 'Claim this listing'}
      </Button>
      {claim.error ? <p className="mt-2 text-sm text-red-600">{claim.error.message}</p> : null}
    </div>
  );
}

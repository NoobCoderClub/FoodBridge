'use client';

import { use } from 'react';
import { useListing } from '@/features/listings/hooks/use-listing';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useMyClaims } from '@/features/claims/hooks/use-my-claims';
import { ClaimButton } from '@/features/claims/components/claim-button';
import { ContactCard } from '@/features/claims/components/contact-card';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: listing, isLoading, error } = useListing(id);
  const { data: user } = useCurrentUser();
  const { data: myClaims } = useMyClaims();

  if (isLoading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-600">{error.message}</p>;
  if (!listing) return <p className="p-8">Listing not found.</p>;

  const myActiveClaim = myClaims?.find(
    (claim) => claim.listing_id === listing.id && claim.status === 'active',
  );
  const canClaim = user?.role === 'taker' && listing.status === 'available' && !myActiveClaim;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold">{listing.food_type}</h1>
      <dl className="grid grid-cols-[8rem_1fr] gap-y-1 text-sm">
        <dt className="text-gray-500">Quantity</dt>
        <dd>
          {listing.quantity} {listing.quantity_unit}
        </dd>
        <dt className="text-gray-500">Area</dt>
        <dd>{listing.address_approx}</dd>
        <dt className="text-gray-500">Prepared</dt>
        <dd>{new Date(listing.prepared_at).toLocaleString()}</dd>
        <dt className="text-gray-500">Expires</dt>
        <dd>{new Date(listing.expires_at).toLocaleString()}</dd>
        <dt className="text-gray-500">Status</dt>
        <dd className="capitalize">{listing.status}</dd>
      </dl>
      {canClaim ? <ClaimButton listingId={listing.id} /> : null}
      {myActiveClaim && listing.address_exact ? (
        <ContactCard
          addressExact={listing.address_exact}
          posterPhone={listing.poster_phone}
          pickupDeadline={myActiveClaim.pickup_deadline}
        />
      ) : null}
    </main>
  );
}

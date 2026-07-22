'use client';

import { use } from 'react';
import { useListing } from '@/features/listings/hooks/use-listing';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: listing, isLoading, error } = useListing(id);

  if (isLoading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-600">{error.message}</p>;
  if (!listing) return <p className="p-8">Listing not found.</p>;

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
        {listing.address_exact ? (
          <>
            <dt className="text-gray-500">Exact address</dt>
            <dd>{listing.address_exact}</dd>
          </>
        ) : null}
        {listing.poster_phone ? (
          <>
            <dt className="text-gray-500">Poster phone</dt>
            <dd>{listing.poster_phone}</dd>
          </>
        ) : null}
        <dt className="text-gray-500">Prepared</dt>
        <dd>{new Date(listing.prepared_at).toLocaleString()}</dd>
        <dt className="text-gray-500">Expires</dt>
        <dd>{new Date(listing.expires_at).toLocaleString()}</dd>
        <dt className="text-gray-500">Status</dt>
        <dd className="capitalize">{listing.status}</dd>
      </dl>
    </main>
  );
}

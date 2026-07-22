'use client';

import Link from 'next/link';
import { useMyClaims } from '@/features/claims/hooks/use-my-claims';
import { CountdownTimer } from '@/features/claims/components/countdown-timer';

export default function MyClaimsPage() {
  const { data: claims, isLoading, error } = useMyClaims();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold">My claims</h1>
      {isLoading ? <p>Loading...</p> : null}
      {error ? <p className="text-red-600">{error.message}</p> : null}
      {claims && claims.length === 0 ? <p>No claims yet.</p> : null}
      <div className="flex flex-col gap-3">
        {claims?.map((claim) => (
          <Link
            key={claim.id}
            href={`/listings/${claim.listing_id}`}
            className="block rounded-md border border-gray-200 p-4 hover:border-black"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{claim.food_type}</h3>
              <span className="text-xs capitalize text-gray-500">{claim.status}</span>
            </div>
            <p className="text-sm text-gray-600">{claim.address_approx}</p>
            {claim.status === 'active' ? (
              <p className="text-xs text-gray-400">
                Pick up within: <CountdownTimer deadline={claim.pickup_deadline} />
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </main>
  );
}

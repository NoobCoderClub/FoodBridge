'use client';

import { useGeolocation } from '@/hooks/use-geolocation';
import { useListings } from '../hooks/use-listings';
import { ListingCard } from './listing-card';

export function ListingList() {
  const geo = useGeolocation();
  const { data, isLoading, error } = useListings(geo.lat, geo.lng);

  if (geo.loading || isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;
  if (!data || data.length === 0) return <p>No listings available.</p>;

  return (
    <div className="flex flex-col gap-3">
      {geo.denied ? (
        <p className="text-xs text-gray-500">
          Location unavailable — sorted by expiry instead of distance.
        </p>
      ) : null}
      {data.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

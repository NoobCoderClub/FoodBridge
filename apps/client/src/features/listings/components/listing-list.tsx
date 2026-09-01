'use client';

import { MapPinOff, PackageOpen } from 'lucide-react';
import { CardSkeleton } from '@repo/ui/skeleton';
import { EmptyState } from '@repo/ui/empty-state';
import { ErrorState } from '@repo/ui/error-state';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useListings } from '../hooks/use-listings';
import { ListingCard } from './listing-card';

export function ListingList() {
  const geo = useGeolocation();
  const { data, isLoading, error, refetch } = useListings(geo.lat, geo.lng);

  if (geo.loading || isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn’t load listings"
        description={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen aria-hidden="true" />}
        title="No food available right now"
        description="Nothing is up for collection in your area yet. New listings appear here as soon as a poster adds them, so check back shortly."
      />
    );
  }

  return (
    <div className="space-y-4">
      {geo.denied ? (
        <p className="flex items-start gap-2 rounded-lg bg-status-pending px-3 py-2 text-sm text-status-pending-foreground">
          <MapPinOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Location is turned off, so these are sorted by expiry instead of distance. Enable
            location to see what’s closest to you.
          </span>
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {data.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}

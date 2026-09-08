'use client';

import { useMemo, useState } from 'react';
import { MapPinOff, PackageOpen, Search, X } from 'lucide-react';

import { CardSkeleton } from '@repo/ui/skeleton';
import { EmptyState } from '@repo/ui/empty-state';
import { ErrorState } from '@repo/ui/error-state';

import { useGeolocation } from '@/hooks/use-geolocation';

import { useListings } from '../hooks/use-listings';
import { ListingCard } from './listing-card';

export function ListingList() {
  const [search, setSearch] = useState('');

  const geo = useGeolocation();
  const { data, isLoading, error, refetch } = useListings(geo.lat, geo.lng);

  const filteredListings = useMemo(() => {
    if (!data) return [];

    const query = search.trim().toLowerCase();

    if (!query) return data;

    return data.filter((listing) => listing.food_type.toLowerCase().includes(query));
  }, [data, search]);

  if (geo.loading || isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}{' '}
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

  return (
    <div className="space-y-4">
      {geo.denied ? (
        <p className="flex items-start gap-2 rounded-lg bg-status-pending px-3 py-2 text-sm text-status-pending-foreground">
          {' '}
          <MapPinOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{' '}
          <span>
            Location is turned off, so these are sorted by expiry instead of distance. Enable
            location to see what’s closest to you.{' '}
          </span>{' '}
        </p>
      ) : null}

      {/* Search */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search food..."
          aria-label="Search food listings"
          className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 [&::-webkit-search-cancel-button]:appearance-none"
        />

        {search ? (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {/* No listings at all */}
      {!data || data.length === 0 ? (
        <EmptyState
          icon={<PackageOpen aria-hidden="true" />}
          title="No food available right now"
          description="Nothing is up for collection in your area yet. New listings appear here as soon as a poster adds them, so check back shortly."
        />
      ) : filteredListings.length === 0 ? (
        /* Search returned nothing */
        <EmptyState
          icon={<Search aria-hidden="true" />}
          title="No matching food found"
          description={`No listings match "${search}". Try searching for another food.`}
        />
      ) : (
        <>
          {search ? (
            <p className="text-sm text-muted-foreground">
              Showing {filteredListings.length}{' '}
              {filteredListings.length === 1 ? 'listing' : 'listings'} matching
              <span className="font-medium text-foreground"> &quot;{search}&quot;</span>
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

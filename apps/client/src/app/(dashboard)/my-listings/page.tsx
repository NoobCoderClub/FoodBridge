'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { MapPin, PlusCircle, Search, Sprout, UtensilsCrossed } from 'lucide-react';
import type { ListingStatus } from '@repo/types';
import { Button } from '@repo/ui/button';
import { cardVariants } from '@repo/ui/card';
import { EmptyState } from '@repo/ui/empty-state';
import { ErrorState } from '@repo/ui/error-state';
import { ExpiryBar } from '@repo/ui/expiry-bar';
import { PageHeader, PageShell } from '@repo/ui/page-header';
import { CardSkeleton } from '@repo/ui/skeleton';
import { StatusBadge } from '@repo/ui/status-badge';
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { TimeRemaining } from '@repo/ui/countdown';
import { formatDateTime, formatQuantity } from '@repo/ui/lib/format';
import { cn } from '@repo/ui/lib/utils';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useMyListings } from '@/features/listings/hooks/use-my-listings';
import type { MyListing } from '@/features/listings/types';

type Filter = 'all' | ListingStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'completed', label: 'Completed' },
  { value: 'expired', label: 'Expired' },
];

function MyListingCard({ listing }: { listing: MyListing }) {
  const live = listing.status === 'available' || listing.status === 'claimed';

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(cardVariants({ interactive: true }), 'group gap-4 p-5')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UtensilsCrossed className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold transition-colors group-hover:text-primary">
              {listing.food_type}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatQuantity(listing.quantity, listing.quantity_unit)}
            </p>
          </div>
        </div>
        <StatusBadge status={listing.status} className="shrink-0" />
      </div>

      {live ? (
        <div className="space-y-2">
          <ExpiryBar expiresAt={listing.expires_at} preparedAt={listing.prepared_at} />
          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{listing.address_approx}</span>
            </span>
            <TimeRemaining expiresAt={listing.expires_at} className="shrink-0" />
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Posted {formatDateTime(listing.created_at)}</p>
      )}

      {listing.active_claim_id ? (
        <p className="rounded-lg bg-status-pending px-3 py-2 text-sm text-status-pending-foreground">
          Someone is on their way — mark it collected once they arrive.
        </p>
      ) : null}
    </Link>
  );
}

export default function MyListingsPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: listings, isLoading, error, refetch } = useMyListings();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    if (!listings) return [];
    return filter === 'all' ? listings : listings.filter((l) => l.status === filter);
  }, [listings, filter]);

  if (userLoading || isLoading) {
    return (
      <PageShell className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </PageShell>
    );
  }

  if (user?.role !== 'poster') {
    return (
      <PageShell>
        <EmptyState
          icon={<Search aria-hidden="true" />}
          title="This view is for food posters"
          description="You’re signed in as a taker. Browse what’s available near you instead."
          action={
            <Button render={<Link href="/listings" />}>
              <Search aria-hidden="true" />
              Browse food near you
            </Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-8">
      <PageHeader
        title="My listings"
        description="Everything you’ve posted, including what expired uncollected."
        actions={
          <Button render={<Link href="/listings/new" />}>
            <PlusCircle aria-hidden="true" />
            Post a listing
          </Button>
        }
      />

      {error ? (
        <ErrorState
          title="Couldn’t load your listings"
          description={error.message}
          onRetry={() => void refetch()}
        />
      ) : listings && listings.length === 0 ? (
        <EmptyState
          icon={<Sprout aria-hidden="true" />}
          title="You haven’t posted anything yet"
          description="Share your surplus food and approved takers nearby will be able to claim it within minutes."
          action={
            <Button render={<Link href="/listings/new" />}>
              <PlusCircle aria-hidden="true" />
              Post your first listing
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
            <TabsList>
              {FILTERS.map((option) => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed aria-hidden="true" />}
              title={`Nothing ${filter}`}
              description="Try a different filter to see your other listings."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((listing) => (
                <MyListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}

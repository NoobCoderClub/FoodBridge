'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarClock, MapPin, Scale, UtensilsCrossed } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { EmptyState } from '@repo/ui/empty-state';
import { ErrorState } from '@repo/ui/error-state';
import { ExpiryBar } from '@repo/ui/expiry-bar';
import { PageShell } from '@repo/ui/page-header';
import { Skeleton } from '@repo/ui/skeleton';
import { StatusBadge } from '@repo/ui/status-badge';
import { TimeRemaining } from '@repo/ui/countdown';
import { formatDateTime, formatQuantity } from '@repo/ui/lib/format';
import { useListing } from '@/features/listings/hooks/use-listing';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useMyClaims } from '@/features/claims/hooks/use-my-claims';
import { ClaimButton } from '@/features/claims/components/claim-button';
import { CompleteButton } from '@/features/claims/components/complete-button';
import { ContactCard } from '@/features/claims/components/contact-card';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: listing, isLoading, error, refetch } = useListing(id);
  const { data: user } = useCurrentUser();
  const { data: myClaims } = useMyClaims();

  if (isLoading) {
    return (
      <PageShell width="narrow" className="space-y-6">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell width="narrow">
        <ErrorState
          title="Couldn’t load this listing"
          description={error.message}
          onRetry={() => void refetch()}
        />
      </PageShell>
    );
  }

  if (!listing) {
    return (
      <PageShell width="narrow">
        <EmptyState
          icon={<UtensilsCrossed aria-hidden="true" />}
          title="Listing not found"
          description="It may have already been collected, or it expired and was removed."
          action={
            <Button variant="outline" render={<Link href="/listings" />}>
              Back to browse
            </Button>
          }
        />
      </PageShell>
    );
  }

  const myActiveClaim = myClaims?.find(
    (claim) => claim.listing_id === listing.id && claim.status === 'active',
  );
  const canClaim = user?.role === 'taker' && listing.status === 'available' && !myActiveClaim;

  const details = [
    {
      icon: Scale,
      label: 'Quantity',
      value: formatQuantity(listing.quantity, listing.quantity_unit),
    },
    { icon: MapPin, label: 'Area', value: listing.address_approx },
    { icon: CalendarClock, label: 'Prepared', value: formatDateTime(listing.prepared_at) },
    { icon: CalendarClock, label: 'Expires', value: formatDateTime(listing.expires_at) },
  ];

  return (
    <PageShell width="narrow" className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" render={<Link href="/listings" />}>
        <ArrowLeft aria-hidden="true" />
        Back
      </Button>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UtensilsCrossed className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold break-words">{listing.food_type}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatQuantity(listing.quantity, listing.quantity_unit)}
              </p>
            </div>
          </div>
          <StatusBadge status={listing.status} className="shrink-0" />
        </div>

        <div className="space-y-2">
          <ExpiryBar expiresAt={listing.expires_at} preparedAt={listing.prepared_at} />
          <div className="flex justify-end">
            <TimeRemaining expiresAt={listing.expires_at} />
          </div>
        </div>
      </div>

      <Card className="divide-y divide-border p-0">
        {details.map((detail) => (
          <div key={detail.label} className="flex items-center gap-3 px-5 py-3.5">
            <detail.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">{detail.label}</span>
            <span className="ml-auto text-right text-sm font-medium break-words">
              {detail.value}
            </span>
          </div>
        ))}
      </Card>

      {canClaim ? <ClaimButton listingId={listing.id} foodType={listing.food_type} /> : null}

      {myActiveClaim && listing.address_exact ? (
        <ContactCard
          addressExact={listing.address_exact}
          posterPhone={listing.poster_phone}
          pickupDeadline={myActiveClaim.pickup_deadline}
        />
      ) : null}

      {listing.active_claim_id ? <CompleteButton claimId={listing.active_claim_id} /> : null}
    </PageShell>
  );
}

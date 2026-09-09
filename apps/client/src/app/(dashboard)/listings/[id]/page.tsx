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
import { ListingGallery } from '@/features/listings/components/listing-gallery';
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
      <PageShell width="narrow" className="space-y-7 py-6 sm:py-8">
        <Skeleton className="h-8 w-2/3 rounded-lg" />
        <Skeleton className="h-56 w-full rounded-2xl sm:h-72" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell width="narrow" className="py-6 sm:py-8">
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
      <PageShell width="narrow" className="py-6 sm:py-8">
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

  // One profile posts and claims, so the only thing standing between a member
  // and this button is owning the listing. `sp_claim_listing` rejects a
  // self-claim regardless — this just avoids offering an action that would 409.
  const isMine = listing.poster_id === user?.id;

  const isExpired = listing.status === 'expired' || new Date(listing.expires_at) <= new Date();
  const canClaim = !isMine && listing.status === 'available' && !myActiveClaim;

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
    <PageShell width="narrow" className="space-y-7 py-5 sm:space-y-8 sm:py-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-9 gap-2 rounded-lg px-3 text-muted-foreground hover:text-foreground"
        render={<Link href={isMine ? '/my-listings' : '/listings'} />}
      >
        <ArrowLeft aria-hidden="true" />
        Back
      </Button>

      <ListingGallery urls={listing.image_urls} />

      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3 sm:gap-5">
          <div className="flex min-w-0 items-start gap-3.5">
            {listing.image_urls.length === 0 ? (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/10 text-primary shadow-sm sm:size-14">
                <UtensilsCrossed className="size-6 sm:size-7" aria-hidden="true" />
              </span>
            ) : null}

            <div className="min-w-0 pt-0.5">
              <h1 className="text-2xl font-semibold leading-tight tracking-tight wrap-break-word sm:text-3xl">
                {listing.food_type}
              </h1>

              <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                {formatQuantity(listing.quantity, listing.quantity_unit)}
              </p>
            </div>
          </div>

          <StatusBadge
            status={listing.status}
            className="shrink-0 rounded-full px-2.5 py-1 text-xs"
          />
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Pickup availability</span>

            <TimeRemaining expiresAt={listing.expires_at} />
          </div>

          <ExpiryBar expiresAt={listing.expires_at} preparedAt={listing.prepared_at} />
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-border/70 p-0 shadow-sm">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="flex min-h-14 items-center gap-3 border-b border-border/70 px-4 py-3.5 last:border-b-0 sm:px-5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <detail.icon className="size-4" aria-hidden="true" />
            </span>

            <span className="text-sm text-muted-foreground">{detail.label}</span>

            <span className="ml-auto max-w-[60%] text-right text-sm font-medium wrap-break-word sm:max-w-[65%]">
              {detail.value}
            </span>
          </div>
        ))}
      </Card>

      {isMine ? (
        <p className="rounded-xl border border-border/70 bg-muted/50 px-4 py-3.5 text-sm leading-relaxed text-muted-foreground">
          You posted this listing, so you can’t claim it yourself. You’ll see the collector’s
          details here once someone does.
        </p>
      ) : null}

      {/* Expired warning — shown when the cron hasn't flipped status yet */}
      {isExpired && !isMine && !myActiveClaim ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 space-y-1 text-destructive">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <span aria-hidden="true">⚠️</span>
            This listing has expired
          </div>
          <p className="text-xs text-destructive/90">
            This food expired at {formatDateTime(listing.expires_at)} and can no longer be claimed.
          </p>
        </div>
      ) : null}

      {canClaim ? (
        <ClaimButton
          listingId={listing.id}
          foodType={listing.food_type}
          listingExpiryTime={listing.expires_at}
        />
      ) : null}

      {myActiveClaim && listing.address_exact ? (
        <ContactCard
          addressExact={listing.address_exact}
          posterPhone={listing.poster_phone}
          pickupDeadline={myActiveClaim.pickup_deadline}
          latitude={listing.latitude}
          longitude={listing.longitude}
        />
      ) : null}

      {listing.active_claim_id ? <CompleteButton claimId={listing.active_claim_id} /> : null}
    </PageShell>
  );
}

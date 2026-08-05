'use client';

import Link from 'next/link';
import { MapPin, Search, Ticket, UtensilsCrossed } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { cardVariants } from '@repo/ui/card';
import { CountdownTimer } from '@repo/ui/countdown';
import { EmptyState } from '@repo/ui/empty-state';
import { ErrorState } from '@repo/ui/error-state';
import { PageHeader, PageShell } from '@repo/ui/page-header';
import { CardSkeleton } from '@repo/ui/skeleton';
import { StatusBadge } from '@repo/ui/status-badge';
import { cn } from '@repo/ui/lib/utils';
import { formatDateTime } from '@repo/ui/lib/format';
import { useMyClaims } from '@/features/claims/hooks/use-my-claims';
import type { MyClaim } from '@/features/claims/types';

function ClaimCard({ claim }: { claim: MyClaim }) {
  const active = claim.status === 'active';

  return (
    <Link
      href={`/listings/${claim.listing_id}`}
      className={cn(
        cardVariants({ interactive: true }),
        'group gap-3 p-5',
        active && 'border-primary/30 bg-primary/[0.03]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
              active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
            )}
          >
            <UtensilsCrossed className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold transition-colors group-hover:text-primary">
              {claim.food_type}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{claim.address_approx}</span>
            </p>
          </div>
        </div>
        <StatusBadge status={claim.status} className="shrink-0" />
      </div>

      {active ? (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2">
          <span className="text-sm text-muted-foreground">Collect within</span>
          <CountdownTimer deadline={claim.pickup_deadline} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Claimed {formatDateTime(claim.claimed_at)}</p>
      )}
    </Link>
  );
}

export default function MyClaimsPage() {
  const { data: claims, isLoading, error, refetch } = useMyClaims();

  const active = claims?.filter((claim) => claim.status === 'active') ?? [];
  const past = claims?.filter((claim) => claim.status !== 'active') ?? [];

  return (
    <PageShell className="space-y-8">
      <PageHeader
        title="My claims"
        description="Food you’ve reserved. Active claims have a 60-minute pickup window — collect them before the timer runs out."
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Couldn’t load your claims"
          description={error.message}
          onRetry={() => void refetch()}
        />
      ) : claims && claims.length === 0 ? (
        <EmptyState
          icon={<Ticket aria-hidden="true" />}
          title="You haven’t claimed anything yet"
          description="When you claim a listing it shows up here with a live countdown and the poster’s contact details."
          action={
            <Button render={<Link href="/listings" />}>
              <Search aria-hidden="true" />
              Browse food near you
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {active.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                Awaiting pickup
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {active.map((claim) => (
                  <ClaimCard key={claim.id} claim={claim} />
                ))}
              </div>
            </section>
          ) : null}

          {past.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                History
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {past.map((claim) => (
                  <ClaimCard key={claim.id} claim={claim} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}

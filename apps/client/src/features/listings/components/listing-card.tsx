import Link from 'next/link';
import { MapPin, UtensilsCrossed } from 'lucide-react';
import { Badge } from '@repo/ui/badge';
import { cardVariants } from '@repo/ui/card';
import { StatusBadge } from '@repo/ui/status-badge';
import { ExpiryBar } from '@repo/ui/expiry-bar';
import { TimeRemaining } from '@repo/ui/countdown';
import { formatDistance, formatQuantity } from '@repo/ui/lib/format';
import { cn } from '@repo/ui/lib/utils';
import type { Listing } from '../types';

export function ListingCard({ listing }: { listing: Listing }) {
  const distance = formatDistance(listing.distance_km);

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
        {distance ? (
          <Badge tone="outline" className="shrink-0 gap-1">
            <MapPin aria-hidden="true" />
            {distance}
          </Badge>
        ) : (
          <StatusBadge status={listing.status} />
        )}
      </div>

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
    </Link>
  );
}

import Link from 'next/link';
import { Clock3, MapPin } from 'lucide-react';
import { Badge } from '@repo/ui/badge';
import { cardVariants } from '@repo/ui/card';
import { StatusBadge } from '@repo/ui/status-badge';
import { ExpiryBar } from '@repo/ui/expiry-bar';
import { TimeRemaining } from '@repo/ui/countdown';
import { formatDistance, formatQuantity } from '@repo/ui/lib/format';
import { cn } from '@repo/ui/lib/utils';
import { ListingThumb } from './listing-thumb';
import type { Listing } from '../types';

export function ListingCard({ listing }: { listing: Listing }) {
  const distance = formatDistance(listing.distance_km);

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(cardVariants({ interactive: true }), 'group flex flex-col overflow-hidden p-0')}
    >
      {/* Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
          <ListingThumb url={listing.thumbnail_url} />
        </div>

        {/* Top badges */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {listing.status && <StatusBadge status={listing.status} />}

          {distance && (
            <Badge
              tone="outline"
              className="gap-1 rounded-full border-white/60 bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur"
            >
              <MapPin className="size-3" aria-hidden="true" />
              {distance}
            </Badge>
          )}
        </div>

        {/* Bottom image gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        {/* Title */}
        <div>
          <h3 className="line-clamp-1 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
            {listing.food_type}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {formatQuantity(listing.quantity, listing.quantity_unit)}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
            <MapPin className="size-3.5" aria-hidden="true" />
          </div>

          <span className="truncate">{listing.address_approx}</span>
        </div>

        {/* Expiry */}
        <div className="mt-auto rounded-xl border border-border/70 bg-muted/30 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock3 className="size-3.5" aria-hidden="true" />
              <span>Expires</span>
            </div>

            <TimeRemaining expiresAt={listing.expires_at} className="text-xs font-semibold" />
          </div>

          <ExpiryBar expiresAt={listing.expires_at} preparedAt={listing.prepared_at} />
        </div>
      </div>
    </Link>
  );
}

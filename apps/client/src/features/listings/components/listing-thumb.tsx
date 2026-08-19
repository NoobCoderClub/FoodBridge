import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

interface ListingThumbProps {
  url: string | null;
  className?: string;
}

/**
 * The square slot at the head of a listing card: the cover photo when there is
 * one, the utensils chip when there isn't.
 *
 * A plain `<img>` rather than `next/image` — the URL is presigned and its
 * signature rotates, which both defeats the optimiser's cache and would need
 * the server-side optimiser to reach the bucket.
 */
export function ListingThumb({ url, className }: ListingThumbProps) {
  if (!url) {
    return (
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary',
          className,
        )}
      >
        <UtensilsCrossed className="size-5" aria-hidden="true" />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      loading="lazy"
      className={cn('size-10 shrink-0 rounded-lg border border-border object-cover', className)}
    />
  );
}

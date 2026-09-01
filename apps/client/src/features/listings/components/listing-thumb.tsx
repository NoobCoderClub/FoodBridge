import { UtensilsCrossed } from 'lucide-react';

import { cn } from '@repo/ui/lib/utils';

interface ListingThumbProps {
  url: string | null;
  className?: string;
}

export function ListingThumb({ url, className }: ListingThumbProps) {
  if (!url) {
    return (
      <div className={cn('flex h-full w-full items-center justify-center bg-muted', className)}>
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UtensilsCrossed className="size-8" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      loading="lazy"
      className={cn('block h-full w-full object-cover', className)}
    />
  );
}

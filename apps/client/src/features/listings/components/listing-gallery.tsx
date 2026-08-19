'use client';

import { useState } from 'react';
import { cn } from '@repo/ui/lib/utils';

/**
 * Hero photo for a listing, with a thumbnail strip when there's more than one.
 *
 * Plain `<img>` rather than `next/image`: these URLs are presigned and their
 * signature rotates, which defeats the optimiser's cache and would require the
 * server-side optimiser to reach the bucket.
 */
export function ListingGallery({ urls }: { urls: string[] }) {
  const [active, setActive] = useState(0);

  if (urls.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urls[active]}
        alt=""
        className="aspect-video w-full rounded-xl border border-border bg-muted object-cover"
      />

      {urls.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === active}
              className={cn(
                'size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                index === active
                  ? 'border-primary'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

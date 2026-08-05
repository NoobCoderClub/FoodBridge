'use client';

import * as React from 'react';

import { elapsedFraction, getUrgency, type Urgency } from '../lib/urgency';
import { useTick } from './countdown';
import { cn } from '../lib/utils';

const URGENCY_FILL: Record<Urgency, string> = {
  safe: 'bg-urgency-safe',
  soon: 'bg-urgency-soon',
  critical: 'bg-urgency-critical',
  past: 'bg-muted-foreground/40',
};

/**
 * Shelf life consumed, as a bar. Makes the difference between "expires in six
 * hours" and "expires in ten minutes" visible without reading a timestamp.
 */
function ExpiryBar({
  expiresAt,
  preparedAt,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  expiresAt: string | Date;
  preparedAt?: string | Date | null;
}) {
  const now = useTick(true);
  const fraction = now == null ? 0 : elapsedFraction(expiresAt, preparedAt, now);
  const urgency = now == null ? 'safe' : getUrgency(expiresAt, now);

  return (
    <div
      role="progressbar"
      aria-label="Time until this listing expires"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fraction * 100)}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width,background-color] duration-500',
          URGENCY_FILL[urgency],
        )}
        style={{ width: `${Math.max(2, fraction * 100)}%` }}
      />
    </div>
  );
}

export { ExpiryBar };

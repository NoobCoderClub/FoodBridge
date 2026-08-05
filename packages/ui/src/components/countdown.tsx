'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';

import { formatCountdown, formatRemaining, getUrgency, type Urgency } from '../lib/urgency';
import { cn } from '../lib/utils';

const URGENCY_TEXT: Record<Urgency, string> = {
  safe: 'text-urgency-safe',
  soon: 'text-urgency-soon',
  critical: 'text-urgency-critical',
  past: 'text-muted-foreground',
};

/**
 * Ticks once a second. Renders a stable placeholder on the server so the first
 * client paint doesn't produce a hydration mismatch.
 */
function useTick(active: boolean) {
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  return now;
}

/** mm:ss pickup countdown — used on claims, where the deadline is 60 minutes. */
function CountdownTimer({
  deadline,
  className,
  showIcon = true,
  ...props
}: React.ComponentProps<'span'> & { deadline: string | Date; showIcon?: boolean }) {
  const now = useTick(true);
  const urgency = now == null ? 'safe' : getUrgency(deadline, now);
  const expired = urgency === 'past';

  return (
    <span
      className={cn(
        'tabular inline-flex items-center gap-1.5 font-medium',
        URGENCY_TEXT[urgency],
        urgency === 'critical' && !expired && 'animate-pulse',
        className,
      )}
      {...props}
    >
      {showIcon ? <Clock className="size-4" aria-hidden="true" /> : null}
      {now == null ? (
        <span className="opacity-0">00:00</span>
      ) : expired ? (
        'Expired'
      ) : (
        formatCountdown(deadline, now)
      )}
    </span>
  );
}

/** Coarser "2h 14m left" label — used on listing cards. */
function TimeRemaining({
  expiresAt,
  className,
  showIcon = true,
  ...props
}: React.ComponentProps<'span'> & { expiresAt: string | Date; showIcon?: boolean }) {
  const now = useTick(true);
  const urgency = now == null ? 'safe' : getUrgency(expiresAt, now);

  return (
    <span
      className={cn(
        'tabular inline-flex items-center gap-1.5 text-sm font-medium',
        URGENCY_TEXT[urgency],
        className,
      )}
      {...props}
    >
      {showIcon ? <Clock className="size-3.5" aria-hidden="true" /> : null}
      {now == null ? (
        <span className="opacity-0">0h 00m</span>
      ) : urgency === 'past' ? (
        'Expired'
      ) : (
        `${formatRemaining(expiresAt, now)} left`
      )}
    </span>
  );
}

export { CountdownTimer, TimeRemaining, useTick };

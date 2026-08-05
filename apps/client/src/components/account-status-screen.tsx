'use client';

import Link from 'next/link';
import { Ban, Clock3, RefreshCw, ShieldX, Sprout } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import type { AccountStatus } from '@repo/types';

const COPY: Record<
  Exclude<AccountStatus, 'approved'>,
  { icon: React.ComponentType<{ className?: string }>; title: string; body: string; tone: string }
> = {
  pending: {
    icon: Clock3,
    title: 'Your account is under review',
    body: 'An admin is verifying your details. This usually takes less than a day — we’ll open things up the moment you’re approved.',
    tone: 'bg-status-pending text-status-pending-foreground',
  },
  rejected: {
    icon: ShieldX,
    title: 'Application not approved',
    body: 'Your application wasn’t approved. If you think this was a mistake, contact support and we’ll take another look.',
    tone: 'bg-status-danger text-status-danger-foreground',
  },
  suspended: {
    icon: Ban,
    title: 'Account suspended',
    body: 'Your account has been suspended and you can’t post or claim food right now. Contact support for details.',
    tone: 'bg-status-neutral text-status-neutral-foreground',
  },
};

/**
 * The three gate states used to be near-identical walls of text. They are the
 * first thing a brand-new user sees, so they carry the brand and tell the user
 * what happens next.
 */
export function AccountStatusScreen({
  status,
  onRecheck,
  rechecking,
}: {
  status: Exclude<AccountStatus, 'approved'>;
  onRecheck?: () => void;
  rechecking?: boolean;
}) {
  const { icon: Icon, title, body, tone } = COPY[status];

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sprout className="size-4.5" aria-hidden="true" />
        </span>
        FoodBridge
      </Link>

      <Card className="w-full max-w-md items-center p-8 text-center">
        <div className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>

        {onRecheck ? (
          <Button variant="outline" className="mt-6" onClick={onRecheck} loading={rechecking}>
            <RefreshCw aria-hidden="true" />
            Check again
          </Button>
        ) : null}
      </Card>

      <p className="mt-6 text-sm text-muted-foreground">
        Need help?{' '}
        <a
          className="font-medium text-primary hover:underline"
          href="mailto:support@foodbridge.app"
        >
          Contact support
        </a>
      </p>
    </main>
  );
}

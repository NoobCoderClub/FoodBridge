'use client';

import * as React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

import { Button } from './button';
import { cn } from '../lib/utils';

/**
 * Replaces `<p className="text-red-600">{error.message}</p>`, which surfaced raw
 * API strings with no way to recover.
 */
function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      data-slot="error-state"
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-destructive/25 bg-destructive/5 px-6 py-12 text-center',
        className,
      )}
      {...props}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-background text-destructive shadow-soft">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <p className="text-base font-semibold">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RotateCcw aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

/** Compact inline variant for form and mutation errors. */
function InlineError({ children, className, ...props }: React.ComponentProps<'p'>) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={cn(
        'flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive',
        className,
      )}
      {...props}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export { ErrorState, InlineError };

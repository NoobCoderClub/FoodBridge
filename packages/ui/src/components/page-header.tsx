import * as React from 'react';

import { cn } from '../lib/utils';

/**
 * Consistent page title block. Previously each page hand-rolled its own heading
 * and picked its own max-width (max-w-sm / max-w-md / max-w-2xl at random).
 */
function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      data-slot="page-header"
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}
      {...props}
    >
      <div className="min-w-0 space-y-1.5">
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description ? (
          <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Standard page container — one max-width for the whole product. */
function PageShell({
  className,
  width = 'default',
  ...props
}: React.ComponentProps<'main'> & { width?: 'default' | 'wide' | 'narrow' }) {
  return (
    <main
      className={cn(
        'mx-auto w-full px-4 py-8 sm:px-6 sm:py-10',
        width === 'narrow' && 'max-w-xl',
        width === 'default' && 'max-w-5xl',
        width === 'wide' && 'max-w-7xl',
        className,
      )}
      {...props}
    />
  );
}

export { PageHeader, PageShell };

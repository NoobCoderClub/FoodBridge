import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      tone: {
        neutral: 'border-transparent bg-status-neutral text-status-neutral-foreground',
        success: 'border-transparent bg-status-success text-status-success-foreground',
        pending: 'border-transparent bg-status-pending text-status-pending-foreground',
        danger: 'border-transparent bg-status-danger text-status-danger-foreground',
        primary: 'border-transparent bg-primary/10 text-primary',
        outline: 'border-border bg-transparent text-muted-foreground',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ tone, className }))} {...props} />;
}

export { Badge, badgeVariants };

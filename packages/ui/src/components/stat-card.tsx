import * as React from 'react';

import { Card } from './card';
import { cn } from '../lib/utils';

function StatCard({
  label,
  value,
  unit,
  icon,
  hint,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  label: string;
  value: React.ReactNode;
  unit?: string;
  icon?: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden gap-0 p-5',
        'transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md',
        className,
      )}
      {...props}
    >
      {/* Accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-primary/80" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>

          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="tabular text-3xl font-bold tracking-tight">{value}</p>

            {unit ? (
              <span className="text-sm font-medium text-muted-foreground">{unit}</span>
            ) : null}
          </div>
        </div>

        {icon ? (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10 [&_svg]:size-5">
            {icon}
          </div>
        ) : null}
      </div>

      {hint ? (
        <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
          <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          <p className="truncate text-xs font-medium text-muted-foreground">{hint}</p>
        </div>
      ) : null}
    </Card>
  );
}

export { StatCard };

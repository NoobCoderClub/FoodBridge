import * as React from 'react';

import { Card } from './card';
import { cn } from '../lib/utils';

/**
 * KPI tile for the admin overview. Replaces the hardcoded `grid-cols-3` block
 * that crushed on mobile.
 */
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
    <Card className={cn('gap-0 p-5', className)} {...props}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="tabular mt-3 flex items-baseline gap-1.5 text-3xl font-semibold">
        {value}
        {unit ? <span className="text-base font-medium text-muted-foreground">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}

export { StatCard };

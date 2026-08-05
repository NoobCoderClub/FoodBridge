import * as React from 'react';

import { Badge } from './badge';
import { statusLabel, statusTone } from '../lib/status';
import { cn } from '../lib/utils';

/**
 * One badge for every status the domain produces — listing, claim and account
 * alike. Previously each screen rendered raw status text with no visual weight.
 */
function StatusBadge({
  status,
  className,
  showDot = true,
  ...props
}: React.ComponentProps<'span'> & { status: string; showDot?: boolean }) {
  const tone = statusTone(status);

  return (
    <Badge tone={tone} className={cn('gap-1.5', className)} {...props}>
      {showDot ? (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current opacity-70" />
      ) : null}
      {statusLabel(status)}
    </Badge>
  );
}

export { StatusBadge };

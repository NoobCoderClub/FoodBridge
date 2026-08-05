import * as React from 'react';

import { cn } from '../lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-20 w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-base shadow-xs transition-colors outline-none',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60',
        'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
        'sm:text-sm dark:bg-input/30',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

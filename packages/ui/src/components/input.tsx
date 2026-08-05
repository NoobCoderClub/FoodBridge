import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '../lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2 text-base shadow-xs transition-colors outline-none',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60',
        'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
        'sm:text-sm dark:bg-input/30 dark:disabled:bg-input/50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };

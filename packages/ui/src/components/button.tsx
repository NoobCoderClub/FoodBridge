import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '../lib/utils';

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-soft hover:bg-primary/90',
        highlight: 'bg-highlight text-highlight-foreground shadow-soft hover:bg-highlight/90',
        outline:
          'border-border bg-card hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground',
        ghost:
          'hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent dark:hover:bg-accent/60',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30',
        'destructive-solid':
          'bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90 focus-visible:ring-destructive/30',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default:
          'h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        xs: "h-7 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-md px-3 text-[0.8125rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-11 gap-2 px-5 text-[0.9375rem]',
        icon: 'size-10',
        'icon-xs': "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-9 rounded-md',
        'icon-lg': 'size-11',
      },
      block: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** Shows a spinner and disables the button. Keeps children mounted so width doesn't jump. */
    loading?: boolean;
  };

function Button({
  className,
  variant = 'default',
  size = 'default',
  block,
  loading = false,
  disabled,
  children,
  render,
  nativeButton = render ? false : true,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-loading={loading || undefined}
      disabled={disabled || loading}
      render={render}
      nativeButton={nativeButton}
      className={cn(buttonVariants({ variant, size, block, className }))}
      {...props}
    >
      {loading ? <Loader2 className="absolute size-4 animate-spin" aria-hidden="true" /> : null}
      <span className={cn('inline-flex items-center gap-2', loading && 'invisible')}>
        {children}
      </span>
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };

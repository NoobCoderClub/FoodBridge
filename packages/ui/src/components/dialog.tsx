'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { X } from 'lucide-react';

import { cn } from '../lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const backdropClasses =
  'fixed inset-0 z-50 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 dark:bg-background/60';

const popupClasses =
  'relative z-50 flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-border bg-popover p-6 text-popover-foreground shadow-lift outline-none transition-all duration-200 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0';

function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: DialogPrimitive.Popup.Props & { showClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className={backdropClasses} />
      <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-4 sm:items-center">
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(popupClasses, className)}
          {...props}
        >
          {children}
          {showClose ? (
            <DialogPrimitive.Close
              aria-label="Close"
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              <X className="size-4" aria-hidden="true" />
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 pr-8', className)} {...props} />;
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      className={cn('text-lg leading-tight font-semibold', className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  backdropClasses,
  popupClasses,
};

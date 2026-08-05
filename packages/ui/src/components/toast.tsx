'use client';

import * as React from 'react';
import { Toast } from '@base-ui/react/toast';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

import { cn } from '../lib/utils';

/**
 * A module-level manager so any hook, mutation callback or event handler can
 * fire a toast without threading context through props.
 */
const toastManager = Toast.createToastManager();

type ToastOptions = {
  title: string;
  description?: string;
  /** Milliseconds; defaults to Base UI's timeout. */
  timeout?: number;
};

export const toast = {
  success: (options: ToastOptions) => toastManager.add({ ...options, type: 'success' }),
  error: (options: ToastOptions) => toastManager.add({ ...options, type: 'error' }),
  info: (options: ToastOptions) => toastManager.add({ ...options, type: 'info' }),
};

const TONE_ICON: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="size-5 text-status-success-foreground" aria-hidden="true" />,
  error: <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />,
  info: <Info className="size-5 text-primary" aria-hidden="true" />,
};

function ToastList() {
  const { toasts } = Toast.useToastManager();

  return toasts.map((item) => (
    <Toast.Root
      key={item.id}
      toast={item}
      className={cn(
        '[--gap:0.75rem]',
        '[--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]',
        'absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] w-full',
        'rounded-xl border border-border bg-popover text-popover-foreground shadow-lift select-none',
        // Stack: each toast behind the front one peeks out and scales down.
        '[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*0.75rem)))_scale(calc(max(0,1-(var(--toast-index)*0.06))))]',
        'data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]',
        'transition-[transform,opacity] duration-300 ease-out',
        'data-[starting-style]:[transform:translateY(150%)]',
        'data-[ending-style]:opacity-0 data-[limited]:opacity-0',
        '[&[data-ending-style]:not([data-limited])]:[transform:translateY(150%)]',
        'after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[""]',
      )}
    >
      <Toast.Content className="flex items-start gap-3 p-4 transition-opacity duration-200 data-[behind]:opacity-0 data-[expanded]:opacity-100">
        <div className="mt-0.5 shrink-0">{TONE_ICON[item.type ?? 'info'] ?? TONE_ICON.info}</div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Toast.Title className="text-sm font-semibold" />
          <Toast.Description className="text-sm text-muted-foreground" />
        </div>
        <Toast.Close
          aria-label="Dismiss"
          className="-mt-1 -mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          <X className="size-4" aria-hidden="true" />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ));
}

/** Mount once, inside the app's provider tree. */
function Toaster({ children }: { children?: React.ReactNode }) {
  return (
    <Toast.Provider toastManager={toastManager}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed right-4 bottom-4 left-4 z-100 mx-auto flex w-auto sm:left-auto sm:w-90">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

export { Toaster, toastManager };

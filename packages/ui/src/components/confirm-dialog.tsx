'use client';

import * as React from 'react';
import { AlertDialog } from '@base-ui/react/alert-dialog';

import { Button } from './button';
import { backdropClasses, popupClasses } from './dialog';
import { cn } from '../lib/utils';

/**
 * Gates destructive/irreversible actions — Suspend, Reject, Claim, Mark
 * completed — which previously fired the moment the button was pressed.
 */
function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  loading = false,
  destructive = false,
  children,
  className,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  destructive?: boolean;
  /** Extra content between the description and the actions (e.g. a reason field). */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <AlertDialog.Trigger render={trigger as React.ReactElement} /> : null}
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={backdropClasses} />
        <AlertDialog.Viewport className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-4 sm:items-center">
          <AlertDialog.Popup className={cn(popupClasses, 'max-w-md', className)}>
            <AlertDialog.Title className="text-lg leading-tight font-semibold">
              {title}
            </AlertDialog.Title>
            {description ? (
              <AlertDialog.Description className="text-sm text-muted-foreground">
                {description}
              </AlertDialog.Description>
            ) : null}

            {children}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialog.Close
                render={
                  <Button variant="outline" disabled={loading}>
                    {cancelLabel}
                  </Button>
                }
              />
              <Button
                variant={destructive ? 'destructive-solid' : 'default'}
                loading={loading}
                onClick={() => void onConfirm()}
              >
                {confirmLabel}
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export { ConfirmDialog };

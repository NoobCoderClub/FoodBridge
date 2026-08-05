'use client';

import { useState } from 'react';
import { Ban, Check, X } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { ConfirmDialog } from '@repo/ui/confirm-dialog';
import { Input } from '@repo/ui/input';
import { toast } from '@repo/ui/toast';
import { useApproveAccount } from '../hooks/use-approve-account';
import { useRejectAccount } from '../hooks/use-reject-account';
import { useSuspendAccount } from '../hooks/use-suspend-account';
import type { Account } from '../types';

/**
 * Replaces approve-button / reject-dialog / suspend-button. Reject and Suspend
 * now go through a real modal — the old "dialog" was an inline state swap with
 * no overlay, focus trap or Escape handling, and Suspend fired instantly.
 */
export function AccountActions({
  account,
  size = 'sm',
}: {
  account: Account;
  size?: 'sm' | 'default';
}) {
  const approve = useApproveAccount();
  const reject = useRejectAccount();
  const suspend = useSuspendAccount();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState('');

  function handleApprove() {
    approve.mutate(account.id, {
      onSuccess: () =>
        toast.success({
          title: 'Account approved',
          description: `${account.name} can now use FoodBridge.`,
        }),
      onError: (error) => toast.error({ title: 'Approval failed', description: error.message }),
    });
  }

  function handleReject() {
    reject.mutate(
      { id: account.id, reason },
      {
        onSuccess: () => {
          setRejectOpen(false);
          setReason('');
          toast.success({
            title: 'Account rejected',
            description: `${account.name} was notified.`,
          });
        },
        onError: (error) => toast.error({ title: 'Rejection failed', description: error.message }),
      },
    );
  }

  function handleSuspend() {
    suspend.mutate(account.id, {
      onSuccess: () => {
        setSuspendOpen(false);
        toast.success({
          title: 'Account suspended',
          description: `${account.name} can no longer post or claim.`,
        });
      },
      onError: (error) => toast.error({ title: 'Suspension failed', description: error.message }),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {account.status === 'pending' ? (
        <>
          <Button size={size} onClick={handleApprove} loading={approve.isPending}>
            <Check aria-hidden="true" />
            Approve
          </Button>
          <Button size={size} variant="destructive" onClick={() => setRejectOpen(true)}>
            <X aria-hidden="true" />
            Reject
          </Button>
        </>
      ) : null}

      {account.status === 'approved' ? (
        <Button size={size} variant="destructive" onClick={() => setSuspendOpen(true)}>
          <Ban aria-hidden="true" />
          Suspend
        </Button>
      ) : null}

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) setReason('');
        }}
        title={`Reject ${account.name}?`}
        description="They won’t be able to post or claim food. The reason is stored on the account and shown to them."
        confirmLabel="Reject account"
        destructive
        loading={reject.isPending}
        onConfirm={handleReject}
      >
        <div className="space-y-2">
          <label htmlFor={`reason-${account.id}`} className="text-sm font-medium">
            Reason for rejection
          </label>
          <Input
            id={`reason-${account.id}`}
            placeholder="e.g. Could not verify the organisation"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          {reason.trim().length === 0 ? (
            <p className="text-xs text-muted-foreground">A reason is required.</p>
          ) : null}
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        title={`Suspend ${account.name}?`}
        description="They’ll immediately lose access to posting and claiming. You can’t undo this from the admin console."
        confirmLabel="Suspend account"
        destructive
        loading={suspend.isPending}
        onConfirm={handleSuspend}
      />
    </div>
  );
}

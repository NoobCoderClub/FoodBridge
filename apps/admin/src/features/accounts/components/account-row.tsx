import type { Account } from '../types';
import { ApproveButton } from './approve-button';
import { RejectDialog } from './reject-dialog';

export function AccountRow({ account }: { account: Account }) {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-3">{account.name}</td>
      <td className="px-4 py-3">{account.email}</td>
      <td className="px-4 py-3 capitalize">{account.role}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <ApproveButton accountId={account.id} />
          <RejectDialog accountId={account.id} />
        </div>
      </td>
    </tr>
  );
}

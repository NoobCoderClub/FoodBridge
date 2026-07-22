import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountKeys } from '@/lib/query-keys';
import { approveAccount } from '../api/accounts.api';

export function useApproveAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveAccount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

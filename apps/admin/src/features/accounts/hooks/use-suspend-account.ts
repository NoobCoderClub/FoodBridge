import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountKeys } from '@/lib/query-keys';
import { suspendAccount } from '../api/accounts.api';

export function useSuspendAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: suspendAccount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

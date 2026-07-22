import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountKeys } from '@/lib/query-keys';
import { rejectAccount } from '../api/accounts.api';

export function useRejectAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectAccount(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

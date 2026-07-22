import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authKeys } from '@/lib/query-keys';
import { login } from '../api/auth.api';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
    },
  });
}

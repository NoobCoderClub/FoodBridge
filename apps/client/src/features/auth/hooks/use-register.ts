import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authKeys } from '@/lib/query-keys';
import { signup } from '../api/auth.api';

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
    },
  });
}

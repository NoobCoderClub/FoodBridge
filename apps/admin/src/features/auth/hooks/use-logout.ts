import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authKeys } from '@/lib/query-keys';
import { clearBearerToken } from '@/lib/auth';
import { logout } from '../api/auth.api';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearBearerToken();
      queryClient.setQueryData(authKeys.currentUser, null);
      router.push('/login');
    },
  });
}

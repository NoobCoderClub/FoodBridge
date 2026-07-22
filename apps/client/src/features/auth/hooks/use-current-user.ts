import { useQuery } from '@tanstack/react-query';
import { authKeys } from '@/lib/query-keys';
import { getCurrentUser } from '../api/auth.api';

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: getCurrentUser,
  });
}

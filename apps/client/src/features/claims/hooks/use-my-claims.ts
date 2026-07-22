import { useQuery } from '@tanstack/react-query';
import { claimKeys } from '@/lib/query-keys';
import { getMyClaims } from '../api/claims.api';

export function useMyClaims() {
  return useQuery({
    queryKey: claimKeys.mine,
    queryFn: getMyClaims,
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { claimKeys, listingKeys } from '@/lib/query-keys';
import { completeClaim } from '../api/claims.api';

export function useCompleteClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeClaim,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listingKeys.all });
      void queryClient.invalidateQueries({ queryKey: claimKeys.mine });
    },
  });
}

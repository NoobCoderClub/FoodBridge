import { useMutation, useQueryClient } from '@tanstack/react-query';
import { claimKeys, listingKeys } from '@/lib/query-keys';
import { claimListing } from '../api/claims.api';

export function useClaimListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: claimListing,
    onSuccess: (_data, listingId) => {
      void queryClient.invalidateQueries({
        queryKey: listingKeys.detail(listingId),
      });
      void queryClient.invalidateQueries({ queryKey: listingKeys.all });
      void queryClient.invalidateQueries({ queryKey: claimKeys.mine });
    },
  });
}

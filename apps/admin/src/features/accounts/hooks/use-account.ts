import { useQuery } from '@tanstack/react-query';
import { accountKeys } from '@/lib/query-keys';
import { listAccounts } from '../api/accounts.api';

export function useAccount(id: string) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: async () => {
      const accounts = await listAccounts();
      return accounts.find((account) => account.id === id) ?? null;
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { statsKeys } from '@/lib/query-keys';
import { getStatsOverview } from '../api/stats.api';

export function useStatsOverview() {
  return useQuery({
    queryKey: statsKeys.overview,
    queryFn: getStatsOverview,
  });
}

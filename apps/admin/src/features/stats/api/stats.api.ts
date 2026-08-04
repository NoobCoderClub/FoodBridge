import { apiFetch } from '@/lib/api-client';
import type { StatsOverview } from '../types';

export function getStatsOverview() {
  return apiFetch<StatsOverview>('/admin/stats/overview');
}

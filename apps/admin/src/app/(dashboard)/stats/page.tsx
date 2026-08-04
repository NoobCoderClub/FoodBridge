'use client';

import { useStatsOverview } from '@/features/stats/hooks/use-stats-overview';
import { StatsCards } from '@/features/stats/components/stats-cards';
import { TopDonorsTable } from '@/features/stats/components/top-donors-table';
import { MonthlyTrendTable } from '@/features/stats/components/monthly-trend-table';
import { WasteHotspotsTable } from '@/features/stats/components/waste-hotspots-table';

export default function StatsPage() {
  const { data, isLoading, error } = useStatsOverview();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Stats overview</h1>
      <StatsCards
        totalKgRescued={data.total_kg_rescued}
        totalServingsRescued={data.total_servings_rescued}
        totalCompletedClaims={data.total_completed_claims}
      />
      <div>
        <h2 className="mb-2 text-lg font-medium">Top donors</h2>
        <TopDonorsTable donors={data.top_donors} />
      </div>
      <div>
        <h2 className="mb-2 text-lg font-medium">Monthly trend</h2>
        <MonthlyTrendTable trend={data.monthly_trend} />
      </div>
      <div>
        <h2 className="mb-2 text-lg font-medium">Waste hotspots</h2>
        <WasteHotspotsTable hotspots={data.waste_hotspots} />
      </div>
    </div>
  );
}

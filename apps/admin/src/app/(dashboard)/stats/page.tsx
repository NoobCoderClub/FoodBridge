'use client';

import { PageHeader } from '@repo/ui/page-header';
import { ErrorState } from '@repo/ui/error-state';
import { Skeleton } from '@repo/ui/skeleton';
import { useStatsOverview } from '@/features/stats/hooks/use-stats-overview';
import { StatsCards } from '@/features/stats/components/stats-cards';
import { MonthlyTrendChart } from '@/features/stats/components/monthly-trend-chart';
import { TopDonorsChart } from '@/features/stats/components/top-donors-chart';
import { WasteHotspots } from '@/features/stats/components/waste-hotspots';

export default function StatsPage() {
  const { data, isLoading, error, refetch } = useStatsOverview();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn’t load platform stats"
        description={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform impact"
        description="How much surplus food FoodBridge has moved, who is contributing, and where it is still going to waste."
      />

      <StatsCards
        totalKgRescued={data.total_kg_rescued}
        totalServingsRescued={data.total_servings_rescued}
        totalCompletedClaims={data.total_completed_claims}
      />

      <MonthlyTrendChart trend={data.monthly_trend} />

      <div className="grid gap-4 lg:grid-cols-2">
        <TopDonorsChart donors={data.top_donors} />
        <WasteHotspots hotspots={data.waste_hotspots} />
      </div>
    </div>
  );
}

import { CheckCircle2, Scale, UtensilsCrossed } from 'lucide-react';
import { StatCard } from '@repo/ui/stat-card';
import { formatNumber } from '@repo/ui/lib/format';

export function StatsCards({
  totalKgRescued,
  totalServingsRescued,
  totalCompletedClaims,
}: {
  totalKgRescued: number;
  totalServingsRescued: number;
  totalCompletedClaims: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Food rescued"
        value={formatNumber(totalKgRescued)}
        unit="kg"
        icon={<Scale aria-hidden="true" />}
        hint="Total weight collected instead of wasted"
      />
      <StatCard
        label="Servings rescued"
        value={formatNumber(totalServingsRescued)}
        unit="servings"
        icon={<UtensilsCrossed aria-hidden="true" />}
        hint="Meals redistributed to takers"
      />
      <StatCard
        label="Completed pickups"
        value={formatNumber(totalCompletedClaims)}
        icon={<CheckCircle2 aria-hidden="true" />}
        hint="Claims that ended in a successful handover"
      />
    </div>
  );
}

'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Trophy } from 'lucide-react';
import { Card } from '@repo/ui/card';
import { EmptyState } from '@repo/ui/empty-state';
import { formatNumber } from '@repo/ui/lib/format';
import type { TopDonor } from '../types';

function DonorTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: TopDonor }[];
}) {
  const donor = payload?.[0]?.payload;
  if (!active || !donor) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-lift">
      <p className="font-medium">{donor.name}</p>
      <p className="tabular mt-0.5 text-muted-foreground">
        {formatNumber(donor.completed_count)} pickups · {formatNumber(donor.total_kg)} kg
      </p>
    </div>
  );
}

/**
 * Horizontal bars: donor names are long, and magnitude comparison reads better
 * along a shared baseline than in the table this replaces.
 */
export function TopDonorsChart({ donors }: { donors: TopDonor[] }) {
  const data = donors.slice(0, 8);

  return (
    <Card className="gap-5 p-5">
      <div className="flex gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Trophy className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Top donors</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Ranked by completed pickups.</p>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={<Trophy aria-hidden="true" />}
          title="No completed donations yet"
          description="Donors appear here once their first pickup completes."
          className="py-10"
        />
      ) : (
        <div style={{ height: Math.max(180, data.length * 40) }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
              barCategoryGap={8}
            >
              <CartesianGrid stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={128}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--foreground)', fontSize: 12 }}
              />
              <Tooltip cursor={{ fill: 'var(--muted)' }} content={<DonorTooltip />} />
              <Bar dataKey="completed_count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                {data.map((donor) => (
                  <Cell key={donor.poster_id} fill="var(--chart-1)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

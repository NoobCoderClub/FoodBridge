'use client';

import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@repo/ui/card';
import { EmptyState } from '@repo/ui/empty-state';
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { TrendingUp } from 'lucide-react';
import { formatMonth, formatNumber } from '@repo/ui/lib/format';
import type { MonthlyTrendPoint } from '../types';

type Measure = 'total_kg' | 'total_servings' | 'completed_count';

const MEASURES: { value: Measure; label: string; unit: string }[] = [
  { value: 'total_kg', label: 'Kilograms', unit: 'kg' },
  { value: 'total_servings', label: 'Servings', unit: 'servings' },
  { value: 'completed_count', label: 'Pickups', unit: 'pickups' },
];

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-lift">
      <p className="font-medium">{label ? formatMonth(label) : ''}</p>
      <p className="tabular mt-0.5 text-muted-foreground">
        {formatNumber(payload[0]?.value ?? 0)} {unit}
      </p>
    </div>
  );
}

/**
 * One measure at a time — never two y-scales on one chart. The measure switcher
 * replaces what would otherwise be a dual-axis chart.
 */
export function MonthlyTrendChart({ trend }: { trend: MonthlyTrendPoint[] }) {
  const [measure, setMeasure] = useState<Measure>('total_kg');
  const active = MEASURES.find((m) => m.value === measure) ?? MEASURES[0]!;

  return (
    <Card className="gap-5 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Monthly trend</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {active.label} rescued per month.
            </p>
          </div>
        </div>
        <Tabs value={measure} onValueChange={(value) => setMeasure(value as Measure)}>
          <TabsList>
            {MEASURES.map((m) => (
              <TabsTrigger key={m.value} value={m.value}>
                {m.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {trend.length === 0 ? (
        <EmptyState
          icon={<TrendingUp aria-hidden="true" />}
          title="No completed donations yet"
          description="Once pickups start completing, the monthly trend appears here."
          className="py-10"
        />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                minTickGap={16}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: 'var(--border)' }}
                content={<ChartTooltip unit={active.unit} />}
              />
              <Area
                type="monotone"
                dataKey={measure}
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#trendFill)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

import { MapPinned } from 'lucide-react';
import { Card } from '@repo/ui/card';
import { EmptyState } from '@repo/ui/empty-state';
import { formatNumber } from '@repo/ui/lib/format';
import type { WasteHotspot } from '../types';

/**
 * A ranked list with inline magnitude bars — for ten rows of one measure this
 * reads faster than a chart and keeps every value directly labelled.
 */
export function WasteHotspots({ hotspots }: { hotspots: WasteHotspot[] }) {
  const max = Math.max(1, ...hotspots.map((hotspot) => hotspot.expired_count));

  return (
    <Card className="gap-5 p-5">
      <div className="flex gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MapPinned className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Waste hotspots</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Areas where the most listings expired uncollected.
          </p>
        </div>
      </div>

      {hotspots.length === 0 ? (
        <EmptyState
          icon={<MapPinned aria-hidden="true" />}
          title="No expired listings yet"
          description="Nothing has gone to waste so far — areas show up here when listings expire uncollected."
          className="py-10"
        />
      ) : (
        <ol className="space-y-3">
          {hotspots.map((hotspot, index) => (
            <li key={`${hotspot.address_approx}-${index}`} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-medium">
                  {hotspot.address_approx}
                </span>
                <span className="tabular shrink-0 text-sm text-muted-foreground">
                  {formatNumber(hotspot.expired_count)} expired
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-4"
                  style={{ width: `${Math.max(3, (hotspot.expired_count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

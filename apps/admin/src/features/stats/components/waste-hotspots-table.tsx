import type { WasteHotspot } from '../types';

export function WasteHotspotsTable({ hotspots }: { hotspots: WasteHotspot[] }) {
  if (hotspots.length === 0) return <p>No expired listings yet.</p>;

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-300 font-medium">
          <th className="px-4 py-2">Area</th>
          <th className="px-4 py-2">Expired listings</th>
        </tr>
      </thead>
      <tbody>
        {hotspots.map((hotspot) => (
          <tr key={hotspot.address_approx} className="border-b border-gray-200">
            <td className="px-4 py-2">{hotspot.address_approx}</td>
            <td className="px-4 py-2">{hotspot.expired_count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

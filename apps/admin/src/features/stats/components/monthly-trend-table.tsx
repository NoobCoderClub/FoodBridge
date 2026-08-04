import type { MonthlyTrendPoint } from '../types';

export function MonthlyTrendTable({ trend }: { trend: MonthlyTrendPoint[] }) {
  if (trend.length === 0) return <p>No completed donations yet.</p>;

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-300 font-medium">
          <th className="px-4 py-2">Month</th>
          <th className="px-4 py-2">Completed</th>
          <th className="px-4 py-2">Total kg</th>
          <th className="px-4 py-2">Total servings</th>
        </tr>
      </thead>
      <tbody>
        {trend.map((point) => (
          <tr key={point.month} className="border-b border-gray-200">
            <td className="px-4 py-2">{point.month}</td>
            <td className="px-4 py-2">{point.completed_count}</td>
            <td className="px-4 py-2">{point.total_kg}</td>
            <td className="px-4 py-2">{point.total_servings}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

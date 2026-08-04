import type { TopDonor } from '../types';

export function TopDonorsTable({ donors }: { donors: TopDonor[] }) {
  if (donors.length === 0) return <p>No completed donations yet.</p>;

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-300 font-medium">
          <th className="px-4 py-2">Donor</th>
          <th className="px-4 py-2">Completed</th>
          <th className="px-4 py-2">Total kg</th>
          <th className="px-4 py-2">Total servings</th>
        </tr>
      </thead>
      <tbody>
        {donors.map((donor) => (
          <tr key={donor.poster_id} className="border-b border-gray-200">
            <td className="px-4 py-2">{donor.name}</td>
            <td className="px-4 py-2">{donor.completed_count}</td>
            <td className="px-4 py-2">{donor.total_kg}</td>
            <td className="px-4 py-2">{donor.total_servings}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

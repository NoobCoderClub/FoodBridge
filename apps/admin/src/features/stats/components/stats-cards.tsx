export function StatsCards({
  totalKgRescued,
  totalServingsRescued,
  totalCompletedClaims,
}: {
  totalKgRescued: number;
  totalServingsRescued: number;
  totalCompletedClaims: number;
}) {
  const cards = [
    { label: 'Total kg rescued', value: totalKgRescued },
    { label: 'Total servings rescued', value: totalServingsRescued },
    { label: 'Completed pickups', value: totalCompletedClaims },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-md border border-gray-300 p-4">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="text-2xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

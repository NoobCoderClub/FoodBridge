export interface TopDonor {
  poster_id: string;
  name: string;
  completed_count: number;
  total_kg: number;
  total_servings: number;
}

export interface MonthlyTrendPoint {
  month: string;
  completed_count: number;
  total_kg: number;
  total_servings: number;
}

export interface WasteHotspot {
  address_approx: string;
  expired_count: number;
}

export interface StatsOverview {
  total_kg_rescued: number;
  total_servings_rescued: number;
  total_completed_claims: number;
  top_donors: TopDonor[];
  monthly_trend: MonthlyTrendPoint[];
  waste_hotspots: WasteHotspot[];
}

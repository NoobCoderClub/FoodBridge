/**
 * The API returns raw Postgres rows: snake_case keys and `numeric` columns
 * serialised as strings. Never call .toFixed() on those directly.
 */
export function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** "40 servings", "2.5 kg" — trims trailing zeros so 40.00 reads as 40. */
export function formatQuantity(quantity: string | number | null | undefined, unit: string): string {
  const n = toNumber(quantity);
  const rounded = Math.round(n * 100) / 100;
  return `${rounded} ${unit}`;
}

export function formatNumber(value: string | number | null | undefined): string {
  return toNumber(value).toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDistance(km: number | null | undefined): string | null {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/** "2026-03" -> "Mar 2026" for the admin monthly trend axis. */
export function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  if (!year || !m) return month;
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

/** Turns a phone number into a dialable href; takers use this mid-pickup. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/**
 * Opens the platform's maps app at the pickup point.
 *
 * Coordinates win when we have them: the address is free text a poster typed,
 * so searching for it lands on a street, the wrong house, or nothing at all,
 * whereas the poster's GPS fix is the actual door. The address form stays as
 * the fallback for callers that hold no coordinates.
 */
export function mapsHref(
  address: string,
  coords?: { latitude?: number | null; longitude?: number | null },
): string {
  const { latitude, longitude } = coords ?? {};
  const query = latitude != null && longitude != null ? `${latitude},${longitude}` : address;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

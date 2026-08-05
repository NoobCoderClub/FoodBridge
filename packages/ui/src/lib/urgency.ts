/**
 * Time-to-expiry is the core tension of FoodBridge: a listing nobody collects
 * becomes waste. These helpers turn a timestamp into a visual urgency level so
 * the pressure is legible at a glance rather than buried in a date string.
 */
export type Urgency = 'safe' | 'soon' | 'critical' | 'past';

const SOON_MS = 2 * 60 * 60 * 1000; // 2 hours
const CRITICAL_MS = 30 * 60 * 1000; // 30 minutes

export function getUrgency(expiresAt: string | Date, now: number = Date.now()): Urgency {
  const remaining = new Date(expiresAt).getTime() - now;
  if (remaining <= 0) return 'past';
  if (remaining <= CRITICAL_MS) return 'critical';
  if (remaining <= SOON_MS) return 'soon';
  return 'safe';
}

export function msRemaining(expiresAt: string | Date, now: number = Date.now()): number {
  return Math.max(0, new Date(expiresAt).getTime() - now);
}

/** "2h 14m", "18m", "— " once elapsed. Short enough for a badge. */
export function formatRemaining(expiresAt: string | Date, now: number = Date.now()): string {
  const ms = msRemaining(expiresAt, now);
  if (ms <= 0) return 'Expired';

  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (totalMinutes > 0) return `${totalMinutes}m`;
  return `${Math.ceil(ms / 1000)}s`;
}

/** mm:ss for the live pickup countdown. */
export function formatCountdown(deadline: string | Date, now: number = Date.now()): string {
  const ms = msRemaining(deadline, now);
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Fraction of the listing's shelf life already consumed, for the expiry bar.
 * Falls back to a time-to-expiry ratio when preparedAt is unknown.
 */
export function elapsedFraction(
  expiresAt: string | Date,
  preparedAt?: string | Date | null,
  now: number = Date.now(),
): number {
  const end = new Date(expiresAt).getTime();
  const start = preparedAt ? new Date(preparedAt).getTime() : end - SOON_MS * 2;
  if (!Number.isFinite(start) || end <= start) return 1;
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

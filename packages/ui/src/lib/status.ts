/**
 * Maps every status the domain produces onto one of four visual tones.
 *
 * Listing: available | claimed | completed | expired
 * Claim:   active | completed | no_show
 * Account: pending | approved | rejected | suspended
 */
export type StatusTone = 'success' | 'pending' | 'danger' | 'neutral';

const TONE_BY_STATUS: Record<string, StatusTone> = {
  // listings
  available: 'success',
  claimed: 'pending',
  completed: 'success',
  expired: 'danger',
  // claims
  active: 'pending',
  no_show: 'danger',
  // accounts
  approved: 'success',
  pending: 'pending',
  rejected: 'danger',
  suspended: 'neutral',
};

const LABEL_BY_STATUS: Record<string, string> = {
  available: 'Available',
  claimed: 'Claimed',
  completed: 'Completed',
  expired: 'Expired',
  active: 'Active',
  no_show: 'No show',
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
  suspended: 'Suspended',
};

export function statusTone(status: string): StatusTone {
  return TONE_BY_STATUS[status] ?? 'neutral';
}

export function statusLabel(status: string): string {
  return LABEL_BY_STATUS[status] ?? status.replace(/_/g, ' ');
}

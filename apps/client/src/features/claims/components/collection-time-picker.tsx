'use client';

import { useState, useMemo, useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Input } from '@repo/ui/input';

// ─── Format Helpers ──────────────────────────────────────────────────────────

/**
 * Formats a Date as "Month Day, HH:mm" (24-hour time).
 * Example: "Sep 9, 16:30"
 */
export function formatDateTime24h(date: Date): string {
  const month = date.toLocaleDateString(undefined, { month: 'short' });
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month} ${day}, ${hours}:${minutes}`;
}

/**
 * Formats a Date into "YYYY-MM-DDTHH:mm" for the datetime-local input.
 */
function toLocalDateTimeInputValue(date: Date): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

/**
 * Calculates a sensible default collection time:
 * - If more than 1 hour remains before expiry, defaults to 1 hour from now.
 * - If less than 1 hour remains, automatically adjusts to a safe time before expiry.
 */
function calculateDefaultCollectionTime(now: Date, listingExpiryTime: Date): Date {
  const msUntilExpiry = listingExpiryTime.getTime() - now.getTime();
  const oneHourMs = 60 * 60 * 1000;

  if (msUntilExpiry > oneHourMs) {
    return new Date(now.getTime() + oneHourMs);
  }

  // Less than 1 hour remaining: pick roughly 75% towards expiry (at least 5 min from now)
  const adjustedLeadMs = Math.max(5 * 60 * 1000, Math.floor(msUntilExpiry * 0.75));
  return new Date(now.getTime() + adjustedLeadMs);
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Single source of truth for collection-time validation.
 *
 * Answers: "Is the selected collection time before the listing expiry?"
 * Also ensures the selected time is in the future.
 */
export function isCollectionTimeValid(
  selectedCollectionTime: Date | null,
  listingExpiryTime: Date,
): boolean {
  if (!selectedCollectionTime) return false;
  const now = new Date();
  return selectedCollectionTime > now && selectedCollectionTime < listingExpiryTime;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface CollectionTimePickerProps {
  /** Listing expiry ISO timestamp from the API */
  listingExpiryTime: string;
  /** Passes selected Date and validity boolean to parent */
  onCollectionTimeChange: (
    selectedCollectionTime: Date | null,
    isCollectionTimeValid: boolean,
  ) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CollectionTimePicker({
  listingExpiryTime,
  onCollectionTimeChange,
}: CollectionTimePickerProps) {
  const maxCollectionTime = useMemo(() => new Date(listingExpiryTime), [listingExpiryTime]);

  const referenceNow = useMemo(() => new Date(), []);
  const isListingExpired = maxCollectionTime <= referenceNow;

  // Default collection time (auto-adjusted if < 1h remaining)
  const initialDefaultTime = useMemo(
    () =>
      isListingExpired
        ? referenceNow
        : calculateDefaultCollectionTime(referenceNow, maxCollectionTime),
    [isListingExpired, referenceNow, maxCollectionTime],
  );

  // Input value state ("YYYY-MM-DDTHH:mm")
  const [collectionTimeInput, setCollectionTimeInput] = useState<string>(() =>
    toLocalDateTimeInputValue(initialDefaultTime),
  );

  // Selected Date object
  const selectedCollectionTime: Date | null = useMemo(() => {
    if (isListingExpired || !collectionTimeInput) return null;
    const parsed = new Date(collectionTimeInput);
    return isNaN(parsed.getTime()) ? null : parsed;
  }, [isListingExpired, collectionTimeInput]);

  // Validation
  const isValid = isCollectionTimeValid(selectedCollectionTime, maxCollectionTime);

  // Notify parent
  useEffect(() => {
    onCollectionTimeChange(selectedCollectionTime, isValid);
  }, [selectedCollectionTime, isValid, onCollectionTimeChange]);

  // ── Warning: Listing is already expired ─────────────────────────────────────
  if (isListingExpired) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 space-y-1 text-destructive">
        <div className="flex items-center gap-2 font-medium text-sm">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>Listing Expired</span>
        </div>
        <p className="text-xs text-destructive/90">
          This listing expired at {formatDateTime24h(maxCollectionTime)} and can no longer be
          claimed.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium">Collection date & time</span>
        </div>
        <span className="text-xs text-muted-foreground">24h format</span>
      </div>

      {/* shadcn Input Widget */}
      <div className="space-y-1.5">
        <Input
          type="datetime-local"
          value={collectionTimeInput}
          onChange={(e) => setCollectionTimeInput(e.target.value)}
          min={toLocalDateTimeInputValue(referenceNow)}
          max={toLocalDateTimeInputValue(maxCollectionTime)}
          aria-invalid={!isValid || undefined}
        />

        {/* Live Validation Feedback */}
        {selectedCollectionTime && !isValid && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-destructive pt-1">
            <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
            {selectedCollectionTime <= new Date() ? (
              <span>Warning: Collection time cannot be in the past.</span>
            ) : (
              <span>
                Warning: Must be before {formatDateTime24h(maxCollectionTime)} (listing expiry).
              </span>
            )}
          </div>
        )}

        {selectedCollectionTime && isValid && (
          <p className="text-xs font-medium text-primary pt-1">
            ✓ Collection scheduled for: {formatDateTime24h(selectedCollectionTime)}
          </p>
        )}
      </div>

      {/* Expiry limit notice */}
      <p className="text-xs text-muted-foreground">
        Must be collected before{' '}
        <span className="font-medium text-foreground">{formatDateTime24h(maxCollectionTime)}</span>{' '}
        when this listing expires.
      </p>
    </div>
  );
}

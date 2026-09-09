'use client';

import { useState, useMemo, useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@repo/ui/select';

// ─── Constants ───────────────────────────────────────────────────────────────

const SLOT_INTERVAL_MINUTES = 15;
const DEFAULT_WINDOW_MINUTES = 60;
const CUSTOM_TIME_VALUE = '__custom__';

// ─── 24-Hour + Date Helpers ──────────────────────────────────────────────────

/**
 * Formats a Date as "Month Day, HH:mm" (24-hour time).
 * Example: "Sep 8, 16:30"
 */
export function formatDateTime24h(date: Date): string {
  const month = date.toLocaleDateString(undefined, { month: 'short' });
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month} ${day}, ${hours}:${minutes}`;
}

/**
 * Formats a slot label with relative day and 24-hour time.
 * Example: "Today, 16:30", "Tomorrow, 09:15", "Sep 10, 14:00"
 */
export function formatSlotLabel(date: Date, referenceNow: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const time24h = `${hours}:${minutes}`;

  const isToday =
    date.getFullYear() === referenceNow.getFullYear() &&
    date.getMonth() === referenceNow.getMonth() &&
    date.getDate() === referenceNow.getDate();

  if (isToday) return `Today, ${time24h}`;

  const tomorrow = new Date(referenceNow);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();

  if (isTomorrow) return `Tomorrow, ${time24h}`;

  const month = date.toLocaleDateString(undefined, { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}, ${time24h}`;
}

/**
 * Formats a Date into "YYYY-MM-DDTHH:mm" for <input type="datetime-local">.
 */
function toLocalDateTimeInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Parses a "YYYY-MM-DDTHH:mm" string into a Date object.
 */
function parseLocalDateTimeInputValue(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function roundUpToNextInterval(date: Date): Date {
  const intervalMs = SLOT_INTERVAL_MINUTES * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / intervalMs) * intervalMs);
}

/**
 * Returns available collection times strictly between now and listingExpiryTime.
 * If less than 1 hour remaining, automatically includes only valid slots before expiry.
 */
function getAvailableCollectionTimes(listingExpiryTime: Date): Date[] {
  const now = new Date();
  const firstSlot = roundUpToNextInterval(now);
  const availableTimes: Date[] = [];

  let cursor = firstSlot;
  while (cursor < listingExpiryTime) {
    availableTimes.push(new Date(cursor));
    cursor = new Date(cursor.getTime() + SLOT_INTERVAL_MINUTES * 60 * 1000);
  }

  return availableTimes;
}

/**
 * Determines default collection time:
 * - Ideally ~1 hour from now.
 * - If < 1 hour remains before expiry, automatically chooses the last available slot before expiry.
 */
function getDefaultCollectionTime(availableTimes: Date[], listingExpiryTime: Date): Date | null {
  if (availableTimes.length === 0) return null;

  const targetTime = new Date(Date.now() + DEFAULT_WINDOW_MINUTES * 60 * 1000);

  if (targetTime < listingExpiryTime) {
    for (const time of availableTimes) {
      if (time >= targetTime) return time;
    }
  }

  // Less than 1 hour remaining: pick the latest available slot
  return availableTimes[availableTimes.length - 1]!;
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Single validation function answering:
 * "Is the selected collection time before the listing expiry?"
 * Also guarantees that the collection time is in the future.
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

  // Available collection times strictly before expiry
  const availableCollectionTimes = useMemo(
    () => (isListingExpired ? [] : getAvailableCollectionTimes(maxCollectionTime)),
    [isListingExpired, maxCollectionTime],
  );

  // Default collection time (~1h from now, or auto-adjusted if <1h remains)
  const defaultCollectionTime = useMemo(
    () => getDefaultCollectionTime(availableCollectionTimes, maxCollectionTime),
    [availableCollectionTimes, maxCollectionTime],
  );

  // Dropdown state
  const [selectedDropdownValue, setSelectedDropdownValue] = useState<string>(() =>
    defaultCollectionTime
      ? String(availableCollectionTimes.indexOf(defaultCollectionTime))
      : CUSTOM_TIME_VALUE,
  );

  // Custom datetime input state (in YYYY-MM-DDTHH:mm 24h format)
  const [customDateTimeInput, setCustomDateTimeInput] = useState<string>(() =>
    defaultCollectionTime
      ? toLocalDateTimeInputValue(defaultCollectionTime)
      : toLocalDateTimeInputValue(new Date()),
  );

  const isCustom = selectedDropdownValue === CUSTOM_TIME_VALUE;

  // Selected collection time Date
  const selectedCollectionTime: Date | null = useMemo(() => {
    if (isListingExpired) return null;
    if (isCustom) {
      return parseLocalDateTimeInputValue(customDateTimeInput);
    }
    const slotIndex = Number(selectedDropdownValue);
    return availableCollectionTimes[slotIndex] ?? null;
  }, [
    isListingExpired,
    isCustom,
    customDateTimeInput,
    selectedDropdownValue,
    availableCollectionTimes,
  ]);

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

  // ── Notice: Expiring in less than 15 minutes ─────────────────────────────────
  if (availableCollectionTimes.length === 0 && !isCustom) {
    return (
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3.5 space-y-2 text-amber-700 dark:text-amber-400">
        <div className="flex items-center gap-2 font-medium text-sm">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>Expiring very soon</span>
        </div>
        <p className="text-xs">
          This listing expires at {formatDateTime24h(maxCollectionTime)} (less than 15 minutes
          remaining).
        </p>
        <button
          type="button"
          onClick={() => setSelectedDropdownValue(CUSTOM_TIME_VALUE)}
          className="text-xs font-semibold underline underline-offset-2 hover:opacity-80"
        >
          Set exact collection time before expiry
        </button>
      </div>
    );
  }

  // Trigger label with date + 24-hour time
  const triggerLabel = isCustom
    ? 'Custom date & time…'
    : (() => {
        const slot = availableCollectionTimes[Number(selectedDropdownValue)];
        return slot ? formatSlotLabel(slot, referenceNow) : 'Select collection time';
      })();

  return (
    <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium">Collection time</span>
        </div>
        <span className="text-xs text-muted-foreground">24h format</span>
      </div>

      {/* Main Select Dropdown */}
      <Select
        value={selectedDropdownValue}
        onValueChange={(val) => setSelectedDropdownValue(String(val))}
      >
        <SelectTrigger>
          <span>{triggerLabel}</span>
        </SelectTrigger>
        <SelectContent>
          {availableCollectionTimes.map((time, index) => (
            <SelectItem key={index} value={String(index)}>
              {formatSlotLabel(time, referenceNow)}
            </SelectItem>
          ))}
          <div className="my-1 h-px bg-border" role="separator" />
          <SelectItem value={CUSTOM_TIME_VALUE}>Custom date & time…</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom Date & Time Picker */}
      {isCustom && (
        <div className="space-y-2 pt-1 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground">
            Choose custom date & time (24h):
          </p>
          <Input
            type="datetime-local"
            value={customDateTimeInput}
            onChange={(e) => setCustomDateTimeInput(e.target.value)}
            min={toLocalDateTimeInputValue(referenceNow)}
            max={toLocalDateTimeInputValue(maxCollectionTime)}
            aria-invalid={!isValid || undefined}
          />

          {/* Validation Feedback */}
          {selectedCollectionTime && !isValid && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-destructive pt-1">
              <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
              {selectedCollectionTime <= referenceNow ? (
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
      )}

      {/* Expiry limit notice with full date and 24-hour time */}
      <p className="text-xs text-muted-foreground">
        Must be collected before{' '}
        <span className="font-medium text-foreground">{formatDateTime24h(maxCollectionTime)}</span>{' '}
        when this listing expires.
      </p>
    </div>
  );
}

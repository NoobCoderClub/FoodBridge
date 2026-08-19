import { applyProcedures } from './lib/apply-procedures.js';

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Re-applies `fn_get_listing_by_id` with `latitude` and `longitude` behind the
 * same `is_poster or has_active_claim` gate as `address_exact`. The previous
 * body returned raw coordinates to every authenticated requester while
 * carefully withholding the exact address — but coordinates are a more precise
 * statement of that same address, so the gate never actually held. It went
 * unnoticed only because no client read the fields; it matters now that the
 * listing form captures a high-accuracy GPS fix rather than a coarse one.
 *
 * Must sort after 1787420000001_apply-listing-image-procedures.js. Only the
 * `case` expressions change here, so CREATE OR REPLACE suffices — but
 * `applyProcedures()` reapplies whatever is on disk, and on disk this procedure
 * already returns the gallery's `image_keys`. Run before that migration and the
 * replace would be widening the return type instead, which Postgres rejects
 * outright. Ordering is what keeps this a body-only change.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  applyProcedures(pgm, 'listings', ['fn_get_listing_by_id']);
};

/**
 * Deliberately empty — replaces a function body, doesn't create a new object;
 * see 1785840647000_fix-recompute-reputation-score.js for the same rationale.
 * Rolling back to a version that leaks coordinates would not be a fix anyway.
 *
 * @returns {Promise<void> | void}
 */
export const down = () => {};

import { applyProcedures } from './lib/apply-procedures.js';

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Re-applies `fn_get_listing_by_id`, edited to add `active_claim_id`
 * (`CREATE OR REPLACE`, so a no-op on a fresh database that already built it
 * from the current source).
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  applyProcedures(pgm, 'listings', ['fn_get_listing_by_id']);
};

/**
 * Deliberately empty — this migration replaces a function body, not creates
 * a new object; see 1785839210000_simplify-procedures.js for the same
 * rationale.
 *
 * @returns {Promise<void> | void}
 */
export const down = () => {};

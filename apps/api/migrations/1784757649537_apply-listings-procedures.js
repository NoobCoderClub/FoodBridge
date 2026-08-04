import { applyProcedures, dropProcedures } from './lib/apply-procedures.js';

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Applies the M2 listings procedures. Must stay ordered after
 * `better-auth-tables`, since `fn_get_listing_by_id` joins `"user"`.
 *
 * `shared` goes first: `fn_browse_listings` calls `fn_distance_km`, and a
 * `language sql` body cannot be created before the function it references
 * exists. Ordering by domain rather than by filename matters here —
 * `fn_browse_listings.sql` sorts alphabetically ahead of its own dependency.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  applyProcedures(pgm, 'shared');
  applyProcedures(pgm, 'listings');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  dropProcedures(pgm, 'listings');
  dropProcedures(pgm, 'shared');
};

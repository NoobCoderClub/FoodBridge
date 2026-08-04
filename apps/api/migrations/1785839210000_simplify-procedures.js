import { applyProcedures } from './lib/apply-procedures.js';

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Re-applies the simplified procedure bodies onto databases that already ran the
 * earlier milestone migrations. Every file uses `CREATE OR REPLACE`, so this is
 * a no-op on a fresh database that just built them from the same sources.
 *
 * `shared` must precede `listings` — `fn_browse_listings` now calls
 * `fn_distance_km`.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  applyProcedures(pgm, 'shared');
  applyProcedures(pgm, 'accounts');
  applyProcedures(pgm, 'listings');
  applyProcedures(pgm, 'claims');
};

/**
 * Deliberately empty. This migration replaces function *bodies* rather than
 * creating objects, and the previous bodies no longer exist in the tree to
 * restore — dropping the functions here would instead undo what the milestone
 * migrations created. Roll back those migrations to remove the routines.
 *
 * @returns {Promise<void> | void}
 */
export const down = () => {};

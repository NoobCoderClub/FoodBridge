import { applyProcedures } from './lib/apply-procedures.js';

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Re-applies `fn_get_listing_by_id`, edited to add a 14th output column
 * (`active_claim_id`). `CREATE OR REPLACE FUNCTION` cannot change a
 * function's OUT-parameter list — Postgres rejects it with `42P13 cannot
 * change return type of existing function` (confirmed against the real dev
 * database, which already had the 13-column version; every prior test of
 * this migration ran against a throwaway database with no existing version
 * to conflict with, which is why this wasn't caught sooner). The explicit
 * drop first is required whenever a procedure's return columns change,
 * unlike the pure body-only edits elsewhere in this repo that
 * `CREATE OR REPLACE` handles fine.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.sql('drop function if exists fn_get_listing_by_id(uuid, uuid);');
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

import { applyProcedures, dropProcedures } from './lib/apply-procedures.js';

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Adds `sp_recompute_reputation` and wires it into `sp_release_stale_claims`
 * (a no-show now penalizes the taker's reputation, closing a gap where
 * `reputation.no_show_count` was defined but never incremented). Order
 * matters: `reputation` must exist before `claims` is re-applied, since
 * `sp_release_stale_claims` now calls `sp_recompute_reputation`.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  applyProcedures(pgm, 'reputation');
  applyProcedures(pgm, 'claims', ['sp_release_stale_claims']);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  dropProcedures(pgm, 'reputation');
};

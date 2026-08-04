import { applyProcedures, dropProcedures } from './lib/apply-procedures.js';

const PROCEDURES = ['sp_complete_claim'];

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Adds `sp_complete_claim` (M4). Depends on `sp_recompute_reputation`
 * existing, applied by the previous migration.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  applyProcedures(pgm, 'claims', PROCEDURES);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  dropProcedures(pgm, 'claims', PROCEDURES);
};

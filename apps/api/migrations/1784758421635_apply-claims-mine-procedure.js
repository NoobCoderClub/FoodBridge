import { applyProcedures, dropProcedures } from './lib/apply-procedures.js';

const PROCEDURES = ['fn_list_my_claims'];

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Adds `fn_list_my_claims` (M3, "my claims" listing view).
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

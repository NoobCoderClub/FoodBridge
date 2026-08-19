import { applyProcedures } from './lib/apply-procedures.js';

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Reapplies the two procedures that assumed a poster/taker account split:
 *
 * - `fn_browse_listings` takes the viewer's id and hides their own listings.
 * - `sp_claim_listing` refuses a claim on a listing you posted yourself.
 *
 * `create or replace` cannot change a parameter list — it would leave the old
 * 2-arg `fn_browse_listings` in place as an overload, which then makes
 * `dropProcedures()`'s unqualified `DROP FUNCTION` ambiguous. So both
 * directions drop by explicit signature rather than going through the helper.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.sql(
    'DROP FUNCTION IF EXISTS fn_browse_listings(double precision, double precision);',
  );
  applyProcedures(pgm, 'listings', ['fn_browse_listings']);
  applyProcedures(pgm, 'claims', ['sp_claim_listing']);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(
    'DROP FUNCTION IF EXISTS fn_browse_listings(double precision, double precision, uuid);',
  );
  pgm.sql('DROP FUNCTION IF EXISTS sp_claim_listing(uuid, uuid);');
};

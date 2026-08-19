import { applyProcedures } from './lib/apply-procedures.js';

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Reapplies the four listings procedures now that a listing carries a gallery:
 *
 * - `sp_create_listing` takes `p_image_keys` and writes the `listing_images` rows.
 * - `fn_get_listing_by_id` returns the full ordered `image_keys`.
 * - `fn_browse_listings` / `fn_list_my_listings` return just the cover key.
 *
 * Every one of them has to be dropped first, and by explicit signature.
 * `create or replace` refuses to change a return type — which rules out all
 * four — and `sp_create_listing` also gains a parameter, so a replace would
 * leave the old 10-arg version behind as an overload. That in turn makes
 * `dropProcedures()`'s unqualified `DROP FUNCTION` ambiguous for every later
 * migration, so the signature is spelled out here. Same reasoning as
 * `1787165500001_apply-unified-profile-procedures.js`.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.sql(`DROP FUNCTION IF EXISTS sp_create_listing(uuid, text, numeric, text,
    double precision, double precision, text, text, timestamptz, timestamptz);`);
  pgm.sql(
    'DROP FUNCTION IF EXISTS fn_browse_listings(double precision, double precision, uuid);',
  );
  pgm.sql('DROP FUNCTION IF EXISTS fn_list_my_listings(uuid);');
  pgm.sql('DROP FUNCTION IF EXISTS fn_get_listing_by_id(uuid, uuid);');

  applyProcedures(pgm, 'listings', [
    'sp_create_listing',
    'fn_browse_listings',
    'fn_list_my_listings',
    'fn_get_listing_by_id',
  ]);
};

/**
 * Lossy, like the migration above it: `applyProcedures` reads whatever is on
 * disk today, so a down cannot restore the pre-gallery bodies. It drops the new
 * signatures and leaves reapplying to the earlier migrations.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`DROP FUNCTION IF EXISTS sp_create_listing(uuid, text, numeric, text,
    double precision, double precision, text, text, timestamptz, timestamptz, text[]);`);
  pgm.sql(
    'DROP FUNCTION IF EXISTS fn_browse_listings(double precision, double precision, uuid);',
  );
  pgm.sql('DROP FUNCTION IF EXISTS fn_list_my_listings(uuid);');
  pgm.sql('DROP FUNCTION IF EXISTS fn_get_listing_by_id(uuid, uuid);');
};

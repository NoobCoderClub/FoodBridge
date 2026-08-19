-- Photos for a listing, stored as object keys into the S3-compatible bucket
-- (MinIO locally). The bytes never live in Postgres — only the key, which the
-- API turns into a short-lived presigned URL on every read.
--
-- `position` is the gallery order; position 0 is the cover shown on cards. The
-- pair uniqueness is what stops two images claiming the same slot, and the
-- `object_key` uniqueness stops the same object being attached twice.
--
-- Timestamped back here beside `init-domain-tables` even though the feature is
-- much later, because `applyProcedures()` reapplies whatever is on disk *now*:
-- from `1784757649537_apply-listings-procedures.js` onwards, every migration
-- that touches the listings domain builds `fn_browse_listings` &co. against the
-- current bodies, which select from this table. A `language sql` body is parsed
-- at creation time, so on a fresh database those migrations fail outright
-- unless the table already exists — exactly the ordering trap called out in
-- `migrations/lib/apply-procedures.js`. On a database that is already past
-- those migrations this simply runs as the next pending one.

-- Up Migration

create table listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  object_key text not null unique,
  position integer not null,
  created_at timestamptz not null default now(),
  constraint listing_images_listing_position_key unique (listing_id, position)
);

create index listing_images_listing_idx on listing_images (listing_id, position);

-- Down Migration

drop table if exists listing_images;

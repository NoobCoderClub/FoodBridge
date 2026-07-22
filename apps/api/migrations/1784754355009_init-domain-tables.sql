-- Up Migration

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE listings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id      uuid NOT NULL,
  food_type      text NOT NULL,
  quantity       numeric NOT NULL,
  quantity_unit  text NOT NULL CHECK (quantity_unit IN ('kg', 'servings')),
  latitude       double precision NOT NULL,
  longitude      double precision NOT NULL,
  address_approx text NOT NULL,
  address_exact  text NOT NULL,
  prepared_at    timestamptz NOT NULL,
  expires_at     timestamptz NOT NULL,
  status         text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'completed', 'expired')),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE claims (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      uuid NOT NULL REFERENCES listings(id),
  taker_id        uuid NOT NULL,
  claimed_at      timestamptz NOT NULL DEFAULT now(),
  pickup_deadline timestamptz NOT NULL,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'no_show')),
  completed_at    timestamptz
);

CREATE TABLE reputation (
  user_id         uuid PRIMARY KEY,
  completed_count integer NOT NULL DEFAULT 0,
  no_show_count   integer NOT NULL DEFAULT 0,
  score           numeric NOT NULL DEFAULT 0,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX listings_status_expires_at_idx ON listings (status, expires_at);
CREATE INDEX listings_latitude_longitude_idx ON listings (latitude, longitude);
CREATE UNIQUE INDEX claims_listing_id_active_idx ON claims (listing_id) WHERE status = 'active';

-- Down Migration

DROP TABLE IF EXISTS claims;
DROP TABLE IF EXISTS reputation;
DROP TABLE IF EXISTS listings;

-- Collapses the two customer-facing roles into one. A `member` both posts
-- surplus food and claims it, so the poster/taker split no longer describes an
-- account — only a party's position in a single exchange, which
-- `listings.poster_id` / `claims.taker_id` already carry.
--
-- The CHECK was declared inline in the better-auth-tables migration, so
-- Postgres auto-named it `user_role_check`.

-- Up Migration

alter table "user" drop constraint if exists user_role_check;

update "user" set role = 'member', "updatedAt" = now() where role <> 'admin';

alter table "user" alter column role set default 'member';

alter table "user" add constraint user_role_check check ("role" in ('member', 'admin'));

-- Down Migration

-- Lossy: which members used to be posters and which were takers is not
-- recoverable, so everyone lands back on the old default of 'taker'.

alter table "user" drop constraint if exists user_role_check;

update "user" set role = 'taker', "updatedAt" = now() where role <> 'admin';

alter table "user" alter column role set default 'taker';

alter table "user" add constraint user_role_check check ("role" in ('poster', 'taker', 'admin'));

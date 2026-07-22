-- Up Migration

alter table listings add constraint listings_poster_id_fkey foreign key (poster_id) references "user" (id);
alter table claims add constraint claims_taker_id_fkey foreign key (taker_id) references "user" (id);

-- Down Migration

alter table claims drop constraint if exists claims_taker_id_fkey;
alter table listings drop constraint if exists listings_poster_id_fkey;

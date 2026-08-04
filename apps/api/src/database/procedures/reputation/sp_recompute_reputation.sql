-- Adds the given deltas to a user's reputation counters and recomputes
-- `score` in the same statement. Called from other procedures
-- (sp_complete_claim, sp_release_stale_claims), never from the API layer.
--
-- Deliberately a single INSERT ... ON CONFLICT rather than an upsert CTE
-- followed by a second UPDATE: every statement inside one WITH clause runs
-- against the same initial snapshot, so a follow-up UPDATE scanning
-- `reputation` for a row a sibling CTE just inserted would find nothing for
-- a brand-new user (confirmed against a live instance — that exact two-
-- statement shape silently left `score` at its placeholder 0). Computing
-- `score` directly in both the INSERT's VALUES and the ON CONFLICT's SET
-- avoids the problem entirely.
create or replace function sp_recompute_reputation(
  p_user_id uuid,
  p_completed_delta integer default 0,
  p_no_show_delta integer default 0
)
returns void
language sql
as $$
  insert into reputation (user_id, completed_count, no_show_count, score, updated_at)
  values (
    p_user_id,
    greatest(p_completed_delta, 0),
    greatest(p_no_show_delta, 0),
    greatest(p_completed_delta, 0)::numeric
      / greatest(greatest(p_completed_delta, 0) + greatest(p_no_show_delta, 0), 1),
    now()
  )
  on conflict (user_id) do update
  set completed_count = reputation.completed_count + excluded.completed_count,
      no_show_count = reputation.no_show_count + excluded.no_show_count,
      score = (reputation.completed_count + excluded.completed_count)::numeric
        / greatest(
            (reputation.completed_count + excluded.completed_count)
              + (reputation.no_show_count + excluded.no_show_count),
            1
          ),
      updated_at = now();
$$;

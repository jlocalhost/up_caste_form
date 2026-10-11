-- Remember which device last submitted each booth, so a worker can list and edit
-- their own submissions without an account.
alter table public.survey_submissions add column device_id uuid;

create index survey_submissions_device_id_idx
  on public.survey_submissions (device_id, updated_at desc)
  where device_id is not null;

-- New 5-argument overload. The 4-argument version stays so the previously deployed
-- app keeps working until it is redeployed; drop it in a later migration.
create function public.submit_survey(
  p_booth_id     uuid,
  p_total_voters integer,
  p_comment      text,
  p_counts       jsonb,  -- [{ "caste": text, "count": int }]
  p_device_id    uuid
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_submission_id uuid;
begin
  insert into public.survey_submissions (booth_id, total_voters, comment, device_id)
  values (p_booth_id, p_total_voters, nullif(btrim(p_comment), ''), p_device_id)
  on conflict (booth_id) do update
    set total_voters = excluded.total_voters,
        comment      = excluded.comment,
        device_id    = coalesce(excluded.device_id, public.survey_submissions.device_id),
        revision     = public.survey_submissions.revision + 1,
        updated_at   = now()
  returning id into v_submission_id;

  delete from public.survey_caste_counts where submission_id = v_submission_id;

  insert into public.survey_caste_counts (submission_id, caste, count)
  select v_submission_id, btrim(c.caste), c.count
  from jsonb_to_recordset(p_counts) as c(caste text, count integer);

  return v_submission_id;
end;
$$;

revoke execute on function public.submit_survey(uuid, integer, text, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.submit_survey(uuid, integer, text, jsonb, uuid) to service_role;

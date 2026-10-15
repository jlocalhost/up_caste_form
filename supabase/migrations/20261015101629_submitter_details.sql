-- Who filled the survey: name and Indian mobile number (no OTP, format check only).
-- Like the counts, these describe the latest submit of the booth.
alter table public.survey_submissions
  add column submitter_name text
    check (submitter_name is null or char_length(btrim(submitter_name)) between 2 and 60),
  add column submitter_phone text
    check (submitter_phone is null or submitter_phone ~ '^[6-9][0-9]{9}$');

create function public.submit_survey(
  p_booth_id        uuid,
  p_total_voters    integer,
  p_comment         text,
  p_counts          jsonb,  -- [{ "caste": text, "count": int }]
  p_device_id       uuid,
  p_submitter_name  text,
  p_submitter_phone text
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_submission_id uuid;
begin
  insert into public.survey_submissions
    (booth_id, total_voters, comment, device_id, submitter_name, submitter_phone)
  values
    (p_booth_id, p_total_voters, nullif(btrim(p_comment), ''), p_device_id,
     btrim(p_submitter_name), p_submitter_phone)
  on conflict (booth_id) do update
    set total_voters    = excluded.total_voters,
        comment         = excluded.comment,
        device_id       = coalesce(excluded.device_id, public.survey_submissions.device_id),
        submitter_name  = excluded.submitter_name,
        submitter_phone = excluded.submitter_phone,
        revision        = public.survey_submissions.revision + 1,
        updated_at      = now()
  returning id into v_submission_id;

  delete from public.survey_caste_counts where submission_id = v_submission_id;

  insert into public.survey_caste_counts (submission_id, caste, count)
  select v_submission_id, btrim(c.caste), c.count
  from jsonb_to_recordset(p_counts) as c(caste text, count integer);

  return v_submission_id;
end;
$$;

revoke execute on function public.submit_survey(uuid, integer, text, jsonb, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.submit_survey(uuid, integer, text, jsonb, uuid, text, text) to service_role;

-- The deployed app already uses the 5-argument version, so the original 4-argument one is unused.
-- The 5-argument version stays until this release is deployed; drop it in a later migration.
drop function public.submit_survey(uuid, integer, text, jsonb);

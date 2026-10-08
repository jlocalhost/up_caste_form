-- Count how many times each booth's survey was submitted (first submit = 1).
alter table public.survey_submissions
  add column revision integer not null default 1 check (revision >= 1);

create or replace function public.submit_survey(
  p_booth_id     uuid,
  p_total_voters integer,
  p_comment      text,
  p_counts       jsonb  -- [{ "caste": text, "count": int }]
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_submission_id uuid;
begin
  insert into public.survey_submissions (booth_id, total_voters, comment)
  values (p_booth_id, p_total_voters, nullif(btrim(p_comment), ''))
  on conflict (booth_id) do update
    set total_voters = excluded.total_voters,
        comment      = excluded.comment,
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

-- Adds district/assembly coverage and resubmission totals to the dashboard payload.
create or replace function public.admin_overview()
returns jsonb
language sql
stable
set search_path = ''
as $$
  with submission_totals as (
    select s.id, s.booth_id, s.total_voters, s.updated_at, s.revision,
           coalesce(sum(c.count), 0)::bigint as entered
    from public.survey_submissions s
    left join public.survey_caste_counts c on c.submission_id = s.id
    group by s.id
  ),
  covered as (
    select a.id as assembly_id, a.district_id
    from submission_totals st
    join public.booths b on b.id = st.booth_id
    join public.assemblies a on a.id = b.assembly_id
  )
  select jsonb_build_object(
    'totals', jsonb_build_object(
      'districts',         (select count(*) from public.districts),
      'coveredDistricts',  (select count(distinct district_id) from covered),
      'assemblies',        (select count(*) from public.assemblies),
      'coveredAssemblies', (select count(distinct assembly_id) from covered),
      'booths',            (select count(*) from public.booths),
      'listedVoters',      (select coalesce(sum(voters), 0) from public.booths),
      'surveyedBooths',    (select count(*) from submission_totals),
      'surveyedVoters',    (select coalesce(sum(total_voters), 0) from submission_totals),
      'enteredCount',      (select coalesce(sum(entered), 0) from submission_totals),
      'resubmissions',     (select coalesce(sum(revision - 1), 0) from submission_totals),
      'lastSubmissionAt',  (select max(updated_at) from submission_totals)
    ),
    'districts', coalesce((
      select jsonb_agg(row_to_json(x) order by x."surveyedBooths" desc, x.name)
      from (
        select d.name,
               count(b.id) as booths,
               count(st.id) as "surveyedBooths",
               coalesce(sum(b.voters), 0) as "listedVoters"
        from public.districts d
        left join public.assemblies a on a.district_id = d.id
        left join public.booths b on b.assembly_id = a.id
        left join submission_totals st on st.booth_id = b.id
        group by d.id
      ) x
    ), '[]'::jsonb),
    'castes', coalesce((
      select jsonb_agg(row_to_json(x) order by x.count desc)
      from (
        select caste, sum(count)::bigint as count, count(distinct submission_id) as booths
        from public.survey_caste_counts
        group by caste
      ) x
    ), '[]'::jsonb),
    'recent', coalesce((
      select jsonb_agg(row_to_json(x) order by x."updatedAt" desc)
      from (
        select d.name as district, a.name as assembly, b.number as "boothNumber", b.name as "boothName",
               st.total_voters as "totalVoters", st.entered, st.updated_at as "updatedAt"
        from submission_totals st
        join public.booths b on b.id = st.booth_id
        join public.assemblies a on a.id = b.assembly_id
        join public.districts d on d.id = a.district_id
        order by st.updated_at desc
        limit 10
      ) x
    ), '[]'::jsonb)
  );
$$;

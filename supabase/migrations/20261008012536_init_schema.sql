-- =============================================================================
-- Booth survey schema.
-- All tables have RLS enabled with no policies: the anon/authenticated roles
-- cannot touch them directly. Every read/write goes through the Next.js server
-- using the secret key, after the server has authenticated/authorised the caller.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Master data: district → assembly → booth
-- ---------------------------------------------------------------------------
create table public.districts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique check (length(btrim(name)) > 0),
  created_at timestamptz not null default now()
);

create table public.assemblies (
  id          uuid primary key default gen_random_uuid(),
  district_id uuid not null references public.districts (id) on delete cascade,
  name        text not null check (length(btrim(name)) > 0),
  created_at  timestamptz not null default now(),
  unique (district_id, name)
);

create table public.booths (
  id          uuid primary key default gen_random_uuid(),
  assembly_id uuid not null references public.assemblies (id) on delete cascade,
  number      text not null check (length(btrim(number)) > 0),
  name        text not null check (length(btrim(name)) > 0),
  voters      integer not null check (voters > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (assembly_id, number)
);

create table public.castes (
  id         smallint generated always as identity primary key,
  name       text not null unique,
  sort_order smallint not null
);

-- ---------------------------------------------------------------------------
-- Survey responses: one live submission per booth (re-submitting replaces it)
-- ---------------------------------------------------------------------------
create table public.survey_submissions (
  id           uuid primary key default gen_random_uuid(),
  booth_id     uuid not null unique references public.booths (id) on delete restrict,
  total_voters integer not null check (total_voters > 0),
  comment      text check (comment is null or length(comment) <= 1000),
  submitted_at timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index survey_submissions_updated_at_idx on public.survey_submissions (updated_at desc);

create table public.survey_caste_counts (
  submission_id uuid not null references public.survey_submissions (id) on delete cascade,
  caste         text not null check (length(btrim(caste)) > 0),
  count         integer not null check (count > 0),
  primary key (submission_id, caste)
);

alter table public.districts           enable row level security;
alter table public.assemblies          enable row level security;
alter table public.booths              enable row level security;
alter table public.castes              enable row level security;
alter table public.survey_submissions  enable row level security;
alter table public.survey_caste_counts enable row level security;

-- ---------------------------------------------------------------------------
-- import_booths: idempotent bulk upsert of booth master data (one CSV chunk).
-- Runs in a single transaction. Returns how many booths were inserted/updated.
-- ---------------------------------------------------------------------------
create function public.import_booths(p_rows jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_inserted integer;
  v_updated  integer;
begin
  create temp table _incoming on commit drop as
  select distinct on (district, assembly, booth_number)
         btrim(district) as district,
         btrim(assembly) as assembly,
         btrim(booth_number) as booth_number,
         btrim(booth_name) as booth_name,
         voters
  from jsonb_to_recordset(p_rows)
       as r(district text, assembly text, booth_number text, booth_name text, voters integer);

  insert into public.districts (name)
  select distinct district from _incoming
  on conflict (name) do nothing;

  insert into public.assemblies (district_id, name)
  select distinct d.id, i.assembly
  from _incoming i
  join public.districts d on d.name = i.district
  on conflict (district_id, name) do nothing;

  with upserted as (
    insert into public.booths (assembly_id, number, name, voters)
    select a.id, i.booth_number, i.booth_name, i.voters
    from _incoming i
    join public.districts d on d.name = i.district
    join public.assemblies a on a.district_id = d.id and a.name = i.assembly
    on conflict (assembly_id, number) do update
      set name = excluded.name, voters = excluded.voters, updated_at = now()
      where (public.booths.name, public.booths.voters) is distinct from (excluded.name, excluded.voters)
    returning (xmax = 0) as is_insert
  )
  select count(*) filter (where is_insert), count(*) filter (where not is_insert)
  into v_inserted, v_updated
  from upserted;

  return jsonb_build_object(
    'received', (select count(*) from _incoming),
    'inserted', v_inserted,
    'updated',  v_updated
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- submit_survey: atomically create/replace a booth's submission and counts.
-- ---------------------------------------------------------------------------
create function public.submit_survey(
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
        updated_at   = now()
  returning id into v_submission_id;

  delete from public.survey_caste_counts where submission_id = v_submission_id;

  insert into public.survey_caste_counts (submission_id, caste, count)
  select v_submission_id, btrim(c.caste), c.count
  from jsonb_to_recordset(p_counts) as c(caste text, count integer);

  return v_submission_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_overview: everything the dashboard needs, in one round trip.
-- ---------------------------------------------------------------------------
create function public.admin_overview()
returns jsonb
language sql
stable
set search_path = ''
as $$
  with submission_totals as (
    select s.id, s.booth_id, s.total_voters, s.updated_at,
           coalesce(sum(c.count), 0)::bigint as entered
    from public.survey_submissions s
    left join public.survey_caste_counts c on c.submission_id = s.id
    group by s.id
  )
  select jsonb_build_object(
    'totals', jsonb_build_object(
      'districts',        (select count(*) from public.districts),
      'assemblies',       (select count(*) from public.assemblies),
      'booths',           (select count(*) from public.booths),
      'listedVoters',     (select coalesce(sum(voters), 0) from public.booths),
      'surveyedBooths',   (select count(*) from submission_totals),
      'surveyedVoters',   (select coalesce(sum(total_voters), 0) from submission_totals),
      'enteredCount',     (select coalesce(sum(entered), 0) from submission_totals),
      'lastSubmissionAt', (select max(updated_at) from submission_totals)
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

-- Functions are server-only: callable with the secret key, never by browsers.
revoke execute on function public.import_booths(jsonb) from public, anon, authenticated;
revoke execute on function public.submit_survey(uuid, integer, text, jsonb) from public, anon, authenticated;
revoke execute on function public.admin_overview() from public, anon, authenticated;
grant execute on function public.import_booths(jsonb) to service_role;
grant execute on function public.submit_survey(uuid, integer, text, jsonb) to service_role;
grant execute on function public.admin_overview() to service_role;

-- ---------------------------------------------------------------------------
-- Caste options shown in the form (editable later from the database).
-- ---------------------------------------------------------------------------
insert into public.castes (name, sort_order) values
  ('ब्राह्मण', 1),
  ('ठाकुर / राजपूत', 2),
  ('यादव', 3),
  ('कुर्मी', 4),
  ('जाटव', 5),
  ('पासवान / दुसाध', 6),
  ('मौर्य / कुशवाहा / शाक्य', 7),
  ('निषाद / मल्लाह / केवट', 8),
  ('वैश्य / बनिया', 9),
  ('कायस्थ', 10),
  ('मुस्लिम', 11),
  ('अनुसूचित जनजाति', 12),
  ('अन्य', 99);

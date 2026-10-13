-- Assemblies that have at least one submission (optionally within a district / one assembly),
-- with their submission counts. Lets the CSV export skip the hundreds of assemblies with no
-- data and batch the rest into a few large queries instead of one query per assembly.
create function public.export_assemblies(p_district_id uuid default null, p_assembly_id uuid default null)
returns table (assembly_id uuid, assembly_name text, district_name text, submissions bigint)
language sql
stable
set search_path = ''
as $$
  select a.id, a.name, d.name, count(*)
  from public.survey_submissions s
  join public.booths b on b.id = s.booth_id
  join public.assemblies a on a.id = b.assembly_id
  join public.districts d on d.id = a.district_id
  where (p_district_id is null or a.district_id = p_district_id)
    and (p_assembly_id is null or a.id = p_assembly_id)
  group by a.id, a.name, d.name;
$$;

revoke execute on function public.export_assemblies(uuid, uuid) from public, anon, authenticated;
grant execute on function public.export_assemblies(uuid, uuid) to service_role;

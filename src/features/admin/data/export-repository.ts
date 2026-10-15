import "server-only";

import { compareBoothNumbers } from "@/features/survey/lib/survey-math";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { EXPORT_PAGE_SIZE, type ExportAssembly } from "../export/export-batches";
import type { ResponseRow } from "../export/responses-csv";

export type ExportScope = { districtId?: string; assemblyId?: string };

const collator = new Intl.Collator("hi", { numeric: true });
const byName = (a: ExportAssembly, b: ExportAssembly) =>
  collator.compare(a.district, b.district) || collator.compare(a.name, b.name);

/** Only assemblies that have submissions, ordered by district then assembly name. */
export async function listExportAssemblies(scope: ExportScope): Promise<ExportAssembly[]> {
  const { data, error } = await supabaseAdmin().rpc("export_assemblies", {
    p_district_id: scope.districtId,
    p_assembly_id: scope.assemblyId,
  });
  if (error) throw error;
  return data
    .map((a) => ({ id: a.assembly_id, name: a.assembly_name, district: a.district_name, submissions: a.submissions }))
    .sort(byName);
}

/** Human-readable name of the export scope, for the file name. */
export async function getScopeName(scope: ExportScope): Promise<string> {
  const db = supabaseAdmin();
  if (scope.assemblyId) {
    const { data } = await db.from("assemblies").select("name, districts(name)").eq("id", scope.assemblyId).maybeSingle();
    return data ? `${data.districts.name}-${data.name}` : "";
  }
  if (scope.districtId) {
    const { data } = await db.from("districts").select("name").eq("id", scope.districtId).maybeSingle();
    return data?.name ?? "";
  }
  return "सभी";
}

/**
 * Submitted booths for a batch of assemblies, in the batch's assembly order and natural
 * booth-number order within each. Pages past PostgREST's row cap if a batch is large.
 */
export async function listBatchResponses(batch: ExportAssembly[]): Promise<ResponseRow[]> {
  const order = new Map(batch.map((a, index) => [a.id, { index, assembly: a }]));
  const rows: { order: number; row: ResponseRow }[] = [];

  for (let from = 0; ; from += EXPORT_PAGE_SIZE) {
    const { data, error } = await supabaseAdmin()
      .from("booths")
      .select("id, assembly_id, number, name, survey_submissions!inner(id, updated_at, total_voters, submitter_name, submitter_phone, survey_caste_counts(caste, count))")
      .in("assembly_id", [...order.keys()])
      .order("id")
      .range(from, from + EXPORT_PAGE_SIZE - 1);
    if (error) throw error;

    for (const booth of data) {
      const { index, assembly } = order.get(booth.assembly_id)!;
      const submission = booth.survey_submissions;
      rows.push({
        order: index,
        row: {
          submissionId: submission.id,
          submittedAt: submission.updated_at,
          submitterName: submission.submitter_name ?? "",
          submitterPhone: submission.submitter_phone ?? "",
          district: assembly.district,
          assembly: assembly.name,
          boothNumber: booth.number,
          boothName: booth.name,
          totalVoters: submission.total_voters,
          counts: submission.survey_caste_counts.map((c) => ({ caste: c.caste, count: c.count })),
        },
      });
    }
    if (data.length < EXPORT_PAGE_SIZE) break;
  }

  return rows
    .sort((a, b) => a.order - b.order || compareBoothNumbers(a.row.boothNumber, b.row.boothNumber))
    .map(({ row }) => row);
}

import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { compareBoothNumbers, type ResolvedArea } from "../lib/survey-math";
import type { Booth, SurveyConfig } from "../types";

/** Invalidated whenever booth master data is imported. */
export const MASTER_DATA_TAG = "master-data";

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, "hi");

/** Districts → assemblies and caste options. Small, so it ships with the page. */
export async function getSurveyConfig(): Promise<SurveyConfig> {
  "use cache";
  cacheLife("hours");
  cacheTag(MASTER_DATA_TAG);

  const db = supabaseAdmin();
  const [districts, castes] = await Promise.all([
    db.from("districts").select("id, name, assemblies(id, name, booths(count))"),
    db.from("castes").select("name").order("sort_order"),
  ]);
  if (districts.error) throw districts.error;
  if (castes.error) throw castes.error;

  return {
    districts: districts.data
      .map((d) => ({
        id: d.id,
        name: d.name,
        assemblies: d.assemblies
          .map((a) => ({ id: a.id, name: a.name, boothCount: a.booths[0]?.count ?? 0 }))
          .sort(byName),
      }))
      .sort(byName),
    castes: castes.data.map((c) => c.name),
  };
}

/** Booths of one assembly (a few hundred at most), naturally ordered by booth number. */
export async function getBoothsForAssembly(assemblyId: string): Promise<Booth[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(MASTER_DATA_TAG);

  const { data, error } = await supabaseAdmin()
    .from("booths")
    .select("id, assembly_id, number, name, voters")
    .eq("assembly_id", assemblyId);
  if (error) throw error;

  return data
    .map((b) => ({ id: b.id, assemblyId: b.assembly_id, number: b.number, name: b.name, voters: b.voters }))
    .sort((a, b) => compareBoothNumbers(a.number, b.number));
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

/** Authoritative booth → assembly → district lookup for server-side validation. Never cached. */
export async function resolveAreaFromDb(boothId: string | undefined): Promise<ResolvedArea> {
  if (!isUuid(boothId)) return {};
  const { data, error } = await supabaseAdmin()
    .from("booths")
    .select("id, assembly_id, number, name, voters, assemblies(id, name, districts(id, name))")
    .eq("id", boothId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return {};

  const assembly = data.assemblies;
  return {
    district: assembly.districts,
    assembly: { id: assembly.id, name: assembly.name },
    booth: { id: data.id, assemblyId: data.assembly_id, number: data.number, name: data.name, voters: data.voters },
  };
}

export type SubmissionPayload = {
  boothId: string;
  totalVoters: number;
  comment: string;
  counts: { caste: string; count: number }[];
};

export async function saveSubmission(payload: SubmissionPayload): Promise<void> {
  const { error } = await supabaseAdmin().rpc("submit_survey", {
    p_booth_id: payload.boothId,
    p_total_voters: payload.totalVoters,
    p_comment: payload.comment,
    p_counts: payload.counts,
  });
  if (error) throw error;
}

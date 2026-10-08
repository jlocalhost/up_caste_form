"use server";

import { updateTag } from "next/cache";
import { MASTER_DATA_TAG } from "@/features/survey/data/survey-repository";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "../auth/dal";
import { MAX_CHUNK_ROWS, validateBoothRecord, type BoothImportRow } from "./booth-csv";

export type ImportChunkResult =
  | { ok: true; received: number; inserted: number; updated: number }
  | { ok: false; message: string };

/** Imports one chunk of already-previewed rows. Re-validates everything: the client is untrusted. */
export async function importBoothsChunk(input: unknown): Promise<ImportChunkResult> {
  await requireAdmin();

  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_CHUNK_ROWS) {
    return { ok: false, message: "अमान्य अनुरोध" };
  }
  const rows: BoothImportRow[] = [];
  for (const record of input) {
    const fields = typeof record === "object" && record !== null ? (record as Record<string, unknown>) : {};
    const result = validateBoothRecord({ ...fields, voters: String(fields.voters ?? "") });
    if (typeof result === "string") return { ok: false, message: `अमान्य पंक्ति: ${result}` };
    rows.push(result);
  }

  const { data, error } = await supabaseAdmin().rpc("import_booths", { p_rows: rows });
  if (error) {
    console.error("import_booths failed", error);
    return { ok: false, message: "डेटाबेस में सहेजते समय त्रुटि हुई" };
  }

  updateTag(MASTER_DATA_TAG);
  const counts = data as { received: number; inserted: number; updated: number };
  return { ok: true, ...counts };
}

"use server";

import { resolveAreaFromDb, saveSubmission } from "../data/survey-repository";
import { casteLabel, isActiveRow, parseWholeNumber } from "../lib/survey-math";
import { isSurveyValid, validateSurvey } from "../lib/validation";
import type { SurveyDraft } from "../types";

export type SubmitResult = { ok: true } | { ok: false; message: string };

/** Server-side gate: never trust the client — re-resolve the booth from the DB and re-validate. */
export async function submitSurvey(input: SurveyDraft): Promise<SubmitResult> {
  if (!isDraftShape(input)) return { ok: false, message: "अमान्य अनुरोध" };
  const draft: SurveyDraft = { ...input, rows: input.rows.filter(isActiveRow) };
  const area = await resolveAreaFromDb(draft.booth?.id);

  // The booth must belong to the assembly and district the worker picked.
  const matchesSelection = area.assembly?.id === draft.assemblyId && area.district?.id === draft.districtId;
  if (!matchesSelection || !isSurveyValid(validateSurvey(draft, area))) {
    return { ok: false, message: "कृपया लाल रंग में दिखी त्रुटियाँ ठीक करें" };
  }

  try {
    await saveSubmission({
      boothId: area.booth!.id,
      totalVoters: area.booth!.voters,
      comment: draft.comment.slice(0, 1000),
      counts: draft.rows.map((row) => ({ caste: casteLabel(row), count: parseWholeNumber(row.count)! })),
    });
  } catch (error) {
    console.error("submitSurvey failed", error);
    return { ok: false, message: "सबमिट नहीं हो सका। आपका डेटा सुरक्षित है, कृपया पुनः प्रयास करें।" };
  }

  return { ok: true };
}

/** Runtime shape check — the action is a public endpoint, so its argument is untrusted. */
function isDraftShape(value: unknown): value is SurveyDraft {
  const d = value as SurveyDraft;
  const isText = (v: unknown) => typeof v === "string";
  return (
    typeof d === "object" &&
    d !== null &&
    isText(d.districtId) &&
    isText(d.assemblyId) &&
    isText(d.comment) &&
    Array.isArray(d.rows) &&
    d.rows.length <= 100 &&
    d.rows.every((r) => r && isText(r.id) && isText(r.caste) && isText(r.otherName) && isText(r.count))
  );
}

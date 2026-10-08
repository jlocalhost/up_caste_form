import { OTHER_CASTE } from "../constants";
import type { SurveyDraft } from "../types";
import { casteKey, parseWholeNumber, sumCounts, type ResolvedArea } from "./survey-math";

export type RowErrors = {
  caste?: string;
  other?: string;
  count?: string;
  duplicate?: string;
};

export type SurveyErrors = {
  district?: string;
  assembly?: string;
  booth?: string;
  noCaste?: string;
  overflow?: string;
  rows: RowErrors[];
};

export const messages = {
  district: "जिला चुनना आवश्यक है",
  assembly: "विधानसभा चुनना आवश्यक है",
  booth: "बूथ चुनना आवश्यक है",
  caste: "जाति चुनना आवश्यक है",
  other: "अन्य जाति का नाम लिखें",
  count: "सही संख्या दर्ज करें",
  duplicate: "यह जाति पहले जोड़ी जा चुकी है",
  noCaste: "कम से कम एक जाति दर्ज करना आवश्यक है",
  overflow: "जातिवार कुल संख्या, कुल मतदाताओं से अधिक नहीं हो सकती",
} as const;

export function hasRowError(errors: RowErrors): boolean {
  return Boolean(errors.caste || errors.other || errors.count || errors.duplicate);
}

/**
 * Pure validation shared by the client (inline errors) and the server (final gate).
 * The caller resolves the area from its own source of truth (client: page data, server: DB).
 * Always returns every error; the UI decides when to reveal them.
 */
export function validateSurvey(draft: SurveyDraft, area: ResolvedArea): SurveyErrors {
  const { district, assembly, booth } = area;
  // Total voters always comes from the booth master list, never from user input.
  const voters = booth?.voters ?? 0;
  const entered = sumCounts(draft.rows);

  const keys = draft.rows.filter((row) => row.caste).map(casteKey);
  const rows = draft.rows.map((row): RowErrors => {
    const count = parseWholeNumber(row.count);
    const key = casteKey(row);
    return {
      caste: row.count.trim() && !row.caste ? messages.caste : undefined,
      other: row.caste === OTHER_CASTE && !row.otherName.trim() ? messages.other : undefined,
      count: row.caste && (count === null || count < 1) ? messages.count : undefined,
      duplicate: key && keys.filter((k) => k === key).length > 1 ? messages.duplicate : undefined,
    };
  });

  return {
    district: district ? undefined : messages.district,
    assembly: assembly ? undefined : messages.assembly,
    booth: booth ? undefined : messages.booth,
    noCaste: draft.rows.some((row) => row.caste) ? undefined : messages.noCaste,
    overflow: voters > 0 && entered > voters ? messages.overflow : undefined,
    rows,
  };
}

export function isSurveyValid(errors: SurveyErrors): boolean {
  const { rows, ...formErrors } = errors;
  return Object.values(formErrors).every((e) => !e) && !rows.some(hasRowError);
}

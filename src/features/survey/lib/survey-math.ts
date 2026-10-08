import { OTHER_CASTE } from "../constants";
import type { Assembly, Booth, CasteRow, District, SurveyDraft } from "../types";

/** Natural order for booth numbers stored as text ("2" before "10", "12A" after "12"). */
export function compareBoothNumbers(a: string, b: string): number {
  return a.localeCompare(b, "en", { numeric: true });
}

/** Parses a whole, non-negative number. Returns null for blanks, decimals and junk. */
export function parseWholeNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return Number(trimmed);
}

export function sumCounts(rows: CasteRow[]): number {
  return rows.reduce((sum, row) => sum + (parseWholeNumber(row.count) ?? 0), 0);
}

/** Percentage of `part` in `whole`, formatted to one decimal ("0.0" when undefined). */
export function formatPercent(part: number, whole: number): string {
  if (!whole || !part) return "0.0";
  return ((part / whole) * 100).toFixed(1);
}

export function coveragePercent(entered: number, total: number): number {
  return total ? Math.min((entered / total) * 100, 100) : 0;
}

/** Identity used for duplicate detection: free-text "other" names compare case-insensitively. */
export function casteKey(row: CasteRow): string {
  return row.caste === OTHER_CASTE ? row.otherName.trim().toLowerCase() : row.caste;
}

export function casteLabel(row: CasteRow): string {
  return row.caste === OTHER_CASTE ? row.otherName.trim() : row.caste;
}

/** A row the user has started filling in; untouched rows are ignored on submit. */
export function isActiveRow(row: CasteRow): boolean {
  return Boolean(row.caste || row.count.trim());
}

export function formatBoothLabel(booth: Booth): string {
  return `${booth.number} · ${booth.name}`;
}

export type ResolvedArea = {
  district?: Pick<District, "id" | "name">;
  assembly?: Pick<Assembly, "id" | "name">;
  booth?: Booth;
};

/** Looks up the selected district → assembly → booth, enforcing the hierarchy. */
export function resolveArea(
  districts: District[],
  draft: Pick<SurveyDraft, "districtId" | "assemblyId" | "booth">,
): ResolvedArea {
  const district = districts.find((d) => d.id === draft.districtId);
  const assembly = district?.assemblies.find((a) => a.id === draft.assemblyId);
  const booth = assembly && draft.booth?.assemblyId === assembly.id ? draft.booth : undefined;
  return { district, assembly, booth };
}

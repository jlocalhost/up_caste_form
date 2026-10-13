import { formatPercent } from "@/features/survey/lib/survey-math";
import type { CasteCount } from "@/features/survey/types";

/** One submitted booth, flattened for export. */
export type ResponseRow = {
  district: string;
  assembly: string;
  boothNumber: string;
  boothName: string;
  totalVoters: number;
  counts: CasteCount[];
};

export const RESPONSE_HEADERS = [
  "District",
  "AC Name",
  "Booth Number",
  "Booth Name",
  "Total Voters",
  "Caste wise count",
] as const;

/** "यादव: 300 (34.7%); ब्राह्मण: 120 (13.9%)" — largest first, % of the booth's total voters. */
export function formatCasteBreakdown(counts: CasteCount[], totalVoters: number): string {
  return [...counts]
    .sort((a, b) => b.count - a.count || a.caste.localeCompare(b.caste, "hi"))
    .map((c) => `${c.caste}: ${c.count} (${formatPercent(c.count, totalVoters)}%)`)
    .join("; ");
}

/**
 * Quotes a cell when needed and defuses spreadsheet formulas. Free-text values (e.g. an
 * "other" caste typed by a field worker) must never run as a formula when opened in Excel.
 */
export function escapeCsvCell(value: string | number): string {
  if (typeof value === "number") return String(value);
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]|^\s|\s$/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function csvLine(cells: (string | number)[]): string {
  return `${cells.map(escapeCsvCell).join(",")}\r\n`;
}

export function responseCells(row: ResponseRow): (string | number)[] {
  return [
    row.district,
    row.assembly,
    row.boothNumber,
    row.boothName,
    row.totalVoters,
    formatCasteBreakdown(row.counts, row.totalVoters),
  ];
}

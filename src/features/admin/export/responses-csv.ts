import { formatPercent } from "@/features/survey/lib/survey-math";
import type { CasteCount } from "@/features/survey/types";

/** One submitted booth, flattened for export. */
export type ResponseRow = {
  submissionId: string;
  /** ISO timestamp of the latest submit — the counts in the row are from that submit. */
  submittedAt: string;
  /** Empty for submissions made before these fields existed. */
  submitterName: string;
  submitterPhone: string;
  district: string;
  assembly: string;
  boothNumber: string;
  boothName: string;
  totalVoters: number;
  counts: CasteCount[];
};

export const RESPONSE_HEADERS = [
  "Submission ID",
  "Submission Date Time (IST)",
  "User Name",
  "User Phone",
  "District",
  "AC Name",
  "Booth Number",
  "Booth Name",
  "Total Voters",
  "Caste wise count",
] as const;

const istParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** "2026-10-13 15:42:07" in IST — sortable, and Excel reads it as a date-time. */
export function formatIstDateTime(iso: string): string {
  const p = Object.fromEntries(istParts.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

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
    row.submissionId,
    formatIstDateTime(row.submittedAt),
    row.submitterName,
    row.submitterPhone,
    row.district,
    row.assembly,
    row.boothNumber,
    row.boothName,
    row.totalVoters,
    formatCasteBreakdown(row.counts, row.totalVoters),
  ];
}

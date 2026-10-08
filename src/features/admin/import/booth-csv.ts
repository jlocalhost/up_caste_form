/**
 * Pure booth-master CSV rules, shared by the browser (preview) and the server (final gate).
 * Expected columns (English or Hindi headers): district, assembly, booth_number, booth_name, voters.
 */

export type BoothImportRow = {
  district: string;
  assembly: string;
  booth_number: string;
  booth_name: string;
  voters: number;
};

export type RowIssue = { line: number; message: string };

export type BoothCsvResult = {
  rows: BoothImportRow[];
  issues: RowIssue[];
  missingColumns: string[];
};

export const MAX_BOOTH_VOTERS = 5000;
export const MAX_TEXT_LENGTH = 200;
/** Rows sent per server request during import. */
export const MAX_CHUNK_ROWS = 2000;

const COLUMN_ALIASES: Record<keyof BoothImportRow, string[]> = {
  district: ["district", "जिला", "jila"],
  assembly: ["assembly", "विधानसभा", "vidhansabha", "assembly_name"],
  booth_number: ["booth_number", "booth_no", "booth no", "बूथ संख्या", "बूथ नंबर"],
  booth_name: ["booth_name", "booth name", "बूथ नाम", "बूथ का नाम"],
  voters: ["voters", "total_voters", "मतदाता", "कुल मतदाता"],
};

export const REQUIRED_COLUMNS = Object.keys(COLUMN_ALIASES) as (keyof BoothImportRow)[];

const normalizeHeader = (header: string) => header.replace(/^﻿/, "").trim().toLowerCase().replace(/\s+/g, " ");

/** Maps whatever headers the file uses onto our column names. */
export function canonicalHeader(header: string): string {
  const normalized = normalizeHeader(header);
  for (const [column, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.includes(normalized) || aliases.includes(normalized.replace(/ /g, "_"))) return column;
  }
  return normalized;
}

const clean = (value: unknown) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "");

/** Validates one record; returns the typed row or the reason it was rejected. */
export function validateBoothRecord(record: Record<string, unknown>): BoothImportRow | string {
  const district = clean(record.district);
  const assembly = clean(record.assembly);
  const boothNumber = clean(record.booth_number);
  const boothName = clean(record.booth_name);
  const votersText = clean(record.voters).replace(/,/g, "");

  if (!district) return "जिला खाली है";
  if (!assembly) return "विधानसभा खाली है";
  if (!boothNumber) return "बूथ संख्या खाली है";
  if (!boothName) return "बूथ नाम खाली है";
  if ([district, assembly, boothNumber, boothName].some((v) => v.length > MAX_TEXT_LENGTH)) {
    return `कोई मान ${MAX_TEXT_LENGTH} अक्षरों से लंबा है`;
  }
  if (!/^\d+$/.test(votersText)) return "मतदाता संख्या पूर्ण संख्या होनी चाहिए";
  const voters = Number(votersText);
  if (voters < 1 || voters > MAX_BOOTH_VOTERS) return `मतदाता संख्या 1 से ${MAX_BOOTH_VOTERS} के बीच होनी चाहिए`;

  return { district, assembly, booth_number: boothNumber, booth_name: boothName, voters };
}

const boothKey = (row: BoothImportRow) => `${row.district}\u0000${row.assembly}\u0000${row.booth_number}`;

/**
 * Validates parsed CSV records. `firstLine` is the file line of records[0]
 * (2 when the header is on line 1) so issues point at the real line.
 */
export function validateBoothRecords(
  headers: string[],
  records: Record<string, unknown>[],
  firstLine = 2,
): BoothCsvResult {
  const present = new Set(headers.map(canonicalHeader));
  const missingColumns = REQUIRED_COLUMNS.filter((c) => !present.has(c));
  if (missingColumns.length) return { rows: [], issues: [], missingColumns };

  const rows: BoothImportRow[] = [];
  const issues: RowIssue[] = [];
  const seen = new Map<string, number>();

  records.forEach((record, index) => {
    const line = firstLine + index;
    // Blank lines are skipped here (not by the parser) so line numbers stay true to the file.
    if (Object.values(record).every((v) => !clean(v))) return;
    const result = validateBoothRecord(record);
    if (typeof result === "string") {
      issues.push({ line, message: result });
      return;
    }
    const key = boothKey(result);
    const firstSeen = seen.get(key);
    if (firstSeen !== undefined) {
      issues.push({ line, message: `यही बूथ पंक्ति ${firstSeen} में पहले से है` });
      return;
    }
    seen.set(key, line);
    rows.push(result);
  });

  return { rows, issues, missingColumns };
}

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

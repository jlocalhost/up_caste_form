import Papa from "papaparse";
import { describe, expect, it } from "vitest";
import {
  RESPONSE_HEADERS,
  csvLine,
  escapeCsvCell,
  formatCasteBreakdown,
  formatIstDateTime,
  responseCells,
} from "./responses-csv";

describe("formatCasteBreakdown", () => {
  it("lists castes largest first with % of total voters", () => {
    const text = formatCasteBreakdown(
      [
        { caste: "ब्राह्मण", count: 120 },
        { caste: "यादव", count: 300 },
      ],
      864,
    );
    expect(text).toBe("यादव: 300 (34.7%); ब्राह्मण: 120 (13.9%)");
  });
});

describe("escapeCsvCell", () => {
  it("leaves plain values alone and quotes commas, quotes and newlines", () => {
    expect(escapeCsvCell("लखनऊ")).toBe("लखनऊ");
    expect(escapeCsvCell(864)).toBe("864");
    expect(escapeCsvCell("प्राथमिक विद्यालय, हुसैनगंज")).toBe('"प्राथमिक विद्यालय, हुसैनगंज"');
    expect(escapeCsvCell('कक्ष "1"')).toBe('"कक्ष ""1"""');
  });

  it("neutralises spreadsheet formulas", () => {
    expect(escapeCsvCell("=HYPERLINK(\"http://x\")")).toBe('"\'=HYPERLINK(""http://x"")"');
    expect(escapeCsvCell("+91")).toBe("'+91");
    expect(escapeCsvCell("@cmd")).toBe("'@cmd");
  });
});

describe("csvLine / responseCells", () => {
  it("round-trips through a CSV parser", () => {
    const row = {
      submissionId: "3f2a9c1e-0000-4000-8000-000000000001",
      submittedAt: "2026-10-13T10:12:07.123+00:00",
      submitterName: "राम कुमार",
      submitterPhone: "9876543210",
      district: "लखनऊ",
      assembly: "लखनऊ मध्य",
      boothNumber: "159",
      boothName: "प्राथमिक विद्यालय, हुसैनगंज",
      totalVoters: 864,
      counts: [
        { caste: "यादव", count: 300 },
        { caste: "=evil", count: 20 },
      ],
    };
    const csv = csvLine([...RESPONSE_HEADERS]) + csvLine(responseCells(row));
    const { data } = Papa.parse<string[]>(csv.trim());
    expect(data[0]).toEqual([...RESPONSE_HEADERS]);
    expect(data[1]).toEqual([
      "3f2a9c1e-0000-4000-8000-000000000001",
      "2026-10-13 15:42:07",
      "राम कुमार",
      "9876543210",
      "लखनऊ",
      "लखनऊ मध्य",
      "159",
      "प्राथमिक विद्यालय, हुसैनगंज",
      "864",
      "यादव: 300 (34.7%); =evil: 20 (2.3%)",
    ]);
  });
});

describe("formatIstDateTime", () => {
  it("converts UTC to IST in a sortable 24-hour format", () => {
    expect(formatIstDateTime("2026-10-13T10:12:07Z")).toBe("2026-10-13 15:42:07");
    expect(formatIstDateTime("2026-10-13T19:00:00Z")).toBe("2026-10-14 00:30:00");
  });
});

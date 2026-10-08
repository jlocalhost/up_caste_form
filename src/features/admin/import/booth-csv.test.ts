import Papa from "papaparse";
import { describe, expect, it } from "vitest";
import { canonicalHeader, chunk, validateBoothRecords } from "./booth-csv";

function parse(csv: string) {
  const { data, meta } = Papa.parse<Record<string, string>>(csv, { header: true, transformHeader: canonicalHeader });
  return validateBoothRecords(meta.fields ?? [], data);
}

describe("booth CSV", () => {
  it("accepts English headers and trims values", () => {
    const result = parse("district,assembly,booth_number,booth_name,voters\n लखनऊ ,लखनऊ मध्य,159,स्कूल,\"1,042\"\n");
    expect(result.issues).toEqual([]);
    expect(result.rows).toEqual([
      { district: "लखनऊ", assembly: "लखनऊ मध्य", booth_number: "159", booth_name: "स्कूल", voters: 1042 },
    ]);
  });

  it("accepts Hindi headers with a BOM", () => {
    const result = parse("﻿जिला,विधानसभा,बूथ संख्या,बूथ नाम,मतदाता\nआगरा,आगरा कैंट,1,विद्यालय,700");
    expect(result.rows).toHaveLength(1);
  });

  it("reports missing columns", () => {
    expect(parse("district,assembly\nलखनऊ,लखनऊ मध्य").missingColumns).toEqual(["booth_number", "booth_name", "voters"]);
  });

  it("reports bad rows and duplicates with their file line, skipping blank lines", () => {
    const csv = [
      "district,assembly,booth_number,booth_name,voters",
      "लखनऊ,लखनऊ मध्य,159,स्कूल,864",
      "",
      "लखनऊ,लखनऊ मध्य,160,स्कूल,12.5",
      "लखनऊ,लखनऊ मध्य,159,दूसरा नाम,900",
      "लखनऊ,,161,स्कूल,700",
    ].join("\n");
    const result = parse(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.issues.map((i) => i.line)).toEqual([4, 5, 6]);
    expect(result.issues[1].message).toContain("पंक्ति 2");
  });

  it("chunks rows", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

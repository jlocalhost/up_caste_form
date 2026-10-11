import { describe, expect, it } from "vitest";
import { matchesSearch } from "./format";
import { rowsFromCounts } from "./survey-math";

describe("rowsFromCounts", () => {
  it("maps known castes to options and unknown ones to 'other' with the saved name", () => {
    const rows = rowsFromCounts(
      [
        { caste: "यादव", count: 300 },
        { caste: "पासी", count: 50 },
      ],
      ["यादव", "कुर्मी", "अन्य"],
      (i) => `r${i}`,
    );
    expect(rows).toEqual([
      { id: "r0", caste: "यादव", otherName: "", count: "300" },
      { id: "r1", caste: "अन्य", otherName: "पासी", count: "50" },
    ]);
  });
});

describe("matchesSearch", () => {
  it("ignores letter case and extra spaces", () => {
    expect(matchesSearch("1 · SAMVILIYAN UCHCH PRATHAMIK VIDYALAY", "samviliyan  uchch")).toBe(true);
    expect(matchesSearch("Aligarh", "ALI")).toBe(true);
  });

  it("matches Devanagari and treats an empty query as a match", () => {
    expect(matchesSearch("लखनऊ मध्य", "मध्य")).toBe(true);
    expect(matchesSearch("लखनऊ", "")).toBe(true);
    expect(matchesSearch("लखनऊ", "वाराणसी")).toBe(false);
  });
});

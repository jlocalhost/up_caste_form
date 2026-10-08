import { describe, expect, it } from "vitest";
import type { CasteRow, SurveyDraft } from "../types";
import { resolveArea } from "./survey-math";
import { districtsFixture, lucknowCentralBooth } from "./test-fixtures";
import { isSurveyValid, messages, validateSurvey } from "./validation";

const row = (caste: string, count: string, otherName = ""): CasteRow => ({
  id: `${caste}-${count}-${otherName}`,
  caste,
  count,
  otherName,
});

const validDraft = (patch: Partial<SurveyDraft> = {}): SurveyDraft => ({
  districtId: "lucknow",
  assemblyId: "lucknow-central",
  booth: lucknowCentralBooth,
  rows: [row("यादव", "300"), row("", "")],
  comment: "",
  ...patch,
});

const validate = (draft: SurveyDraft) => validateSurvey(draft, resolveArea(districtsFixture, draft));

describe("validateSurvey", () => {
  it("accepts a complete draft and ignores untouched rows", () => {
    expect(isSurveyValid(validate(validDraft()))).toBe(true);
  });

  it("rejects a booth that does not belong to the chosen assembly", () => {
    const errors = validate(validDraft({ assemblyId: "lucknow-east" }));
    expect(errors.booth).toBe(messages.booth);
  });

  it("takes total voters from the booth, so small or large booths are accepted", () => {
    const smallBooth = { ...lucknowCentralBooth, voters: 120 };
    expect(isSurveyValid(validate(validDraft({ booth: smallBooth, rows: [row("यादव", "100")] })))).toBe(true);
    expect(validate(validDraft({ booth: smallBooth, rows: [row("यादव", "121")] })).overflow).toBe(messages.overflow);
  });

  it("requires at least one caste", () => {
    expect(validate(validDraft({ rows: [row("", "")] })).noCaste).toBe(messages.noCaste);
  });

  it("flags a count without a caste", () => {
    expect(validate(validDraft({ rows: [row("यादव", "10"), row("", "5")] })).rows[1].caste).toBe(messages.caste);
  });

  it.each(["", "0", "2.5"])("flags an invalid count %s", (count) => {
    expect(validate(validDraft({ rows: [row("यादव", count)] })).rows[0].count).toBe(messages.count);
  });

  it("requires a name for 'other' and detects duplicates case-insensitively", () => {
    const errors = validate(
      validDraft({ rows: [row("अन्य", "10", ""), row("अन्य", "10", "Pasi"), row("अन्य", "5", " pasi ")] }),
    );
    expect(errors.rows[0].other).toBe(messages.other);
    expect(errors.rows[1].duplicate).toBe(messages.duplicate);
    expect(errors.rows[2].duplicate).toBe(messages.duplicate);
  });

  it("rejects entries that exceed the total voters", () => {
    const errors = validate(validDraft({ rows: [row("यादव", "800"), row("कुर्मी", "100")] }));
    expect(errors.overflow).toBe(messages.overflow);
    expect(isSurveyValid(errors)).toBe(false);
  });
});

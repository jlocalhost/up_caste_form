import { describe, expect, it } from "vitest";
import { districtsFixture, lucknowCentralBooth as booth } from "../lib/test-fixtures";
import { createInitialState, emptyRow, surveyReducer, type SurveyAction, type SurveyState } from "./survey-reducer";

const [lucknow] = districtsFixture;
const [central] = lucknow.assemblies;

const run = (...actions: SurveyAction[]): SurveyState =>
  actions.reduce(surveyReducer, createInitialState([emptyRow("r1")]));

const filled: SurveyAction[] = [
  { type: "selectDistrict", districtId: lucknow.id },
  { type: "selectAssembly", assemblyId: central.id },
  { type: "selectBooth", booth },
];

describe("surveyReducer", () => {
  it("stores the chosen booth", () => {
    const state = run(...filled);
    expect(state.draft).toMatchObject({ booth });
  });

  it("clears assembly and booth when a different district is picked", () => {
    const state = run(...filled, { type: "selectDistrict", districtId: "varanasi" });
    expect(state.draft).toMatchObject({ districtId: "varanasi", assemblyId: "", booth: null });
  });

  it("keeps the selection when the same district or assembly is picked again", () => {
    const state = run(
      ...filled,
      { type: "selectDistrict", districtId: lucknow.id },
      { type: "selectAssembly", assemblyId: central.id },
    );
    expect(state.draft).toMatchObject({ booth });
  });

  it("drops a stale 'other' name when the caste changes", () => {
    const state = run(
      { type: "updateRow", rowId: "r1", field: "caste", value: "अन्य" },
      { type: "updateRow", rowId: "r1", field: "otherName", value: "पासी" },
      { type: "updateRow", rowId: "r1", field: "caste", value: "यादव" },
    );
    expect(state.draft.rows[0]).toMatchObject({ caste: "यादव", otherName: "" });
  });

  it("keeps district and assembly when starting another booth", () => {
    const state = run(...filled, { type: "markSubmitted" }, { type: "startAnotherBooth", rows: [emptyRow("r2")] });
    expect(state.draft).toMatchObject({ districtId: lucknow.id, assemblyId: central.id, booth: null });
    expect(state.submitted).toBe(false);
  });

  it("loads a saved submission for editing and falls back to one empty row", () => {
    const savedRow = { id: "s1", caste: "यादव", otherName: "", count: "600" };
    const loaded = run({
      type: "loadSubmission",
      districtId: lucknow.id,
      assemblyId: central.id,
      booth,
      rows: [savedRow],
      comment: "पुरानी टिप्पणी",
    });
    expect(loaded.draft).toMatchObject({ booth, rows: [savedRow], comment: "पुरानी टिप्पणी" });

    const fresh = run({ type: "loadSubmission", districtId: lucknow.id, assemblyId: central.id, booth, rows: [], comment: "" });
    expect(fresh.draft.rows).toHaveLength(1);
    expect(fresh.draft.rows[0]).toMatchObject({ caste: "", count: "" });
  });

  it("keeps the submitter across clearing the form, the next booth and editing a saved booth", () => {
    const named: SurveyAction[] = [
      ...filled,
      { type: "setSubmitter", field: "submitterName", value: "राम कुमार" },
      { type: "setSubmitter", field: "submitterPhone", value: "9876543210" },
    ];
    const submitter = { submitterName: "राम कुमार", submitterPhone: "9876543210" };

    expect(run(...named, { type: "reset", rows: [emptyRow("r2")] }).draft).toMatchObject({ booth: null, ...submitter });
    expect(run(...named, { type: "startAnotherBooth", rows: [emptyRow("r2")] }).draft).toMatchObject(submitter);
    const edited = run(...named, {
      type: "loadSubmission",
      districtId: lucknow.id,
      assemblyId: central.id,
      booth,
      rows: [],
      comment: "",
    });
    expect(edited.draft).toMatchObject(submitter);
  });

  it("fills missing submitter fields when restoring an older saved draft", () => {
    const oldDraft = { districtId: "", assemblyId: "", booth: null, rows: [emptyRow("r9")], comment: "" };
    const state = run({ type: "restoreDraft", draft: oldDraft as never });
    expect(state.draft).toMatchObject({ submitterName: "", submitterPhone: "" });
  });
});

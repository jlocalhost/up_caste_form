import { INITIAL_ROW_COUNT, OTHER_CASTE } from "../constants";
import type { Booth, CasteRow, SurveyDraft } from "../types";

export type SurveyState = {
  draft: SurveyDraft;
  /** Errors are revealed only after the first submit attempt. */
  touched: boolean;
  submitted: boolean;
};

export type RowField = "caste" | "otherName" | "count";

export type SurveyAction =
  | { type: "selectDistrict"; districtId: string }
  | { type: "selectAssembly"; assemblyId: string }
  | { type: "selectBooth"; booth: Booth }
  | { type: "updateRow"; rowId: string; field: RowField; value: string }
  | { type: "addRow"; row: CasteRow }
  | { type: "removeRow"; rowId: string }
  | { type: "setComment"; value: string }
  | { type: "markTouched" }
  | { type: "markSubmitted" }
  | { type: "reset"; rows: CasteRow[] }
  | { type: "startAnotherBooth"; rows: CasteRow[] }
  | { type: "restoreDraft"; draft: SurveyDraft };

let idSeed = 0;
/**
 * Unique id for a row added by the user. Call only from event handlers: prerendering
 * forbids Math.random/Date.now. Works on plain-HTTP origins, unlike crypto.randomUUID.
 */
export function createRowId(): string {
  idSeed += 1;
  return `row-${Date.now().toString(36)}-${idSeed}-${Math.random().toString(36).slice(2, 7)}`;
}

export function emptyRow(id: string = createRowId()): CasteRow {
  return { id, caste: "", otherName: "", count: "" };
}

/** Deterministic ids so the initial form renders identically on server and client. */
export function initialRows(): CasteRow[] {
  return Array.from({ length: INITIAL_ROW_COUNT }, (_, index) => emptyRow(`row-initial-${index}`));
}

export function emptyDraft(rows: CasteRow[]): SurveyDraft {
  return { districtId: "", assemblyId: "", booth: null, rows, comment: "" };
}

export function createInitialState(rows: CasteRow[] = initialRows()): SurveyState {
  return { draft: emptyDraft(rows), touched: false, submitted: false };
}

function withDraft(state: SurveyState, patch: Partial<SurveyDraft>): SurveyState {
  return { ...state, draft: { ...state.draft, ...patch } };
}

const clearedArea = { districtId: "", assemblyId: "", booth: null };

export function surveyReducer(state: SurveyState, action: SurveyAction): SurveyState {
  switch (action.type) {
    case "selectDistrict":
      // Picking the same district again keeps the assembly/booth already chosen under it.
      if (action.districtId === state.draft.districtId) return state;
      return withDraft(state, { ...clearedArea, districtId: action.districtId });
    case "selectAssembly":
      if (action.assemblyId === state.draft.assemblyId) return state;
      return withDraft(state, { assemblyId: action.assemblyId, booth: null });
    case "selectBooth":
      return withDraft(state, { booth: action.booth });
    case "updateRow":
      return withDraft(state, {
        rows: state.draft.rows.map((row) => {
          if (row.id !== action.rowId) return row;
          const updated = { ...row, [action.field]: action.value };
          // Drop a stale free-text name once "other" is no longer selected.
          if (action.field === "caste" && action.value !== OTHER_CASTE) updated.otherName = "";
          return updated;
        }),
      });
    case "addRow":
      return withDraft(state, { rows: [...state.draft.rows, action.row] });
    case "removeRow":
      return withDraft(state, { rows: state.draft.rows.filter((row) => row.id !== action.rowId) });
    case "setComment":
      return withDraft(state, { comment: action.value });
    case "markTouched":
      return { ...state, touched: true };
    case "markSubmitted":
      return { ...state, submitted: true };
    case "reset":
      return createInitialState(action.rows);
    case "startAnotherBooth":
      return {
        touched: false,
        submitted: false,
        draft: {
          ...emptyDraft(action.rows),
          districtId: state.draft.districtId,
          assemblyId: state.draft.assemblyId,
        },
      };
    case "restoreDraft":
      return { ...state, draft: action.draft };
  }
}

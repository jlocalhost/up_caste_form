import { useEffect, useRef, type Dispatch } from "react";
import { DRAFT_STORAGE_KEY } from "../constants";
import type { SurveyAction, SurveyState } from "../state/survey-reducer";
import type { SurveyDraft } from "../types";

function readDraft(): SurveyDraft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as SurveyDraft;
    return Array.isArray(draft?.rows) ? draft : null;
  } catch {
    return null;
  }
}

function writeDraft(draft: SurveyDraft | null) {
  try {
    if (draft) window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    else window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode, quota) — the draft simply isn't kept.
  }
}

/**
 * Keeps the in-progress form on the device so a refresh, a closed tab or a dropped
 * connection in the field doesn't lose the worker's entries. Cleared once submitted.
 */
export function useDraftPersistence(state: SurveyState, dispatch: Dispatch<SurveyAction>) {
  const restored = useRef(false);

  useEffect(() => {
    // Restore once; the ref survives StrictMode's effect re-run, which would otherwise
    // read back the blank draft written in between.
    if (restored.current) return;
    const draft = readDraft();
    if (draft) dispatch({ type: "restoreDraft", draft });
    restored.current = true;
  }, [dispatch]);

  useEffect(() => {
    if (!restored.current) return;
    writeDraft(state.submitted ? null : state.draft);
  }, [state.draft, state.submitted]);
}

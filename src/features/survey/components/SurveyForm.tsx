"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { submitSurvey } from "../actions/submit-survey";
import { useBoothSubmission } from "../hooks/use-booth-submission";
import { useBooths } from "../hooks/use-booths";
import { useDraftPersistence } from "../hooks/use-draft-persistence";
import { useOnlineStatus } from "../hooks/use-online-status";
import { useToast } from "../hooks/use-toast";
import { getDeviceId } from "../lib/device-id";
import { coveragePercent, resolveArea, rowsFromCounts, sumCounts } from "../lib/survey-math";
import { isSurveyValid, validateSurvey, type SurveyErrors } from "../lib/validation";
import { createInitialState, createRowId, emptyRow, initialRows, surveyReducer } from "../state/survey-reducer";
import type { Booth, BoothSubmissionResponse, SurveyConfig } from "../types";
import AreaPicker from "./AreaPicker";
import AreaSection, { type PickerKind } from "./AreaSection";
import CasteSection from "./CasteSection";
import ExistingSubmissionNotice from "./ExistingSubmissionNotice";
import LiveSummary from "./LiveSummary";
import SubmissionSummary from "./SubmissionSummary";
import SubmitterSection from "./SubmitterSection";
import { IntroCard, OfflineBanner, SurveyHeader } from "./SurveyIntro";
import ToastMessage from "./ToastMessage";

const hiddenErrors: SurveyErrors = { rows: [] };

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

export default function SurveyForm({ districts, castes }: SurveyConfig) {
  const [state, dispatch] = useReducer(surveyReducer, undefined, () => createInitialState());
  const [picker, setPicker] = useState<PickerKind | null>(null);
  const [isSubmitting, startSubmit] = useTransition();
  const online = useOnlineStatus();
  const { toast, show: showToast, dismiss: dismissToast } = useToast();
  const { status: saved, load: loadSaved } = useBoothSubmission();
  /** Booth whose saved submission currently fills the rows, if any. */
  const rowsFromBooth = useRef<string | null>(null);
  /** Booth requested via /?booth=<id>; it wins over a restored draft's booth. */
  const pendingEdit = useRef<string | null>(null);
  useDraftPersistence(state, dispatch);

  const { draft, touched, submitted } = state;
  const { districtId, assemblyId, booth } = draft;
  const area = useMemo(
    () => resolveArea(districts, { districtId, assemblyId, booth }),
    [districts, districtId, assemblyId, booth],
  );
  const totalVoters = area.booth?.voters ?? 0;
  const entered = sumCounts(draft.rows);
  const coverage = coveragePercent(entered, totalVoters);

  const boothList = useBooths(area.assembly?.id ?? "");

  const errors = useMemo(() => validateSurvey(draft, area), [draft, area]);
  const shownErrors = touched ? errors : hiddenErrors;

  const savedForBooth = saved && saved.boothId === area.booth?.id ? saved : null;
  const checkingSaved = savedForBooth?.status === "loading";
  const isUpdate = savedForBooth?.status === "found";

  const closePicker = useCallback(() => setPicker(null), []);

  /** Fills the form with a booth's saved submission so it can be edited. */
  const applySaved = useCallback(
    (body: BoothSubmissionResponse) => {
      if (!body.submission) return;
      rowsFromBooth.current = body.area.booth.id;
      dispatch({
        type: "loadSubmission",
        ...body.area,
        rows: rowsFromCounts(body.submission.counts, castes, () => createRowId()),
        comment: body.submission.comment,
      });
    },
    [castes],
  );

  // Next.js keeps this page alive (hidden) when navigating away. A finished submission must not
  // greet the worker on return, so start a fresh booth when hidden; unsaved drafts stay intact.
  const submittedRef = useRef(submitted);
  useEffect(() => {
    submittedRef.current = submitted;
  }, [submitted]);
  useLayoutEffect(
    () => () => {
      if (!submittedRef.current) return;
      rowsFromBooth.current = null;
      dispatch({ type: "startAnotherBooth", rows: initialRows() });
    },
    [],
  );

  // A restored draft keeps the worker's unsaved edits; only look up whether the booth was submitted.
  const boothId = area.booth?.id;
  const savedBoothId = saved?.boothId;
  useEffect(() => {
    if (pendingEdit.current) return;
    if (boothId && !submitted && savedBoothId !== boothId) void loadSaved(boothId);
  }, [boothId, savedBoothId, submitted, loadSaved]);

  // Arriving from "my submissions" via /?booth=<id> opens that booth for editing.
  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get("booth");
    if (!target) return;
    window.history.replaceState(null, "", window.location.pathname);
    pendingEdit.current = target;
    void loadSaved(target).then((body) => {
      pendingEdit.current = null;
      if (!body?.submission) return;
      applySaved(body);
      showToast("सबमिशन संपादन के लिए खोला गया", "success");
    });
  }, [loadSaved, applySaved, showToast]);

  const selectDistrict = (districtId: string) => {
    dispatch({ type: "selectDistrict", districtId });
    setPicker(null);
  };

  const selectAssembly = (assemblyId: string) => {
    dispatch({ type: "selectAssembly", assemblyId });
    setPicker(null);
  };

  const selectBooth = async (booth: Booth) => {
    dispatch({ type: "selectBooth", booth });
    setPicker(null);
    showToast(`बूथ मतदाता संख्या ${booth.voters} से भरी गई`, "success");

    const body = await loadSaved(booth.id);
    if (!body) return;
    if (body.submission) {
      applySaved(body);
      showToast("यह बूथ पहले से सबमिट है — पिछला डेटा भरा गया, बदलाव कर सकते हैं", "info");
    } else if (rowsFromBooth.current) {
      // The rows came from another booth's submission; start this booth fresh.
      rowsFromBooth.current = null;
      dispatch({ type: "loadSubmission", ...body.area, rows: [], comment: "" });
    }
  };

  const clearForm = () => {
    rowsFromBooth.current = null;
    dispatch({ type: "reset", rows: initialRows() });
    showToast("फॉर्म साफ़ कर दिया गया");
    scrollToTop();
  };

  const startAnotherBooth = () => {
    rowsFromBooth.current = null;
    dispatch({ type: "startAnotherBooth", rows: initialRows() });
    showToast("अब अगला बूथ चुनें");
    scrollToTop();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    dispatch({ type: "markTouched" });

    if (!online) {
      showToast("इंटरनेट उपलब्ध नहीं है। डेटा सुरक्षित रखें और पुनः प्रयास करें।");
      return;
    }
    if (checkingSaved) {
      showToast("पिछला डेटा जाँचा जा रहा है, कृपया एक क्षण रुकें");
      return;
    }
    if (!isSurveyValid(errors)) {
      showToast("कृपया लाल रंग में दिखी त्रुटियाँ ठीक करें");
      return;
    }

    startSubmit(async () => {
      try {
        const result = await submitSurvey(draft, getDeviceId());
        if (!result.ok) {
          showToast(result.message);
          return;
        }
        dispatch({ type: "markSubmitted" });
        showToast(isUpdate ? "प्रतिक्रिया सफलतापूर्वक अपडेट हुई" : "प्रतिक्रिया सफलतापूर्वक सबमिट हुई", "success");
        scrollToTop();
      } catch {
        showToast("सबमिट नहीं हो सका। आपका डेटा सुरक्षित है, कृपया पुनः प्रयास करें।");
      }
    });
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-slate-50 shadow-2xl shadow-slate-300/40">
        <SurveyHeader
          action={
            <Link
              href="/my-submissions"
              className="rounded-lg border border-white/40 px-2.5 py-1.5 text-xs font-bold whitespace-nowrap text-white hover:bg-white/15"
            >
              मेरे सबमिशन
            </Link>
          }
        />

        <div className={`${submitted ? "mt-3" : "-mt-3"} space-y-4 px-4 pb-6`}>
          {!submitted && <IntroCard />}

          {!online && <OfflineBanner />}

          {submitted ? (
            <SubmissionSummary
              area={area}
              totalVoters={totalVoters}
              entered={entered}
              coverage={coverage}
              rows={draft.rows}
              comment={draft.comment}
              submitterName={draft.submitterName}
              submitterPhone={draft.submitterPhone}
              onStartAnotherBooth={startAnotherBooth}
            />
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <SubmitterSection
                name={draft.submitterName}
                phone={draft.submitterPhone}
                errors={shownErrors}
                onChange={(field, value) => dispatch({ type: "setSubmitter", field, value })}
              />

              <AreaSection area={area} errors={shownErrors} onOpenPicker={setPicker} />

              {savedForBooth && savedForBooth.status !== "none" && <ExistingSubmissionNotice status={savedForBooth} />}

              <CasteSection
                rows={draft.rows}
                castes={castes}
                totalVoters={totalVoters}
                comment={draft.comment}
                errors={shownErrors}
                onRowChange={(rowId, field, value) => dispatch({ type: "updateRow", rowId, field, value })}
                onRowRemove={(rowId) => dispatch({ type: "removeRow", rowId })}
                onRowAdd={() => dispatch({ type: "addRow", row: emptyRow() })}
                onCommentChange={(value) => dispatch({ type: "setComment", value })}
              />

              <LiveSummary
                totalVoters={totalVoters}
                entered={entered}
                coverage={coverage}
                error={shownErrors.overflow ?? shownErrors.minCoverage}
              />

              <div className="grid grid-cols-[0.9fr_1.35fr] gap-3 pt-1">
                <Button variant="secondary" onClick={clearForm} disabled={isSubmitting}>
                  फॉर्म साफ़ करें
                </Button>
                <Button type="submit" disabled={isSubmitting || checkingSaved} aria-busy={isSubmitting}>
                  <Icon name="check" className="size-5" />
                  {isSubmitting ? "सबमिट हो रहा है…" : isUpdate ? "प्रतिक्रिया अपडेट करें" : "प्रतिक्रिया सबमिट करें"}
                </Button>
              </div>
              <p className="text-center text-[11px] leading-5 text-slate-500">
                सबमिट करके आप पुष्टि करते हैं कि यह जानकारी अनुमानित एवं संगठनात्मक उपयोग हेतु है।
              </p>
            </form>
          )}
        </div>
      </div>

      {picker && (
        <AreaPicker
          kind={picker}
          districts={districts}
          area={area}
          boothList={boothList}
          onSelectDistrict={selectDistrict}
          onSelectAssembly={selectAssembly}
          onSelectBooth={selectBooth}
          onClose={closePicker}
        />
      )}

      {toast && <ToastMessage toast={toast} onDismiss={dismissToast} />}
    </main>
  );
}

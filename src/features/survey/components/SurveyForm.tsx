"use client";

import { useCallback, useMemo, useReducer, useState, useTransition, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { submitSurvey } from "../actions/submit-survey";
import { useBooths } from "../hooks/use-booths";
import { useDraftPersistence } from "../hooks/use-draft-persistence";
import { useOnlineStatus } from "../hooks/use-online-status";
import { useToast } from "../hooks/use-toast";
import { coveragePercent, resolveArea, sumCounts } from "../lib/survey-math";
import { isSurveyValid, validateSurvey, type SurveyErrors } from "../lib/validation";
import { createInitialState, emptyRow, initialRows, surveyReducer } from "../state/survey-reducer";
import type { Booth, SurveyConfig } from "../types";
import AreaPicker from "./AreaPicker";
import AreaSection, { type PickerKind } from "./AreaSection";
import CasteSection from "./CasteSection";
import LiveSummary from "./LiveSummary";
import SubmissionSummary from "./SubmissionSummary";
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

  const closePicker = useCallback(() => setPicker(null), []);

  const selectDistrict = (districtId: string) => {
    dispatch({ type: "selectDistrict", districtId });
    setPicker(null);
  };

  const selectAssembly = (assemblyId: string) => {
    dispatch({ type: "selectAssembly", assemblyId });
    setPicker(null);
  };

  const selectBooth = (booth: Booth) => {
    dispatch({ type: "selectBooth", booth });
    setPicker(null);
    showToast(`बूथ मतदाता संख्या ${booth.voters} से भरी गई`, "success");
  };

  const clearForm = () => {
    dispatch({ type: "reset", rows: initialRows() });
    showToast("फॉर्म साफ़ कर दिया गया");
    scrollToTop();
  };

  const startAnotherBooth = () => {
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
    if (!isSurveyValid(errors)) {
      showToast("कृपया लाल रंग में दिखी त्रुटियाँ ठीक करें");
      return;
    }

    startSubmit(async () => {
      try {
        const result = await submitSurvey(draft);
        if (!result.ok) {
          showToast(result.message);
          return;
        }
        dispatch({ type: "markSubmitted" });
        showToast("प्रतिक्रिया सफलतापूर्वक सबमिट हुई", "success");
        scrollToTop();
      } catch {
        showToast("सबमिट नहीं हो सका। आपका डेटा सुरक्षित है, कृपया पुनः प्रयास करें।");
      }
    });
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-slate-50 shadow-2xl shadow-slate-300/40">
        <SurveyHeader />

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
              onStartAnotherBooth={startAnotherBooth}
            />
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <AreaSection
                area={area}
                errors={shownErrors}
                onOpenPicker={setPicker}
              />

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
                overflowError={shownErrors.overflow}
              />

              <div className="grid grid-cols-[0.9fr_1.35fr] gap-3 pt-1">
                <Button variant="secondary" onClick={clearForm} disabled={isSubmitting}>
                  फॉर्म साफ़ करें
                </Button>
                <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
                  <Icon name="check" className="size-5" />
                  {isSubmitting ? "सबमिट हो रहा है…" : "प्रतिक्रिया सबमिट करें"}
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

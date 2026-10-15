"use client";

import Field from "@/components/ui/Field";
import SectionTitle from "@/components/ui/SectionTitle";
import { formatBoothLabel, type ResolvedArea } from "../lib/survey-math";
import type { SurveyErrors } from "../lib/validation";
import PickerTrigger from "./PickerTrigger";

export type PickerKind = "district" | "assembly" | "booth";

type Props = {
  area: ResolvedArea;
  errors: SurveyErrors;
  onOpenPicker: (kind: PickerKind) => void;
};

export default function AreaSection({
  area: { district, assembly, booth },
  errors,
  onOpenPicker,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle number="2" title="क्षेत्र का विवरण" subtitle="पहले जिला, विधानसभा और बूथ चुनें" />
      <div className="space-y-4">
        <Field label="जिला" required error={errors.district}>
          {(control) => (
            <PickerTrigger
              control={control}
              invalid={errors.district}
              value={district?.name}
              placeholder="जिला खोजें या चुनें"
              onOpen={() => onOpenPicker("district")}
            />
          )}
        </Field>

        <Field label="विधानसभा" required error={errors.assembly}>
          {(control) => (
            <PickerTrigger
              control={control}
              invalid={errors.assembly}
              disabled={!district}
              value={assembly?.name}
              placeholder={district ? "विधानसभा खोजें या चुनें" : "पहले जिला चुनें"}
              onOpen={() => onOpenPicker("assembly")}
            />
          )}
        </Field>

        <Field label="बूथ" required error={errors.booth} hint="बूथ चुनने पर मतदाता संख्या स्वतः भर जाएगी">
          {(control) => (
            <PickerTrigger
              control={control}
              invalid={errors.booth}
              disabled={!assembly}
              value={booth && formatBoothLabel(booth)}
              placeholder={assembly ? "बूथ खोजें या चुनें" : "पहले विधानसभा चुनें"}
              onOpen={() => onOpenPicker("booth")}
            />
          )}
        </Field>

        <Field label="कुल मतदाता" required hint="बूथ सूची से स्वतः भरा जाता है · बदला नहीं जा सकता">
          {(control) => (
            <div className="relative">
              <input
                {...control}
                readOnly
                tabIndex={-1}
                value={booth ? String(booth.voters) : ""}
                placeholder="बूथ चुनने पर स्वतः भरेगा"
                className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 pr-20 text-[15px] font-semibold text-slate-600 outline-none placeholder:font-normal placeholder:text-slate-400"
              />
              {booth && (
                <span className="absolute top-3 right-3 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                  प्रीफिल
                </span>
              )}
            </div>
          )}
        </Field>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useState } from "react";
import Field from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import { controlClass } from "@/components/ui/control-class";
import { OTHER_CASTE } from "../constants";
import { formatPercent, parseWholeNumber } from "../lib/survey-math";
import { hasRowError, type RowErrors } from "../lib/validation";
import type { RowField } from "../state/survey-reducer";
import type { CasteRow } from "../types";
import PickerSheet from "./PickerSheet";
import PickerTrigger from "./PickerTrigger";

type Props = {
  index: number;
  row: CasteRow;
  errors: RowErrors;
  castes: string[];
  /** Castes already picked in other rows of this form. */
  usedElsewhere: Set<string>;
  totalVoters: number;
  onChange: (field: RowField, value: string) => void;
  onRemove: () => void;
};

export default function CasteRowCard({
  index,
  row,
  errors,
  castes,
  usedElsewhere,
  totalVoters,
  onChange,
  onRemove,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const closePicker = useCallback(() => setPickerOpen(false), []);
  const percentage = formatPercent(parseWholeNumber(row.count) ?? 0, totalVoters);
  const casteError = errors.caste || errors.duplicate;

  return (
    <article
      className={`rounded-2xl border p-4 transition ${
        hasRowError(errors) ? "border-red-300 bg-red-50/30" : "border-slate-200 bg-slate-50/70"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-slate-200 text-xs font-extrabold text-slate-700">
            {index + 1}
          </span>
          <p className="text-sm font-bold text-slate-800">जाति विवरण</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${index + 1} नंबर पंक्ति हटाएँ`}
          className="flex size-10 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600"
        >
          <Icon name="trash" className="size-5" />
        </button>
      </div>
      <div className="space-y-3">
        <Field label="जाति" error={casteError}>
          {(control) => (
            <PickerTrigger
              control={control}
              invalid={casteError}
              value={row.caste || undefined}
              placeholder="जाति खोजें या चुनें"
              onOpen={() => setPickerOpen(true)}
            />
          )}
        </Field>
        {pickerOpen && (
          <PickerSheet
            title="जाति चुनें"
            subtitle={`जाति विवरण ${index + 1}`}
            searchPlaceholder="जाति खोजें"
            emptyText="कोई जाति नहीं मिली — सूची में न हो तो “अन्य” चुनें"
            options={castes.map((caste) => ({
              id: caste,
              label: caste,
              detail: caste !== OTHER_CASTE && usedElsewhere.has(caste) ? "इस फ़ॉर्म में पहले से जोड़ी गई" : undefined,
            }))}
            selectedId={row.caste}
            onSelect={(caste) => {
              onChange("caste", caste);
              setPickerOpen(false);
            }}
            onClose={closePicker}
          />
        )}
        {row.caste === OTHER_CASTE && (
          <Field label="अन्य जाति का नाम" required error={errors.other}>
            {(control) => (
              <input
                {...control}
                value={row.otherName}
                onChange={(e) => onChange("otherName", e.target.value)}
                placeholder="जाति का नाम लिखें"
                maxLength={60}
                className={controlClass(errors.other)}
              />
            )}
          </Field>
        )}
        <div className="grid grid-cols-[1fr_96px] gap-3">
          <Field label="संख्या" error={errors.count}>
            {(control) => (
              <input
                {...control}
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={row.count}
                onChange={(e) => onChange("count", e.target.value)}
                placeholder="0"
                className={controlClass(errors.count)}
              />
            )}
          </Field>
          <Field label="प्रतिशत">
            <div className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-extrabold text-orange-700">
              {percentage}%
            </div>
          </Field>
        </div>
      </div>
    </article>
  );
}

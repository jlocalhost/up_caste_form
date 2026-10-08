"use client";

import Field from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import { controlClass } from "@/components/ui/control-class";
import { OTHER_CASTE } from "../constants";
import { formatPercent, parseWholeNumber } from "../lib/survey-math";
import { hasRowError, type RowErrors } from "../lib/validation";
import type { RowField } from "../state/survey-reducer";
import type { CasteRow } from "../types";

type Props = {
  index: number;
  row: CasteRow;
  errors: RowErrors;
  castes: string[];
  totalVoters: number;
  onChange: (field: RowField, value: string) => void;
  onRemove: () => void;
};

export default function CasteRowCard({ index, row, errors, castes, totalVoters, onChange, onRemove }: Props) {
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
            <div className="relative">
              <select
                {...control}
                value={row.caste}
                onChange={(e) => onChange("caste", e.target.value)}
                className={`${controlClass(casteError)} appearance-none pr-10`}
              >
                <option value="">जाति चुनें</option>
                {castes.map((caste) => (
                  <option key={caste}>{caste}</option>
                ))}
              </select>
              <Icon name="chevron" className="pointer-events-none absolute top-3.5 right-3.5 size-5 text-slate-400" />
            </div>
          )}
        </Field>
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

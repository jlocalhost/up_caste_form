"use client";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import SectionTitle from "@/components/ui/SectionTitle";
import { controlClass } from "@/components/ui/control-class";
import type { SurveyErrors } from "../lib/validation";
import type { RowField } from "../state/survey-reducer";
import type { CasteRow } from "../types";
import CasteRowCard from "./CasteRowCard";

type Props = {
  rows: CasteRow[];
  castes: string[];
  totalVoters: number;
  comment: string;
  errors: SurveyErrors;
  onRowChange: (rowId: string, field: RowField, value: string) => void;
  onRowRemove: (rowId: string) => void;
  onRowAdd: () => void;
  onCommentChange: (value: string) => void;
};

export default function CasteSection({
  rows,
  castes,
  totalVoters,
  comment,
  errors,
  onRowChange,
  onRowRemove,
  onRowAdd,
  onCommentChange,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="px-1">
        <SectionTitle number="2" title="जातिवार अनुमान" subtitle="बूथ के अनुमानित सामाजिक समूह दर्ज करें" />
      </div>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <CasteRowCard
            key={row.id}
            index={index}
            row={row}
            errors={errors.rows[index] ?? {}}
            castes={castes}
            usedElsewhere={new Set(rows.filter((other) => other.id !== row.id && other.caste).map((other) => other.caste))}
            totalVoters={totalVoters}
            onChange={(field, value) => onRowChange(row.id, field, value)}
            onRemove={() => onRowRemove(row.id)}
          />
        ))}
      </div>
      <Button variant="ghost" onClick={onRowAdd} className="mt-4 w-full">
        <Icon name="plus" className="size-5" /> जाति जोड़ें
      </Button>
      {errors.noCaste && (
        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
          <Icon name="info" className="size-3.5" />
          {errors.noCaste}
        </p>
      )}
      <div className="mt-5 border-t border-slate-200 pt-5">
        <Field label="टिप्पणी (वैकल्पिक)" hint="पूरे जातिवार अनुमान से जुड़ी कोई अतिरिक्त जानकारी लिखें">
          {(control) => (
            <textarea
              {...control}
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="संक्षिप्त टिप्पणी लिखें"
              className={`${controlClass()} h-auto min-h-24 resize-none py-3`}
            />
          )}
        </Field>
      </div>
    </section>
  );
}

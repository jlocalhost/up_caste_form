"use client";

import Field from "@/components/ui/Field";
import SectionTitle from "@/components/ui/SectionTitle";
import { controlClass } from "@/components/ui/control-class";
import { normalizePhone, SUBMITTER_NAME_MAX } from "../lib/submitter";
import type { SurveyErrors } from "../lib/validation";
import type { SubmitterField } from "../state/survey-reducer";

type Props = {
  name: string;
  phone: string;
  errors: SurveyErrors;
  onChange: (field: SubmitterField, value: string) => void;
};

export default function SubmitterSection({ name, phone, errors, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle number="1" title="आपका विवरण" subtitle="फ़ॉर्म भरने वाले का नाम और मोबाइल नंबर · अगले बूथ के लिए याद रहेगा" />
      <div className="space-y-4">
        <Field label="नाम" required error={errors.submitterName}>
          {(control) => (
            <input
              {...control}
              value={name}
              onChange={(e) => onChange("submitterName", e.target.value)}
              autoComplete="name"
              maxLength={SUBMITTER_NAME_MAX}
              placeholder="अपना पूरा नाम लिखें"
              className={controlClass(errors.submitterName)}
            />
          )}
        </Field>

        <Field label="मोबाइल नंबर" required error={errors.submitterPhone} hint="10 अंकों का मोबाइल नंबर">
          {(control) => (
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[15px] font-semibold text-slate-500"
              >
                +91
              </span>
              <input
                {...control}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => onChange("submitterPhone", normalizePhone(e.target.value))}
                placeholder="98765 43210"
                className={`${controlClass(errors.submitterPhone)} pl-13 tracking-wide`}
              />
            </div>
          )}
        </Field>
      </div>
    </section>
  );
}

import Link from "next/link";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { formatPhone } from "../lib/submitter";
import { casteLabel, formatBoothLabel, formatPercent, parseWholeNumber, type ResolvedArea } from "../lib/survey-math";
import type { CasteRow } from "../types";

type Props = {
  area: ResolvedArea;
  totalVoters: number;
  entered: number;
  coverage: number;
  rows: CasteRow[];
  comment: string;
  submitterName: string;
  submitterPhone: string;
  onStartAnotherBooth: () => void;
};

export default function SubmissionSummary({
  area: { district, assembly, booth },
  totalVoters,
  entered,
  coverage,
  rows,
  comment,
  submitterName,
  submitterPhone,
  onStartAnotherBooth,
}: Props) {
  const filledRows = rows.filter((row) => row.caste && parseWholeNumber(row.count));

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
      <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Icon name="check" />
      </span>
      <div className="text-center">
        <p className="mt-3 text-lg font-extrabold text-emerald-950">प्रतिक्रिया दर्ज हो गई</p>
        <p className="mt-1 text-xs leading-5 text-emerald-800">
          बूथ {booth?.number} का सामाजिक संरचना अनुमान सफलतापूर्वक सुरक्षित किया गया।
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-extrabold text-slate-900">भरे गए विवरण का सारांश</p>
          <span className="rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">सबमिटेड</span>
        </div>
        <dl className="space-y-2.5 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">जिला</dt>
            <dd className="text-right font-bold text-slate-800">{district?.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">विधानसभा</dt>
            <dd className="text-right font-bold text-slate-800">{assembly?.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="shrink-0 text-slate-500">बूथ</dt>
            <dd className="text-right leading-5 font-bold text-slate-800">{booth && formatBoothLabel(booth)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="shrink-0 text-slate-500">भरने वाला</dt>
            <dd className="text-right leading-5 font-bold text-slate-800">
              {submitterName} · +91 {formatPhone(submitterPhone)}
            </dd>
          </div>
        </dl>
        <div className="my-4 h-px bg-slate-200" />
        <div className="grid grid-cols-3 text-center">
          <div>
            <p className="text-lg font-black text-slate-900">{totalVoters}</p>
            <p className="text-[10px] text-slate-500">कुल मतदाता</p>
          </div>
          <div className="border-x border-slate-200">
            <p className="text-lg font-black text-orange-700">{entered}</p>
            <p className="text-[10px] text-slate-500">दर्ज संख्या</p>
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">{coverage.toFixed(1)}%</p>
            <p className="text-[10px] text-slate-500">कवरेज</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-bold text-slate-600">जातिवार विवरण</p>
        {filledRows.map((row) => {
          const count = parseWholeNumber(row.count) ?? 0;
          return (
            <div
              key={row.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-xs"
            >
              <span className="font-semibold text-slate-700">{casteLabel(row)}</span>
              <span className="font-extrabold text-slate-900">
                {count}{" "}
                <span className="font-medium text-slate-400">({formatPercent(count, totalVoters)}%)</span>
              </span>
            </div>
          );
        })}
      </div>

      {comment && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">टिप्पणी</p>
          <p className="mt-1 text-xs leading-5 whitespace-pre-line text-slate-700">{comment}</p>
        </div>
      )}

      <Button onClick={onStartAnotherBooth} className="mt-5 w-full">
        <Icon name="plus" className="size-5" /> दूसरे बूथ का जातिगत सर्वेक्षण भरें
      </Button>
      <p className="mt-2 text-center text-[11px] leading-5 text-slate-500">
        जिला और विधानसभा वही रहेंगे, केवल नया बूथ चुनना होगा।
      </p>
      <Link
        href="/my-submissions"
        className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50"
      >
        मेरे सबमिशन देखें
      </Link>
    </section>
  );
}

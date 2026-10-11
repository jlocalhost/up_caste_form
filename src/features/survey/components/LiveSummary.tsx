import Icon from "@/components/ui/Icon";
import { MIN_COVERAGE_PERCENT } from "../constants";
import { minimumEntered } from "../lib/validation";

type Props = {
  totalVoters: number;
  entered: number;
  coverage: number;
  /** Overflow or minimum-coverage error, already gated on the first submit attempt. */
  error?: string;
};

export default function LiveSummary({ totalVoters, entered, coverage, error }: Props) {
  const remaining = totalVoters - entered;
  const overflowing = totalVoters > 0 && entered > totalVoters;
  const needed = minimumEntered(totalVoters);
  const metMinimum = totalVoters > 0 && entered >= needed && !overflowing;

  return (
    <section
      aria-label="लाइव सारांश"
      className={`rounded-2xl border bg-white p-5 shadow-sm ${overflowing || error ? "border-red-300" : "border-slate-200"}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-extrabold text-slate-900">लाइव सारांश</p>
          <p className="mt-0.5 text-xs text-slate-500">आपकी प्रविष्टियों का कवरेज</p>
        </div>
        <span className="rounded-lg bg-orange-50 px-2.5 py-1.5 text-sm font-extrabold text-orange-700">
          {coverage.toFixed(1)}%
        </span>
      </div>
      <div className="relative">
        <div
          className="h-2.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(coverage)}
          aria-label="कवरेज"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overflowing ? "bg-red-500" : metMinimum ? "bg-emerald-500" : "bg-orange-500"
            }`}
            style={{ width: `${coverage}%` }}
          />
        </div>
        <span
          aria-hidden="true"
          className="absolute -top-1 h-4.5 w-0.5 -translate-x-1/2 rounded-full bg-slate-500"
          style={{ left: `${MIN_COVERAGE_PERCENT}%` }}
        />
      </div>
      <p className={`mt-2 flex items-center gap-1 text-[11px] ${metMinimum ? "text-emerald-700" : "text-slate-500"}`}>
        {metMinimum && <Icon name="check" className="size-3.5" />}
        न्यूनतम {MIN_COVERAGE_PERCENT}% कवरेज आवश्यक
        {totalVoters > 0 && ` (कम से कम ${needed} मतदाता)`}
      </p>
      <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 text-center">
        <div>
          <p className="text-lg font-black text-slate-900">{totalVoters || "—"}</p>
          <p className="text-[11px] text-slate-500">कुल मतदाता</p>
        </div>
        <div>
          <p className="text-lg font-black text-orange-700">{entered}</p>
          <p className="text-[11px] text-slate-500">दर्ज संख्या</p>
        </div>
        <div>
          <p className={`text-lg font-black ${remaining < 0 ? "text-red-600" : "text-slate-900"}`}>
            {totalVoters ? remaining : "—"}
          </p>
          <p className="text-[11px] text-slate-500">शेष</p>
        </div>
      </div>
      {error && (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700">
          <Icon name="info" className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </section>
  );
}

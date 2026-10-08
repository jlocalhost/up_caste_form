import Icon from "@/components/ui/Icon";

type Props = {
  totalVoters: number;
  entered: number;
  coverage: number;
  overflowError?: string;
};

export default function LiveSummary({ totalVoters, entered, coverage, overflowError }: Props) {
  const remaining = totalVoters - entered;
  const overflowing = totalVoters > 0 && entered > totalVoters;

  return (
    <section
      aria-label="लाइव सारांश"
      className={`rounded-2xl border bg-white p-5 shadow-sm ${overflowing ? "border-red-300" : "border-slate-200"}`}
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
      <div
        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(coverage)}
        aria-label="कवरेज"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${overflowing ? "bg-red-500" : "bg-orange-500"}`}
          style={{ width: `${coverage}%` }}
        />
      </div>
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
      {overflowError && (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700">
          <Icon name="info" className="size-4 shrink-0" />
          {overflowError}
        </p>
      )}
    </section>
  );
}

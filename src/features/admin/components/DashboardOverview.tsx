import Link from "next/link";
import type { ReactNode } from "react";
import type { AdminOverview } from "../data/overview-repository";
import ExpandableList from "./ExpandableList";

const num = new Intl.NumberFormat("en-IN");
const dateTime = new Intl.DateTimeFormat("hi-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

const pct = (part: number, whole: number) => (whole ? (part / whole) * 100 : 0);
const fmtPct = (value: number) => `${value.toFixed(1)}%`;

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** KPI tile: "covered / total" headline, optional coverage meter and a one-line note. */
function StatTile({
  label,
  value,
  total,
  percent,
  note,
  className = "",
}: {
  label: string;
  value: number;
  total?: number;
  percent?: number;
  note?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black tracking-tight text-slate-950 tabular-nums">
        {num.format(value)}
        {total !== undefined && <span className="text-base font-bold text-slate-400"> / {num.format(total)}</span>}
      </p>
      {percent !== undefined && (
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
          role="meter"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
        >
          <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(percent, 100)}%` }} />
        </div>
      )}
      {note && <p className="mt-1.5 text-xs text-slate-500">{note}</p>}
    </div>
  );
}

/** One horizontal bar: single series, single hue; value is always printed beside it. */
function BarRow({ label, value, percent, detail }: { label: string; value: string; percent: number; detail: string }) {
  return (
    <li className="group" title={`${label}: ${detail}`}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate font-semibold text-slate-700">{label}</span>
        <span className="shrink-0 font-bold text-slate-900 tabular-nums">
          {value} <span className="font-medium text-slate-500">({fmtPct(percent)})</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-orange-500 transition-colors group-hover:bg-orange-600"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </li>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">{children}</p>;
}

export default function DashboardOverview({ data }: { data: AdminOverview }) {
  const { totals, districts, castes, recent } = data;

  if (totals.booths === 0) {
    return (
      <Card title="अभी कोई बूथ डेटा नहीं है">
        <p className="text-sm text-slate-600">शुरू करने के लिए बूथ मास्टर सूची की CSV अपलोड करें।</p>
        <Link
          href="/admin/upload"
          className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-orange-600 px-4 text-sm font-bold text-white hover:bg-orange-700"
        >
          CSV अपलोड करें
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile
          label="जिले (कवर / कुल)"
          value={totals.coveredDistricts}
          total={totals.districts}
          percent={pct(totals.coveredDistricts, totals.districts)}
          note={`${fmtPct(pct(totals.coveredDistricts, totals.districts))} कवर`}
        />
        <StatTile
          label="विधानसभा (कवर / कुल)"
          value={totals.coveredAssemblies}
          total={totals.assemblies}
          percent={pct(totals.coveredAssemblies, totals.assemblies)}
          note={`${fmtPct(pct(totals.coveredAssemblies, totals.assemblies))} कवर`}
        />
        <StatTile
          label="बूथ (कवर / कुल)"
          value={totals.surveyedBooths}
          total={totals.booths}
          percent={pct(totals.surveyedBooths, totals.booths)}
          note={`${fmtPct(pct(totals.surveyedBooths, totals.booths))} कवर`}
        />
        <StatTile
          label="मतदाता (दर्ज / कुल)"
          value={totals.enteredCount}
          total={totals.listedVoters}
          percent={pct(totals.enteredCount, totals.listedVoters)}
          note={`सर्वे वाले बूथों में कुल: ${num.format(totals.surveyedVoters)}`}
        />
        <StatTile
          label="कुल सबमिशन"
          value={totals.surveyedBooths}
          note={
            totals.lastSubmissionAt
              ? `${num.format(totals.resubmissions)} बार दोबारा भरे · अंतिम ${dateTime.format(new Date(totals.lastSubmissionAt))}`
              : "अभी कोई सबमिशन नहीं"
          }
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="जिलेवार प्रगति" subtitle="सर्वे पूरे / कुल बूथ">
          <ExpandableList>
            {districts.map((d) => (
              <BarRow
                key={d.name}
                label={d.name}
                value={`${num.format(d.surveyedBooths)} / ${num.format(d.booths)}`}
                percent={pct(d.surveyedBooths, d.booths)}
                detail={`${d.booths} में से ${d.surveyedBooths} बूथ सर्वे हुए, ${num.format(d.listedVoters)} सूचीबद्ध मतदाता`}
              />
            ))}
          </ExpandableList>
        </Card>

        <Card title="जातिवार अनुमान" subtitle="सभी सर्वे किए गए बूथों का योग · कुल दर्ज संख्या में हिस्सा">
          {castes.length ? (
            <ExpandableList>
              {castes.map((c) => (
                <BarRow
                  key={c.caste}
                  label={c.caste}
                  value={num.format(c.count)}
                  percent={pct(c.count, totals.enteredCount)}
                  detail={`${num.format(c.count)} मतदाता, ${c.booths} बूथ में दर्ज`}
                />
              ))}
            </ExpandableList>
          ) : (
            <EmptyNote>अभी तक कोई सर्वे सबमिट नहीं हुआ है।</EmptyNote>
          )}
        </Card>
      </div>

      <Card title="हाल के सबमिशन" subtitle="नवीनतम 10">
        {recent.length ? (
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-3 font-semibold">बूथ</th>
                  <th className="py-2 pr-3 font-semibold">विधानसभा</th>
                  <th className="py-2 pr-3 font-semibold">जिला</th>
                  <th className="py-2 pr-3 text-right font-semibold">दर्ज / कुल</th>
                  <th className="py-2 text-right font-semibold">समय</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={`${r.district}-${r.assembly}-${r.boothNumber}`} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="font-bold text-slate-900">{r.boothNumber}</span>{" "}
                      <span className="text-slate-600">· {r.boothName}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-slate-700">{r.assembly}</td>
                    <td className="py-2.5 pr-3 text-slate-700">{r.district}</td>
                    <td className="py-2.5 pr-3 text-right font-semibold text-slate-900 tabular-nums">
                      {num.format(r.entered)} / {num.format(r.totalVoters)}
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap text-slate-500">
                      {dateTime.format(new Date(r.updatedAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyNote>अभी तक कोई सर्वे सबमिट नहीं हुआ है।</EmptyNote>
        )}
      </Card>
    </div>
  );
}

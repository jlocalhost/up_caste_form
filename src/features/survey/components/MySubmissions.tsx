"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { controlClass } from "@/components/ui/control-class";
import { DEVICE_ID_HEADER, getDeviceId } from "../lib/device-id";
import { formatCount, formatDateTime, matchesSearch } from "../lib/format";
import { formatBoothLabel, formatPercent } from "../lib/survey-math";
import type { DeviceSubmission } from "../types";
import { SurveyHeader } from "./SurveyIntro";

type ListState =
  | { status: "loading" }
  | { status: "no-device" }
  | { status: "failed" }
  | { status: "ready"; items: DeviceSubmission[] };

const actionLinkClass =
  "flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition";

function SubmissionCard({ item }: { item: DeviceSubmission }) {
  const coverage = formatPercent(item.entered, item.booth.voters);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm leading-5 font-extrabold text-slate-900">{formatBoothLabel(item.booth)}</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {item.district.name} · {item.assembly.name}
          </p>
        </div>
        {item.revision > 1 && (
          <span className="shrink-0 rounded-md bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700">
            {item.revision - 1} बार अपडेट
          </span>
        )}
      </div>

      <dl className="mt-3 grid grid-cols-3 rounded-xl bg-slate-50 py-2.5 text-center">
        <div>
          <dd className="text-base font-black text-slate-900 tabular-nums">{formatCount(item.booth.voters)}</dd>
          <dt className="text-[10px] text-slate-500">कुल मतदाता</dt>
        </div>
        <div className="border-x border-slate-200">
          <dd className="text-base font-black text-orange-700 tabular-nums">{formatCount(item.entered)}</dd>
          <dt className="text-[10px] text-slate-500">दर्ज संख्या</dt>
        </div>
        <div>
          <dd className="text-base font-black text-slate-900 tabular-nums">{coverage}%</dd>
          <dt className="text-[10px] text-slate-500">कवरेज</dt>
        </div>
      </dl>

      <ul className="mt-3 space-y-1.5 text-xs">
        {item.counts.map((c) => (
          <li key={c.caste} className="flex items-center justify-between gap-3">
            <span className="font-semibold text-slate-700">{c.caste}</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatCount(c.count)}{" "}
              <span className="font-medium text-slate-400">({formatPercent(c.count, item.booth.voters)}%)</span>
            </span>
          </li>
        ))}
      </ul>

      {item.comment && (
        <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs leading-5 whitespace-pre-line text-slate-700">
          {item.comment}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <p className="text-[11px] text-slate-500">अंतिम अपडेट: {formatDateTime(item.updatedAt)}</p>
        <Link
          href={`/?booth=${item.booth.id}`}
          className={`${actionLinkClass} border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100`}
        >
          संपादित करें
        </Link>
      </div>
    </article>
  );
}

function Notice({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <p className="font-extrabold text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </section>
  );
}

/** Lists the surveys submitted from this browser, each with a link to edit it. */
export default function MySubmissions() {
  const [state, setState] = useState<ListState>({ status: "loading" });
  const [search, setSearch] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const deviceId = getDeviceId();
    const controller = new AbortController();
    const load = async () => {
      if (!deviceId) return setState({ status: "no-device" });
      try {
        const res = await fetch("/api/my-submissions", {
          headers: { [DEVICE_ID_HEADER]: deviceId },
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setState({ status: "ready", items: (await res.json()) as DeviceSubmission[] });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to load my submissions", error);
        setState({ status: "failed" });
      }
    };
    void load();
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  const items = state.status === "ready" ? state.items : [];
  const visible = items.filter((item) =>
    matchesSearch(`${formatBoothLabel(item.booth)} ${item.assembly.name} ${item.district.name}`, search),
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-slate-50 shadow-2xl shadow-slate-300/40">
        <SurveyHeader
          action={
            <Link
              href="/"
              className="rounded-lg border border-white/40 px-2.5 py-1.5 text-xs font-bold whitespace-nowrap text-white hover:bg-white/15"
            >
              + नया फॉर्म
            </Link>
          }
        />

        <div className="-mt-3 space-y-4 px-4 pb-6">
          <section className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h1 className="text-xl font-black tracking-tight text-slate-950">मेरे सबमिशन</h1>
            {state.status === "ready" && (
              <p className="mt-1 text-xs leading-5 text-slate-500">कुल {formatCount(items.length)} बूथ</p>
            )}
            {items.length > 0 && (
              <div className="relative mt-4">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="बूथ, विधानसभा या जिला खोजें"
                  aria-label="बूथ, विधानसभा या जिला खोजें"
                  className={`${controlClass()} pl-11`}
                />
                <Icon name="search" className="absolute top-3.5 left-3.5 size-5 text-slate-400" />
              </div>
            )}
          </section>

          {state.status === "loading" && (
            <div className="space-y-3" aria-busy="true" aria-label="लोड हो रहा है">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          )}

          {state.status === "failed" && (
            <Notice
              title="सूची लोड नहीं हो सकी"
              body="इंटरनेट जाँचें और पुनः प्रयास करें।"
              action={
                <button
                  type="button"
                  onClick={retry}
                  className={`${actionLinkClass} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
                >
                  पुनः प्रयास करें
                </button>
              }
            />
          )}

          {state.status === "no-device" && (
            <Notice
              title="सूची उपलब्ध नहीं"
              body="इस ब्राउज़र में स्टोरेज बंद है, इसलिए यहाँ से भरे गए बूथ याद नहीं रखे जा सकते।"
            />
          )}

          {state.status === "ready" && items.length === 0 && (
            <Notice
              title="अभी कोई सबमिशन नहीं"
              body="इस फ़ोन/ब्राउज़र से अभी तक कोई बूथ सबमिट नहीं हुआ है।"
              action={
                <Link href="/" className={`${actionLinkClass} bg-orange-600 text-white hover:bg-orange-700`}>
                  फॉर्म भरें
                </Link>
              }
            />
          )}

          {state.status === "ready" && items.length > 0 && visible.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">कोई बूथ नहीं मिला</p>
          )}

          {visible.map((item) => (
            <SubmissionCard key={item.booth.id} item={item} />
          ))}

          {state.status === "ready" && items.length > 0 && (
            <p className="text-center text-[11px] leading-5 text-slate-500">
              यह सूची इसी फ़ोन/ब्राउज़र से जुड़ी है। ब्राउज़र डेटा साफ़ करने या दूसरे डिवाइस पर यह सूची नहीं दिखेगी।
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

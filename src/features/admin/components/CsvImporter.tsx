"use client";

import Link from "next/link";
import Papa from "papaparse";
import { useRef, useState, type DragEvent } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { importBoothsChunk } from "../import/actions";
import {
  canonicalHeader,
  chunk,
  MAX_CHUNK_ROWS,
  validateBoothRecords,
  type BoothCsvResult,
} from "../import/booth-csv";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const ISSUE_PREVIEW = 20;
const num = new Intl.NumberFormat("en-IN");

const TEMPLATE =
  "district,assembly,booth_number,booth_name,voters\n" +
  "लखनऊ,लखनऊ मध्य,159,\"प्राथमिक विद्यालय, हुसैनगंज\",864\n";

type Phase =
  | { kind: "idle"; error?: string }
  | { kind: "parsing"; fileName: string }
  | { kind: "parsed"; fileName: string; result: BoothCsvResult }
  | { kind: "importing"; fileName: string; done: number; total: number }
  | { kind: "done"; fileName: string; received: number; inserted: number; updated: number; error?: string };

function downloadTemplate() {
  // BOM so Excel opens the Devanagari text correctly.
  const blob = new Blob(["﻿" + TEMPLATE], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: "booth-template.csv" });
  link.click();
  URL.revokeObjectURL(url);
}

export default function CsvImporter() {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPhase({ kind: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  };

  const readFile = (file: File | undefined) => {
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) return setPhase({ kind: "idle", error: "केवल .csv फ़ाइल चुनें" });
    if (file.size > MAX_FILE_BYTES) return setPhase({ kind: "idle", error: "फ़ाइल 25 MB से बड़ी है" });

    setPhase({ kind: "parsing", fileName: file.name });
    Papa.parse<Record<string, string>>(file, {
      header: true,
      transformHeader: canonicalHeader,
      complete: ({ data, meta }) =>
        setPhase({ kind: "parsed", fileName: file.name, result: validateBoothRecords(meta.fields ?? [], data) }),
      error: () => setPhase({ kind: "idle", error: "फ़ाइल पढ़ी नहीं जा सकी" }),
    });
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    readFile(event.dataTransfer.files[0]);
  };

  const startImport = async (fileName: string, result: BoothCsvResult) => {
    const batches = chunk(result.rows, MAX_CHUNK_ROWS);
    const totals = { received: 0, inserted: 0, updated: 0 };
    setPhase({ kind: "importing", fileName, done: 0, total: result.rows.length });

    for (const batch of batches) {
      let response;
      try {
        response = await importBoothsChunk(batch);
      } catch {
        response = { ok: false as const, message: "सर्वर से संपर्क नहीं हो सका" };
      }
      if (!response.ok) {
        return setPhase({ kind: "done", fileName, ...totals, error: response.message });
      }
      totals.received += response.received;
      totals.inserted += response.inserted;
      totals.updated += response.updated;
      setPhase({ kind: "importing", fileName, done: totals.received, total: result.rows.length });
    }
    setPhase({ kind: "done", fileName, ...totals });
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">बूथ मास्टर सूची अपलोड करें</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              कॉलम: <code className="rounded bg-slate-100 px-1">district</code>,{" "}
              <code className="rounded bg-slate-100 px-1">assembly</code>,{" "}
              <code className="rounded bg-slate-100 px-1">booth_number</code>,{" "}
              <code className="rounded bg-slate-100 px-1">booth_name</code>,{" "}
              <code className="rounded bg-slate-100 px-1">voters</code> (हिंदी हेडर भी चलेंगे)। पहले से मौजूद बूथ
              (जिला + विधानसभा + बूथ संख्या) अपडेट होंगे, नए जुड़ेंगे — कुछ भी डिलीट नहीं होगा।
            </p>
          </div>
          <Button variant="secondary" onClick={downloadTemplate}>
            टेम्पलेट डाउनलोड करें
          </Button>
        </div>

        {(phase.kind === "idle" || phase.kind === "parsing") && (
          <>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${
                dragging ? "border-orange-500 bg-orange-50" : "border-slate-300 bg-slate-50 hover:border-orange-400"
              }`}
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                <Icon name="plus" />
              </span>
              <span className="mt-3 text-sm font-bold text-slate-800">
                {phase.kind === "parsing" ? `${phase.fileName} पढ़ी जा रही है…` : "CSV फ़ाइल यहाँ छोड़ें या चुनें"}
              </span>
              <span className="mt-1 text-xs text-slate-500">अधिकतम 25 MB</span>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                disabled={phase.kind === "parsing"}
                onChange={(e) => readFile(e.target.files?.[0])}
              />
            </label>
            {phase.kind === "idle" && phase.error && (
              <p role="alert" className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-red-600">
                <Icon name="info" className="size-4" />
                {phase.error}
              </p>
            )}
          </>
        )}
      </section>

      {phase.kind === "parsed" && <Preview phase={phase} onImport={startImport} onCancel={reset} />}

      {phase.kind === "importing" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-live="polite">
          <p className="text-sm font-bold text-slate-900">
            इम्पोर्ट हो रहा है… {num.format(phase.done)} / {num.format(phase.total)}
          </p>
          <div
            className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={phase.total}
            aria-valuenow={phase.done}
            aria-label="इम्पोर्ट प्रगति"
          >
            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{ width: `${(phase.done / phase.total) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">यह पेज बंद न करें।</p>
        </section>
      )}

      {phase.kind === "done" && (
        <section
          className={`rounded-2xl border bg-white p-5 shadow-sm ${phase.error ? "border-red-200" : "border-emerald-200"}`}
          role="status"
        >
          <p className={`text-base font-extrabold ${phase.error ? "text-red-700" : "text-emerald-800"}`}>
            {phase.error ? `इम्पोर्ट बीच में रुका: ${phase.error}` : "इम्पोर्ट पूरा हुआ"}
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              ["प्रोसेस हुए", phase.received],
              ["नए जुड़े", phase.inserted],
              ["अपडेट हुए", phase.updated],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col-reverse rounded-xl bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="text-xl font-black text-slate-900 tabular-nums">{num.format(Number(value))}</dd>
              </div>
            ))}
          </dl>
          {phase.error && (
            <p className="mt-3 text-xs text-slate-600">
              जो पंक्तियाँ सहेजी जा चुकी हैं वे सुरक्षित हैं। वही फ़ाइल दोबारा अपलोड करना सुरक्षित है।
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="inline-flex min-h-12 items-center rounded-xl bg-orange-600 px-4 text-sm font-bold text-white hover:bg-orange-700"
            >
              डैशबोर्ड देखें
            </Link>
            <Button variant="secondary" onClick={reset}>
              नई फ़ाइल
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function Preview({
  phase,
  onImport,
  onCancel,
}: {
  phase: Extract<Phase, { kind: "parsed" }>;
  onImport: (fileName: string, result: BoothCsvResult) => void;
  onCancel: () => void;
}) {
  const { result, fileName } = phase;

  if (result.missingColumns.length) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm" role="alert">
        <p className="font-extrabold text-red-700">ज़रूरी कॉलम नहीं मिले: {result.missingColumns.join(", ")}</p>
        <p className="mt-1 text-sm text-slate-600">टेम्पलेट डाउनलोड करके उसी फ़ॉर्मेट में फ़ाइल बनाएँ।</p>
        <Button variant="secondary" onClick={onCancel} className="mt-4">
          दूसरी फ़ाइल चुनें
        </Button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{fileName}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-xl font-black text-emerald-800 tabular-nums">{num.format(result.rows.length)}</p>
          <p className="text-xs text-emerald-700">मान्य बूथ</p>
        </div>
        <div className={`rounded-xl p-3 ${result.issues.length ? "bg-red-50" : "bg-slate-50"}`}>
          <p className={`text-xl font-black tabular-nums ${result.issues.length ? "text-red-700" : "text-slate-900"}`}>
            {num.format(result.issues.length)}
          </p>
          <p className="text-xs text-slate-600">त्रुटि वाली पंक्तियाँ (छोड़ दी जाएँगी)</p>
        </div>
      </div>

      {result.issues.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold text-slate-600">त्रुटियाँ</p>
          <ul className="mt-2 max-h-56 space-y-1 overflow-auto rounded-xl border border-red-100 bg-red-50/40 p-3 text-xs">
            {result.issues.slice(0, ISSUE_PREVIEW).map((issue) => (
              <li key={issue.line} className="text-red-800">
                <span className="font-bold">पंक्ति {issue.line}:</span> {issue.message}
              </li>
            ))}
            {result.issues.length > ISSUE_PREVIEW && (
              <li className="text-slate-500">…और {num.format(result.issues.length - ISSUE_PREVIEW)}</li>
            )}
          </ul>
        </div>
      )}

      {result.rows.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold text-slate-600">पूर्वावलोकन (पहली 5 पंक्तियाँ)</p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-140 text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-3 font-semibold">जिला</th>
                  <th className="py-2 pr-3 font-semibold">विधानसभा</th>
                  <th className="py-2 pr-3 font-semibold">बूथ</th>
                  <th className="py-2 text-right font-semibold">मतदाता</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.slice(0, 5).map((row) => (
                  <tr key={`${row.district}-${row.assembly}-${row.booth_number}`} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{row.district}</td>
                    <td className="py-2 pr-3">{row.assembly}</td>
                    <td className="py-2 pr-3">
                      {row.booth_number} · {row.booth_name}
                    </td>
                    <td className="py-2 text-right tabular-nums">{num.format(row.voters)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={() => onImport(fileName, result)} disabled={!result.rows.length}>
          <Icon name="check" className="size-5" />
          {num.format(result.rows.length)} बूथ इम्पोर्ट करें
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          रद्द करें
        </Button>
      </div>
    </section>
  );
}

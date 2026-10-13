"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { controlClass } from "@/components/ui/control-class";
import type { District } from "@/features/survey/types";
import { RESPONSE_HEADERS } from "../export/responses-csv";

const DOWNLOAD_PATH = "/admin/export/download";

const sampleRow = [
  "3f2a9c1e-…",
  "2026-10-13 15:42:07",
  "लखनऊ",
  "लखनऊ मध्य",
  "159",
  "प्राथमिक विद्यालय, हुसैनगंज",
  "864",
  "यादव: 300 (34.7%); ब्राह्मण: 120 (13.9%); …",
];

/** Pick a scope (all / district / assembly) and download submitted responses as CSV. */
export default function ResponseExport({ districts }: { districts: District[] }) {
  const [districtId, setDistrictId] = useState("");
  const [assemblyId, setAssemblyId] = useState("");

  const district = districts.find((d) => d.id === districtId);
  const assembly = district?.assemblies.find((a) => a.id === assemblyId);

  const params = new URLSearchParams();
  if (district) params.set("district", district.id);
  if (assembly) params.set("assembly", assembly.id);
  const href = params.size ? `${DOWNLOAD_PATH}?${params}` : DOWNLOAD_PATH;

  const scope = assembly
    ? `${district?.name} · ${assembly.name}`
    : district
      ? `${district.name} (सभी विधानसभा)`
      : "सभी जिले";

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900">रिस्पॉन्स डाउनलोड करें</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          केवल सबमिट हुए बूथ फ़ाइल में आते हैं — हर बूथ की एक पंक्ति। फ़ाइल CSV है, Excel या Google Sheets में सीधे
          खुलती है।
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="export-district" className="block text-sm font-semibold text-slate-700">
              जिला
            </label>
            <select
              id="export-district"
              value={districtId}
              onChange={(e) => {
                setDistrictId(e.target.value);
                setAssemblyId("");
              }}
              className={controlClass()}
            >
              <option value="">सभी जिले</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="export-assembly" className="block text-sm font-semibold text-slate-700">
              विधानसभा
            </label>
            <select
              id="export-assembly"
              value={assemblyId}
              disabled={!district}
              onChange={(e) => setAssemblyId(e.target.value)}
              className={`${controlClass()} disabled:bg-slate-100 disabled:text-slate-400`}
            >
              <option value="">{district ? "सभी विधानसभा" : "पहले जिला चुनें"}</option>
              {district?.assemblies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {/* A plain link: the server streams the file, so large exports never sit in browser memory. */}
          <a
            href={href}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-bold text-white shadow-sm hover:bg-orange-700"
          >
            <Icon name="download" className="size-5" />
            CSV डाउनलोड करें
          </a>
          <p className="text-sm text-slate-600">
            दायरा: <span className="font-bold text-slate-900">{scope}</span>
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900">फ़ाइल के कॉलम</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          जातिवार संख्या में सबसे बड़ी जाति पहले; % बूथ के कुल मतदाताओं में से।
        </p>
        <div className="-mx-5 mt-4 overflow-x-auto px-5">
          <table className="w-full min-w-160 text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr className="border-b border-slate-200">
                {RESPONSE_HEADERS.map((h) => (
                  <th key={h} className="py-2 pr-3 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="text-slate-700">
                {sampleRow.map((cell, i) => (
                  <td key={i} className="py-2.5 pr-3 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

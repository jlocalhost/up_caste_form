"use client";

import { useEffect, useId, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { controlClass } from "@/components/ui/control-class";
import { matchesSearch } from "../lib/format";

export type PickerOption = {
  id: string;
  label: string;
  detail?: string;
};

type Props = {
  title: string;
  subtitle?: string;
  searchPlaceholder: string;
  emptyText: string;
  options: PickerOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  loading?: boolean;
  failedText?: string;
  onRetry?: () => void;
};

/** Searchable bottom sheet for a single choice. Mount it only while open so search resets each time. */
export default function PickerSheet({
  title,
  subtitle,
  searchPlaceholder,
  emptyText,
  options,
  selectedId,
  onSelect,
  onClose,
  loading = false,
  failedText,
  onRetry,
}: Props) {
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const visible = options.filter((o) => matchesSearch(o.label, search));

  // Escape closes, background stops scrolling, and focus returns to the trigger afterwards.
  useEffect(() => {
    // Capture the trigger before moving focus (autoFocus would steal it first).
    const trigger = document.activeElement as HTMLElement | null;
    searchRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 px-0 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button type="button" className="absolute inset-0" aria-label="बंद करें" onClick={onClose} />
      <div className="relative w-full max-w-[430px] rounded-t-3xl bg-white px-5 pt-3 pb-8 shadow-2xl">
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-slate-300" />
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 id={titleId} className="text-lg font-extrabold">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="बंद करें"
            className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="relative">
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className={`${controlClass()} pl-11`}
          />
          <Icon name="search" className="absolute top-3.5 left-3.5 size-5 text-slate-400" />
        </div>
        <div className="mt-3 max-h-[48vh] space-y-2 overflow-auto" aria-busy={loading}>
          {loading ? (
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl border border-slate-100 bg-slate-100" />
            ))
          ) : failedText ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">{failedText}</p>
              {onRetry && (
                <button type="button" onClick={onRetry} className="mt-2 text-sm font-bold text-orange-700 underline">
                  पुनः प्रयास करें
                </button>
              )}
            </div>
          ) : visible.length ? (
            visible.map((option) => {
              const selected = option.id === selectedId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelect(option.id)}
                  aria-pressed={selected}
                  className="flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-orange-300 hover:bg-orange-50"
                >
                  <span>
                    <span className="block text-sm leading-5 font-bold text-slate-800">{option.label}</span>
                    {option.detail && <span className="mt-1 block text-xs text-slate-500">{option.detail}</span>}
                  </span>
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected ? "border-orange-600" : "border-slate-300"
                    }`}
                  >
                    {selected && <span className="size-3 rounded-full bg-orange-600" />}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">{emptyText}</p>
          )}
        </div>
      </div>
    </div>
  );
}

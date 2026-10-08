"use client";

import { Children, useId, useState, type ReactNode } from "react";

const num = new Intl.NumberFormat("en-IN");

/** Shows the first `limit` items with a toggle to reveal the rest. Items arrive pre-sorted. */
export default function ExpandableList({ children, limit = 10 }: { children: ReactNode; limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const items = Children.toArray(children);
  const hiddenCount = items.length - limit;

  return (
    <>
      <ul id={listId} className="space-y-3.5">
        {expanded ? items : items.slice(0, limit)}
      </ul>
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={listId}
          className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
        >
          {expanded ? "कम दिखाएँ" : `सभी देखें (${num.format(items.length)})`}
        </button>
      )}
    </>
  );
}

const dateTime = new Intl.DateTimeFormat("hi-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

const count = new Intl.NumberFormat("en-IN");

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

export const formatCount = (value: number) => count.format(value);

/** Case-insensitive, whitespace-tolerant "contains" for search boxes (Devanagari has no case, Latin does). */
export function matchesSearch(text: string, query: string): boolean {
  const q = query.trim().replace(/\s+/g, " ").toLowerCase();
  return !q || text.replace(/\s+/g, " ").toLowerCase().includes(q);
}

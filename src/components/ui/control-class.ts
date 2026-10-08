/** Shared look for inputs, selects and textareas; red treatment when `invalid`. */
export function controlClass(invalid?: boolean | string): string {
  return `h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-3 ${
    invalid
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-slate-300 focus:border-orange-500 focus:ring-orange-100"
  }`;
}

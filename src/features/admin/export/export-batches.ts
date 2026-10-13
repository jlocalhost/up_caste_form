/** PostgREST returns at most this many rows per request (Supabase default). */
export const EXPORT_PAGE_SIZE = 1000;

export type ExportAssembly = { id: string; name: string; district: string; submissions: number };

/**
 * Groups consecutive assemblies (order preserved) so each group's submissions fit in one
 * page — far fewer round trips than one query per assembly. An assembly larger than a page
 * gets a group of its own and is paged by the caller.
 */
export function planExportBatches(assemblies: ExportAssembly[], pageSize = EXPORT_PAGE_SIZE): ExportAssembly[][] {
  const batches: ExportAssembly[][] = [];
  let current: ExportAssembly[] = [];
  let size = 0;
  for (const assembly of assemblies) {
    if (current.length && size + assembly.submissions > pageSize) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(assembly);
    size += assembly.submissions;
  }
  if (current.length) batches.push(current);
  return batches;
}

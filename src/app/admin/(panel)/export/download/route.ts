import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser, LOGIN_PATH } from "@/features/admin/auth/dal";
import { getScopeName, listBatchResponses, listExportAssemblies } from "@/features/admin/data/export-repository";
import { planExportBatches, type ExportAssembly } from "@/features/admin/export/export-batches";
import { RESPONSE_HEADERS, csvLine, responseCells } from "@/features/admin/export/responses-csv";
import { chunk } from "@/features/admin/import/booth-csv";
import { isUuid } from "@/features/survey/data/survey-repository";

/** Batches fetched in parallel; output order is still preserved. */
const CONCURRENCY = 4;

const istDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

/** CSV text, one chunk per group of batches; stops early if the download is cancelled. */
async function* csvChunks(batches: ExportAssembly[][]): AsyncGenerator<string> {
  // BOM so Excel detects UTF-8 and shows Devanagari correctly.
  yield `﻿${csvLine([...RESPONSE_HEADERS])}`;
  for (const group of chunk(batches, CONCURRENCY)) {
    const results = await Promise.all(group.map(listBatchResponses));
    const text = results.flat().map((row) => csvLine(responseCells(row))).join("");
    if (text) yield text;
  }
}

/** Streams submitted survey responses as CSV (one row per booth), optionally filtered. */
export async function GET(request: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  const params = request.nextUrl.searchParams;
  const districtId = params.get("district") || undefined;
  const assemblyId = params.get("assembly") || undefined;
  if ((districtId && !isUuid(districtId)) || (assemblyId && !isUuid(assemblyId))) {
    return Response.json({ error: "Invalid filter" }, { status: 400 });
  }

  const scope = { districtId, assemblyId };
  const [assemblies, scopeName] = await Promise.all([listExportAssemblies(scope), getScopeName(scope)]);
  const fileName = `survey-responses-${scopeName}-${istDate()}.csv`.replace(/[\\/:*?"<>|\s]+/g, "-");

  const encoder = new TextEncoder();
  const chunks = csvChunks(planExportBatches(assemblies));
  // Pull-based: the next query runs only when the client is ready for more. The download can
  // be cancelled while a query is in flight, so never touch the controller after that.
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await chunks.next();
        if (cancelled) return;
        if (done) controller.close();
        else controller.enqueue(encoder.encode(value));
      } catch (error) {
        if (cancelled) return;
        console.error("Response export failed", error);
        controller.error(error);
      }
    },
    async cancel() {
      cancelled = true;
      await chunks.return(undefined);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="survey-responses-${istDate()}.csv"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "no-store",
    },
  });
}

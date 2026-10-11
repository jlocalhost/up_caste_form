import { getSubmissionForBooth, isUuid, resolveAreaFromDb } from "@/features/survey/data/survey-repository";
import type { BoothSubmissionResponse } from "@/features/survey/types";

export async function GET(_request: Request, { params }: RouteContext<"/api/booths/[boothId]/submission">) {
  const { boothId } = await params;
  if (!isUuid(boothId)) {
    return Response.json({ error: "Invalid booth id" }, { status: 400 });
  }

  const [area, submission] = await Promise.all([resolveAreaFromDb(boothId), getSubmissionForBooth(boothId)]);
  if (!area.booth || !area.assembly || !area.district) {
    return Response.json({ error: "Booth not found" }, { status: 404 });
  }

  const body: BoothSubmissionResponse = {
    area: { districtId: area.district.id, assemblyId: area.assembly.id, booth: area.booth },
    submission,
  };
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}

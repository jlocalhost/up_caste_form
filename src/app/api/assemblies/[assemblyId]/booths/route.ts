import { getBoothsForAssembly, isUuid } from "@/features/survey/data/survey-repository";

export async function GET(_request: Request, { params }: RouteContext<"/api/assemblies/[assemblyId]/booths">) {
  const { assemblyId } = await params;
  if (!isUuid(assemblyId)) {
    return Response.json({ error: "Invalid assembly id" }, { status: 400 });
  }
  const booths = await getBoothsForAssembly(assemblyId);
  return Response.json(booths, { headers: { "Cache-Control": "private, max-age=300" } });
}

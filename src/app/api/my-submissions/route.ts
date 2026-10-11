import { isUuid, listDeviceSubmissions } from "@/features/survey/data/survey-repository";
import { DEVICE_ID_HEADER } from "@/features/survey/lib/device-id";

export async function GET(request: Request) {
  const deviceId = request.headers.get(DEVICE_ID_HEADER);
  if (!isUuid(deviceId)) {
    return Response.json({ error: "Missing device id" }, { status: 400 });
  }
  const submissions = await listDeviceSubmissions(deviceId);
  return Response.json(submissions, { headers: { "Cache-Control": "no-store" } });
}

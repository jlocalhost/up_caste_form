import { useCallback, useRef, useState } from "react";
import type { BoothSubmissionResponse, ExistingSubmission } from "../types";

export type BoothSubmissionStatus =
  | { boothId: string; status: "loading" }
  | { boothId: string; status: "none" }
  | { boothId: string; status: "found"; submission: ExistingSubmission }
  | { boothId: string; status: "failed" };

/**
 * Looks up whether a booth was already submitted. Only the latest request wins, so a
 * slow response for a previously picked booth never overwrites the current one.
 */
export function useBoothSubmission() {
  const [status, setStatus] = useState<BoothSubmissionStatus | null>(null);
  const latest = useRef<string | null>(null);

  const load = useCallback(async (boothId: string): Promise<BoothSubmissionResponse | null> => {
    latest.current = boothId;
    setStatus({ boothId, status: "loading" });
    try {
      const res = await fetch(`/api/booths/${boothId}/submission`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as BoothSubmissionResponse;
      if (latest.current !== boothId) return null;
      setStatus(
        body.submission ? { boothId, status: "found", submission: body.submission } : { boothId, status: "none" },
      );
      return body;
    } catch (error) {
      if (latest.current === boothId) setStatus({ boothId, status: "failed" });
      console.error("Failed to load booth submission", error);
      return null;
    }
  }, []);

  return { status, load };
}

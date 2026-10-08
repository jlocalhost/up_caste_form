import { useEffect, useState } from "react";
import type { Booth } from "../types";

type Loaded = { assemblyId: string; booths: Booth[] | null; failed: boolean };

/** Fetches the booths of the selected assembly; results are cached for the session. */
const cache = new Map<string, Booth[]>();

export function useBooths(assemblyId: string) {
  const [loaded, setLoaded] = useState<Loaded>({ assemblyId: "", booths: null, failed: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!assemblyId || cache.has(assemblyId)) return;
    const controller = new AbortController();
    fetch(`/api/assemblies/${assemblyId}/booths`, { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<Booth[]>) : Promise.reject(new Error(String(res.status)))))
      .then((booths) => {
        cache.set(assemblyId, booths);
        setLoaded({ assemblyId, booths, failed: false });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoaded({ assemblyId, booths: null, failed: true });
        if (!(error instanceof DOMException)) console.error("Failed to load booths", error);
      });
    return () => controller.abort();
  }, [assemblyId, attempt]);

  const cached = cache.get(assemblyId);
  const current = loaded.assemblyId === assemblyId ? loaded : null;
  return {
    booths: cached ?? current?.booths ?? [],
    loading: Boolean(assemblyId) && !cached && !current?.failed,
    failed: Boolean(current?.failed) && !cached,
    retry: () => {
      setLoaded({ assemblyId: "", booths: null, failed: false });
      setAttempt((n) => n + 1);
    },
  };
}

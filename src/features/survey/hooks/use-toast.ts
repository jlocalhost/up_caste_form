import { useCallback, useEffect, useState } from "react";
import { TOAST_DURATION_MS } from "../constants";
import type { Toast, ToastTone } from "../types";

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const show = useCallback((message: string, tone: ToastTone = "info") => setToast({ message, tone }), []);
  const dismiss = useCallback(() => setToast(null), []);

  return { toast, show, dismiss };
}

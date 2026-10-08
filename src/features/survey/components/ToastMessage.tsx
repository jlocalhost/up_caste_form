import Icon from "@/components/ui/Icon";
import type { Toast } from "../types";

export default function ToastMessage({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const success = toast.tone === "success";
  return (
    <div
      className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2 items-center gap-3 rounded-xl bg-slate-900 px-4 py-3.5 text-white shadow-2xl"
      role="status"
    >
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full ${success ? "bg-emerald-500" : "bg-orange-500"}`}
      >
        <Icon name={success ? "check" : "info"} className="size-4" />
      </span>
      <p className="flex-1 text-xs leading-5 font-semibold">{toast.message}</p>
      <button type="button" onClick={onDismiss} aria-label="सूचना बंद करें" className="text-slate-300">
        <Icon name="close" className="size-4" />
      </button>
    </div>
  );
}

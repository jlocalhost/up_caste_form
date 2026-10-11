import Icon from "@/components/ui/Icon";
import type { BoothSubmissionStatus } from "../hooks/use-booth-submission";
import { formatDateTime } from "../lib/format";

/** Tells the worker this booth already has a saved survey that their submit will replace. */
export default function ExistingSubmissionNotice({ status }: { status: BoothSubmissionStatus }) {
  if (status.status === "loading") {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600" role="status">
        <span className="size-3 animate-spin rounded-full border-2 border-slate-300 border-t-orange-600" />
        पिछला सबमिशन जाँचा जा रहा है…
      </p>
    );
  }
  if (status.status === "failed") {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900" role="status">
        <Icon name="info" className="size-4 shrink-0" />
        पिछला सबमिशन जाँचा नहीं जा सका। सबमिट करने पर यदि पहले से डेटा है तो वह बदल जाएगा।
      </p>
    );
  }
  if (status.status !== "found") return null;

  return (
    <div className="flex gap-2.5 rounded-xl border border-sky-200 bg-sky-50 p-3.5 text-sky-950" role="status">
      <Icon name="info" className="mt-0.5 size-4 shrink-0 text-sky-700" />
      <div className="text-xs leading-5">
        <p className="text-sm font-bold">यह बूथ पहले से सबमिट है</p>
        <p className="mt-0.5">
          अंतिम अपडेट: {formatDateTime(status.submission.updatedAt)}। नीचे पिछला डेटा भरा है — बदलाव करके दोबारा
          सबमिट करने पर पुराना डेटा बदल जाएगा।
        </p>
      </div>
    </div>
  );
}

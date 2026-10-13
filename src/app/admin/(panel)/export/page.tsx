import { connection } from "next/server";
import { Suspense } from "react";
import { requireAdmin } from "@/features/admin/auth/dal";
import ResponseExport from "@/features/admin/components/ResponseExport";
import { getSurveyConfig } from "@/features/survey/data/survey-repository";

export default function AdminExportPage() {
  return (
    <>
      <h1 className="mb-4 text-xl font-black tracking-tight text-slate-950">रिस्पॉन्स डाउनलोड</h1>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" aria-busy="true" />}>
        <GuardedExport />
      </Suspense>
    </>
  );
}

async function GuardedExport() {
  await connection();
  await requireAdmin();
  const { districts } = await getSurveyConfig();
  return <ResponseExport districts={districts} />;
}

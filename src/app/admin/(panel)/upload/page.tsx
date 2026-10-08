import { connection } from "next/server";
import { Suspense } from "react";
import { requireAdmin } from "@/features/admin/auth/dal";
import CsvImporter from "@/features/admin/components/CsvImporter";

export default function AdminUploadPage() {
  return (
    <>
      <h1 className="mb-4 text-xl font-black tracking-tight text-slate-950">बूथ CSV अपलोड</h1>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" aria-busy="true" />}>
        <GuardedImporter />
      </Suspense>
    </>
  );
}

async function GuardedImporter() {
  await connection();
  await requireAdmin();
  return <CsvImporter />;
}

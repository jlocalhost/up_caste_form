import { connection } from "next/server";
import { Suspense } from "react";
import { requireAdmin } from "@/features/admin/auth/dal";
import DashboardOverview from "@/features/admin/components/DashboardOverview";
import { getAdminOverview } from "@/features/admin/data/overview-repository";
import PanelSkeleton from "@/features/admin/components/PanelSkeleton";

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="mb-4 text-xl font-black tracking-tight text-slate-950">डैशबोर्ड</h1>
      <Suspense fallback={<PanelSkeleton />}>
        <Dashboard />
      </Suspense>
    </>
  );
}

async function Dashboard() {
  await connection();
  await requireAdmin();
  const overview = await getAdminOverview();
  return <DashboardOverview data={overview} />;
}

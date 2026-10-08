import AdminHeader from "@/features/admin/components/AdminHeader";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </>
  );
}

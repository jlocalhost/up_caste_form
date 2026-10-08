import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "एडमिन पैनल | सामाजिक संरचना सर्वेक्षण",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-screen bg-slate-100 text-slate-900">{children}</div>;
}

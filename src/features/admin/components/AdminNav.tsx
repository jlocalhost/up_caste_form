"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "डैशबोर्ड" },
  { href: "/admin/upload", label: "बूथ CSV अपलोड" },
  { href: "/admin/export", label: "रिस्पॉन्स डाउनलोड" },
] as const;

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="एडमिन नेविगेशन" className="flex gap-1">
      {links.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
              active ? "bg-white text-orange-700" : "text-orange-50 hover:bg-white/15"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

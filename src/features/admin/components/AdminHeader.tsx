import Image from "next/image";
import { signOut } from "../auth/actions";
import AdminNav from "./AdminNav";

export default function AdminHeader() {
  return (
    <header className="relative overflow-hidden bg-orange-600 text-white">
      <div className="absolute -top-14 -right-9 size-36 rounded-full border-20 border-white/10" />
      <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full border-2 border-white/70 bg-white">
            <Image src="/BJP-Symbol.png" alt="" fill sizes="40px" loading="eager" className="object-cover" />
          </div>
          <div>
            <p className="text-base font-extrabold tracking-tight">एडमिन पैनल</p>
            <p className="text-xs font-medium text-orange-100">सामाजिक संरचना सर्वेक्षण | उत्तर प्रदेश</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminNav />
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-white/40 px-3 py-2 text-sm font-bold text-white hover:bg-white/15"
            >
              लॉग आउट
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

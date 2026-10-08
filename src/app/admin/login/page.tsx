import Image from "next/image";
import LoginForm from "@/features/admin/components/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative overflow-hidden bg-orange-600 px-5 pt-5 pb-6 text-white">
          <div className="absolute -top-14 -right-9 size-36 rounded-full border-20 border-white/10" />
          <div className="relative flex items-center gap-3">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-white/70 bg-white">
              <Image src="/BJP-Symbol.png" alt="" fill sizes="44px" loading="eager" className="object-cover" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight">एडमिन लॉग इन</h1>
              <p className="mt-0.5 text-xs font-medium text-orange-100">सामाजिक संरचना सर्वेक्षण | उत्तर प्रदेश</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

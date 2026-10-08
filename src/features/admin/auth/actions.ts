"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdminRole, LOGIN_PATH } from "./dal";

export type SignInState = { error?: string; email?: string };

const INVALID = "ईमेल या पासवर्ड गलत है";

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { error: "सही ईमेल दर्ज करें", email };
  }
  if (password.length < 8 || password.length > 128) return { error: INVALID, email };

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) return { error: INVALID, email };
  if (!isAdminRole(data.user.app_metadata)) {
    // Valid account without admin rights: don't leave a session behind.
    await supabase.auth.signOut();
    return { error: "इस खाते को एडमिन पैनल की अनुमति नहीं है", email };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect(LOGIN_PATH);
}

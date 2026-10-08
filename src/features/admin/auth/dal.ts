import "server-only";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export type AdminUser = { id: string; email: string };

export const LOGIN_PATH = "/admin/login";

/** Admin role lives in app_metadata, which only the secret key can write. */
export function isAdminRole(appMetadata: Record<string, unknown> | undefined): boolean {
  return appMetadata?.role === "admin";
}

/**
 * Data Access Layer gate. Verifies the session with Supabase Auth (not just the cookie)
 * and requires the admin role. Call it in every admin page and server action.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !isAdminRole(data.user.app_metadata)) redirect(LOGIN_PATH);
  return { id: data.user.id, email: data.user.email ?? "" };
}

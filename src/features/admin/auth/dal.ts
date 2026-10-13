import "server-only";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export type AdminUser = { id: string; email: string };

export const LOGIN_PATH = "/admin/login";

/** Admin role lives in app_metadata, which only the secret key can write. */
export function isAdminRole(appMetadata: Record<string, unknown> | undefined): boolean {
  return appMetadata?.role === "admin";
}

/** The signed-in admin, verified with Supabase Auth (not just the cookie), or null. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !isAdminRole(data.user.app_metadata)) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

/**
 * Data Access Layer gate: requires the admin role, otherwise redirects to login.
 * Call it in every admin page, server action and route handler.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) redirect(LOGIN_PATH);
  return admin;
}

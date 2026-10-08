import "server-only";

import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "../env";
import type { Database } from "./database.types";

let client: ReturnType<typeof createClient<Database>> | undefined;

/**
 * Privileged client using the secret key — bypasses RLS. Server-only.
 * Callers must authenticate/authorise the request themselves before using it.
 */
export function supabaseAdmin() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) throw new Error("Missing environment variable SUPABASE_SECRET_KEY.");
  client ??= createClient<Database>(publicEnv.supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

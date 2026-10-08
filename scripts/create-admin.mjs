// Creates (or promotes) an admin user.
// Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password>
import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 8) {
  console.error("Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password (min 8 chars)>");
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const appMetadata = { role: "admin" };
const { error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  app_metadata: appMetadata,
});

if (!error) {
  console.log(`Admin created: ${email}`);
  process.exit(0);
}

if (error.code !== "email_exists") {
  console.error(`Failed: ${error.message}`);
  process.exit(1);
}

// Already registered: promote to admin and reset the password.
const { data, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
const user = data?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (listError || !user) {
  console.error("User exists but could not be found to update.");
  process.exit(1);
}
const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
  password,
  app_metadata: { ...user.app_metadata, ...appMetadata },
});
if (updateError) {
  console.error(`Failed: ${updateError.message}`);
  process.exit(1);
}
console.log(`Existing user promoted to admin: ${email}`);

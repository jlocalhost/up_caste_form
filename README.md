# UP Booth Survey (Next.js + Supabase)

Mobile-first booth-level social structure survey, plus an admin panel for uploading the booth
master list (CSV) and viewing a live dashboard.

- `/` — survey form for field workers
- `/admin/login` — admin sign-in (email + password)
- `/admin` — dashboard overview
- `/admin/upload` — booth master CSV upload

## Requirements

- **Node.js 22+** (`nvm use` reads `.nvmrc`) — `@supabase/supabase-js` needs Node 22's native WebSocket.
- pnpm, and Docker for local Supabase.

## Local setup

```bash
pnpm install
npx supabase start                    # local Postgres + Auth in Docker
npx supabase db reset                 # applies migrations + seed (13 sample booths)
cp .env.example .env.local            # fill with the keys printed by `supabase start`
pnpm create-admin admin@local.test 'Admin@12345'
pnpm dev                              # http://localhost:3000
```

Checks: `pnpm test && pnpm lint && pnpm typecheck && pnpm build`

## Production (hosted Supabase)

1. Create a Supabase project, then `npx supabase link --project-ref <ref>` and `npx supabase db push`.
2. In the dashboard → Authentication → Sign In / Providers: **disable "Allow new users to sign up"**
   (admins are created only via the script).
3. Set the three env vars from `.env.example` on the host. `SUPABASE_SECRET_KEY` is server-only.
4. `pnpm create-admin <email> <password>` with production env loaded.

## Booth CSV format

```
district,assembly,booth_number,booth_name,voters
लखनऊ,लखनऊ मध्य,159,"प्राथमिक विद्यालय, हुसैनगंज",864
```

Hindi headers (जिला, विधानसभा, बूथ संख्या, बूथ नाम, मतदाता) also work. Rows are upserted on
(district, assembly, booth_number): existing booths are updated, new ones added, nothing deleted.
Invalid and duplicate rows are listed with their line numbers and skipped. Re-uploading a file is safe.

## Security model

- All tables have RLS on with **no policies** — browsers can't read or write them with the publishable key.
- The server uses the secret key only after checks: survey submit re-validates against the DB;
  admin pages and actions call `requireAdmin()` (verifies the session with Supabase Auth and
  requires `app_metadata.role = "admin"`, which users cannot set themselves).
- `src/proxy.ts` refreshes the session and redirects signed-out visitors away from `/admin`.
- Each booth keeps one submission; re-submitting replaces it atomically (`submit_survey`).

## Structure

```
supabase/migrations/            schema, RLS, SQL functions (import_booths, submit_survey, admin_overview)
src/proxy.ts                    session refresh + /admin gate
src/lib/supabase/               admin (secret key) and cookie-bound server clients, generated types
src/features/survey/            public form: components, reducer, validation, repository, submit action
src/features/admin/
  auth/                         requireAdmin DAL, sign-in/out actions
  import/                       CSV rules (shared client/server) + chunked import action
  data/                         dashboard query
  components/                   header, login, dashboard, CSV importer
scripts/create-admin.mjs        create or promote an admin user
```

Regenerate DB types after schema changes:
`npx supabase gen types typescript --local > src/lib/supabase/database.types.ts`

# Client Hub — Setup Guide

This is the one-time wiring you have to do before `/portal/*` works in production.
Once these steps are done, the Hub is live and you onboard the 4 founding
clients per CLIENT_HUB_PLAN.md Step 1.7.

If anything below is unclear, fall back to CLIENT_HUB_PLAN.md as the source of
truth.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), sign in, create a new project.
   Name it **designedtoelevate-client-hub**. Pick the closest region (Ohio →
   `us-east-1`). Save the database password somewhere safe (you won't need it
   day-to-day).
2. Wait for the project to provision (~2 min).

---

## 2. Run the migrations

The repo ships migrations under `supabase/migrations/`. Pick one path:

### Path A — Supabase CLI (recommended)

```bash
# install once
npm i -g supabase

# from the repo root
supabase link --project-ref <your-project-ref>
supabase db push
```

`<your-project-ref>` is the short string in your project's URL
(`https://supabase.com/dashboard/project/<your-project-ref>/...`).

### Path B — Paste into the SQL editor

If you don't want to install the CLI, open Supabase → **SQL Editor**, then run
each file in order:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_rls_policies.sql`
3. `supabase/migrations/0003_storage_bucket.sql`

Run them one at a time so any errors surface clearly.

### Seed the 4 clients

Open `supabase/seed.sql`, fill in real `business_name`, `slug`, and
`primary_contact_email` for each row, then run it from the SQL editor.

The `slug` is what appears in `/portal/admin/clients/<slug>` — keep it short
and lowercase. Examples: `fitchin`, `modern-classic`, `all-transport`.

---

## 3. Collect API keys

In Supabase → **Settings → API**:

| Env var                        | Where it comes from                |
|--------------------------------|------------------------------------|
| `PUBLIC_SUPABASE_URL`          | "Project URL"                      |
| `PUBLIC_SUPABASE_ANON_KEY`     | "Project API keys → `anon public`" |
| `SUPABASE_SERVICE_ROLE_KEY`    | "Project API keys → `service_role`"|

⚠️ The **service role key bypasses RLS**. Never commit it. Never expose it
to the browser. Only set it as a server-side env var.

---

## 4. Resend (transactional email)

1. Sign in to [resend.com](https://resend.com).
2. Add and verify your sending domain (`designedtoelevate.co`). Resend walks
   you through the DNS records.
3. Create an API key (Dashboard → API keys → Create). Copy it.

Set these env vars:

| Env var               | Example                                              |
|-----------------------|------------------------------------------------------|
| `RESEND_API_KEY`      | `re_...`                                             |
| `EMAIL_FROM`          | `Designed to Elevate <hello@designedtoelevate.co>`   |
| `ADMIN_NOTIFY_EMAIL`  | your inbox (where new-request emails land)           |

---

## 5. Configure environment

### Local dev

Copy `.env.example` to `.env` and fill in the values. Then:

```bash
npm install
npm run dev
```

Open <http://localhost:4321/portal/login>.

### Vercel (production)

In the Vercel project for `designedtoelevate.co` → **Settings → Environment
Variables**, add every variable from `.env.example`. Set `PUBLIC_SITE_URL` to
`https://designedtoelevate.co`. Redeploy.

### Supabase auth redirect URL

In Supabase → **Authentication → URL Configuration** add both:

- `http://localhost:4321/portal/auth/callback`
- `https://designedtoelevate.co/portal/auth/callback`

Magic links won't redirect to these URLs otherwise.

---

## 6. Make Bill the admin

The first time you log in via `/portal/login` Supabase creates a profile
row with `role = 'client'`. Promote it to admin manually — one SQL run:

```sql
update public.profiles
set role = 'admin', full_name = 'Bill <last name>'
where id = (
  select id from auth.users
  where email = 'bill@designedtoelevate.co'   -- your email
);
```

Now hit `/portal/login` again. After the magic link, you'll land on
`/portal/admin`.

---

## 7. Onboard the 4 founding clients

From `/portal/admin/clients`, open each client and use the **Invite + send
link** form to add the owner's email. The system:

1. Creates their auth user.
2. Links them to that client via `client_users`.
3. Sends them a magic-link sign-in email.

Walk each of them through their first request via FaceTime or in person. Note
friction; that's Phase 2 fuel.

---

## What's wired and what isn't

✅ Built and ready:

- Magic-link login → /portal/auth/callback → role-based redirect
- Client dashboard, submit form (with file uploads), request detail w/ comments
- Admin queue with filters, request detail with status + billing dropdowns,
  internal notes, completion-screenshot uploads
- Client management: add client, edit, invite/remove users
- Transactional email on new request + status changes (in_progress,
  waiting_on_client, complete)
- RLS policies for every table; service role only used server-side

🟡 Phase 2 (only after 2+ weeks of real Phase 1 usage):

- Request templates
- Activity-log view on the request detail page (the table exists; we log
  to it; we just haven't built the UI surface yet)
- Mobile UI polish (swipe-to-status, larger tap targets)
- Saved filter views on admin

❌ Not built (by design — see plan §10):

- Real-time chat, Slack, push notifications
- Per-client branding
- Multi-website-per-client
- Stripe billing / Care Plan productization (Phase 3)

---

## Troubleshooting

**Magic link email never arrives.** Check Supabase → Authentication → Logs.
First-time hosts sometimes need their email confirmed via Resend's domain
verification.

**`/portal` redirects me to login even though I just signed in.** The
HttpOnly cookies require `secure: true`. Local dev over plain HTTP will set
them, but Safari sometimes strips them. Use `localhost` (not `127.0.0.1`)
or test in Chrome.

**RLS denies a query I expect to work.** Confirm:
1. The user has a `client_users` row linking them to that client.
2. Their `profiles.role` matches what you expect.
3. You're calling `createServerSupabase(cookies)`, not the service role,
   for user-scoped reads.

**Build fails on Vercel.** The portal pages need SSR. The
`@astrojs/vercel` adapter is already in `astro.config.mjs`. If you see a
404 on `/portal/*` after deploy, check that Vercel Functions are enabled
for the project (default: yes).

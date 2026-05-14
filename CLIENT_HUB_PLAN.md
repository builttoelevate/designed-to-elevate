# Designed to Elevate — Client Hub Build Plan

> **Status:** Active build plan. This document is the source of truth for the Client Hub project. Reference it before improvising on architecture, copy, or scope.

---

## 1. Project Overview

A client portal living at `designedtoelevate.co/portal/*` that lets Designed to Elevate (DTE) clients submit website change requests through a structured workflow instead of texts, emails, and DMs. Solves the "juggling 4+ businesses in my head" problem and becomes a sales asset for new clients.

**Promise to clients:** "You don't need my phone number. You log in, submit a change in 30 seconds with a screenshot if you've got one, and you get an email when it's done."

**Promise to Bill:** One queue, one dashboard, one place to mark things complete. Mobile-first because everything runs from the phone.

### Why this exists

- DTE has 4 active clients and growing. Texts, emails, and verbal requests don't scale.
- A branded portal is a real differentiator in pitches against other freelancers.
- Long-term, this becomes part of the DTE Care Plan product (Phase 3).

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Astro 5+ | Lives in existing `designedtoelevate` repo at `/portal/*` routes |
| Backend | Supabase | Postgres + Auth (magic links) + Storage + Realtime |
| Email | Resend | Transactional only |
| Hosting | Vercel | Existing deployment |
| Auth | Supabase magic links | No passwords, no social login |

### Why Supabase (not a custom Railway backend like TintShopLaunch)

- Auth solved out of the box (magic links)
- Postgres with Row Level Security handles multi-tenant isolation natively
- File storage built in (no S3 wiring)
- Free tier covers DTE's scale indefinitely
- One less server for a solo operator to maintain

This is a **deliberate departure** from the TintShopLaunch pattern. TintShopLaunch is a product with complex business logic that warrants a custom backend. The Client Hub is mostly CRUD with auth — exactly what Supabase does best. Don't argue against this choice during Phase 1.

---

## 3. Architecture Decisions (Guardrails)

These are not up for debate during Phase 1. If a session feels like it wants to deviate, stop and ask Bill.

1. **Multi-tenant from day one.** Every record scoped by `client_id`. RLS policies enforce isolation at the database level. Never trust the frontend.
2. **One website per client (for now).** No `websites` table. If a client gets a second site later, add a second `clients` record.
3. **One URL field, no page dropdown.** Asking clients to pick from "Homepage / About / Services" assumes every site has the same structure. Just one "Page URL" field.
4. **Four statuses only.** `new`, `in_progress`, `waiting_on_client`, `complete`. No "Needs Review," "Approved," "Archived."
5. **Five request categories only.** `text`, `image`, `layout`, `new_feature`, `broken`.
6. **Client-friendly status copy.** The database stores `in_progress`; the UI shows "Your update is being worked on."
7. **Billing type is admin-only.** Client never sees whether their request is included, billable, or needs an estimate.
8. **Magic link auth only.** No passwords. No social login.
9. **Email notifications only.** No SMS, no Slack, no push.
10. **No file library tab.** Files attach to the requests that need them.
11. **No per-client branding.** Lives under DTE's brand on purpose.
12. **Bill is the only admin.** Multi-admin is a Phase 3 problem (if ever).

---

## 4. Database Schema

Run via Supabase migrations under `supabase/migrations/`.

### `clients`
```
id                    uuid primary key default gen_random_uuid()
slug                  text unique not null            -- e.g. "fitchin", "modern-classic"
business_name         text not null
primary_contact_email text not null
site_url              text
status                text default 'active'           -- active | paused | archived
created_at            timestamptz default now()
```

### `profiles`
Supabase manages `auth.users` automatically. This is the extension table.
```
id          uuid primary key references auth.users(id) on delete cascade
full_name   text
role        text not null default 'client'   -- admin | client
created_at  timestamptz default now()
```

### `client_users`
One client business can have multiple users (owner + office manager). Most will have one — build it now to avoid pain later.
```
id          uuid primary key default gen_random_uuid()
user_id     uuid references profiles(id) on delete cascade
client_id   uuid references clients(id)  on delete cascade
role        text default 'member'        -- owner | member
created_at  timestamptz default now()
unique (user_id, client_id)
```

### `requests`
```
id                          uuid primary key default gen_random_uuid()
client_id                   uuid references clients(id) not null
submitted_by                uuid references profiles(id) not null
title                       text not null
description                 text not null
category                    text not null               -- text | image | layout | new_feature | broken
priority                    text default 'normal'       -- normal | important | urgent
status                      text default 'new'          -- new | in_progress | waiting_on_client | complete
page_url                    text
billing_type                text default 'included'     -- included | billable | needs_estimate | courtesy (ADMIN ONLY)
preferred_completion_date   date
created_at                  timestamptz default now()
completed_at                timestamptz
```

### `request_files`
```
id            uuid primary key default gen_random_uuid()
request_id    uuid references requests(id) on delete cascade not null
file_url      text not null                  -- Supabase Storage public/signed URL
filename      text not null
uploaded_by   uuid references profiles(id)
created_at    timestamptz default now()
```

### `comments`
```
id          uuid primary key default gen_random_uuid()
request_id  uuid references requests(id) on delete cascade not null
author_id   uuid references profiles(id) not null
body        text not null
visibility  text default 'public'   -- public | internal (internal = admin-only notes)
created_at  timestamptz default now()
```

### `request_activity`
Audit log. Insert on status change, comment add, file upload, etc.
```
id          uuid primary key default gen_random_uuid()
request_id  uuid references requests(id) on delete cascade not null
actor_id    uuid references profiles(id)
action      text not null                  -- status_changed | comment_added | file_uploaded
metadata    jsonb                          -- e.g. {"from": "new", "to": "in_progress"}
created_at  timestamptz default now()
```

### RLS Policies (mandatory)

- **`clients`**: clients can SELECT only rows where they're linked via `client_users`. Admins via service role.
- **`profiles`**: users can SELECT/UPDATE their own row. Admins can SELECT all.
- **`client_users`**: users can SELECT their own join rows. Admins manage all.
- **`requests`**:
  - Clients SELECT where `client_id` matches their `client_users.client_id`
  - Clients INSERT where `client_id` matches theirs and `submitted_by = auth.uid()`
  - Clients UPDATE only where `client_id` is theirs AND `status = 'new'` (edit window closes when work starts)
  - `billing_type` cannot be updated by clients (column-level policy or trigger)
- **`request_files`**: same rules as `requests`.
- **`comments`**:
  - Clients SELECT where `visibility = 'public'` AND linked request is theirs
  - Clients INSERT with `visibility = 'public'` only
  - Admins manage all (via service role)
- **`request_activity`**: read-only for clients on their own requests. Writes only via server-side service role.

Admin operations bypass RLS via the Supabase **service role key** on server-side API routes only. Never expose the service role key client-side.

---

## 5. URL & Route Structure

### Public
- `/portal/login` — magic link request form
- `/portal/auth/callback` — Supabase auth callback handler

### Client (auth required, `role = 'client'`)
- `/portal` — dashboard with list of their requests
- `/portal/new` — submit a change form
- `/portal/r/[id]` — request detail with comment thread

### Admin (auth required, `role = 'admin'`)
- `/portal/admin` — global dashboard, all clients, filterable
- `/portal/admin/r/[id]` — request detail with admin controls
- `/portal/admin/clients` — list/manage client records
- `/portal/admin/clients/new` — add a new client
- `/portal/admin/clients/[slug]` — client detail page

Middleware enforces auth and role-based redirects. Unauthed users hitting `/portal/*` go to `/portal/login`. Clients hitting `/portal/admin/*` get redirected to `/portal`.

---

## 6. UX Copy (Use Exactly As Written)

These strings are decided. Don't invent variations.

### Login page
- Headline: **"Welcome to your Client Hub"**
- Subhead: "Submit website change requests, track status, and keep everything in one place."
- Email field placeholder: `you@yourbusiness.com`
- Submit button: **"Send me a login link"**
- After submit (banner): "Check your email — we sent a login link to {email}. It expires in 1 hour."

### Client dashboard
- Welcome line: "Welcome back, {first_name}."
- Empty state headline: "No requests yet"
- Empty state body: "Click below when you need something updated on your site."
- Primary action button: **"Submit a Change"**

### Submit request form
- Page title: **"Submit a Website Change"**
- Expectations blurb (above the form):
  > "Need something updated? Tell us what you need below. Small updates like text, photos, hours, and links are included in your plan. New pages, custom features, or redesigns may need a separate estimate before work begins."
- Field labels:
  - "What needs changed?" (`title`)
  - "What type of change is this?" (`category` — dropdown)
  - "Page URL (optional)" (`page_url`)
  - "Describe the change in detail" (`description`)
  - "Upload files" (`request_files` — multi-file)
  - "Priority" (`priority` — Normal / Important / Urgent)
  - "Preferred completion date (optional)" (`preferred_completion_date`)
- Category options (label / value):
  - "Text update" / `text`
  - "Image or photo update" / `image`
  - "Layout or design change" / `layout`
  - "New page or feature" / `new_feature`
  - "Something's broken" / `broken`
- Priority guidance helper text:
  - "**Normal** — general update"
  - "**Important** — needed soon, but the site still works"
  - "**Urgent** — site issue, incorrect info, broken page, or time-sensitive"
- Submit button: **"Submit Request"**
- Success message (after submit): "Got it. Your request is in the queue and we'll email you when it's in progress."

### Status badges (client-facing)
| DB value | UI badge | Detail-page description |
|---|---|---|
| `new` | "New" | "We received your request and it's in the queue." |
| `in_progress` | "In Progress" | "Your update is being worked on." |
| `waiting_on_client` | "Waiting on You" | "We need one more detail, file, or approval before moving forward." |
| `complete` | "Complete" | "Your update has been completed." |

### Email policy

Email is only used to **(a)** confirm receipt, **(b)** notify admin of new work, and **(c)** request input when blocked. All other status updates live in the portal — clients check progress there, not in their inbox. This is deliberate: every email that isn't load-bearing trains the recipient to ignore the next one.

That means only three messages ever go out, and `status → in_progress` and `status → complete` send **nothing**.

### Email design system

Every outgoing email — Supabase auth (magic link, invite, confirm signup) and app-fired (the three above) — shares one visual identity so the inbox feels like one brand.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0F0F0F` | Outer email background |
| `--card` | `#1A1A1A` | Inner content card |
| `--divider` | `#2A2A2A` | Footer top border |
| `--text` | `#F5F5F5` | Headlines + primary text |
| `--text-muted` | `#A1A1AA` | Body copy |
| `--text-faint` | `#71717A` | Footer + meta labels |
| `--accent` | `#FF6A00` | DTE orange — buttons, "Elevate" in wordmark |
| `--button-text` | `#000000` | Black on orange for max contrast |

Layout rules:
- Inline styles only — Outlook strips `<style>` tags in head, so no media queries; size scales via `width:100% max-width:560px` on the card.
- System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`. No Google Fonts — they don't render in some clients.
- 560px max card, centered, 14px border radius.
- Outlook-safe buttons via VML conditional + `<table>` fallback (never `<a>` with padding alone).
- Header: "Designed to" in `--text` + "Elevate" in `--accent`, uppercase, letter-spaced.
- Footer: `Designed to Elevate · Zanesville, Ohio · designedtoelevate.co` in `--text-faint`, separated from body by a `--divider` top border.

Supabase auth templates live in `supabase/email-templates/` (version controlled). The contents have to be pasted into the Supabase dashboard manually — there's no API for syncing templates — but the canonical copy is the file.

### Email templates

**To client — request received:**
- Subject: `We got your request — {title}`
- Body:
  > "Hi {first_name},
  >
  > We received your website change request '{title}' and it's in the queue.
  >
  > You can check progress anytime at {request_url} — your dashboard shows when work is in progress and when it's complete.
  >
  > We'll only email you again if we need something from you to finish the job.
  >
  > — Bill, Designed to Elevate"

**To Bill — new request notification:**
- Subject: `[New] {client_name}: {title}`
- Body: Plain summary with title, category, priority, description preview, and direct link to `/portal/admin/r/{id}`.

**To client — status changed to waiting_on_client:**
- Subject: `Need one more thing — {title}`
- Body:
  > "Hi {first_name},
  >
  > We need a bit more info to move forward on '{title}'. Check the request for details and reply with what we need.
  >
  > {request_url}
  >
  > — Bill, Designed to Elevate"

**Statuses that intentionally do NOT email:**
- `status → in_progress` — visible in the portal, no email
- `status → complete` — visible in the portal, no email

---

## 7. Phase 1 Build Plan

**Goal:** A working portal that all 4 current clients can use today.

### Step 1.1 — Supabase setup
- Create a fresh Supabase project (separate from any TintShopLaunch project)
- Write migrations under `supabase/migrations/` for all tables in Section 4
- Set up RLS policies per Section 4
- Create Storage bucket `request-files` with auth-required access
- Seed `clients` table with the 4 current clients (Bill provides names/emails)
- Create Bill's admin profile (manual SQL insert after he signs up via magic link)

### Step 1.2 — Astro + Supabase integration
- Install `@supabase/supabase-js`
- Add env vars: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Create `src/lib/supabase.ts` with both browser and server-side clients
- Add `src/middleware.ts` that protects `/portal/*` routes

### Step 1.3 — Auth flow
- Build `/portal/login` page (use exact copy from Section 6)
- Wire to Supabase magic link
- Build `/portal/auth/callback` handler
- Build session helper that returns `{ user, profile, client_id, role }`
- Add role-based redirect after login (admin → `/portal/admin`, client → `/portal`)

### Step 1.4 — Client-side flows
- Build `/portal` (dashboard with request list, status filter)
- Build `/portal/new` (submit form with file upload to Supabase Storage)
- Build `/portal/r/[id]` (request detail + public comment thread)
- Clients can edit a request only while `status = 'new'`

### Step 1.5 — Admin dashboard
- Build `/portal/admin` (global request list, filterable by client, status, priority, billing type)
- Build `/portal/admin/r/[id]` (status dropdown, billing dropdown, internal-notes toggle on comments, ability to upload completion screenshots)
- Build `/portal/admin/clients` (list, add, edit)
- Mobile-first: status changes should work in one tap on a phone
- On `/portal/admin/clients/[slug]`, each linked user shows an invite/sign-in status badge:
  - **Active** (green) — user has signed in at least once. Below the badge, "Last seen {relative time}" reads from `auth.users.last_sign_in_at`.
  - **Invited — not yet signed in** (muted grey) — `last_sign_in_at` is null. Pending users get a small **Resend invite** button next to the row.
  - Resend invite hits `POST /api/portal/admin/client-users/[id]/resend-invite`, which re-fires Supabase's "Invite user" template for the same email. Used when a client never opened the first invite or it landed in spam.
  - Server-side, the page joins `client_users` → `profiles` → `auth.users` via the service-role client to pull `email`, `invited_at`, `last_sign_in_at`, and `email_confirmed_at`. Status comes from `last_sign_in_at` truthy/null.

### Step 1.6 — Email notifications
- Add `RESEND_API_KEY` to env
- Create `src/lib/email.ts` with helpers for the three templates in Section 6
- Trigger emails from API routes on (a) request creation and (b) status → `waiting_on_client` only. `in_progress` and `complete` deliberately do not email — see §6 policy.
- Include direct links to the request in every email

### Step 1.7 — Onboarding the 4 current clients
- **Not a code task.** Bill manually creates auth users (or sends magic links), then walks each client through their first request.

### Phase 1 acceptance criteria
- [ ] Bill logs in to `/portal/admin` and sees all requests across clients
- [ ] A client logs in via magic link in one tap
- [ ] A client submits a request with files attached
- [ ] A client sees only their own requests (RLS enforced)
- [ ] Bill gets email when any client submits
- [ ] Client gets email only when status moves to `waiting_on_client` (not on in_progress or complete — see §6)
- [ ] Bill can change status from his phone in under 10 seconds per request
- [ ] All 4 current clients have submitted at least one real request
- [ ] Internal notes are invisible to clients
- [ ] Billing type field is invisible to clients

---

## 8. Phase 2 — Polish & Real-Use Improvements

**Trigger:** After 2+ weeks of Phase 1 in production with all 4 clients actively using it. Do not start Phase 2 work speculatively.

- Comment threads with reply notifications
- Request templates ("Update Hours", "Replace Phone Number") — pre-fill common requests
- Mobile UI polish on admin view (swipe to change status, larger tap targets)
- Activity log displayed on request detail
- Admin can edit/delete a request (rare, but needed)
- Saved filter views on admin dashboard ("All Urgent", "Waiting on Client")

---

## 9. Phase 3 — Productize

**Trigger:** When DTE has 8+ active clients and the portal is part of every sales pitch.

- Care Plan billing — Stripe integration, "X hours remaining this month" UI
- Time tracking per request (so Bill knows which clients are profitable)
- Self-serve client onboarding (Bill enters client info; system sends invite)
- Public marketing page at `/portal` explaining the hub to prospects
- "Powered by Designed to Elevate" badge on completed work
- Multiple websites per client (only if a client actually requests it)

---

## 10. What NOT to Build

Resist these even if they feel tempting. Each one re-opens the question of whether the product is too complex.

- ❌ Real-time chat (creates always-on availability expectations)
- ❌ Slack/Discord integration
- ❌ Per-client branding (lives under DTE's brand on purpose)
- ❌ Embedded calendar/booking (Calendly's job)
- ❌ Approval workflows for design comps (different product)
- ❌ Atarim-style visual page annotation (cool but heavy)
- ❌ Client-facing analytics
- ❌ Public marketing portal page (Phase 3 only)
- ❌ Multiple websites per client (Phase 3 if ever)
- ❌ Multi-admin support
- ❌ Mobile native app (web is enough)
- ❌ Webhooks for third-party tools (Phase 3 if ever)

---

## 11. Claude Code Session Prompts

Each prompt below is meant for **one focused Claude Code session**. Don't combine them.

### Session 1: Supabase schema + RLS

```
Set up the Supabase project for the Client Hub per CLIENT_HUB_PLAN.md.

Tasks:
1. Create migrations under supabase/migrations/ for all tables in Section 4 of the plan.
2. Create RLS policies exactly as described in Section 4.
3. Create the `request-files` Storage bucket with auth-required access.
4. Add a seed.sql with the 4 current clients (Bill will provide business names and emails).
5. Do NOT seed profiles or user records — those come via magic link signup.

Reference CLIENT_HUB_PLAN.md as the source of truth. Do not deviate from the schema or RLS rules. If anything is ambiguous, stop and ask before improvising.
```

### Session 2: Astro + Supabase integration + auth

```
Wire up Supabase auth in the designedtoelevate Astro repo per CLIENT_HUB_PLAN.md Section 7.2 and 7.3.

Tasks:
1. Install @supabase/supabase-js.
2. Add the three env vars to .env.example with comments.
3. Create src/lib/supabase.ts with browser-side and server-side helpers.
4. Build /portal/login using the EXACT copy from Section 6 of the plan.
5. Build /portal/auth/callback to handle the magic link return.
6. Build src/middleware.ts that protects /portal/* and redirects unauthed users to /portal/login.
7. After login, route admins to /portal/admin and clients to /portal. Use stub pages for both — do not build out the dashboards yet.

Stop at "auth works end-to-end and routes to the correct stub page." Do not start on dashboards in this session.
```

### Session 3: Client-side flows

```
Build the client-side portal flows per CLIENT_HUB_PLAN.md Section 7.4.

Tasks:
1. /portal — list of the logged-in client's requests, status filter, status badges (use UI labels from Section 6).
2. /portal/new — submit form per Section 6 spec, with file upload to the request-files Supabase Storage bucket.
3. /portal/r/[id] — request detail + public-visibility comment thread. Show full status description (from Section 6 table).
4. Clients can edit a request only when status = 'new'.
5. Use the EXACT UX copy from Section 6. Do not invent new copy.

Do not build admin views in this session.
```

### Session 4: Admin dashboard

```
Build the admin views per CLIENT_HUB_PLAN.md Section 7.5.

Tasks:
1. /portal/admin — global request list across all clients. Filters: client, status, priority, billing_type.
2. /portal/admin/r/[id] — request detail with status dropdown, billing_type dropdown, internal-notes toggle on the comment form, ability to upload completion screenshots.
3. /portal/admin/clients — list of all clients with add/edit.
4. Mobile-first: status changes must be doable in one tap on a phone.
5. Enforce admin-only access in middleware AND via RLS on writes.

Reference Section 6 for any UI copy. Reference Section 3 guardrail #7 — billing_type must never be exposed to clients.
```

### Session 5: Email notifications

```
Wire up Resend for transactional email per CLIENT_HUB_PLAN.md Section 7.6 and Section 6 templates.

Tasks:
1. Add RESEND_API_KEY to env.
2. Create src/lib/email.ts with one helper function per template in Section 6.
3. Trigger emails from API routes when:
   - A request is created → email to client + email to Bill
   - Status changes to `waiting_on_client` → email to client
   - Other status transitions (in_progress, complete) deliberately do NOT email — see §6
4. Every email includes a direct link to the request.
5. Use the EXACT subject lines and body copy from Section 6.

Test by submitting a real request as a test client and confirming both emails arrive.
```

### Session 6: Onboard real clients

**Not a code session.** Bill manually:
1. Creates Supabase auth users for Eric (Fitchin), Michael (Modern Classic), Andrew (All Transport), and the 4th client.
2. Links each to their `clients` record via `client_users`.
3. Sends them their first magic link.
4. Walks each through their first request via screen-share or in person.
5. Notes friction points for Phase 2.

---

## 12. Working Notes for Future Sessions

- **This document is the source of truth.** If a question is answered here, follow the plan.
- **If a question ISN'T answered here, ask Bill before improvising.** Architecture decisions should be explicit, not accidental.
- **Lock with a repo-level CLAUDE.md guardrail** once Phase 1 ships — same pattern Bill used for Modern Classic's "Book Ahead" feature. No speculative rework of Phase 1 surfaces without a concrete trigger.
- **Naming convention:** the project is called "Client Hub" in user-facing language and "the portal" or "client portal" internally. Don't mix these or invent new names.
- **All admin operations use the Supabase service role key on server-side API routes.** Never ship the service role key to the browser.

---

*Last updated: May 13, 2026. Owned by Bill / Designed to Elevate.*

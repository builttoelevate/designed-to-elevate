-- Per-client email notification preferences.
--
-- Each row is one notification type toggled for one client. A MISSING row
-- means "use the code default" (see src/lib/notifications.ts) — so we only
-- ever write a row when the admin changes a toggle away from, or back to, an
-- explicit value. Defaults today:
--   request_received          → on
--   status_waiting_on_client  → on
--   job_complete              → on
--   new_message               → off
--
-- All app access is through the service role (which bypasses RLS); the
-- admin-only policy below just denies direct client access.
--
-- Idempotent — safe to re-run.

create table if not exists public.client_notification_settings (
  client_id        uuid not null references public.clients(id) on delete cascade,
  notification_key text not null,
  enabled          boolean not null default true,
  updated_at       timestamptz not null default now(),
  primary key (client_id, notification_key)
);

alter table public.client_notification_settings enable row level security;

drop policy if exists "client_notification_settings_admin_all" on public.client_notification_settings;
create policy "client_notification_settings_admin_all"
  on public.client_notification_settings for all
  using (public.is_admin())
  with check (public.is_admin());

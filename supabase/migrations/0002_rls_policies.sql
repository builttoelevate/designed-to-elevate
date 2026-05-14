-- Designed to Elevate — Client Hub
-- Row-level security policies for the Client Hub tables.
--
-- Source of truth: CLIENT_HUB_PLAN.md §4 (RLS Policies)
--
-- Rule of thumb:
--   • Clients can only see their own rows (scoped via client_users)
--   • Admins use the service role on server-side API routes → bypasses RLS
--   • billing_type cannot be changed by clients (enforced by trigger in 0001)

------------------------------------------------------------------------------
-- helper: is current caller an admin?
------------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.client_ids_for_current_user()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select client_id from public.client_users where user_id = auth.uid();
$$;

------------------------------------------------------------------------------
-- enable RLS
------------------------------------------------------------------------------
alter table public.clients          enable row level security;
alter table public.profiles         enable row level security;
alter table public.client_users     enable row level security;
alter table public.requests         enable row level security;
alter table public.request_files    enable row level security;
alter table public.comments         enable row level security;
alter table public.request_activity enable row level security;

------------------------------------------------------------------------------
-- clients
------------------------------------------------------------------------------
drop policy if exists "clients_select_own" on public.clients;
create policy "clients_select_own"
  on public.clients for select
  using (
    public.is_admin()
    or id in (select public.client_ids_for_current_user())
  );

-- writes happen via service role only.

------------------------------------------------------------------------------
-- profiles
------------------------------------------------------------------------------
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- prevent self-promotion to admin
    and role = (select role from public.profiles where id = auth.uid())
  );

------------------------------------------------------------------------------
-- client_users
------------------------------------------------------------------------------
drop policy if exists "client_users_select_own" on public.client_users;
create policy "client_users_select_own"
  on public.client_users for select
  using (user_id = auth.uid() or public.is_admin());

------------------------------------------------------------------------------
-- requests
------------------------------------------------------------------------------
drop policy if exists "requests_select_own_or_admin" on public.requests;
create policy "requests_select_own_or_admin"
  on public.requests for select
  using (
    public.is_admin()
    or client_id in (select public.client_ids_for_current_user())
  );

drop policy if exists "requests_insert_own" on public.requests;
create policy "requests_insert_own"
  on public.requests for insert
  with check (
    public.is_admin()
    or (
      submitted_by = auth.uid()
      and client_id in (select public.client_ids_for_current_user())
    )
  );

drop policy if exists "requests_update_own_while_new" on public.requests;
create policy "requests_update_own_while_new"
  on public.requests for update
  using (
    public.is_admin()
    or (
      client_id in (select public.client_ids_for_current_user())
      and status = 'new'
    )
  )
  with check (
    public.is_admin()
    or (
      client_id in (select public.client_ids_for_current_user())
      and status = 'new'
    )
  );

------------------------------------------------------------------------------
-- request_files
------------------------------------------------------------------------------
drop policy if exists "request_files_select_own_or_admin" on public.request_files;
create policy "request_files_select_own_or_admin"
  on public.request_files for select
  using (
    public.is_admin()
    or request_id in (
      select id from public.requests
      where client_id in (select public.client_ids_for_current_user())
    )
  );

drop policy if exists "request_files_insert_own_or_admin" on public.request_files;
create policy "request_files_insert_own_or_admin"
  on public.request_files for insert
  with check (
    public.is_admin()
    or request_id in (
      select id from public.requests
      where client_id in (select public.client_ids_for_current_user())
    )
  );

------------------------------------------------------------------------------
-- comments
------------------------------------------------------------------------------
drop policy if exists "comments_select_public_or_admin" on public.comments;
create policy "comments_select_public_or_admin"
  on public.comments for select
  using (
    public.is_admin()
    or (
      visibility = 'public'
      and request_id in (
        select id from public.requests
        where client_id in (select public.client_ids_for_current_user())
      )
    )
  );

drop policy if exists "comments_insert_public_only" on public.comments;
create policy "comments_insert_public_only"
  on public.comments for insert
  with check (
    public.is_admin()
    or (
      visibility = 'public'
      and author_id = auth.uid()
      and request_id in (
        select id from public.requests
        where client_id in (select public.client_ids_for_current_user())
      )
    )
  );

------------------------------------------------------------------------------
-- request_activity  (read-only for clients on their own requests)
------------------------------------------------------------------------------
drop policy if exists "request_activity_select_own_or_admin" on public.request_activity;
create policy "request_activity_select_own_or_admin"
  on public.request_activity for select
  using (
    public.is_admin()
    or request_id in (
      select id from public.requests
      where client_id in (select public.client_ids_for_current_user())
    )
  );
-- inserts come from server-side service role only.

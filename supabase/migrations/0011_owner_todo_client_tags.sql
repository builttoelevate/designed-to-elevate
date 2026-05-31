-- Client tagging for owner todos.
--
-- A todo can be associated with:
--   - no clients (general / not client-specific) — both join table empty
--     and applies_to_all_clients = false.
--   - one or more specific clients — rows in owner_todo_clients.
--   - "all clients" — applies_to_all_clients = true. The join table is
--     treated as empty when this flag is true (UI clears it on toggle).
--
-- Filter semantics on /portal/admin/todos:
--   ?client=<id>          → todo is tagged with that client OR
--                           applies_to_all_clients = true.
--   ?client=unassigned    → no tag rows AND applies_to_all_clients = false.
--   (no ?client param)    → no filter, show everything.
--
-- All app access goes through the service-role client (which bypasses RLS);
-- the admin-only policies below just block direct access from the anon key.
--
-- Idempotent — safe to re-run.

-- 1. owner_todos: flag for "applies to every client"
alter table public.owner_todos
  add column if not exists applies_to_all_clients boolean not null default false;

-- 2. owner_todo_clients: many-to-many between todos and clients
create table if not exists public.owner_todo_clients (
  todo_id    uuid not null references public.owner_todos(id) on delete cascade,
  client_id  uuid not null references public.clients(id)     on delete cascade,
  created_at timestamptz not null default now(),
  primary key (todo_id, client_id)
);

create index if not exists owner_todo_clients_client_idx
  on public.owner_todo_clients (client_id);

alter table public.owner_todo_clients enable row level security;

drop policy if exists "admin sees todo client tags"   on public.owner_todo_clients;
drop policy if exists "admin manages todo client tags" on public.owner_todo_clients;

create policy "admin sees todo client tags"
  on public.owner_todo_clients for select
  using (
    public.is_admin()
    and exists (
      select 1 from public.owner_todos
      where public.owner_todos.id       = owner_todo_clients.todo_id
        and public.owner_todos.owner_id = auth.uid()
    )
  );

create policy "admin manages todo client tags"
  on public.owner_todo_clients for all
  using (
    public.is_admin()
    and exists (
      select 1 from public.owner_todos
      where public.owner_todos.id       = owner_todo_clients.todo_id
        and public.owner_todos.owner_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    and exists (
      select 1 from public.owner_todos
      where public.owner_todos.id       = owner_todo_clients.todo_id
        and public.owner_todos.owner_id = auth.uid()
    )
  );

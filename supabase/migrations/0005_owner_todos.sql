-- Designed to Elevate — Client Hub
-- Owner personal todos.
--
-- The /portal/admin queue already tracks client-submitted change requests.
-- This table is the orthogonal "things I personally need to do" list — jobs
-- the owner adds for himself so he doesn't forget them while away from his
-- computer. Not linked to clients, not visible to clients.
--
-- Scoped per-admin via owner_id so the schema stays correct if a second
-- admin is ever added. Today there's one admin (the owner).

create table if not exists public.owner_todos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(trim(title)) > 0 and length(title) <= 280),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists owner_todos_owner_open_idx
  on public.owner_todos (owner_id, completed, created_at desc);

alter table public.owner_todos enable row level security;

drop policy if exists "admin sees own todos"    on public.owner_todos;
drop policy if exists "admin inserts own todos" on public.owner_todos;
drop policy if exists "admin updates own todos" on public.owner_todos;
drop policy if exists "admin deletes own todos" on public.owner_todos;

create policy "admin sees own todos"
  on public.owner_todos for select
  using (public.is_admin() and owner_id = auth.uid());

create policy "admin inserts own todos"
  on public.owner_todos for insert
  with check (public.is_admin() and owner_id = auth.uid());

create policy "admin updates own todos"
  on public.owner_todos for update
  using (public.is_admin() and owner_id = auth.uid())
  with check (public.is_admin() and owner_id = auth.uid());

create policy "admin deletes own todos"
  on public.owner_todos for delete
  using (public.is_admin() and owner_id = auth.uid());

------------------------------------------------------------------------------
-- completed_at auto-stamp when completed flips true (mirrors the
-- requests.completed_at trigger in 0001_initial_schema.sql lines 178–189).
------------------------------------------------------------------------------
create or replace function public.owner_todos_set_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.completed = true and (old.completed is distinct from true) then
    new.completed_at = now();
  elsif new.completed = false then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists owner_todos_completed_at on public.owner_todos;
create trigger owner_todos_completed_at
  before update on public.owner_todos
  for each row execute function public.owner_todos_set_completed_at();

-- Designed to Elevate — Client Hub
-- Owner personal todos v2: add body, due date, attachments.
--
-- Builds on 0005_owner_todos.sql. Existing rows stay valid because all new
-- columns are nullable (or have defaults).
--
-- Storage bucket convention: <owner_id>/<todo_id>/<attachment_id>-<filename>
-- so storage.foldername() returns [owner_id, todo_id, ...] and we can scope
-- access by checking the first segment against auth.uid().

------------------------------------------------------------------------------
-- 1. owner_todos: tighten title check, add body / due_at / updated_at
------------------------------------------------------------------------------

-- Drop the 280-char check from v1 and add a 200-char one. (Postgres names the
-- inline check constraint owner_todos_title_check; we use IF EXISTS just in
-- case it was named differently in a fresh install.)
alter table public.owner_todos drop constraint if exists owner_todos_title_check;
alter table public.owner_todos
  add constraint owner_todos_title_check
  check (length(trim(title)) > 0 and length(title) <= 200);

alter table public.owner_todos
  add column if not exists body text
    check (body is null or length(body) <= 50000);

alter table public.owner_todos
  add column if not exists due_at timestamptz;

alter table public.owner_todos
  add column if not exists updated_at timestamptz not null default now();

-- Helpful when scanning open todos sorted by due_at.
create index if not exists owner_todos_owner_due_idx
  on public.owner_todos (owner_id, completed, due_at);

------------------------------------------------------------------------------
-- updated_at auto-bump on every row update.
-- Mirrors the completed_at trigger pattern from 0005.
------------------------------------------------------------------------------
create or replace function public.owner_todos_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists owner_todos_updated_at on public.owner_todos;
create trigger owner_todos_updated_at
  before update on public.owner_todos
  for each row execute function public.owner_todos_set_updated_at();

------------------------------------------------------------------------------
-- 2. owner_todo_attachments
------------------------------------------------------------------------------
create table if not exists public.owner_todo_attachments (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null references public.owner_todos(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 104857600),
  created_at timestamptz not null default now()
);

create index if not exists owner_todo_attachments_todo_idx
  on public.owner_todo_attachments (todo_id, created_at desc);

alter table public.owner_todo_attachments enable row level security;

drop policy if exists "admin sees own todo attachments"    on public.owner_todo_attachments;
drop policy if exists "admin inserts own todo attachments" on public.owner_todo_attachments;
drop policy if exists "admin updates own todo attachments" on public.owner_todo_attachments;
drop policy if exists "admin deletes own todo attachments" on public.owner_todo_attachments;

create policy "admin sees own todo attachments"
  on public.owner_todo_attachments for select
  using (public.is_admin() and owner_id = auth.uid());

create policy "admin inserts own todo attachments"
  on public.owner_todo_attachments for insert
  with check (public.is_admin() and owner_id = auth.uid());

create policy "admin updates own todo attachments"
  on public.owner_todo_attachments for update
  using (public.is_admin() and owner_id = auth.uid())
  with check (public.is_admin() and owner_id = auth.uid());

create policy "admin deletes own todo attachments"
  on public.owner_todo_attachments for delete
  using (public.is_admin() and owner_id = auth.uid());

------------------------------------------------------------------------------
-- 3. Storage bucket: owner-todo-attachments (private)
--
-- Mirrors the request-files bucket pattern from 0003_storage_bucket.sql.
-- Server-side code uses the service-role client to upload/delete, so these
-- policies primarily guard against a misuse of the anon/authed client.
-- Path: <owner_id>/<todo_id>/<attachment_id>-<filename>
--   storage.foldername(name)[1] = owner_id
------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('owner-todo-attachments', 'owner-todo-attachments', false)
on conflict (id) do nothing;

drop policy if exists "owner_todo_attachments_read"   on storage.objects;
drop policy if exists "owner_todo_attachments_insert" on storage.objects;
drop policy if exists "owner_todo_attachments_update" on storage.objects;
drop policy if exists "owner_todo_attachments_delete" on storage.objects;

create policy "owner_todo_attachments_read"
  on storage.objects for select
  using (
    bucket_id = 'owner-todo-attachments'
    and public.is_admin()
    and (storage.foldername(name))[1]::uuid = auth.uid()
  );

create policy "owner_todo_attachments_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'owner-todo-attachments'
    and public.is_admin()
    and (storage.foldername(name))[1]::uuid = auth.uid()
  );

create policy "owner_todo_attachments_update"
  on storage.objects for update
  using (
    bucket_id = 'owner-todo-attachments'
    and public.is_admin()
    and (storage.foldername(name))[1]::uuid = auth.uid()
  );

create policy "owner_todo_attachments_delete"
  on storage.objects for delete
  using (
    bucket_id = 'owner-todo-attachments'
    and public.is_admin()
    and (storage.foldername(name))[1]::uuid = auth.uid()
  );

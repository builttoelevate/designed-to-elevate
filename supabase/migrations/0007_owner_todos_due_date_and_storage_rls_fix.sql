-- Designed to Elevate — Client Hub
-- Patch on top of 0006_owner_todos_v2.sql.
--
-- This migration captures two changes that were applied to production by
-- hand after 0006 shipped, recorded here so the migrations folder reflects
-- what's actually live:
--
--   1. owner_todos.due_at  timestamptz → date
--      A "due date" is a calendar date, not an end-of-day timestamp; the
--      app code reads/writes YYYY-MM-DD strings and the column needs to
--      match.
--
--   2. owner_todo_attachments_* storage policies: cast the path segment
--      to text and compare against auth.uid()::text rather than casting
--      it to uuid. Defensive — a malformed object name (e.g. a stray
--      manual upload at the bucket root) won't throw a uuid cast error
--      and break access checks for every other row.
--
-- Both steps are idempotent: re-running this migration on a database that
-- already has these changes is a no-op aside from the policy recreates.

------------------------------------------------------------------------------
-- 1. owner_todos.due_at → date
------------------------------------------------------------------------------
alter table public.owner_todos
  alter column due_at type date using due_at::date;

------------------------------------------------------------------------------
-- 2. Storage policies: ::uuid cast → ::text compare
------------------------------------------------------------------------------
drop policy if exists "owner_todo_attachments_read"   on storage.objects;
drop policy if exists "owner_todo_attachments_insert" on storage.objects;
drop policy if exists "owner_todo_attachments_update" on storage.objects;
drop policy if exists "owner_todo_attachments_delete" on storage.objects;

create policy "owner_todo_attachments_read"
  on storage.objects for select
  using (
    bucket_id = 'owner-todo-attachments'
    and public.is_admin()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owner_todo_attachments_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'owner-todo-attachments'
    and public.is_admin()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owner_todo_attachments_update"
  on storage.objects for update
  using (
    bucket_id = 'owner-todo-attachments'
    and public.is_admin()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owner_todo_attachments_delete"
  on storage.objects for delete
  using (
    bucket_id = 'owner-todo-attachments'
    and public.is_admin()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

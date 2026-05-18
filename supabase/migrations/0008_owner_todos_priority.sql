-- Designed to Elevate — Client Hub
-- Owner todos: add urgency/priority so the most important items can float
-- to the top of the list ahead of anything else.
--
-- Stored as smallint so the existing sort plumbing (Supabase .order()) can
-- order rows by priority desc without a CASE expression:
--   0 = low, 1 = normal (default), 2 = high
--
-- Idempotent — safe to re-run.

alter table public.owner_todos
  add column if not exists priority smallint not null default 1;

alter table public.owner_todos drop constraint if exists owner_todos_priority_check;
alter table public.owner_todos
  add constraint owner_todos_priority_check
  check (priority in (0, 1, 2));

-- Composite index supporting the new sort: priority desc, due_at asc nulls last.
create index if not exists owner_todos_owner_priority_due_idx
  on public.owner_todos (owner_id, completed, priority desc, due_at);

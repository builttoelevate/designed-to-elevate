-- Designed to Elevate — Client Hub
-- Initial schema: clients, profiles, client_users, requests, request_files,
-- comments, request_activity.
--
-- Source of truth: CLIENT_HUB_PLAN.md §4

------------------------------------------------------------------------------
-- clients
------------------------------------------------------------------------------
create table if not exists public.clients (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null,
  business_name         text not null,
  primary_contact_email text not null,
  site_url              text,
  status                text not null default 'active'
    check (status in ('active', 'paused', 'archived')),
  created_at            timestamptz not null default now()
);

------------------------------------------------------------------------------
-- profiles  (extends auth.users)
------------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       text not null default 'client'
    check (role in ('admin', 'client')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

------------------------------------------------------------------------------
-- client_users  (join: which auth users belong to which client business)
------------------------------------------------------------------------------
create table if not exists public.client_users (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  client_id  uuid not null references public.clients(id)  on delete cascade,
  role       text not null default 'member'
    check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists client_users_user_idx   on public.client_users (user_id);
create index if not exists client_users_client_idx on public.client_users (client_id);

------------------------------------------------------------------------------
-- requests
------------------------------------------------------------------------------
create table if not exists public.requests (
  id                        uuid primary key default gen_random_uuid(),
  client_id                 uuid not null references public.clients(id),
  submitted_by              uuid not null references public.profiles(id),
  title                     text not null,
  description               text not null,
  category                  text not null
    check (category in ('text', 'image', 'layout', 'new_feature', 'broken')),
  priority                  text not null default 'normal'
    check (priority in ('normal', 'important', 'urgent')),
  status                    text not null default 'new'
    check (status in ('new', 'in_progress', 'waiting_on_client', 'complete')),
  page_url                  text,
  billing_type              text not null default 'included'
    check (billing_type in ('included', 'billable', 'needs_estimate', 'courtesy')),
  preferred_completion_date date,
  created_at                timestamptz not null default now(),
  completed_at              timestamptz
);

create index if not exists requests_client_idx     on public.requests (client_id);
create index if not exists requests_status_idx     on public.requests (status);
create index if not exists requests_created_idx    on public.requests (created_at desc);

------------------------------------------------------------------------------
-- request_files
------------------------------------------------------------------------------
create table if not exists public.request_files (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.requests(id) on delete cascade,
  file_url    text not null,
  filename    text not null,
  uploaded_by uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

create index if not exists request_files_request_idx on public.request_files (request_id);

------------------------------------------------------------------------------
-- comments
------------------------------------------------------------------------------
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  author_id  uuid not null references public.profiles(id),
  body       text not null,
  visibility text not null default 'public'
    check (visibility in ('public', 'internal')),
  created_at timestamptz not null default now()
);

create index if not exists comments_request_idx on public.comments (request_id);

------------------------------------------------------------------------------
-- request_activity  (audit log)
------------------------------------------------------------------------------
create table if not exists public.request_activity (
  id         uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  actor_id   uuid references public.profiles(id),
  action     text not null,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists request_activity_request_idx on public.request_activity (request_id);

------------------------------------------------------------------------------
-- guard: clients cannot modify billing_type
------------------------------------------------------------------------------
create or replace function public.guard_billing_type()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
begin
  -- Service-role calls come through with auth.uid() null → allow.
  if auth.uid() is null then
    return new;
  end if;

  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role = 'admin' then
    return new;
  end if;

  if new.billing_type is distinct from old.billing_type then
    raise exception 'billing_type is admin-only';
  end if;
  return new;
end;
$$;

drop trigger if exists requests_billing_type_guard on public.requests;
create trigger requests_billing_type_guard
  before update on public.requests
  for each row execute function public.guard_billing_type();

------------------------------------------------------------------------------
-- completed_at auto-stamp when status flips to complete
------------------------------------------------------------------------------
create or replace function public.stamp_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'complete' and (old.status is distinct from 'complete') then
    new.completed_at = now();
  elsif new.status <> 'complete' then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists requests_stamp_completed_at on public.requests;
create trigger requests_stamp_completed_at
  before update on public.requests
  for each row execute function public.stamp_completed_at();

-- Designed to Elevate — Client Hub
-- Storage bucket for request file attachments.
--
-- Bucket: request-files  (private; access via signed URLs only)
-- Path convention: <client_id>/<request_id>/<filename>

insert into storage.buckets (id, name, public)
values ('request-files', 'request-files', false)
on conflict (id) do nothing;

------------------------------------------------------------------------------
-- Object-level policies.
-- Path convention is "<client_id>/<request_id>/<filename>", so storage.foldername()
-- returns [client_id, request_id, ...]. We check the first segment against the
-- caller's client_users links (or admin role).
------------------------------------------------------------------------------
drop policy if exists "request_files_read" on storage.objects;
create policy "request_files_read"
  on storage.objects for select
  using (
    bucket_id = 'request-files'
    and (
      public.is_admin()
      or (storage.foldername(name))[1]::uuid in (
        select public.client_ids_for_current_user()
      )
    )
  );

drop policy if exists "request_files_insert" on storage.objects;
create policy "request_files_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'request-files'
    and (
      public.is_admin()
      or (storage.foldername(name))[1]::uuid in (
        select public.client_ids_for_current_user()
      )
    )
  );

drop policy if exists "request_files_delete" on storage.objects;
create policy "request_files_delete"
  on storage.objects for delete
  using (
    bucket_id = 'request-files'
    and (
      public.is_admin()
      or (storage.foldername(name))[1]::uuid in (
        select public.client_ids_for_current_user()
      )
    )
  );

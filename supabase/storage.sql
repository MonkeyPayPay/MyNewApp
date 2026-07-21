-- Documents storage bucket (private)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Only circle members can upload to their circle's folder
create policy "circle_members_upload_documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] in (
      select cm.circle_id::text
      from circle_members cm
      where cm.user_id = auth.uid()
    )
  );

-- Only circle members can read documents in their circle's folder
create policy "circle_members_read_documents"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] in (
      select cm.circle_id::text
      from circle_members cm
      where cm.user_id = auth.uid()
    )
  );

-- Users can delete their own uploads
create policy "owners_delete_documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and owner = auth.uid()
  );

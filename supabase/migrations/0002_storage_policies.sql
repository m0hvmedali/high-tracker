-- Create media bucket (run once)
insert into storage.buckets (id, public) values ('media', true)
  on conflict (id) do nothing;

-- Policies on storage.objects
alter table storage.objects enable row level security;

create policy if not exists "Public read media"
  on storage.objects for select using ( bucket_id = 'media' );

create policy if not exists "Teachers/Admin can upload to media"
  on storage.objects for insert with check (
    bucket_id = 'media' and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin')
    )
  );

create policy if not exists "Teachers/Admin can update media"
  on storage.objects for update using (
    bucket_id = 'media' and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin')
    )
  ) with check (
    bucket_id = 'media'
  );

create policy if not exists "Teachers/Admin can delete media"
  on storage.objects for delete using (
    bucket_id = 'media' and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin')
    )
  );

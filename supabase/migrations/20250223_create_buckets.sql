-- Create storage buckets
insert into storage.buckets (id, name)
values ('stamps', 'stamps')
on conflict (id) do nothing;

-- Set up storage policies
create policy "Stamps bucket is accessible by everyone"
on storage.objects for select
using ( bucket_id = 'stamps' );

create policy "Stamps bucket is insertable by authenticated users"
on storage.objects for insert
with check ( bucket_id = 'stamps' );

create policy "Stamps bucket is updatable by authenticated users"
on storage.objects for update
using ( bucket_id = 'stamps' );

create policy "Stamps bucket is deletable by authenticated users"
on storage.objects for delete
using ( bucket_id = 'stamps' );

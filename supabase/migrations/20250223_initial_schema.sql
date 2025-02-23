-- Create tables for Epic Moments
-- Enable RLS (Row Level Security)
alter table if exists public.videos enable row level security;
alter table if exists public.stamps enable row level security;
alter table if exists public.associations enable row level security;

-- Create videos table
create table if not exists public.videos (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    video_url text not null,
    thumbnail_url text
);

-- Create stamps table
create table if not exists public.stamps (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    image_url text not null,
    detection_data jsonb -- Stores detection patterns/features
);

-- Create associations table
create table if not exists public.associations (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    stamp_id uuid references public.stamps(id) on delete cascade not null,
    video_id uuid references public.videos(id) on delete cascade not null,
    unique(stamp_id, video_id)
);

-- Create policies
create policy "Videos are viewable by everyone"
    on videos for select
    using (true);

create policy "Videos are insertable by authenticated users"
    on videos for insert
    with check (true);

create policy "Videos are updatable by authenticated users"
    on videos for update
    using (true);

create policy "Videos are deletable by authenticated users"
    on videos for delete
    using (true);

-- Repeat for stamps
create policy "Stamps are viewable by everyone"
    on stamps for select
    using (true);

create policy "Stamps are insertable by authenticated users"
    on stamps for insert
    with check (true);

create policy "Stamps are updatable by authenticated users"
    on stamps for update
    using (true);

create policy "Stamps are deletable by authenticated users"
    on stamps for delete
    using (true);

-- Repeat for associations
create policy "Associations are viewable by everyone"
    on associations for select
    using (true);

create policy "Associations are insertable by authenticated users"
    on associations for insert
    with check (true);

create policy "Associations are updatable by authenticated users"
    on associations for update
    using (true);

create policy "Associations are deletable by authenticated users"
    on associations for delete
    using (true);

-- Create indexes for better performance
create index if not exists stamps_name_idx on stamps (name);
create index if not exists associations_stamp_id_idx on associations (stamp_id);
create index if not exists associations_video_id_idx on associations (video_id);

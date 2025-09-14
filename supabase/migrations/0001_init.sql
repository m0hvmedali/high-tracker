-- Enable extensions
create extension if not exists pgcrypto;

-- Enum for roles
create type public.user_role as enum ('student','teacher','admin');

-- profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  name text,
  avatar_url text,
  role public.user_role not null default 'student',
  created_at timestamptz default now()
);

-- subjects
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  cover_url text,
  visibility text check (visibility in ('private','unlisted','public')) default 'private',
  created_at timestamptz default now()
);

-- sections
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects(id) on delete cascade,
  title text not null,
  ord integer default 0
);

-- lessons
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references public.sections(id) on delete cascade,
  title text not null,
  description text,
  duration integer,
  tags text[],
  transcript text,
  metadata jsonb default '{}'::jsonb
);

-- media_assets
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  type text check (type in ('diagram','audio','video','pdf')),
  url text,
  caption text,
  thumb_url text,
  size bigint
);

-- quizzes
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  settings jsonb not null default '{"attempts":1,"timeLimit":0,"passScore":60,"showSolutions":"after_end"}',
  questions jsonb not null
);

-- attempts
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  score numeric,
  started_at timestamptz default now(),
  finished_at timestamptz,
  details jsonb
);

-- notes
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text,
  bookmark_ts numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- progress
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  video_ts numeric,
  audio_ts numeric,
  completed boolean default false,
  last_seen timestamptz default now()
);

-- shares
create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  resource_type text check (resource_type in ('subject','section','lesson')),
  resource_id uuid not null,
  owner_id uuid references public.profiles(id) on delete cascade,
  shared_with_user_id uuid references public.profiles(id),
  token text,
  expires_at timestamptz,
  permission text check (permission in ('view','edit','publish')) default 'view'
);

-- RLS
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.sections enable row level security;
alter table public.lessons enable row level security;
alter table public.media_assets enable row level security;
alter table public.quizzes enable row level security;
alter table public.attempts enable row level security;
alter table public.notes enable row level security;
alter table public.progress enable row level security;
alter table public.shares enable row level security;

-- Helper: current user id
create or replace function public.uid() returns uuid as $$
  select coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
$$ language sql stable;

-- profiles policies
create policy if not exists "profiles self access" on public.profiles
  for select using (id = auth.uid())
  with check (id = auth.uid());

create policy if not exists "profiles admin manage" on public.profiles
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- subjects read policy
create policy if not exists "subjects public read" on public.subjects for select
  using (
    visibility = 'public'
    or owner_id = auth.uid()
    or exists (
      select 1 from public.shares s
      where s.resource_type = 'subject' and s.resource_id = subjects.id
        and (s.shared_with_user_id = auth.uid() or (s.token is not null and s.expires_at > now()))
    )
  );

-- subjects write (owner or teacher/admin)
create policy if not exists "subjects write" on public.subjects for all
  using (
    owner_id = auth.uid() or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin')
    )
  ) with check (
    owner_id = auth.uid() or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin')
    )
  );

-- sections read/write similar via subject visibility/ownership
create policy if not exists "sections read" on public.sections for select using (
  exists (select 1 from public.subjects sub where sub.id = sections.subject_id and (
    sub.visibility = 'public' or sub.owner_id = auth.uid()
  ))
);
create policy if not exists "sections write" on public.sections for all using (
  exists (select 1 from public.subjects sub where sub.id = sections.subject_id and (
    sub.owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin'))
  ))
) with check (
  exists (select 1 from public.subjects sub where sub.id = sections.subject_id and (
    sub.owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin'))
  ))
);

-- lessons policies
create policy if not exists "lessons read" on public.lessons for select using (
  exists (
    select 1 from public.sections sec join public.subjects sub on sub.id = sec.subject_id
    where sec.id = lessons.section_id and (sub.visibility = 'public' or sub.owner_id = auth.uid())
  )
);
create policy if not exists "lessons write" on public.lessons for all using (
  exists (
    select 1 from public.sections sec join public.subjects sub on sub.id = sec.subject_id
    where sec.id = lessons.section_id and (sub.owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin')))
  )
) with check (
  exists (
    select 1 from public.sections sec join public.subjects sub on sub.id = sec.subject_id
    where sec.id = lessons.section_id and (sub.owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin')))
  )
);

-- media assets
create policy if not exists "media read" on public.media_assets for select using (
  exists (
    select 1 from public.lessons l join public.sections sec on sec.id = l.section_id join public.subjects sub on sub.id = sec.subject_id
    where l.id = media_assets.lesson_id and (sub.visibility = 'public' or sub.owner_id = auth.uid())
  )
);
create policy if not exists "media write" on public.media_assets for all using (
  exists (
    select 1 from public.lessons l join public.sections sec on sec.id = l.section_id join public.subjects sub on sub.id = sec.subject_id
    where l.id = media_assets.lesson_id and (sub.owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin')))
  )
) with check (
  exists (
    select 1 from public.lessons l join public.sections sec on sec.id = l.section_id join public.subjects sub on sub.id = sec.subject_id
    where l.id = media_assets.lesson_id and (sub.owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin')))
  )
);

-- quizzes
create policy if not exists "quizzes read" on public.quizzes for select using (
  exists (
    select 1 from public.lessons l join public.sections sec on sec.id = l.section_id join public.subjects sub on sub.id = sec.subject_id
    where l.id = quizzes.lesson_id and (sub.visibility = 'public' or sub.owner_id = auth.uid())
  )
);
create policy if not exists "quizzes write" on public.quizzes for all using (
  exists (
    select 1 from public.lessons l join public.sections sec on sec.id = l.section_id join public.subjects sub on sub.id = sec.subject_id
    where l.id = quizzes.lesson_id and (sub.owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin')))
  )
) with check (
  exists (
    select 1 from public.lessons l join public.sections sec on sec.id = l.section_id join public.subjects sub on sub.id = sec.subject_id
    where l.id = quizzes.lesson_id and (sub.owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin')))
  )
);

-- attempts: only owner user
create policy if not exists "attempts self" on public.attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- notes: only owner user
create policy if not exists "notes self" on public.notes for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- progress: only owner user
create policy if not exists "progress self" on public.progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- shares: owner can manage; read for tokens or shared user
create policy if not exists "shares read" on public.shares for select using (
  owner_id = auth.uid() or shared_with_user_id = auth.uid() or (token is not null and expires_at > now())
);
create policy if not exists "shares write" on public.shares for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Storage bucket (create via dashboard): media bucket RLS is set in storage policies.

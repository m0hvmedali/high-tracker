-- Enable required extensions
create extension if not exists pgcrypto;

-- Profiles table (1-1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  role text check (role in ('student','teacher','admin')) default 'student',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Insert a profile on new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Subjects
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_url text,
  owner uuid references public.profiles(id),
  is_published boolean default false,
  created_at timestamptz default now()
);

alter table public.subjects enable row level security;
create index if not exists subjects_owner_idx on public.subjects(owner);
create index if not exists subjects_published_idx on public.subjects(is_published);

-- Sections
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  description text,
  order_int int default 0
);

alter table public.sections enable row level security;
create index if not exists sections_subject_idx on public.sections(subject_id);

-- Lessons
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  title text not null,
  description text,
  duration int,
  tags text[],
  is_published boolean default false,
  owner uuid references public.profiles(id),
  transcript jsonb,
  created_at timestamptz default now()
);

alter table public.lessons enable row level security;
create index if not exists lessons_section_idx on public.lessons(section_id);
create index if not exists lessons_owner_idx on public.lessons(owner);
create index if not exists lessons_published_idx on public.lessons(is_published);

-- Media assets
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  kind text check (kind in ('diagram','audio','video','pdf')) not null,
  title text,
  storage_path text,
  meta jsonb,
  order_int int default 0
);

alter table public.media_assets enable row level security;
create index if not exists media_lesson_idx on public.media_assets(lesson_id);

-- Quizzes
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  settings jsonb
);

alter table public.quizzes enable row level security;
create index if not exists quizzes_lesson_idx on public.quizzes(lesson_id);

-- Quiz questions
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  type text,
  question text,
  options jsonb,
  answer jsonb,
  explanation text,
  order_int int
);

alter table public.quiz_questions enable row level security;
create index if not exists quiz_questions_quiz_idx on public.quiz_questions(quiz_id);

-- Quiz attempts
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  started_at timestamptz default now(),
  finished_at timestamptz,
  score numeric,
  answers jsonb
);

alter table public.quiz_attempts enable row level security;
create index if not exists attempts_quiz_idx on public.quiz_attempts(quiz_id);
create index if not exists attempts_user_idx on public.quiz_attempts(user_id);

-- Progress
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  completed boolean default false,
  watch_seconds int default 0,
  last_video_pos numeric default 0,
  updated_at timestamptz default now()
);

alter table public.progress enable row level security;
create index if not exists progress_lesson_user_idx on public.progress(lesson_id, user_id);

-- Notes
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  content text,
  bookmarks jsonb,
  updated_at timestamptz default now()
);

alter table public.notes enable row level security;
create index if not exists notes_lesson_user_idx on public.notes(lesson_id, user_id);

-- Shares
create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  resource_type text check (resource_type in ('subject','section','lesson')) not null,
  resource_id uuid not null,
  created_by uuid references public.profiles(id) default auth.uid(),
  token text unique not null,
  expires_at timestamptz,
  password_hash text,
  scopes text[],
  created_at timestamptz default now()
);

alter table public.shares enable row level security;
create index if not exists shares_resource_idx on public.shares(resource_type, resource_id);
create index if not exists shares_creator_idx on public.shares(created_by);

-- Helper: is admin
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists(
    select 1 from public.profiles p where p.id = uid and p.role = 'admin'
  );
$$;

-- Policies
-- profiles: users can select/update their own row; admins can select all; role updates only by admin
create policy "select own or admin" on public.profiles for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "update own no role change" on public.profiles for update
  using (auth.uid() = id)
  with check (coalesce(new.role, old.role) = old.role);

create policy "admin update profiles" on public.profiles for update
  using (public.is_admin(auth.uid()))
  with check (true);

-- subjects
create policy "subjects read published or owner or admin" on public.subjects for select
  using (
    is_published = true or owner = auth.uid() or public.is_admin(auth.uid())
  );

create policy "subjects write owner or admin" on public.subjects for all
  using (owner = auth.uid() or public.is_admin(auth.uid()))
  with check (owner = auth.uid() or public.is_admin(auth.uid()));

-- sections (join to subject)
create policy "sections read published or owner or admin" on public.sections for select
  using (
    exists (
      select 1 from public.subjects s where s.id = sections.subject_id and (
        s.is_published = true or s.owner = auth.uid() or public.is_admin(auth.uid())
      )
    )
  );

create policy "sections write owner or admin" on public.sections for all
  using (
    exists (
      select 1 from public.subjects s where s.id = sections.subject_id and (s.owner = auth.uid() or public.is_admin(auth.uid()))
    )
  )
  with check (
    exists (
      select 1 from public.subjects s where s.id = sections.subject_id and (s.owner = auth.uid() or public.is_admin(auth.uid()))
    )
  );

-- lessons
create policy "lessons read published or owner or admin" on public.lessons for select
  using (
    is_published = true or owner = auth.uid() or public.is_admin(auth.uid())
  );

create policy "lessons write owner or admin" on public.lessons for all
  using (owner = auth.uid() or public.is_admin(auth.uid()))
  with check (owner = auth.uid() or public.is_admin(auth.uid()));

-- media_assets (join to lesson)
create policy "media read lesson published or owner or admin" on public.media_assets for select
  using (
    exists (
      select 1 from public.lessons l where l.id = media_assets.lesson_id and (
        l.is_published = true or l.owner = auth.uid() or public.is_admin(auth.uid())
      )
    )
  );

create policy "media write lesson owner or admin" on public.media_assets for all
  using (
    exists (
      select 1 from public.lessons l where l.id = media_assets.lesson_id and (l.owner = auth.uid() or public.is_admin(auth.uid()))
    )
  )
  with check (
    exists (
      select 1 from public.lessons l where l.id = media_assets.lesson_id and (l.owner = auth.uid() or public.is_admin(auth.uid()))
    )
  );

-- quizzes
create policy "quizzes read lesson published or owner" on public.quizzes for select
  using (
    exists (
      select 1 from public.lessons l where l.id = quizzes.lesson_id and (
        l.is_published = true or l.owner = auth.uid() or public.is_admin(auth.uid())
      )
    )
  );

create policy "quizzes write owner or admin" on public.quizzes for all
  using (
    exists (
      select 1 from public.lessons l where l.id = quizzes.lesson_id and (l.owner = auth.uid() or public.is_admin(auth.uid()))
    )
  )
  with check (
    exists (
      select 1 from public.lessons l where l.id = quizzes.lesson_id and (l.owner = auth.uid() or public.is_admin(auth.uid()))
    )
  );

-- quiz_questions
create policy "questions read if parent allowed" on public.quiz_questions for select
  using (
    exists (
      select 1 from public.quizzes q join public.lessons l on l.id = q.lesson_id
      where q.id = quiz_questions.quiz_id and (
        l.is_published = true or l.owner = auth.uid() or public.is_admin(auth.uid())
      )
    )
  );

create policy "questions write owner or admin" on public.quiz_questions for all
  using (
    exists (
      select 1 from public.quizzes q join public.lessons l on l.id = q.lesson_id
      where q.id = quiz_questions.quiz_id and (l.owner = auth.uid() or public.is_admin(auth.uid()))
    )
  )
  with check (
    exists (
      select 1 from public.quizzes q join public.lessons l on l.id = q.lesson_id
      where q.id = quiz_questions.quiz_id and (l.owner = auth.uid() or public.is_admin(auth.uid()))
    )
  );

-- quiz_attempts
create policy "attempts insert by self" on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

create policy "attempts select by self" on public.quiz_attempts for select
  using (auth.uid() = user_id);

create policy "attempts update by self" on public.quiz_attempts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "teachers select attempts for owned lessons" on public.quiz_attempts for select
  using (
    exists (
      select 1 from public.quizzes q join public.lessons l on l.id = q.lesson_id
      where q.id = quiz_attempts.quiz_id and (l.owner = auth.uid() or public.is_admin(auth.uid()))
    )
  );

-- progress
create policy "progress self only" on public.progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "teacher select progress of owned lessons" on public.progress for select
  using (
    exists (
      select 1 from public.lessons l where l.id = progress.lesson_id and (l.owner = auth.uid() or public.is_admin(auth.uid()))
    )
  );

-- notes
create policy "notes self only" on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "teacher select notes of owned lessons" on public.notes for select
  using (
    exists (
      select 1 from public.lessons l where l.id = notes.lesson_id and (l.owner = auth.uid() or public.is_admin(auth.uid()))
    )
  );

-- shares
create policy "shares owner manage" on public.shares for all
  using (created_by = auth.uid() or public.is_admin(auth.uid()))
  with check (created_by = auth.uid() or public.is_admin(auth.uid()));

-- RPC: verify_share_token
create or replace function public.verify_share_token(token text)
returns table(resource_type text, resource_id uuid, scopes text[])
language sql security definer set search_path = public as $$
  select s.resource_type, s.resource_id, s.scopes
  from public.shares s
  where s.token = token
    and (s.expires_at is null or s.expires_at > now());
$$;

grant execute on function public.verify_share_token(text) to anon, authenticated;

-- RPC: teacher_lessons(uid uuid)
create or replace function public.teacher_lessons(uid uuid)
returns setof public.lessons
language sql stable security definer set search_path = public as $$
  select * from public.lessons l where l.owner = uid;
$$;

grant execute on function public.teacher_lessons(uuid) to authenticated;

-- Storage bucket and policies
select public.is_admin(auth.uid()); -- no-op to ensure schema reference

insert into storage.buckets (id, name, public) values ('media', 'media', false)
  on conflict (id) do nothing;

-- Allow teacher/admin to insert/update/delete in media bucket
create policy if not exists "media insert by teacher/admin" on storage.objects for insert
  to authenticated using (
    bucket_id = 'media' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin'))
  ) with check (bucket_id = 'media');

create policy if not exists "media update by teacher/admin" on storage.objects for update
  to authenticated using (
    bucket_id = 'media' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher','admin'))
  ) with check (bucket_id = 'media');

create policy if not exists "media delete by admin" on storage.objects for delete
  to authenticated using (
    bucket_id = 'media' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Reads use signed URLs; no public select policy

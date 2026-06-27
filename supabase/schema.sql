-- Supabase SQL Schema for PrepWise AI
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  resume_text text,
  resume_markdown text,
  resume_image_url text,
  target_role text,
  experience_level text,
  created_at timestamp with time zone default now() not null
);

-- Interview sessions table
create table public.interview_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null,
  experience_level text not null,
  questions jsonb not null default '[]'::jsonb,
  resume_context text,
  analysis jsonb,
  created_at timestamp with time zone default now() not null
);

-- Resume analyses table
create table public.resume_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  target_role text not null,
  overall_score integer,
  skill_gaps jsonb,
  strengths text[],
  improvements text[],
  recommendations text[],
  resume_text text,
  created_at timestamp with time zone default now() not null
);

-- Knowledge base with full-text search for RAG
create table public.knowledge_embeddings (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  category text not null default 'general',
  metadata jsonb default '{}'::jsonb,
  search_vector tsvector generated always as (to_tsvector('english', coalesce(content, ''))) stored,
  created_at timestamp with time zone default now() not null
);

create index idx_knowledge_search_vector
  on public.knowledge_embeddings
  using gin (search_vector);

-- Search knowledge by full-text query (used by RAG pipeline)
create or replace function search_knowledge(
  search_query text,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  category text,
  metadata jsonb,
  rank float
)
language plpgsql
as $$
begin
  return query
  select
    ke.id,
    ke.content,
    ke.category,
    ke.metadata,
    ts_rank(ke.search_vector, plainto_tsquery('english', search_query)) as rank
  from knowledge_embeddings ke
  where ke.search_vector @@ plainto_tsquery('english', search_query)
  order by rank desc
  limit match_count;
end;
$$;

-- Interview answer tone analyses
create table public.answer_tone_analyses (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.interview_sessions(id) on delete cascade not null,
  question_index integer not null,
  answer_text text not null,
  sentiment_label text,
  sentiment_score real,
  emotion_joy real,
  emotion_sadness real,
  emotion_anger real,
  emotion_fear real,
  keywords jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now() not null
);

-- Chat messages for AI coach
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null,
  content text not null,
  created_at timestamp with time zone default now() not null
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.resume_analyses enable row level security;
alter table public.chat_messages enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Sessions policies
create policy "Users can view own sessions"
  on public.interview_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.interview_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.interview_sessions for update
  using (auth.uid() = user_id);

-- Resume analyses policies
create policy "Users can view own analyses"
  on public.resume_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.resume_analyses for insert
  with check (auth.uid() = user_id);

-- Knowledge embeddings policies (read for all authenticated users, insert/update for server only via service role)
create policy "Authenticated users can read knowledge"
  on public.knowledge_embeddings for select
  using (auth.role() = 'authenticated');

-- Answer tone analysis policies
create policy "Users can view own tone analyses"
  on public.answer_tone_analyses for select
  using (auth.uid() = (select user_id from public.interview_sessions where id = session_id));

create policy "Users can insert own tone analyses"
  on public.answer_tone_analyses for insert
  with check (auth.uid() = (select user_id from public.interview_sessions where id = session_id));

-- Chat messages policies
create policy "Users can view own messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own messages"
  on public.chat_messages for delete
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

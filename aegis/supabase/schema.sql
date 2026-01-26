-- ============================================
-- AEGIS DATABASE SCHEMA
-- Supabase PostgreSQL Schema for Phase 3A
-- ============================================

-- Run this SQL in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query

-- ============================================
-- 1. TASKS TABLE
-- ============================================

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Task details
  title text not null,
  description text,
  status text check (status in ('pending','active','completed','avoided')) default 'pending',
  priority text check (priority in ('high','medium','low')) default 'medium',
  
  -- Time tracking
  focus_time int default 0, -- Total minutes focused on this task
  scheduled_for date, -- Which day this task is scheduled for
  
  -- Timestamps
  created_at timestamptz default now() not null,
  completed_at timestamptz,
  avoided_at timestamptz,
  updated_at timestamptz default now() not null
);

-- Index for faster queries
create index if not exists tasks_user_id_idx on tasks(user_id);
create index if not exists tasks_status_idx on tasks(status);
create index if not exists tasks_scheduled_for_idx on tasks(scheduled_for);

-- Auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_tasks_updated_at
  before update on tasks
  for each row
  execute function update_updated_at_column();

-- ============================================
-- 2. FOCUS SESSIONS TABLE
-- ============================================

create table if not exists focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete set null,
  
  -- Session details
  duration_seconds int not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  
  -- Metadata
  created_at timestamptz default now() not null
);

-- Index for faster queries
create index if not exists focus_sessions_user_id_idx on focus_sessions(user_id);
create index if not exists focus_sessions_task_id_idx on focus_sessions(task_id);
create index if not exists focus_sessions_started_at_idx on focus_sessions(started_at);

-- ============================================
-- 3. DAILY SUMMARIES TABLE
-- ============================================

create table if not exists daily_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Summary data
  date date not null,
  focus_seconds int default 0,
  tasks_completed int default 0,
  tasks_avoided int default 0,
  sessions_completed int default 0,
  
  -- AI-generated insight (will be used in Phase 3B)
  insight text,
  
  -- Metadata
  created_at timestamptz default now() not null,
  
  -- Ensure one summary per user per day
  unique(user_id, date)
);

-- Index for faster queries
create index if not exists daily_summaries_user_id_idx on daily_summaries(user_id);
create index if not exists daily_summaries_date_idx on daily_summaries(date);

-- ============================================
-- VERIFICATION
-- ============================================

-- After running, verify tables exist:
-- select table_name from information_schema.tables where table_schema = 'public';

-- Expected output:
-- tasks
-- focus_sessions
-- daily_summaries

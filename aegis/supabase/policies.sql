-- ============================================
-- AEGIS ROW LEVEL SECURITY POLICIES
-- Run AFTER schema.sql
-- ============================================

-- Enable RLS on all tables
alter table tasks enable row level security;
alter table focus_sessions enable row level security;
alter table daily_summaries enable row level security;

-- ============================================
-- TASKS POLICIES
-- ============================================

-- Users can view their own tasks
create policy "Users can view own tasks"
  on tasks
  for select
  using (auth.uid() = user_id);

-- Users can insert their own tasks
create policy "Users can insert own tasks"
  on tasks
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own tasks
create policy "Users can update own tasks"
  on tasks
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own tasks
create policy "Users can delete own tasks"
  on tasks
  for delete
  using (auth.uid() = user_id);

-- ============================================
-- FOCUS SESSIONS POLICIES
-- ============================================

-- Users can view their own focus sessions
create policy "Users can view own focus sessions"
  on focus_sessions
  for select
  using (auth.uid() = user_id);

-- Users can insert their own focus sessions
create policy "Users can insert own focus sessions"
  on focus_sessions
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own focus sessions
create policy "Users can update own focus sessions"
  on focus_sessions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own focus sessions
create policy "Users can delete own focus sessions"
  on focus_sessions
  for delete
  using (auth.uid() = user_id);

-- ============================================
-- DAILY SUMMARIES POLICIES
-- ============================================

-- Users can view their own summaries
create policy "Users can view own summaries"
  on daily_summaries
  for select
  using (auth.uid() = user_id);

-- Users can insert their own summaries
create policy "Users can insert own summaries"
  on daily_summaries
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own summaries
create policy "Users can update own summaries"
  on daily_summaries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own summaries
create policy "Users can delete own summaries"
  on daily_summaries
  for delete
  using (auth.uid() = user_id);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that RLS is enabled:
-- select tablename, rowsecurity 
-- from pg_tables 
-- where schemaname = 'public';

-- Check policies exist:
-- select schemaname, tablename, policyname 
-- from pg_policies 
-- where schemaname = 'public';

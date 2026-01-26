# 🗄️ Supabase Database Setup Guide

## Step-by-Step Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Choose organization (or create one)
4. Fill in:
   - **Project Name**: `aegis` (or your choice)
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. ⏳ Wait 2-3 minutes for project to initialize

---

### 2. Get Your Credentials

Once project is ready:

1. Go to **Settings** (⚙️ icon in sidebar)
2. Click **API** section
3. Copy these values:

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGc...
```

4. Open `/workspaces/Ariya/aegis/.env.local`
5. Paste your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

6. Save the file

---

### 3. Run Database Schema

1. In Supabase Dashboard, click **SQL Editor** (in sidebar)
2. Click **"New Query"**
3. Copy entire contents of `supabase/schema.sql`
4. Paste into editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. ✅ Should see: "Success. No rows returned"

---

### 4. Run Security Policies

1. Still in **SQL Editor**, click **"New Query"**
2. Copy entire contents of `supabase/policies.sql`
3. Paste into editor
4. Click **"Run"**
5. ✅ Should see: "Success. No rows returned"

---

### 5. Verify Setup

Run this query in SQL Editor:

```sql
-- Check tables exist
select table_name from information_schema.tables 
where table_schema = 'public' 
order by table_name;
```

**Expected output:**
- daily_summaries
- focus_sessions
- tasks

Run this to check RLS:

```sql
-- Check RLS is enabled
select tablename, rowsecurity 
from pg_tables 
where schemaname = 'public';
```

All tables should show `rowsecurity = true`

---

### 6. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

The app will now connect to Supabase!

---

## Troubleshooting

### "Invalid API key"
- Double-check you copied the **anon public** key (not service_role)
- Make sure no extra spaces in `.env.local`

### "relation does not exist"
- Schema SQL didn't run successfully
- Re-run `schema.sql` in SQL Editor

### App still works without Supabase
- ✅ This is correct! App runs local-first
- Check browser console for "Supabase credentials not found" warning

---

## What's Next?

After setup is complete, tell me:

**AUTH** — to add minimal login (anonymous or magic link)

This will let you test cloud sync properly.

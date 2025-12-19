# Supabase Setup Guide for DoneWell

This guide will walk you through setting up Supabase for the DoneWell website.

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: `donewell` (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project" (takes ~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 3: Set Up Environment Variables

1. Create a `.env` file in the project root (`/Users/kevoo/Cursor/donewell/donewell_ui_4/.env`)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Never commit `.env` to git! It's already in `.gitignore`.

## Step 4: Run the Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)

This creates:
- `projects` table (for portfolio projects)
- `testimonials` table (for client testimonials)
- `metrics` table (for homepage stats)
- Row Level Security (RLS) policies
- Indexes for performance

## Step 5: Set Up Authentication

### Option A: Email/Password Auth (Recommended)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Ensure "Email" is enabled
3. Create your admin user:
   - Go to **Authentication** → **Users**
   - Click "Add user" → "Create new user"
   - Enter:
     - **Email**: `admin@donewell.com` (or your preferred email)
     - **Password**: Choose a strong password
   - Click "Create user"

### Option B: Use Magic Link (Passwordless)

1. In **Authentication** → **Providers** → **Email**
2. Enable "Enable email confirmations" (optional)
3. Users can log in with just their email (no password needed)

## Step 6: Seed Initial Data (Optional)

You can manually add data through the Supabase dashboard:

1. Go to **Table Editor**
2. Select a table (e.g., `projects`)
3. Click "Insert row" and fill in the fields
4. Repeat for `testimonials` and `metrics`

Or use the admin dashboard at `http://localhost:3000/admin` once you're logged in!

## Step 7: Test the Integration

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/admin`
3. Log in with the credentials you created in Step 5
4. You should see the admin dashboard with empty tables
5. Try adding a project, testimonial, or metric!

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` exists in the project root
- Check that variable names start with `VITE_`
- Restart your dev server after creating/updating `.env`

### "Failed to fetch projects"
- Check your Supabase URL and anon key are correct
- Verify the migration ran successfully (check Tables in Supabase dashboard)
- Check browser console for detailed error messages

### "Login failed"
- Verify the user exists in Supabase (Authentication → Users)
- Check that Email provider is enabled
- Try resetting the password in Supabase dashboard

### RLS Policy Errors
- Make sure you ran the migration SQL (it sets up RLS policies)
- Check that you're logged in when trying to write data
- Public read access should work without auth

## Next Steps

- **Add more admin users**: Create additional users in Supabase Authentication
- **Customize RLS policies**: Edit policies in Supabase dashboard if needed
- **Set up backups**: Configure automatic backups in Supabase dashboard
- **Monitor usage**: Check the Supabase dashboard for API usage and performance

## Database Schema Reference

### Projects Table
- `id` (UUID, primary key)
- `title`, `slug`, `keyframe_image`, `short_description`
- `badge`, `metric_value`, `metric_label`
- `show_on_work_page`, `show_on_homepage`, `order`
- Rich text: `summary`, `problem`, `objective`, `our_actions`, `results`
- `result_metrics` (JSONB array)

### Testimonials Table
- `id` (UUID, primary key)
- `name`, `role`, `company`, `quote`
- `image` (optional)
- `order`, `show_on_homepage`

### Metrics Table
- `id` (UUID, primary key)
- `value`, `label`, `order`

All tables have `created_at` and `updated_at` timestamps.




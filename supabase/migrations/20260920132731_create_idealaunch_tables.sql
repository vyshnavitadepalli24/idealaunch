/*
# IDEALAUNCH - Create profiles, ideas, and favourites tables

## Overview
Creates the full data model for the IDEALAUNCH startup ideas platform: user profiles,
startup ideas, and a favourites (saved ideas) join table. Uses Supabase Auth for
authentication (auth.users) and adds a profiles table for extended user info.

## New Tables

### profiles
- `id` (uuid, primary key, references auth.users) - one row per auth user
- `full_name` (text) - user's display name
- `bio` (text) - short biography
- `skills` (text[]) - list of skills
- `interests` (text[]) - list of interests
- `profile_image` (text) - URL or base64 of profile picture
- `created_at` (timestamptz) - account creation time
- `updated_at` (timestamptz) - last profile update

### ideas
- `id` (uuid, primary key)
- `title` (text, not null) - idea title
- `short_description` (text, not null) - brief one-liner
- `detailed_description` (text) - full description
- `category` (text, not null) - one of the defined categories
- `problem_statement` (text) - what problem does it solve
- `proposed_solution` (text) - how it solves the problem
- `target_audience` (text) - who is it for
- `technologies` (text[]) - required tech stack
- `business_model` (text) - how it makes money
- `expected_impact` (text) - expected outcomes
- `tags` (text[]) - searchable tags
- `image_url` (text) - optional idea image/logo
- `author_id` (uuid, not null, defaults to auth.uid()) - owner
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### favourites
- `id` (uuid, primary key)
- `user_id` (uuid, not null, defaults to auth.uid()) - who saved it
- `idea_id` (uuid, not null, references ideas) - which idea
- `created_at` (timestamptz)

## Security
- RLS enabled on all tables.
- profiles: users can read all profiles (to show author names), update only their own.
- ideas: anyone authenticated can read all ideas (public discovery), but only owners can insert/update/delete.
- favourites: users can read all favourites (for popularity counts), but only owner can insert/delete their own.
- Owner columns default to auth.uid() so inserts that omit the owner still satisfy RLS.

## Notes
1. A trigger auto-creates a profile row when a new auth.user signs up.
2. favourite counts are derived via COUNT(*) over the favourites table.
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  bio text DEFAULT '',
  skills text[] DEFAULT '{}',
  interests text[] DEFAULT '{}',
  profile_image text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================================
-- IDEAS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text NOT NULL,
  detailed_description text DEFAULT '',
  category text NOT NULL,
  problem_statement text DEFAULT '',
  proposed_solution text DEFAULT '',
  target_audience text DEFAULT '',
  technologies text[] DEFAULT '{}',
  business_model text DEFAULT '',
  expected_impact text DEFAULT '',
  tags text[] DEFAULT '{}',
  image_url text DEFAULT '',
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ideas_select_all" ON public.ideas;
CREATE POLICY "ideas_select_all"
  ON public.ideas FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "ideas_insert_own" ON public.ideas;
CREATE POLICY "ideas_insert_own"
  ON public.ideas FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "ideas_update_own" ON public.ideas;
CREATE POLICY "ideas_update_own"
  ON public.ideas FOR UPDATE
  TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "ideas_delete_own" ON public.ideas;
CREATE POLICY "ideas_delete_own"
  ON public.ideas FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

CREATE INDEX IF NOT EXISTS idx_ideas_author_id ON public.ideas(author_id);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON public.ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON public.ideas(created_at DESC);

-- ============================================================
-- FAVOURITES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favourites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id uuid NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, idea_id)
);

ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favourites_select_all" ON public.favourites;
CREATE POLICY "favourites_select_all"
  ON public.favourites FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "favourites_insert_own" ON public.favourites;
CREATE POLICY "favourites_insert_own"
  ON public.favourites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favourites_delete_own" ON public.favourites;
CREATE POLICY "favourites_delete_own"
  ON public.favourites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON public.favourites(user_id);
CREATE INDEX IF NOT EXISTS idx_favourites_idea_id ON public.favourites(idea_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
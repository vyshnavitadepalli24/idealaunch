'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Idea = {
  id: string;
  title: string;
  short_description: string;
  detailed_description: string;
  category: string;
  problem_statement: string;
  proposed_solution: string;
  target_audience: string;
  technologies: string[];
  business_model: string;
  expected_impact: string;
  tags: string[];
  image_url: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  favourite_count?: number;
  author?: {
    full_name: string;
    profile_image: string;
  };
};

export type Profile = {
  id: string;
  full_name: string;
  bio: string;
  skills: string[];
  interests: string[];
  profile_image: string;
  created_at: string;
  updated_at: string;
};

export type Favourite = {
  id: string;
  user_id: string;
  idea_id: string;
  created_at: string;
};

export const CATEGORIES = [
  'AI & Machine Learning',
  'Web Development',
  'FinTech',
  'HealthTech',
  'EdTech',
  'Agriculture',
  'Environment',
  'Cybersecurity',
  'E-Commerce',
  'Social Impact',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

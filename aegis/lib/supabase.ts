/**
 * Supabase client configuration
 * Backend sync layer for Aegis
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase.types';

// Environment variables (set in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate credentials are real (not placeholders)
const hasValidCredentials = supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('placeholder') &&
  !supabaseAnonKey.includes('your-anon-key');

if (!hasValidCredentials) {
  console.warn('⚠️  Supabase credentials not found. Running in local-only mode.');
}

// Create Supabase client (safe to call even without credentials)
export const supabase = hasValidCredentials
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Helper to check if backend is available
export const isBackendAvailable = () => supabase !== null;

// Helper to get current user
export const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
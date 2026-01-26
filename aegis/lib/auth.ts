/**
 * Authentication utilities for Aegis
 * Minimal auth setup - anonymous sessions for testing
 */

import { supabase, isBackendAvailable } from './supabase';

export type AuthUser = {
  id: string;
  email?: string;
  isAnonymous: boolean;
};

/**
 * Sign in anonymously (for testing Phase 3A)
 * Creates a temporary session that persists across page reloads
 */
export async function signInAnonymously(): Promise<AuthUser | null> {
  if (!isBackendAvailable()) {
    console.warn('Backend not available - running in local-only mode');
    return null;
  }

  try {
    const { data, error } = await supabase!.auth.signInAnonymously();
    
    if (error) throw error;
    
    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email || undefined,
        isAnonymous: data.user.is_anonymous || false,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Anonymous sign in failed:', error);
    return null;
  }
}

/**
 * Sign in with magic link (email only, no password)
 */
export async function signInWithEmail(email: string): Promise<boolean> {
  if (!isBackendAvailable()) {
    return false;
  }

  try {
    const { error } = await supabase!.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Email sign in failed:', error);
    return false;
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  if (!isBackendAvailable()) return;

  try {
    await supabase!.auth.signOut();
  } catch (error) {
    console.error('Sign out failed:', error);
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isBackendAvailable()) return null;

  try {
    const { data: { user }, error } = await supabase!.auth.getUser();
    
    if (error) throw error;
    
    if (user) {
      return {
        id: user.id,
        email: user.email || undefined,
        isAnonymous: user.is_anonymous || false,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Get user failed:', error);
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  if (!isBackendAvailable()) return () => {};

  const { data: { subscription } } = supabase!.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || undefined,
        isAnonymous: session.user.is_anonymous || false,
      });
    } else {
      callback(null);
    }
  });

  return () => subscription.unsubscribe();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

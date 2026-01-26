'use client';

/**
 * Auth UI Component - Minimal login interface
 * Supports anonymous sessions for testing
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { signInAnonymously, signOut, onAuthStateChange, type AuthUser } from '@/lib/auth';
import { useAegisStore } from '@/lib/store';
import { isBackendAvailable } from '@/lib/supabase';

export function AuthStatus() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const syncWithCloud = useAegisStore((state) => state.syncWithCloud);
  const syncStatus = useAegisStore((state) => state.syncStatus);

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
      
      // Auto-sync when user logs in
      if (newUser) {
        syncWithCloud();
      }
    });

    return unsubscribe;
  }, [syncWithCloud]);

  const handleSignIn = async () => {
    setLoading(true);
    const authUser = await signInAnonymously();
    if (authUser) {
      setUser(authUser);
      await syncWithCloud();
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  if (!isBackendAvailable()) {
    return (
      <div className="text-xs text-gray-500">
        Local-only mode
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {user ? (
        <motion.div
          key="authenticated"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              syncStatus === 'synced' ? 'bg-green-500' :
              syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
              syncStatus === 'error' ? 'bg-red-500' :
              'bg-gray-500'
            }`} />
            <span className="text-xs text-gray-400">
              {syncStatus === 'synced' ? 'Synced' :
               syncStatus === 'syncing' ? 'Syncing...' :
               syncStatus === 'error' ? 'Sync error' :
               'Ready'}
            </span>
          </div>
          
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
          >
            Sign Out
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="unauthenticated"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <Button
            onClick={handleSignIn}
            variant="primary"
            size="sm"
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Enable Cloud Sync'}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const syncWithCloud = useAegisStore((state) => state.syncWithCloud);

  const handleSignIn = async () => {
    setLoading(true);
    const user = await signInAnonymously();
    if (user) {
      await syncWithCloud();
      setIsOpen(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Show modal on first visit if backend is available
    if (isBackendAvailable()) {
      const hasSeenModal = localStorage.getItem('aegis-auth-modal-seen');
      if (!hasSeenModal) {
        setTimeout(() => setIsOpen(true), 2000);
        localStorage.setItem('aegis-auth-modal-seen', 'true');
      }
    }
  }, []);

  if (!isBackendAvailable() || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card highlight>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">☁️</span>
            </div>
            
            <h2 className="text-2xl font-light text-gray-100 mb-2">
              Enable Cloud Sync?
            </h2>
            
            <p className="text-gray-400 mb-6">
              Sync your tasks and focus sessions across devices.
              Your data stays private and secure.
            </p>
            
            <div className="flex gap-3">
              <Button
                onClick={handleSignIn}
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Enable Sync'}
              </Button>
              
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="flex-1"
              >
                Maybe Later
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              You can enable this anytime from Settings
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

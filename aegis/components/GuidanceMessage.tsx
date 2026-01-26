'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAegisStore } from '@/lib/store';
import { useEffect } from 'react';

/**
 * Jarvis-style AI Guidance Component
 * Appears in bottom-right corner when AI has a message
 * Auto-dismisses after 12 seconds or on click
 */
export default function GuidanceMessage() {
  const guidance = useAegisStore((state) => state.currentGuidance);
  const visible = useAegisStore((state) => state.guidanceVisible);
  const dismissGuidance = useAegisStore((state) => state.dismissGuidance);

  // Auto-dismiss after 12 seconds
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        dismissGuidance();
      }, 12000);

      return () => clearTimeout(timer);
    }
  }, [visible, dismissGuidance]);

  return (
    <AnimatePresence>
      {visible && guidance && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div
            onClick={dismissGuidance}
            className="bg-gradient-to-br from-purple-900/90 to-purple-950/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl cursor-pointer hover:scale-105 transition-transform max-w-md"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl -z-10" />
            
            <div className="p-5">
              {/* Jarvis indicator */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Aegis
                </span>
              </div>

              {/* Message */}
              <p className="text-gray-200 leading-relaxed text-sm">
                {guidance}
              </p>

              {/* Dismiss hint */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Click to dismiss
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissGuidance();
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

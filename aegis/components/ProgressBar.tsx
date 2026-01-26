'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({ 
  progress, 
  label,
  showPercentage = true 
}: ProgressBarProps) {
  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-gray-400">{label}</span>}
          {showPercentage && <span className="text-sm font-medium text-purple-400">{progress}%</span>}
        </div>
      )}
      
      <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/50"
        />
      </div>
    </div>
  );
}

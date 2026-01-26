'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
  onClick?: () => void;
}

export default function Card({ 
  children, 
  className = '', 
  highlight = false,
  onClick 
}: CardProps) {
  const baseStyles = 'rounded-xl p-6 backdrop-blur-sm transition-all duration-200';
  const defaultStyles = 'bg-gray-900/40 border border-gray-800/50 hover:border-gray-700/50';
  const highlightStyles = 'bg-gradient-to-br from-purple-900/40 to-purple-950/40 border border-purple-500/30 shadow-lg shadow-purple-500/10';

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.01 : 1 }}
      className={`${baseStyles} ${highlight ? highlightStyles : defaultStyles} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

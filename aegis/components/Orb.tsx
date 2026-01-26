'use client';

import { motion } from 'framer-motion';

export default function Orb() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: '600px', height: '600px' }}>
      {/* Outermost Halo - Ambient Presence */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Soft Outer Glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 80%)',
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Middle Glow Layer */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, rgba(139, 92, 246, 0.15) 60%, transparent 90%)',
          filter: 'blur(30px)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner Luminous Layer */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(196, 181, 253, 0.4) 0%, rgba(167, 139, 250, 0.25) 50%, transparent 85%)',
          filter: 'blur(20px)',
        }}
        animate={{
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Core Sphere */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '140px',
          height: '140px',
          background: 'radial-gradient(circle at 40% 40%, rgba(221, 214, 254, 0.95) 0%, rgba(196, 181, 253, 0.85) 25%, rgba(167, 139, 250, 0.75) 50%, rgba(139, 92, 246, 0.8) 100%)',
          boxShadow: '0 0 80px rgba(167, 139, 250, 0.5), 0 0 40px rgba(196, 181, 253, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.15)',
          filter: 'blur(0.5px)',
        }}
        animate={{
          y: [0, -12, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{
          scale: 1.05,
        }}
      />

      {/* Inner Core Light */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '80px',
          height: '80px',
          background: 'radial-gradient(circle at 45% 45%, rgba(255, 255, 255, 0.6) 0%, rgba(221, 214, 254, 0.3) 50%, transparent 100%)',
          filter: 'blur(8px)',
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ShaderOrb from '@/components/ShaderOrb';
import Button from '@/components/Button';
import { speak, JARVIS_PHRASES } from '@/lib/voice';

export default function Home() {
  const router = useRouter();

  // Trigger: Greet on every page load/reload
  useEffect(() => {
    // Speak welcome with natural delay
    // Note: speak() already handles cooldown (10 min) and voice enabled check
    setTimeout(() => {
      speak(JARVIS_PHRASES.WELCOME);
    }, 1500);
  }, []);

  return (
    <div className="h-screen w-screen fixed inset-0 flex flex-col items-center justify-center px-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-8"
      >
        {/* Animated Orb */}
        <div>
          <ShaderOrb />
        </div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center -mt-8"
        >
          <h1 className="text-4xl font-light text-gray-100 mb-2">
            Good to see you, Sir.
          </h1>
          <p className="text-gray-400 text-lg">
            Ready to make today count?
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={() => router.push('/dashboard')}
            variant="primary"
            size="lg"
          >
            Start My Day
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="secondary"
            size="lg"
          >
            What should I do?
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

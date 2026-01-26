'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useHydrated } from '@/lib/hooks';
import { getVoiceSettings, setVoiceEnabled, speak, JARVIS_PHRASES } from '@/lib/voice';
import { 
  startAlwaysOnListening, 
  stopAlwaysOnListening, 
  isSpeechRecognitionSupported,
  isCurrentlyListening 
} from '@/lib/alwaysOnListener';
import { handleWake } from '@/lib/voiceCommands';

export default function Settings() {
  const hydrated = useHydrated();
  const [voiceEnabled, setVoiceEnabledState] = useState(false);
  const [alwaysOnEnabled, setAlwaysOnEnabled] = useState(false);
  const [testingVoice, setTestingVoice] = useState(false);
  const [listeningActive, setListeningActive] = useState(false);

  useEffect(() => {
    const settings = getVoiceSettings();
    setVoiceEnabledState(settings.enabled);
    
    // Load always-on setting
    const alwaysOn = localStorage.getItem('aegis-always-on') === 'true';
    setAlwaysOnEnabled(alwaysOn);
    
    // Start always-on if enabled
    if (alwaysOn && isSpeechRecognitionSupported()) {
      const cleanup = startAlwaysOnListening(handleWake);
      setListeningActive(true);
      
      return () => {
        cleanup();
        setListeningActive(false);
      };
    }
  }, []);

  const handleVoiceToggle = () => {
    const newValue = !voiceEnabled;
    setVoiceEnabled(newValue);
    setVoiceEnabledState(newValue);
  };
  
  const handleAlwaysOnToggle = () => {
    const newValue = !alwaysOnEnabled;
    setAlwaysOnEnabled(newValue);
    localStorage.setItem('aegis-always-on', String(newValue));
    
    if (newValue) {
      startAlwaysOnListening(handleWake);
      setListeningActive(true);
    } else {
      stopAlwaysOnListening();
      setListeningActive(false);
    }
  };

  const handleTestVoice = async () => {
    setTestingVoice(true);
    await speak(JARVIS_PHRASES.WELCOME);
    setTimeout(() => setTestingVoice(false), 2000);
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="h-12 bg-gray-800 rounded w-48 mb-12 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-light text-gray-100 mb-12">Settings</h1>

        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-medium text-gray-200 mb-1">Jarvis Voice</h3>
              <p className="text-sm text-gray-400">
                Enable voice feedback for key moments
              </p>
            </div>
            <button
              onClick={handleVoiceToggle}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                voiceEnabled ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  voiceEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {voiceEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-700 pt-4 mt-4"
            >
              <Button
                onClick={handleTestVoice}
                variant="secondary"
                size="sm"
                className="mb-4"
                disabled={testingVoice}
              >
                {testingVoice ? 'Playing...' : 'Test Voice'}
              </Button>

              <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-300 mb-2">
                  When Jarvis Speaks
                </h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• First visit to home page each day</li>
                  <li>• When starting a focus session</li>
                  <li>• When completing a task</li>
                  <li className="text-gray-500 mt-2 italic">
                    Voice respects a 10-second cooldown between messages
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Always-On Listening */}
        {isSpeechRecognitionSupported() && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-medium text-gray-200 mb-1">
                  Always-On Listening
                  {listeningActive && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-purple-400">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                      Active
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-400">
                  Say "Jarvis" to wake and give commands
                </p>
              </div>
              <button
                onClick={handleAlwaysOnToggle}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  alwaysOnEnabled ? 'bg-purple-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    alwaysOnEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {alwaysOnEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-700 pt-4 mt-4"
              >
                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-purple-300 mb-3">
                    Available Commands
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-2">
                    <li>• "What should I do next?"</li>
                    <li>• "Start focus session"</li>
                    <li>• "End focus"</li>
                    <li>• "How many tasks?"</li>
                    <li>• "How's my progress?"</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-700">
                    ⚠️ Keep this tab open. Browser will request mic permission.
                  </p>
                </div>
              </motion.div>
            )}
          </Card>
        )}

        <Card>
          <h3 className="text-xl font-medium text-gray-200 mb-4">About</h3>
          <p className="text-sm text-gray-400">
            Aegis uses local-first architecture with optional cloud sync. Your data stays private and under your control.
          </p>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center text-sm text-gray-500"
        >
          <p>Aegis — Your personal AI assistant for focused productivity</p>
          <p className="mt-2">Version 1.0.0</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Voice Command System
 * 
 * Captures and routes voice commands after wake word
 * Personal use - simple intent matching
 */

import { speak } from './voice';
import { useAegisStore } from './store';

/**
 * Capture voice command after wake
 * Uses brief listening window (5-8 seconds)
 */
export async function captureCommand(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Not in browser'));
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      reject(new Error('SpeechRecognition not supported'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;     // Single command mode
    recognition.interimResults = false; // Only final result
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    // 8 second timeout
    const timeout = setTimeout(() => {
      recognition.stop();
      reject(new Error('Command timeout'));
    }, 8000);

    recognition.onresult = (event: any) => {
      clearTimeout(timeout);
      const command = event.results[0][0].transcript.toLowerCase().trim();
      resolve(command);
    };

    recognition.onerror = (event: any) => {
      clearTimeout(timeout);
      reject(new Error(event.error));
    };

    recognition.onend = () => {
      clearTimeout(timeout);
    };

    try {
      recognition.start();
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
}

/**
 * Route voice command to appropriate action
 * Simple keyword matching for personal use
 */
export async function routeIntent(command: string): Promise<void> {
  console.log('🎯 Command:', command);

  const store = useAegisStore.getState();

  // Next task recommendation
  if (command.includes('next') || command.includes('what should i do')) {
    const nextTask = store.getActiveTask() || store.getTodaysTasks().find(t => t.status === 'pending');
    
    if (nextTask) {
      speak(`${nextTask.title}, Sir.`);
    } else {
      speak('No pending tasks, Sir.');
    }
    return;
  }

  // Start focus session
  if (command.includes('start focus') || command.includes('begin focus')) {
    const nextTask = store.getActiveTask() || store.getTodaysTasks().find(t => t.status === 'pending');
    
    if (nextTask) {
      store.startFocus(nextTask.id);
      speak('Focus session started, Sir.');
    } else {
      speak('No task to focus on, Sir.');
    }
    return;
  }

  // End focus session
  if (command.includes('end focus') || command.includes('stop focus')) {
    if (store.focusSession.isActive) {
      store.endFocus();
      speak('Focus session ended, Sir.');
    } else {
      speak('No active focus session, Sir.');
    }
    return;
  }

  // Task count
  if (command.includes('how many tasks')) {
    const count = store.getTodaysTasks().filter(t => t.status === 'pending').length;
    speak(`${count} pending task${count !== 1 ? 's' : ''}, Sir.`);
    return;
  }

  // Progress check
  if (command.includes('progress') || command.includes('how am i doing')) {
    const stats = store.getTodaysStats();
    speak(`${stats.tasksCompleted} tasks completed today, Sir.`);
    return;
  }

  // Fallback
  speak("I didn't catch that, Sir. Try 'what's next' or 'start focus'.");
}

/**
 * Handle wake word - acknowledge and capture command
 */
export async function handleWake(): Promise<void> {
  try {
    // Acknowledge wake
    speak('Yes, Sir.');

    // Brief delay for natural feel
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Capture command
    const command = await captureCommand();

    // Route to action
    await routeIntent(command);

  } catch (error: any) {
    console.warn('Command capture failed:', error.message);
    // Silent failure - just don't respond
  }
}

/**
 * Always-On Jarvis Listener
 * 
 * Continuous wake word detection using browser's SpeechRecognition API
 * Personal use - no legal/consent requirements
 * 
 * Architecture:
 * - Mic stays open while tab is active
 * - Local wake word detection ("jarvis")
 * - Auto-restart on errors
 * - Minimal CPU usage (browser-native)
 */

type WakeCallback = () => void;

let recognition: any = null;
let isListening = false;
let restartTimeout: NodeJS.Timeout | null = null;

/**
 * Check if browser supports SpeechRecognition
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

/**
 * Start always-on listening for wake word
 * 
 * @param onWake - Callback when "jarvis" is detected
 * @returns Cleanup function to stop listening
 */
export function startAlwaysOnListening(onWake: WakeCallback): () => void {
  if (!isSpeechRecognitionSupported()) {
    console.warn('SpeechRecognition not supported in this browser');
    return () => {};
  }

  if (isListening) {
    console.warn('Already listening');
    return stopAlwaysOnListening;
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  
  // Configuration for continuous listening
  recognition.continuous = true;      // Keep listening
  recognition.interimResults = true;  // Get partial results
  recognition.lang = 'en-US';        // English
  recognition.maxAlternatives = 1;   // Just best guess

  recognition.onstart = () => {
    isListening = true;
    console.log('🎤 Jarvis listening...');
  };

  recognition.onresult = (event: any) => {
    // Get the most recent transcript
    const lastIndex = event.results.length - 1;
    const transcript = event.results[lastIndex][0].transcript
      .toLowerCase()
      .trim();

    // Wake word detection
    if (transcript.includes('jarvis') || transcript.includes('jarvis')) {
      console.log('👂 Wake word detected:', transcript);
      onWake();
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    
    // Auto-restart on certain errors
    if (event.error === 'no-speech' || event.error === 'audio-capture') {
      scheduleRestart();
    }
  };

  recognition.onend = () => {
    isListening = false;
    console.log('🎤 Listening stopped, restarting...');
    
    // Auto-restart to maintain always-on behavior
    scheduleRestart();
  };

  // Start listening
  try {
    recognition.start();
  } catch (error) {
    console.error('Failed to start recognition:', error);
  }

  return stopAlwaysOnListening;
}

/**
 * Stop always-on listening
 */
export function stopAlwaysOnListening(): void {
  if (restartTimeout) {
    clearTimeout(restartTimeout);
    restartTimeout = null;
  }

  if (recognition) {
    try {
      recognition.stop();
      recognition = null;
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }

  isListening = false;
  console.log('🎤 Jarvis listening stopped');
}

/**
 * Schedule a restart after brief delay
 */
function scheduleRestart(): void {
  if (restartTimeout) {
    clearTimeout(restartTimeout);
  }

  restartTimeout = setTimeout(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Failed to restart recognition:', error);
      }
    }
  }, 1000); // 1 second delay before restart
}

/**
 * Check if currently listening
 */
export function isCurrentlyListening(): boolean {
  return isListening;
}

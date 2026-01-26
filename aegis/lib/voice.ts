/**
 * Jarvis Voice System
 * 
 * Rules (DO NOT BREAK):
 * - OFF by default
 * - One sentence max
 * - Never twice within 10 seconds
 * - Never during active focus
 * - Can be muted instantly
 */

const VOICE_COOLDOWN = 10 * 1000; // 10 seconds
let lastSpeakTime = 0;
let currentAudio: HTMLAudioElement | null = null;

/**
 * Check if voice is enabled in user settings
 */
export function isVoiceEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const settings = localStorage.getItem('aegis-voice-settings');
    if (!settings) return false; // OFF by default
    
    const parsed = JSON.parse(settings);
    return parsed.enabled === true;
  } catch {
    return false;
  }
}

/**
 * Check if voice can speak (rate limiting)
 */
export function canSpeak(): boolean {
  if (!isVoiceEnabled()) return false;
  
  const now = Date.now();
  if (now - lastSpeakTime < VOICE_COOLDOWN) {
    return false; // Too soon since last speech
  }
  
  return true;
}

/**
 * Stop any currently playing voice
 */
export function stopVoice(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/**
 * Speak text using ElevenLabs TTS
 * 
 * Approved phrases only:
 * - "Good to see you, Sir."
 * - "Let's begin, Sir."
 * - "Well done, Sir."
 * - Analysis insights (optional)
 */
export async function speak(text: string): Promise<void> {
  // Check if voice is allowed
  if (!canSpeak()) {
    return;
  }
  
  // Stop any current speech
  stopVoice();
  
  try {
    // Fetch audio from API
    const response = await fetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      console.error('Voice API failed:', response.status);
      return; // Fail silently - app continues working
    }
    
    // Create audio from blob
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const audio = new Audio(audioUrl);
    audio.volume = 0.6; // Calm, not loud
    
    // Track current audio
    currentAudio = audio;
    
    // Update last speak time
    lastSpeakTime = Date.now();
    
    // Play
    await audio.play();
    
    // Cleanup after play
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
    };
  } catch (error) {
    console.error('Voice playback failed:', error);
    // Fail silently - never break the app
  }
}

/**
 * Set voice enabled/disabled
 */
export function setVoiceEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  
  const settings = { enabled };
  localStorage.setItem('aegis-voice-settings', JSON.stringify(settings));
  
  // Stop voice if disabling
  if (!enabled) {
    stopVoice();
  }
}

/**
 * Get voice settings
 */
export function getVoiceSettings(): { enabled: boolean } {
  if (typeof window === 'undefined') return { enabled: false };
  
  try {
    const settings = localStorage.getItem('aegis-voice-settings');
    if (!settings) return { enabled: false };
    
    return JSON.parse(settings);
  } catch {
    return { enabled: false };
  }
}

/**
 * Approved Jarvis phrases (ONLY THESE)
 */
export const JARVIS_PHRASES = {
  WELCOME: "Good to see you, Sir.",
  FOCUS_START: "Let's begin, Sir.",
  TASK_COMPLETE: "Well done, Sir.",
  // Analysis insights can be spoken but are optional
} as const;

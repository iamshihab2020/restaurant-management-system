/**
 * Sound Notification Utility
 * Handles audio notifications for order events
 */

// Sound frequency configurations (in Hz)
const SOUND_CONFIGS = {
  newOrder: { frequency: 800, duration: 200, repeat: 2 },
  orderReady: { frequency: 1200, duration: 150, repeat: 3 },
  statusChange: { frequency: 600, duration: 100, repeat: 1 },
  error: { frequency: 300, duration: 300, repeat: 1 },
};

type SoundType = keyof typeof SOUND_CONFIGS;

let audioContext: AudioContext | null = null;
let soundEnabled = true;

/**
 * Initialize audio context (must be called after user interaction)
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn("Audio context not available:", error);
      return null;
    }
  }

  return audioContext;
}

/**
 * Play a single beep with given frequency and duration
 */
function playBeep(frequency: number, duration: number): Promise<void> {
  return new Promise((resolve) => {
    const context = getAudioContext();
    if (!context || !soundEnabled) {
      resolve();
      return;
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    // Fade in/out to avoid clicks
    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      context.currentTime + duration / 1000
    );

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration / 1000);

    oscillator.onended = () => resolve();
  });
}

/**
 * Play notification sound
 */
export async function playNotificationSound(type: SoundType): Promise<void> {
  if (!soundEnabled) return;

  const config = SOUND_CONFIGS[type];

  for (let i = 0; i < config.repeat; i++) {
    await playBeep(config.frequency, config.duration);
    if (i < config.repeat - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

/**
 * Enable sound notifications
 */
export function enableSounds(): void {
  soundEnabled = true;
  // Initialize audio context on user interaction
  getAudioContext();
}

/**
 * Disable sound notifications
 */
export function disableSounds(): void {
  soundEnabled = false;
}

/**
 * Check if sounds are enabled
 */
export function areSoundsEnabled(): boolean {
  return soundEnabled;
}

/**
 * Toggle sound notifications
 */
export function toggleSounds(): boolean {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    getAudioContext();
  }
  return soundEnabled;
}

/**
 * Play new order notification
 */
export function playNewOrderSound(): Promise<void> {
  return playNotificationSound("newOrder");
}

/**
 * Play order ready notification
 */
export function playOrderReadySound(): Promise<void> {
  return playNotificationSound("orderReady");
}

/**
 * Play status change notification
 */
export function playStatusChangeSound(): Promise<void> {
  return playNotificationSound("statusChange");
}

/**
 * Play error notification
 */
export function playErrorSound(): Promise<void> {
  return playNotificationSound("error");
}

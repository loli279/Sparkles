import { useCallback } from 'react';

// Use a single AudioContext instance to avoid creating multiple.
// The context is created on the first user interaction to comply with browser autoplay policies.
let audioCtx: AudioContext | null = null;

const initAudioContext = () => {
  // Initialize only in a browser environment
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch(e) {
      console.error("Web Audio API is not supported in this browser");
      return null;
    }
  }
  return audioCtx;
}

// Sound definitions for on-the-fly generation
// 'complete' and 'achievement' are arrays to create simple melodies (arpeggios).
const soundConfigs = {
  click:       [{ freq: 900,  duration: 0.05, gain: 0.3, type: 'triangle' as const, delay: 0 }],
  message:     [{ freq: 600,  duration: 0.1,  gain: 0.2, type: 'sine' as const, delay: 0 }],
  complete:    [{ freq: 523, duration: 0.1, gain: 0.4, type: 'sine' as const, delay: 0 }, { freq: 783, duration: 0.15, gain: 0.4, type: 'sine' as const, delay: 0.1 }],
  achievement: [{ freq: 523, duration: 0.1, gain: 0.3, type: 'sine' as const, delay: 0 }, { freq: 659, duration: 0.1, gain: 0.3, type: 'sine' as const, delay: 0.1 }, { freq: 783, duration: 0.2, gain: 0.4, type: 'sine' as const, delay: 0.2 }],
};

type SoundType = keyof typeof soundConfigs;

export const useSound = () => {
  const playSound = useCallback((type: SoundType) => {
    const ctx = initAudioContext();
    if (!ctx) return;

    // Browsers may suspend the AudioContext until a user interacts with the page.
    // We must resume it on a user gesture (like a click, which is when this is called).
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const playNote = (config: {freq: number, duration: number, gain: number, type: OscillatorType, delay: number}) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        const startTime = ctx.currentTime + config.delay;
        const endTime = startTime + config.duration;

        // Configure oscillator
        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(config.freq, startTime);

        // Configure gain (volume) with a fade-out to prevent clicks
        gainNode.gain.setValueAtTime(config.gain, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);
        
        // Connect nodes: oscillator -> gain -> speakers
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Start and stop sound at the scheduled times
        oscillator.start(startTime);
        oscillator.stop(endTime);
    }
    
    const configs = soundConfigs[type];
    configs.forEach(playNote);

  }, []);

  return { playSound };
};

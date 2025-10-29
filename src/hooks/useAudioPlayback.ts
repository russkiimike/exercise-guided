import { useState, useCallback, useRef, useEffect } from 'react';
import audioData from '../data/audio.json';

// URL for external audio JSON file - can be configured via environment variable
const AUDIO_CONFIG_URL = import.meta.env.VITE_AUDIO_CONFIG_URL || 'https://gymstreak-asset-storage.s3.us-east-2.amazonaws.com/assets/adinterface/audio.json';

interface AudioConfig {
  audioUrls: string[];
}

interface UseAudioPlaybackReturn {
  enableAudioContext: () => Promise<void>;
  playSelectedSound: () => Promise<void>;
  handleSoundSelection: () => Promise<void>;
}

export const useAudioPlayback = (): UseAudioPlaybackReturn => {
  const [selectedSoundIndex, setSelectedSoundIndex] = useState(0);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioEnabledRef = useRef(false);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);

  // Fetch external audio configuration on mount
  useEffect(() => {
    const fetchAudioConfig = async () => {
      try {
        const response = await fetch(AUDIO_CONFIG_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch audio config: ${response.status}`);
        }
        
        const config: AudioConfig = await response.json();
        
        if (config.audioUrls && Array.isArray(config.audioUrls)) {
          setAudioUrls(config.audioUrls);
        } else {
          throw new Error('Invalid audio config format');
        }
      } catch (error) {
        console.warn('Failed to fetch external audio config, using local fallback:', error);
        // Fallback to local audio data
        setAudioUrls(audioData.audioUrls);
      }
    };

    fetchAudioConfig();
  }, []);

  const enableAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      
      // Resume context if suspended (required for Safari)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
    }
    
    // Pre-create and cache all audio elements for Safari compatibility
    if (audioElementsRef.current.length === 0 && audioUrls.length > 0) {
      const elements = audioUrls.map(url => {
        const audio = new Audio(url);
        audio.volume = 0.5;
        audio.preload = 'auto';
        return audio;
      });
      audioElementsRef.current = elements;
    }
    
    audioEnabledRef.current = true;
  }, [audioUrls]);

  const playSelectedSound = useCallback(async () => {
    if (!audioEnabledRef.current || audioElementsRef.current.length === 0) {
      console.warn('Audio not enabled or elements not cached');
      return;
    }

    try {
      const audio = audioElementsRef.current[selectedSoundIndex];
      
      // Reset audio to beginning for replay
      audio.currentTime = 0;
      
      // Ensure audio context is resumed for Safari
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      await audio.play();
    } catch (error) {
      console.warn('Audio playback failed:', error);
      // Try fallback method for Safari
      if (audioUrls.length > 0) {
        try {
          const audio = new Audio(audioUrls[selectedSoundIndex]);
          audio.volume = 0.5;
          audio.play();
        } catch (fallbackError) {
          console.warn('Fallback audio playback also failed:', fallbackError);
        }
      }
    }
  }, [selectedSoundIndex, audioUrls]);

  const handleSoundSelection = useCallback(async () => {
    // Enable audio context on first user interaction
    await enableAudioContext();
    
    // Wait for audio URLs to be loaded
    if (audioUrls.length === 0) {
      console.warn('Audio URLs not loaded yet');
      return;
    }
    
    // Cycle through available sounds
    setSelectedSoundIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % audioUrls.length;
      
      // Play the sound with the new index immediately
      if (audioEnabledRef.current && audioElementsRef.current.length > 0) {
        const audio = audioElementsRef.current[nextIndex];
        audio.currentTime = 0;
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        audio.play().catch((error) => {
          console.warn('Audio playback failed:', error);
          try {
            const fallbackAudio = new Audio(audioUrls[nextIndex]);
            fallbackAudio.volume = 0.5;
            fallbackAudio.play();
          } catch (fallbackError) {
            console.warn('Fallback audio playback also failed:', fallbackError);
          }
        });
      }
      
      return nextIndex;
    });
  }, [enableAudioContext, audioUrls]);

  return {
    enableAudioContext,
    playSelectedSound,
    handleSoundSelection
  };
};


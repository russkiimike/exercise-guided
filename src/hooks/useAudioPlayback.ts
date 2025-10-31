import { useState, useCallback, useRef, useEffect } from 'react';
import audioData from '../data/audio.json';

// URL for external audio JSON file - can be configured via environment variable
const AUDIO_CONFIG_URL = import.meta.env.VITE_AUDIO_CONFIG_URL || 'https://gymstreak-asset-storage.s3.us-east-2.amazonaws.com/assets/adinterface/audio.json';

interface AudioConfig {
  audioUrls: string[];
  audioUrls2?: string[];
}

interface UseAudioPlaybackReturn {
  enableAudioContext: () => Promise<void>;
  playSelectedSound: () => Promise<void>;
  handleSoundSelection: () => Promise<void>;
  toggleAudioSet: () => Promise<void>;
}

export const useAudioPlayback = (): UseAudioPlaybackReturn => {
  const [selectedSoundIndex, setSelectedSoundIndex] = useState(0);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [secondaryAudioUrls, setSecondaryAudioUrls] = useState<string[]>([]);
  const [isUsingPrimarySet, setIsUsingPrimarySet] = useState(true);
  const audioUrlsRef = useRef<string[]>([]);
  const primaryAudioUrlsRef = useRef<string[]>([]);
  const secondaryAudioUrlsRef = useRef<string[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioEnabledRef = useRef(false);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const currentlyPlayingRef = useRef<HTMLAudioElement | null>(null);

  // Fetch external audio configuration on mount
  useEffect(() => {
    const fetchAudioConfig = async () => {
      try {
        console.log('[Audio] Fetching audio config from', AUDIO_CONFIG_URL);
        const response = await fetch(AUDIO_CONFIG_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch audio config: ${response.status}`);
        }
        
        const config: AudioConfig = await response.json();
        
        if (config.audioUrls && Array.isArray(config.audioUrls)) {
          setAudioUrls(config.audioUrls);
          setSecondaryAudioUrls(Array.isArray(config.audioUrls2) ? config.audioUrls2 : []);
          setIsUsingPrimarySet(true);
          primaryAudioUrlsRef.current = config.audioUrls;
          secondaryAudioUrlsRef.current = Array.isArray(config.audioUrls2) ? config.audioUrls2 : [];
          audioUrlsRef.current = config.audioUrls;
          console.log('[Audio] Loaded audio config', {
            primaryCount: config.audioUrls.length,
            secondaryCount: Array.isArray(config.audioUrls2) ? config.audioUrls2.length : 0
          });
        } else {
          throw new Error('Invalid audio config format');
        }
      } catch (error) {
        console.warn('[Audio] Failed to fetch external audio config, using local fallback:', error);
        // Fallback to local audio data
        setAudioUrls(audioData.audioUrls || []);
        // @ts-expect-error - optional property in local JSON
        setSecondaryAudioUrls(audioData.audioUrls2 || []);
        setIsUsingPrimarySet(true);
        primaryAudioUrlsRef.current = audioData.audioUrls || [];
        secondaryAudioUrlsRef.current = audioData.audioUrls2 || [];
        audioUrlsRef.current = audioData.audioUrls || [];
        console.log('[Audio] Using local audio config', {
          primaryCount: (audioData.audioUrls || []).length,
          secondaryCount: (audioData as any).audioUrls2 ? (audioData as any).audioUrls2.length : 0
        });
      }
    };

    fetchAudioConfig();
  }, []);

  // Cleanup: stop any playing audio when component unmounts
  useEffect(() => {
    return () => {
      if (currentlyPlayingRef.current) {
        currentlyPlayingRef.current.pause();
        currentlyPlayingRef.current.currentTime = 0;
        currentlyPlayingRef.current = null;
      }
    };
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
      console.log('[Audio] Precreated audio elements for primary list:', elements.length);
    }
    
    audioEnabledRef.current = true;
  }, [audioUrls]);

  const playSelectedSound = useCallback(async () => {
    // Wait for audio URLs to be loaded if not ready yet
    if (audioUrlsRef.current.length === 0) {
      console.warn('Audio URLs not loaded yet, waiting...');
      // Wait up to 5 seconds for URLs to load
      let attempts = 0;
      while (audioUrlsRef.current.length === 0 && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      if (audioUrlsRef.current.length === 0) {
        console.warn('Audio URLs failed to load');
        return;
      }
    }

    // Enable audio context if not already enabled
    if (!audioEnabledRef.current) {
      await enableAudioContext();
    }

    if (audioElementsRef.current.length === 0 && audioUrlsRef.current.length > 0) {
      // Create audio elements if they don't exist
      const elements = audioUrlsRef.current.map(url => {
        const audio = new Audio(url);
        audio.volume = 0.5;
        audio.preload = 'auto';
        return audio;
      });
      audioElementsRef.current = elements;
    }

    if (audioElementsRef.current.length === 0) {
      console.warn('Audio elements not available');
      return;
    }

    // Stop any currently playing audio
    if (currentlyPlayingRef.current) {
      currentlyPlayingRef.current.pause();
      currentlyPlayingRef.current.currentTime = 0;
      currentlyPlayingRef.current = null;
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
      currentlyPlayingRef.current = audio;
      console.log('[Audio] Playing', {
        index: selectedSoundIndex,
        url: audio.src
      });
    } catch (error) {
      console.warn('Audio playback failed:', error);
      // Try fallback method for Safari
      if (audioUrlsRef.current.length > 0) {
        try {
          // Stop any currently playing audio
          if (currentlyPlayingRef.current) {
            currentlyPlayingRef.current.pause();
            currentlyPlayingRef.current.currentTime = 0;
            currentlyPlayingRef.current = null;
          }
          
          const audio = new Audio(audioUrlsRef.current[selectedSoundIndex]);
          audio.volume = 0.5;
          await audio.play();
          currentlyPlayingRef.current = audio;
          console.log('[Audio] Playing (fallback)', {
            index: selectedSoundIndex,
            url: audio.src
          });
        } catch (fallbackError) {
          console.warn('Fallback audio playback also failed:', fallbackError);
        }
      }
    }
  }, [selectedSoundIndex, enableAudioContext]);

  const handleSoundSelection = useCallback(async () => {
    // Enable audio context on first user interaction
    await enableAudioContext();
    
    // Wait for audio URLs to be loaded
    if (audioUrlsRef.current.length === 0) {
      console.warn('Audio URLs not loaded yet');
      return;
    }
    
    // Cycle through available sounds using the current active list
    setSelectedSoundIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % audioUrlsRef.current.length;
      
      // Stop any currently playing audio
      if (currentlyPlayingRef.current) {
        currentlyPlayingRef.current.pause();
        currentlyPlayingRef.current.currentTime = 0;
        currentlyPlayingRef.current = null;
      }
      
      // Play the sound with the new index immediately
      if (audioEnabledRef.current && audioElementsRef.current.length > 0) {
        const audio = audioElementsRef.current[nextIndex];
        audio.currentTime = 0;
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        audio.play().then(() => {
          currentlyPlayingRef.current = audio;
          console.log('[Audio] Playing (selection)', {
            index: nextIndex,
            url: audio.src
          });
        }).catch((error) => {
          console.warn('Audio playback failed:', error);
          try {
            // Stop any currently playing audio before fallback
            if (currentlyPlayingRef.current) {
              currentlyPlayingRef.current.pause();
              currentlyPlayingRef.current.currentTime = 0;
              currentlyPlayingRef.current = null;
            }
            
            const fallbackAudio = new Audio(audioUrlsRef.current[nextIndex]);
            fallbackAudio.volume = 0.5;
            fallbackAudio.play().then(() => {
              currentlyPlayingRef.current = fallbackAudio;
              console.log('[Audio] Playing (selection fallback)', {
                index: nextIndex,
                url: fallbackAudio.src
              });
            });
          } catch (fallbackError) {
            console.warn('Fallback audio playback also failed:', fallbackError);
          }
        });
      }
      
      return nextIndex;
    });
  }, [enableAudioContext]);

  const toggleAudioSet = useCallback(async () => {
    if (currentlyPlayingRef.current) {
      currentlyPlayingRef.current.pause();
      currentlyPlayingRef.current.currentTime = 0;
      currentlyPlayingRef.current = null;
    }

    const nextIsPrimary = !isUsingPrimarySet;
    // Use refs to get the most current values
    const nextList = nextIsPrimary ? primaryAudioUrlsRef.current : secondaryAudioUrlsRef.current;

    if (!nextIsPrimary && secondaryAudioUrlsRef.current.length === 0) {
      console.warn('Secondary audio list is empty; cannot toggle');
      return;
    }

    if (nextList.length === 0) {
      console.warn('Selected audio list is empty; cannot toggle');
      return;
    }

    console.log('[Audio] Toggling audio set', {
      to: nextIsPrimary ? 'primary' : 'secondary',
      count: nextList.length
    });

    // Update the active list reference
    audioUrlsRef.current = nextList;
    
    // Recreate audio elements with the new list
    audioElementsRef.current = nextList.map(url => {
      const audio = new Audio(url);
      audio.volume = 0.5;
      audio.preload = 'auto';
      return audio;
    });

    // Reset to first sound in the new list
    setSelectedSoundIndex(0);
    setIsUsingPrimarySet(nextIsPrimary);

    // Play the first sound from the new list
    if (audioEnabledRef.current && audioElementsRef.current.length > 0) {
      try {
        const audio = audioElementsRef.current[0];
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        await audio.play();
        currentlyPlayingRef.current = audio;
        console.log('[Audio] Playing first after toggle', {
          index: 0,
          url: audio.src
        });
      } catch (e) {
        console.warn('Failed to play after toggling audio set:', e);
      }
    }
  }, [isUsingPrimarySet]);

  return {
    enableAudioContext,
    playSelectedSound,
    handleSoundSelection,
    toggleAudioSet
  };
};


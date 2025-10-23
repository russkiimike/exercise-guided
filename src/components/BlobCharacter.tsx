import React, { useCallback } from 'react';
import audioData from '../data/audio.json';

interface BlobCharacterProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const BlobCharacter: React.FC<BlobCharacterProps> = ({ 
  size = 100, 
  className = "",
  onClick
}) => {
  const playRandomAudio = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * audioData.audioUrls.length);
    const audioUrl = audioData.audioUrls[randomIndex];
    
    const audio = new Audio(audioUrl);
    audio.volume = 0.5; // Set volume to 50%
    
    audio.play().catch((error) => {
      console.warn('Audio playback failed:', error);
      // Fallback: try a different audio URL or show a message
    });
    
    // Call the onClick prop if provided
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      onClick={playRandomAudio}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main body - large blue circle */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="#3B82F6"
        stroke="none"
      />
      
      {/* Left eye - white circle */}
      <circle
        cx="40"
        cy="45"
        r="8"
        fill="white"
        stroke="none"
      />
      
      {/* Left pupil - black circle */}
      <circle
        cx="40"
        cy="45"
        r="4"
        fill="black"
        stroke="none"
      />
      
      {/* Right eye - white circle */}
      <circle
        cx="60"
        cy="45"
        r="8"
        fill="white"
        stroke="none"
      />
      
      {/* Right pupil - black circle */}
      <circle
        cx="60"
        cy="45"
        r="4"
        fill="black"
        stroke="none"
      />
    </svg>
  );
};

export default BlobCharacter;

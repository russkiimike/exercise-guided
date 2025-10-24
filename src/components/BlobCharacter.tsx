import React, { useCallback } from 'react';
import audioData from '../data/audio.json';

interface BlobCharacterProps {
  /** Custom size in pixels or CSS units (e.g., 100, "2rem", "50px") */
  size?: number | string;
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Predefined size variants for easy scaling:
   * - small: 24px
   * - medium: 48px  
   * - large: 80px
   * - xl: 120px
   */
  variant?: 'small' | 'medium' | 'large' | 'xl';
}

export const BlobCharacter: React.FC<BlobCharacterProps> = ({ 
  size = 100, 
  className = "",
  onClick,
  variant
}) => {
  // Predefined size variants for easier scaling
  const getVariantSize = () => {
    switch (variant) {
      case 'small': return 24;
      case 'medium': return 48;
      case 'large': return 80;
      case 'xl': return 120;
      default: return size;
    }
  };

  const finalSize = variant ? getVariantSize() : size;
  
  // Responsive scaling based on screen size
  const getResponsiveSize = () => {
    if (typeof finalSize === 'string') return finalSize;
    if (finalSize <= 32) return finalSize; // Don't scale down small sizes
    return finalSize;
  };

  // CSS classes for easy scaling with Tailwind
  const getSizeClasses = () => {
    if (variant) {
      switch (variant) {
        case 'small': return 'w-6 h-6';
        case 'medium': return 'w-12 h-12';
        case 'large': return 'w-20 h-20';
        case 'xl': return 'w-32 h-32';
        default: return '';
      }
    }
    return '';
  };

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
      width={getResponsiveSize()}
      height={getResponsiveSize()}
      viewBox="0 0 100 100"
      className={`cursor-pointer hover:opacity-80 transition-opacity ${getSizeClasses()} ${className}`}
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

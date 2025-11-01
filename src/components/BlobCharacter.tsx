import { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import blobshape from 'blobshape';

interface BlobCharacterProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  isPlaying?: boolean;
}

function getRandomPath() {
  return blobshape({
    growth: 8,
    edges: 8
  }).path;
}

function Blob(props: { isPlaying?: boolean; className?: string }) {
  const [flip, set] = useState(false);
  
  const [{ path }] = useSpring(() => ({
    to: { path: getRandomPath() },
    from: { path: getRandomPath() },
    reverse: flip,
    config: {
      duration: props.isPlaying ? 200 : 1500
    },
    onRest: (result) => {
      // Generate new path for next animation
      result.value.path = getRandomPath();
      set(!flip);
    }
  }), [props.isPlaying, flip]);

  return (
    <animated.svg
      viewBox="90 100 250 250"
      className={props.className}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      <animated.path d={path} fill="#3B82F6" />
    </animated.svg>
  );
}

export function BlobCharacter({ onClick, className = '', ariaLabel = 'Open assistant', isPlaying = false }: BlobCharacterProps) {
  return (
    <div 
      aria-label={ariaLabel}
      onClick={onClick}
      className={`fixed w-16 h-16 flex items-center justify-center cursor-pointer transition-transform active:scale-95 overflow-visible ${className}`}
      style={{ position: 'fixed' }}
    >
      <div className="relative w-16 h-16" style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.15))' }}>
        {/* Animated main body */}
        <Blob isPlaying={isPlaying} className="absolute inset-0" />

        {/* Eyes (kept the same) */}
        <div className="absolute inset-0 flex items-center justify-center space-x-1">
          <div className="w-4 h-4 bg-white rounded-full animate-pulse">
            <div className="w-2 h-2 bg-black rounded-full animate-spin"></div>
          </div>
          <div className="w-4 h-4 bg-white rounded-full animate-pulse">
            <div className="w-2 h-2 bg-black rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  );
}


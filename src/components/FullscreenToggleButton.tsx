import React from 'react';
import { useFullscreen } from '../hooks/useFullscreen';

export const FullscreenToggleButton: React.FC = () => {
  const { isFullscreen, toggleFullscreen, isSupported } = useFullscreen();

  if (!isSupported) return null;

  return (
    <button
      onClick={toggleFullscreen}
      className="fixed bottom-4 left-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors z-50"
    >
      {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    </button>
  );
};

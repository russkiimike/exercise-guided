import { useEffect, useRef } from 'react';
import { configureVideoForTransparency, supportsWebMTransparency } from '../utils/videoUtils';

type MediaDisplayProps = {
  mediaUrl: string | null;
  mediaType: 'image' | 'video';
  exerciseName: string;
};

export function MediaDisplay({ mediaUrl, mediaType, exerciseName }: MediaDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && mediaType === 'video' && mediaUrl) {
      // Configure video for transparency preservation
      configureVideoForTransparency(videoRef.current);
      
      // Check if WebM transparency is supported
      if (mediaUrl.includes('.webm') && supportsWebMTransparency()) {
        console.log('WebM transparency supported for:', exerciseName);
      }
    }
  }, [mediaUrl, mediaType, exerciseName]);

  return (
    <div className="flex flex-col items-center gap-6 px-6">
      <div className="relative w-60 h-60">
        <div className="absolute inset-0 rounded-full border-2 border-white opacity-25"></div>

        <div className="absolute inset-4 rounded-full overflow-hidden backdrop-blur-sm flex items-center justify-center">
          {mediaUrl ? (
            mediaType === 'video' ? (
              <video
                ref={videoRef}
                src={mediaUrl}
                className="w-full h-full object-cover"
                style={{
                  backgroundColor: 'transparent',
                  background: 'transparent',
                  mixBlendMode: 'normal',
                  isolation: 'isolate'
                }}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                webkit-playsinline="true"
              />
            ) : (
              <img
                src={mediaUrl}
                alt={exerciseName}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-48 h-48 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">Exercise Demo</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between w-full px-2">
        <h2 className="text-2xl font-semibold text-white">{exerciseName}</h2>
        <button className="w-10 h-10 rounded-full bg-[#6d6ec0] backdrop-blur-sm flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="5" r="1.5" />
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="10" cy="15" r="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

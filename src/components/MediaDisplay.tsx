import { useEffect, useRef, useState } from 'react';
import { configureVideoForTransparency, supportsWebMTransparency } from '../utils/videoUtils';
import { 
  createCanvasVideoFallback, 
  startCanvasRendering, 
  stopCanvasRendering, 
  destroyCanvasFallback,
  shouldUseCanvasFallback,
  CanvasVideoFallback,
  getDefaultCanvasConfig
} from '../utils/canvasVideoFallback';

type MediaDisplayProps = {
  mediaUrl: string | null;
  mediaType: 'image' | 'video';
  exerciseName: string;
};

export function MediaDisplay({ mediaUrl, mediaType, exerciseName }: MediaDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasFallbackRef = useRef<CanvasVideoFallback | null>(null);
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    if (videoRef.current && mediaType === 'video' && mediaUrl) {
      // Check if canvas fallback is needed
      const needsCanvasFallback = shouldUseCanvasFallback(mediaUrl);
      
      if (needsCanvasFallback) {
        console.log('Using canvas fallback for transparent video:', exerciseName);
        setUseCanvasFallback(true);
        
        // Create canvas fallback
        try {
          const config = getDefaultCanvasConfig();
          const fallback = createCanvasVideoFallback(videoRef.current, config);
          canvasFallbackRef.current = fallback;
          
          // Set canvas ref
          if (canvasRef.current) {
            canvasRef.current.appendChild(fallback.canvas);
            setCanvasReady(true);
          }
          
          // Start canvas rendering
          startCanvasRendering(fallback, videoRef.current);
        } catch (error) {
          console.warn('Canvas fallback failed, using native video:', error);
          setUseCanvasFallback(false);
        }
      } else {
        // Use native video with transparency
        configureVideoForTransparency(videoRef.current);
        
        if (mediaUrl.includes('.webm') && supportsWebMTransparency()) {
          console.log('WebM transparency supported for:', exerciseName);
        }
      }
    }

    // Cleanup on unmount
    return () => {
      if (canvasFallbackRef.current) {
        destroyCanvasFallback(canvasFallbackRef.current);
        canvasFallbackRef.current = null;
      }
    };
  }, [mediaUrl, mediaType, exerciseName]);

  return (
    <div className="flex flex-col items-center gap-6 px-6">
      <div className="relative w-60 h-60">
        <div className="absolute inset-0 rounded-full border-2 border-white opacity-25"></div>

        <div className="absolute inset-4 rounded-full overflow-hidden backdrop-blur-sm flex items-center justify-center">
          {mediaUrl ? (
            mediaType === 'video' ? (
              <div className="relative w-full h-full">
                {/* Video element - hidden when using canvas fallback */}
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  className="w-full h-full object-cover"
                  style={{
                    backgroundColor: 'transparent',
                    background: 'transparent',
                    mixBlendMode: 'normal',
                    isolation: 'isolate',
                    display: useCanvasFallback ? 'none' : 'block'
                  }}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  webkit-playsinline="true"
                />
                
                {/* Canvas fallback for transparency */}
                {useCanvasFallback && (
                  <div 
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{
                      backgroundColor: 'transparent',
                      background: 'transparent',
                      mixBlendMode: 'normal',
                      isolation: 'isolate'
                    }}
                  />
                )}
                
                {/* Loading indicator for canvas */}
                {useCanvasFallback && !canvasReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                    <div className="text-white text-xs">Loading transparent video...</div>
                  </div>
                )}
              </div>
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

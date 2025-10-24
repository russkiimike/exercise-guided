// Video utility functions to ensure WebM transparency is preserved

export interface VideoConfig {
  preserveTransparency: boolean;
  codec: string;
  quality: 'high' | 'medium' | 'low';
}

// Default configuration for WebM videos with transparency
export const getWebMConfig = (): VideoConfig => ({
  preserveTransparency: true,
  codec: 'vp8', // VP8 supports alpha channel for transparency
  quality: 'high'
});

// Check if browser supports WebM with transparency
export const supportsWebMTransparency = (): boolean => {
  const video = document.createElement('video');
  return video.canPlayType('video/webm; codecs="vp8"') !== '';
};

// Get optimal video format based on browser support
export const getOptimalVideoFormat = (): 'webm' | 'mp4' | 'fallback' => {
  const video = document.createElement('video');
  
  if (video.canPlayType('video/webm; codecs="vp8"') !== '') {
    return 'webm';
  } else if (video.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '') {
    return 'mp4';
  }
  
  return 'fallback';
};

// Video element configuration for transparency
export const configureVideoForTransparency = (videoElement: HTMLVideoElement): void => {
  // Ensure video element supports transparency
  videoElement.style.backgroundColor = 'transparent';
  videoElement.style.background = 'transparent';
  
  // Set video attributes for optimal transparency
  videoElement.setAttribute('preload', 'metadata');
  videoElement.setAttribute('playsinline', 'true');
  videoElement.setAttribute('webkit-playsinline', 'true');
  
  // Ensure proper rendering context
  if (videoElement.style) {
    videoElement.style.mixBlendMode = 'normal';
    videoElement.style.isolation = 'isolate';
  }
};

// Create a video element with transparency support
export const createTransparentVideo = (src: string): HTMLVideoElement => {
  const video = document.createElement('video');
  video.src = src;
  video.loop = true;
  video.muted = true;
  video.autoplay = true;
  
  configureVideoForTransparency(video);
  
  return video;
};

// Check if video URL supports transparency
export const isTransparentVideo = (url: string): boolean => {
  return url.includes('.webm') && url.includes('transparent');
};

// Video loading with transparency preservation
export const loadVideoWithTransparency = async (
  videoElement: HTMLVideoElement,
  src: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    videoElement.addEventListener('loadedmetadata', () => {
      configureVideoForTransparency(videoElement);
      resolve();
    });
    
    videoElement.addEventListener('error', (error) => {
      console.warn('Video failed to load with transparency:', error);
      reject(error);
    });
    
    videoElement.src = src;
    videoElement.load();
  });
};

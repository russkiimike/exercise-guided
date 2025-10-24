import { supportsWebMTransparency } from './videoUtils';
import { OptimizedCanvasRenderer, getDefaultOptimizationConfig } from './canvasPerformanceOptimizer';

export interface CanvasVideoConfig {
  preserveTransparency: boolean;
  frameRate: number;
  quality: 'high' | 'medium' | 'low';
  enableOptimization: boolean;
}

export interface CanvasVideoFallback {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  isActive: boolean;
  animationId: number | null;
  config: CanvasVideoConfig;
  renderer: OptimizedCanvasRenderer;
}

// Default configuration for canvas video fallback
export const getDefaultCanvasConfig = (): CanvasVideoConfig => ({
  preserveTransparency: true,
  frameRate: 30,
  quality: 'high',
  enableOptimization: true
});

// Create canvas fallback for transparent video
export const createCanvasVideoFallback = (
  videoElement: HTMLVideoElement,
  config: CanvasVideoConfig = getDefaultCanvasConfig()
): CanvasVideoFallback => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: true });
  
  if (!context) {
    throw new Error('Canvas 2D context not supported');
  }

  // Configure canvas for transparency
  canvas.style.backgroundColor = 'transparent';
  canvas.style.background = 'transparent';
  canvas.style.mixBlendMode = 'normal';
  canvas.style.isolation = 'isolate';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  // Create optimized renderer
  const optimizationConfig = getDefaultOptimizationConfig();
  const renderer = new OptimizedCanvasRenderer(optimizationConfig);

  const fallback: CanvasVideoFallback = {
    canvas,
    context,
    isActive: false,
    animationId: null,
    config,
    renderer
  };

  return fallback;
};

// Start canvas rendering animation
export const startCanvasRendering = (
  fallback: CanvasVideoFallback,
  videoElement: HTMLVideoElement
): void => {
  if (fallback.isActive) return;

  const { canvas, context, renderer } = fallback;
  
  // Set canvas size to match video
  const updateCanvasSize = () => {
    if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
    }
  };

  // Start optimized rendering
  const startRendering = () => {
    if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
      fallback.isActive = true;
      updateCanvasSize();
      renderer.startRendering(canvas, context, videoElement);
    }
  };

  // Event listeners
  videoElement.addEventListener('loadeddata', startRendering);
  videoElement.addEventListener('play', () => {
    if (!fallback.isActive) {
      fallback.isActive = true;
      updateCanvasSize();
      renderer.startRendering(canvas, context, videoElement);
    }
  });
  
  videoElement.addEventListener('pause', () => {
    fallback.isActive = false;
    renderer.stopRendering();
  });

  videoElement.addEventListener('ended', () => {
    fallback.isActive = false;
    renderer.stopRendering();
  });

  // Handle resize
  videoElement.addEventListener('resize', updateCanvasSize);
};

// Stop canvas rendering
export const stopCanvasRendering = (fallback: CanvasVideoFallback): void => {
  fallback.isActive = false;
  fallback.renderer.stopRendering();
  
  // Clear canvas
  fallback.context.clearRect(0, 0, fallback.canvas.width, fallback.canvas.height);
};

// Clean up canvas fallback
export const destroyCanvasFallback = (fallback: CanvasVideoFallback): void => {
  stopCanvasRendering(fallback);
  fallback.canvas.remove();
};

// Check if canvas fallback is needed
export const shouldUseCanvasFallback = (videoUrl: string): boolean => {
  // Check if it's a WebM video
  if (!videoUrl.includes('.webm')) return false;
  
  // Check if native transparency is supported
  if (supportsWebMTransparency()) return false;
  
  // Check if canvas is supported
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: true });
  
  return !!context;
};

// Performance optimization for canvas rendering
export const optimizeCanvasPerformance = (
  fallback: CanvasVideoFallback,
  targetFrameRate: number = 30
): void => {
  const frameInterval = 1000 / targetFrameRate;
  let lastFrameTime = 0;

  const throttledRender = (currentTime: number) => {
    if (currentTime - lastFrameTime >= frameInterval) {
      // Render frame
      if (fallback.isActive) {
        const { canvas, context } = fallback;
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Continue with normal rendering...
      }
      lastFrameTime = currentTime;
    }
    
    if (fallback.isActive) {
      fallback.animationId = requestAnimationFrame(throttledRender);
    }
  };
};

// Get canvas performance metrics
export const getCanvasPerformanceMetrics = (fallback: CanvasVideoFallback) => {
  return {
    isActive: fallback.isActive,
    canvasSize: {
      width: fallback.canvas.width,
      height: fallback.canvas.height
    },
    config: fallback.config,
    performance: fallback.renderer.getPerformanceMetrics()
  };
};

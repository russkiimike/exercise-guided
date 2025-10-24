// Canvas performance optimization utilities for transparent video rendering

export interface PerformanceMetrics {
  frameRate: number;
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface OptimizationConfig {
  targetFrameRate: number;
  maxFrameRate: number;
  qualityThreshold: number;
  enableAdaptiveQuality: boolean;
  enableFrameSkipping: boolean;
  enableMemoryManagement: boolean;
}

// Default optimization configuration
export const getDefaultOptimizationConfig = (): OptimizationConfig => ({
  targetFrameRate: 30,
  maxFrameRate: 60,
  qualityThreshold: 0.8,
  enableAdaptiveQuality: true,
  enableFrameSkipping: true,
  enableMemoryManagement: true
});

// Performance monitor for canvas rendering
export class CanvasPerformanceMonitor {
  private metrics: PerformanceMetrics;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private renderTimes: number[] = [];
  private config: OptimizationConfig;

  constructor(config: OptimizationConfig = getDefaultOptimizationConfig()) {
    this.config = config;
    this.metrics = {
      frameRate: 0,
      renderTime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    };
  }

  // Record frame render time
  recordFrame(renderTime: number): void {
    const currentTime = performance.now();
    
    if (this.lastFrameTime > 0) {
      const frameInterval = currentTime - this.lastFrameTime;
      this.renderTimes.push(renderTime);
      
      // Keep only last 60 frames for average calculation
      if (this.renderTimes.length > 60) {
        this.renderTimes.shift();
      }
      
      // Calculate frame rate
      this.metrics.frameRate = 1000 / frameInterval;
      this.metrics.renderTime = this.getAverageRenderTime();
    }
    
    this.lastFrameTime = currentTime;
    this.frameCount++;
  }

  // Get average render time
  private getAverageRenderTime(): number {
    if (this.renderTimes.length === 0) return 0;
    return this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length;
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Check if performance is acceptable
  isPerformanceAcceptable(): boolean {
    return this.metrics.frameRate >= this.config.targetFrameRate * this.config.qualityThreshold;
  }

  // Get recommended quality adjustment
  getQualityAdjustment(): 'high' | 'medium' | 'low' {
    if (this.metrics.frameRate < this.config.targetFrameRate * 0.5) {
      return 'low';
    } else if (this.metrics.frameRate < this.config.targetFrameRate * 0.8) {
      return 'medium';
    }
    return 'high';
  }

  // Reset metrics
  reset(): void {
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.renderTimes = [];
    this.metrics = {
      frameRate: 0,
      renderTime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    };
  }
}

// Adaptive quality manager
export class AdaptiveQualityManager {
  private monitor: CanvasPerformanceMonitor;
  private currentQuality: 'high' | 'medium' | 'low' = 'high';
  private qualityChangeTime: number = 0;
  private config: OptimizationConfig;

  constructor(config: OptimizationConfig = getDefaultOptimizationConfig()) {
    this.config = config;
    this.monitor = new CanvasPerformanceMonitor(config);
  }

  // Update quality based on performance
  updateQuality(): 'high' | 'medium' | 'low' {
    const now = performance.now();
    
    // Don't change quality too frequently (minimum 2 seconds between changes)
    if (now - this.qualityChangeTime < 2000) {
      return this.currentQuality;
    }

    const recommendedQuality = this.monitor.getQualityAdjustment();
    
    if (recommendedQuality !== this.currentQuality) {
      this.currentQuality = recommendedQuality;
      this.qualityChangeTime = now;
      console.log(`Canvas quality adjusted to: ${this.currentQuality}`);
    }

    return this.currentQuality;
  }

  // Get current quality
  getCurrentQuality(): 'high' | 'medium' | 'low' {
    return this.currentQuality;
  }

  // Get monitor instance
  getMonitor(): CanvasPerformanceMonitor {
    return this.monitor;
  }
}

// Frame rate limiter
export class FrameRateLimiter {
  private targetFrameRate: number;
  private frameInterval: number;
  private lastFrameTime: number = 0;
  private isLimited: boolean = false;

  constructor(targetFrameRate: number = 30) {
    this.targetFrameRate = targetFrameRate;
    this.frameInterval = 1000 / targetFrameRate;
  }

  // Check if frame should be rendered
  shouldRenderFrame(): boolean {
    const now = performance.now();
    
    if (!this.isLimited) {
      this.lastFrameTime = now;
      return true;
    }

    if (now - this.lastFrameTime >= this.frameInterval) {
      this.lastFrameTime = now;
      return true;
    }

    return false;
  }

  // Enable/disable frame rate limiting
  setLimited(limited: boolean): void {
    this.isLimited = limited;
  }

  // Update target frame rate
  setTargetFrameRate(frameRate: number): void {
    this.targetFrameRate = frameRate;
    this.frameInterval = 1000 / frameRate;
  }
}

// Memory management for canvas
export class CanvasMemoryManager {
  private maxMemoryUsage: number;
  private currentMemoryUsage: number = 0;
  private garbageCollectionInterval: number = 0;

  constructor(maxMemoryUsage: number = 50 * 1024 * 1024) { // 50MB default
    this.maxMemoryUsage = maxMemoryUsage;
  }

  // Check memory usage
  checkMemoryUsage(): boolean {
    if (performance.memory) {
      this.currentMemoryUsage = performance.memory.usedJSHeapSize;
      return this.currentMemoryUsage < this.maxMemoryUsage;
    }
    return true; // Assume OK if memory API not available
  }

  // Force garbage collection if needed
  forceGarbageCollection(): void {
    if (!this.checkMemoryUsage()) {
      // Force garbage collection
      if (window.gc) {
        window.gc();
      }
      
      // Clear canvas if memory is still high
      const now = performance.now();
      if (now - this.garbageCollectionInterval > 5000) { // Every 5 seconds
        this.garbageCollectionInterval = now;
        console.log('Canvas memory management: Forcing cleanup');
      }
    }
  }

  // Get current memory usage
  getMemoryUsage(): number {
    return this.currentMemoryUsage;
  }
}

// Optimized canvas renderer
export class OptimizedCanvasRenderer {
  private qualityManager: AdaptiveQualityManager;
  private frameLimiter: FrameRateLimiter;
  private memoryManager: CanvasMemoryManager;
  private isRendering: boolean = false;
  private animationId: number | null = null;

  constructor(config: OptimizationConfig = getDefaultOptimizationConfig()) {
    this.qualityManager = new AdaptiveQualityManager(config);
    this.frameLimiter = new FrameRateLimiter(config.targetFrameRate);
    this.memoryManager = new CanvasMemoryManager();
  }

  // Start optimized rendering
  startRendering(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    videoElement: HTMLVideoElement
  ): void {
    if (this.isRendering) return;

    this.isRendering = true;
    this.render(canvas, context, videoElement);
  }

  // Stop rendering
  stopRendering(): void {
    this.isRendering = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Main render loop
  private render(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    videoElement: HTMLVideoElement
  ): void {
    if (!this.isRendering) return;

    const startTime = performance.now();

    // Check if frame should be rendered
    if (!this.frameLimiter.shouldRenderFrame()) {
      this.animationId = requestAnimationFrame(() => 
        this.render(canvas, context, videoElement)
      );
      return;
    }

    // Update quality based on performance
    const quality = this.qualityManager.updateQuality();
    this.applyQualitySettings(context, quality);

    // Render frame
    this.renderFrame(canvas, context, videoElement);

    // Record performance
    const renderTime = performance.now() - startTime;
    this.qualityManager.getMonitor().recordFrame(renderTime);

    // Memory management
    this.memoryManager.forceGarbageCollection();

    // Continue animation
    this.animationId = requestAnimationFrame(() => 
      this.render(canvas, context, videoElement)
    );
  }

  // Apply quality settings to context
  private applyQualitySettings(context: CanvasRenderingContext2D, quality: 'high' | 'medium' | 'low'): void {
    switch (quality) {
      case 'high':
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        break;
      case 'medium':
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'medium';
        break;
      case 'low':
        context.imageSmoothingEnabled = false;
        break;
    }
  }

  // Render single frame
  private renderFrame(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    videoElement: HTMLVideoElement
  ): void {
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    if (videoElement.readyState >= 2) {
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 1.0;
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    }
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    return this.qualityManager.getMonitor().getMetrics();
  }

  // Update configuration
  updateConfig(config: OptimizationConfig): void {
    this.frameLimiter.setTargetFrameRate(config.targetFrameRate);
  }
}

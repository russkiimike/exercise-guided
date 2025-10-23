import { X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

type RestTimerProps = {
  restTime: number;
  onRestTimeChange: (time: number) => void;
  isActive: boolean;
  onDismiss: () => void;
};

export function RestTimer({ restTime, onRestTimeChange, isActive, onDismiss }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(restTime);
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    setTimeLeft(restTime);
    setAnimationProgress(0);
  }, [restTime]);

  useEffect(() => {
    if (!isActive) return;

    startTimeRef.current = Date.now();
    
    const animate = () => {
      if (!startTimeRef.current) return;
      
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / (restTime * 1000), 1);
      
      setAnimationProgress(progress);
      
      if (progress >= 1) {
        // Animation complete - finish the timer
        setTimeLeft(0);
        // Auto-dismiss the timer when it reaches 0
        setTimeout(() => {
          onDismiss();
        }, 100); // Small delay to ensure smooth transition
        return;
      }
      
      // Update time left based on progress
      const remainingTime = Math.ceil(restTime * (1 - progress));
      setTimeLeft(remainingTime);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, restTime]);

  const progressPercentage = (timeLeft / restTime) * 100;

  // Calculate gradient colors based on smooth animation progress
  const getGradientColors = () => {
    // Cold colors only: blues, teals, cyans, and purples
    // Map animation progress to cold color range (180-300 degrees in HSL)
    const coldHueStart = 200; // Teal
    const coldHueEnd = 180;   // Purple
    const hue = coldHueStart + (animationProgress * (coldHueEnd - coldHueStart));
    
    const saturation = 70 + (animationProgress * 20); // 70-90%
    const lightness = 35 + (animationProgress * 15);  // 35-50%
    
    return {
      from: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      to: `hsl(${hue + 30}, ${saturation}%, ${lightness + 10}%)`
    };
  };

  const gradientColors = getGradientColors();

  return (
    <div className="px-6">
      <div 
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${gradientColors.from}, ${gradientColors.to})`
        }}
      >
        <div
          className="absolute bottom-0 left-0 h-1.5 bg-white/30"
          style={{ width: `${progressPercentage}%` }}
        />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">Time</p>
            <p className="text-white text-3xl font-bold">{timeLeft}s</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onRestTimeChange(Math.max(0, restTime - 15))}
              className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center backdrop-blur-sm"
            >
              <span className="text-white text-lg font-bold">-15s</span>
            </button>

            <button
              onClick={() => onRestTimeChange(restTime + 15)}
              className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center backdrop-blur-sm"
            >
              <span className="text-white text-lg font-bold">+15s</span>
            </button>

            <button
              onClick={onDismiss}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              <X className="w-6 h-6 text-white" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

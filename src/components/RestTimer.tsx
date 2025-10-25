import { X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

type RestTimerProps = {
  restTime: number;
  onRestTimeChange: (time: number) => void;
  isActive: boolean;
  onDismiss: () => void;
  onRestTimerComplete: () => void;
};

export function RestTimer({ restTime, onRestTimeChange, isActive, onDismiss, onRestTimerComplete }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(restTime);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const startSecondRef = useRef<number>();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setTimeLeft(restTime);
    setAnimationProgress(0);
  }, [restTime]);

  // Handle slide-in animation when timer becomes active
  useEffect(() => {
    if (isActive) {
      setIsAnimatingOut(false);
    } else {
      // Reset animation states when not active
      setIsAnimatingOut(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    // Get current time and calculate when to start the timer
    const now = new Date();
    const currentMillisecond = now.getMilliseconds();
    
    // Start the timer at the next second boundary for perfect sync
    const delayToNextSecond = 1000 - currentMillisecond;
    
    const startTimer = () => {
      startSecondRef.current = now.getSeconds();
      
      const updateTimer = () => {
        const currentTime = new Date();
        const currentSecond = currentTime.getSeconds();
        
        // Calculate elapsed seconds since start
        let elapsedSeconds = 0;
        if (startSecondRef.current !== undefined) {
          if (currentSecond >= startSecondRef.current) {
            elapsedSeconds = currentSecond - startSecondRef.current;
          } else {
            // Handle minute rollover
            elapsedSeconds = (60 - startSecondRef.current) + currentSecond;
          }
        }
        
        const remainingTime = Math.max(0, restTime - elapsedSeconds);
        const progress = Math.min(elapsedSeconds / restTime, 1);
        
        setTimeLeft(remainingTime);
        setAnimationProgress(progress);
        
        if (remainingTime <= 0) {
          // Timer completed - start slide-out animation
          setTimeLeft(0);
          setIsAnimatingOut(true);
          // Call completion handler after animation
          setTimeout(() => {
            onRestTimerComplete();
          }, 300);
          return;
        }
      };
      
      // Update immediately
      updateTimer();
      
      // Set up interval to update every second
      intervalRef.current = setInterval(updateTimer, 1000);
    };
    
    // Start timer at the next second boundary
    const timeoutId = setTimeout(startTimer, delayToNextSecond);
    
    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, restTime, onRestTimerComplete]);

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
    <div className={`transform transition-all duration-300 ease-out ${
      isAnimatingOut 
        ? '-translate-x-full opacity-0' 
        : 'translate-x-0 opacity-100'
    }`}>
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
            <p className="text-white/80 text-sm font-medium mb-1">Set Time</p>
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
              onClick={() => {
                setIsAnimatingOut(true);
                setTimeout(() => {
                  onDismiss();
                }, 300);
              }}
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
